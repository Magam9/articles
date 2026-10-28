// Renders every visual in ./src to ./out (PNG for static ones, GIF for animated ones).
// Usage: node visuals/render.mjs [name ...]
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

// CommonJS require so a globally installed Playwright (NODE_PATH) works too
const { chromium } = createRequire(import.meta.url)('playwright');

const here = new URL('.', import.meta.url).pathname;
const srcDir = join(here, 'src');
const outDir = join(here, 'out');
const framesRoot = join(here, '.frames');
mkdirSync(outDir, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const file = join(srcDir, new URL(req.url, 'http://x').pathname);
  try {
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const names =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : readdirSync(srcDir)
        .filter((f) => f.endsWith('.js') && f !== 'lib.js')
        .map((f) => f.replace(/\.js$/, ''));

const browser = await chromium.launch();

for (const name of names) {
  const probe = await browser.newPage();
  await probe.goto(`http://localhost:${port}/page.html?v=${name}`);
  await probe.waitForFunction(() => window.READY === true);
  const meta = await probe.evaluate(() => window.VISUAL);
  await probe.close();

  const scale = meta.scale ?? 2;
  const page = await browser.newPage({ viewport: { width: meta.width, height: meta.height }, deviceScaleFactor: scale });
  await page.goto(`http://localhost:${port}/page.html?v=${name}`);
  await page.waitForFunction(() => window.READY === true);

  if (!meta.duration) {
    await page.evaluate(() => window.render(0));
    await page.screenshot({ path: join(outDir, `${name}.png`) });
    console.log(`${name}.png`);
  } else {
    const fps = meta.fps ?? 20;
    const frames = Math.round(meta.duration * fps);
    const dir = join(framesRoot, name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.render(t), i / fps);
      await page.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    // Poster: the final state, also useful as a static fallback
    await page.evaluate((t) => window.render(t), meta.poster ?? meta.duration);
    await page.screenshot({ path: join(outDir, `${name}-poster.png`) });

    const gif = join(outDir, `${name}.gif`);
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-framerate', String(fps),
      '-i', join(dir, 'f%04d.png'),
      '-vf', `split[a][b];[a]palettegen=max_colors=${meta.colors ?? 96}:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`,
      '-loop', '0',
      gif,
    ]);
    console.log(`${name}.gif  ${(statSync(gif).size / 1024 / 1024).toFixed(2)} MB, ${frames} frames`);
  }
  await page.close();
}

await browser.close();
server.close();
rmSync(framesRoot, { recursive: true, force: true });
