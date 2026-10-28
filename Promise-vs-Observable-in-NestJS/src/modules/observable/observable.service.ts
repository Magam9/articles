import { Injectable } from '@nestjs/common';
import { catchError, forkJoin, from, interval, map, mergeMap, Observable, of, retry, take, timeout, toArray } from 'rxjs';

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
export class ObservableService {
  constructor(private readonly client: DownstreamClient) {}

  getDashboard(userId: number): Observable<Dashboard> {
    return forkJoin({
      user: this.get$<User>(`/users/${userId}`),
      orders: this.get$<Order[]>(`/orders?userId=${userId}`),
      recommendations: this.get$<Recommendation[]>(`/recommendations?userId=${userId}`).pipe(
        retry({ count: RECOMMENDATION_RETRIES, delay: RETRY_DELAY_MS }),
        catchError(() => of([]))
      ),
    }).pipe(map(({ user, orders, recommendations }) => toDashboard(user, orders, recommendations)));
  }

  /** Same job as the worker pool in the Promise version: one operator argument. */
  getUsers(ids: number[], concurrency = 5): Observable<User[]> {
    return from(ids).pipe(
      mergeMap((id, index) => this.get$<User>(`/users/${id}`).pipe(map((user) => ({ user, index }))), concurrency),
      toArray(),
      map((results) => results.sort((a, b) => a.index - b.index).map(({ user }) => user))
    );
  }

  getReport(id: string): Observable<Report> {
    return this.request$<Report>(`/reports/${id}?variant=observable`);
  }

  /** Server-Sent Events: the case where an Observable is simply the right shape. */
  watchOrder(orderId: number): Observable<MessageEvent> {
    const steps = ['created', 'paid', 'packed', 'shipped', 'delivered'];
    return interval(1_000).pipe(
      take(steps.length),
      map((i) => ({ data: { orderId, status: steps[i] } }) as MessageEvent)
    );
  }

  private get$<T>(path: string): Observable<T> {
    return this.request$<T>(path).pipe(timeout(DOWNSTREAM_TIMEOUT_MS));
  }

  /**
   * Turns a fetch call into a cold Observable.
   * The teardown function is the whole point: unsubscribe => abort the HTTP call.
   */
  private request$<T>(path: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const controller = new AbortController();

      this.client.get<T>(path, controller.signal).then(
        (value) => {
          subscriber.next(value);
          subscriber.complete();
        },
        (error: unknown) => subscriber.error(error)
      );

      return () => controller.abort();
    });
  }
}
