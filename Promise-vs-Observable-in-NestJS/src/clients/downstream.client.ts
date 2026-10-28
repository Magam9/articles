import { Injectable } from '@nestjs/common';

export class DownstreamError extends Error {
  constructor(
    readonly status: number,
    readonly path: string
  ) {
    super(`Downstream ${path} answered ${status}`);
  }
}

/**
 * One plain fetch-based client shared by both implementations.
 * The Promise and the Observable versions differ only in how they
 * compose calls, not in how they talk to the network.
 */
@Injectable()
export class DownstreamClient {
  private readonly baseUrl = process.env.DOWNSTREAM_URL ?? 'http://localhost:4000';

  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { signal });
    if (!response.ok) {
      // Drain the body so the keep-alive socket can be reused
      await response.arrayBuffer();
      throw new DownstreamError(response.status, path);
    }
    return (await response.json()) as T;
  }
}
