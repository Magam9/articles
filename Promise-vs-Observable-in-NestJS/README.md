# Promise vs Observable in NestJS

Example code for the article *I Benchmarked Promises vs Observables in NestJS. Speed Was the Boring Part.*

The same features are written twice, once with `async/await` and once with RxJS:

| Feature | Promise | Observable |
| --- | --- | --- |
| Trivial handler (framework overhead) | `GET /promise/ping` | `GET /observable/ping` |
| Fan-out to 3 services with timeout, retry and fallback | `GET /promise/dashboard/:userId` | `GET /observable/dashboard/:userId` |
| Load 20 users, max 5 requests at a time | `GET /promise/users?ids=1,2,3` | `GET /observable/users?ids=1,2,3` |
| Slow downstream call, client leaves early | `GET /promise/reports/:id` and `/promise/reports/:id/abortable` | `GET /observable/reports/:id` |
| Live updates (SSE) | — | `GET /observable/orders/:id/live` |

`GET /sync/ping` is a plain synchronous handler, used as a baseline.

## Structure

```
src/
  downstream/fake-downstream.ts   # "another team's API" with fixed latency
  clients/downstream.client.ts    # one fetch client for both versions
  modules/promise/                # async/await version
  modules/observable/             # RxJS version
  shared/request-signal.decorator.ts  # AbortSignal tied to the HTTP request
  shared/timing.interceptor.ts    # interceptors speak RxJS no matter what
bench/
  micro.bench.ts         # Promise vs RxJS without I/O (tinybench)
  http.bench.ts          # full Nest pipeline under load (autocannon)
  cancellation.bench.ts  # what happens when the client gives up
  stack-traces.ts        # the same error thrown through async/await and through RxJS
  results/               # raw JSON from the runs used in the article
visuals/
  src/                   # charts and animations as small SVG scripts (one file per image)
  render.mjs             # renders them to PNG/GIF with Playwright + ffmpeg
  out/                   # the images used in the article
```

## Run it

Node.js 22+.

```bash
npm install
npm run build

# terminal 1
npm run downstream
# terminal 2
npm start

curl localhost:3000/promise/dashboard/7
curl localhost:3000/observable/dashboard/7
curl -N localhost:3000/observable/orders/7/live
```

## Benchmarks

```bash
npm run bench          # everything
npm run bench:micro
npm run bench:http     # BENCH_DURATION=15 BENCH_CONNECTIONS=50 BENCH_RUNS=3 by default
npm run bench:cancel
npm run stack-traces
```

The HTTP benchmark starts fresh processes for every scenario and runs each
scenario with and without a global interceptor.

Results in `bench/results` come from a 2 vCPU Linux VM (Intel Xeon 2.1 GHz),
Node.js 22, NestJS 12.3, RxJS 7.8. The load generator, the app and the fake
downstream share those 2 cores, so look at the ratios, not the absolute numbers.

Versions matter here: cancelling an Observable when the client disconnects was
added in `@nestjs/core` 12.1.0. On 12.0.0 the `observable` row of the
cancellation benchmark looks exactly like the `promise` row.

## Visuals

Every chart and animation in the article is generated from `visuals/src`, using
the numbers in `bench/results`. To render them again:

```bash
npm i -D playwright && npx playwright install chromium   # once
node visuals/render.mjs            # all of them
node visuals/render.mjs cancel      # just one
```

Animated ones also need `ffmpeg` on your PATH.
