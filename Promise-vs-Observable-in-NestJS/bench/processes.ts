import { ChildProcess, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const root = new URL('../../', import.meta.url).pathname;

export const APP_URL = 'http://localhost:3000';
export const DOWNSTREAM_URL = 'http://localhost:4000';

async function waitFor(url: string) {
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await sleep(100);
    }
  }
  throw new Error(`${url} did not start`);
}

export async function startStack(env: Record<string, string> = {}) {
  const downstream = spawn('node', ['dist/src/downstream/fake-downstream.js'], { cwd: root, stdio: 'ignore' });
  const app = spawn('node', ['dist/src/main.js'], {
    cwd: root,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, ...env },
  });

  await waitFor(`${DOWNSTREAM_URL}/stats`);
  await waitFor(`${APP_URL}/sync/ping`);

  return {
    app,
    async stop() {
      for (const child of [app, downstream]) child.kill();
      await sleep(300);
    },
  };
}

/** Resident memory of the NestJS process, in MB (Linux only). */
export function rssMb(child: ChildProcess): number {
  const status = readFileSync(`/proc/${child.pid}/status`, 'utf8');
  const kb = Number(/VmRSS:\s+(\d+)/.exec(status)?.[1] ?? 0);
  return Math.round(kb / 1024);
}
