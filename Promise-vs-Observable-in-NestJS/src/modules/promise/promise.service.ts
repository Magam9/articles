import { Injectable } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';

import { DownstreamClient } from '../../clients/downstream.client.js';
import {
  Dashboard,
  DOWNSTREAM_TIMEOUT_MS,
  Order,
  RECOMMENDATION_RETRIES,
  Recommendation,
  Report,
  RETRY_DELAY_MS,
  toDashboard,
  User,
} from '../../shared/types.js';

@Injectable()
export class PromiseService {
  constructor(private readonly client: DownstreamClient) {}

  async getDashboard(userId: number): Promise<Dashboard> {
    const [user, orders, recommendations] = await Promise.all([
      this.get<User>(`/users/${userId}`),
      this.get<Order[]>(`/orders?userId=${userId}`),
      this.getRecommendations(userId),
    ]);

    return toDashboard(user, orders, recommendations);
  }

  /**
   * Same rules as the Observable version: timeout, two retries with a small
   * delay, and an empty list if recommendations are still down.
   */
  private async getRecommendations(userId: number): Promise<Recommendation[]> {
    for (let attempt = 0; attempt <= RECOMMENDATION_RETRIES; attempt++) {
      try {
        return await this.get<Recommendation[]>(`/recommendations?userId=${userId}`);
      } catch {
        if (attempt < RECOMMENDATION_RETRIES) await sleep(RETRY_DELAY_MS);
      }
    }
    return [];
  }

  /** Timeout that really stops the request, not just stops waiting for it. */
  private get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const timeout = AbortSignal.timeout(DOWNSTREAM_TIMEOUT_MS);
    return this.client.get<T>(path, signal ? AbortSignal.any([signal, timeout]) : timeout);
  }

  /**
   * Load many users, but never more than `concurrency` requests at once.
   * There is no built-in for this, so here is a tiny worker pool.
   */
  async getUsers(ids: number[], concurrency = 5): Promise<User[]> {
    const users: User[] = new Array(ids.length);
    let next = 0;

    const worker = async () => {
      while (next < ids.length) {
        const index = next++;
        users[index] = await this.get<User>(`/users/${ids[index]}`);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
    return users;
  }

  /** The naive version: nobody tells fetch that the client has left. */
  getReport(id: string): Promise<Report> {
    return this.client.get<Report>(`/reports/${id}?variant=promise`);
  }

  /** The fixed version: the controller passes a signal tied to the HTTP request. */
  getReportAbortable(id: string, signal: AbortSignal): Promise<Report> {
    return this.client.get<Report>(`/reports/${id}?variant=promise-abortable`, signal);
  }
}
