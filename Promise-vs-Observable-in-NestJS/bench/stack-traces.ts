import { lastValueFrom, map, Observable, of, switchMap } from 'rxjs';

/**
 * Same failure, three layers deep. Which stack trace helps you more at 3 a.m.?
 */

class OrdersRepository {
  async findByUser(userId: number): Promise<number[]> {
    await Promise.resolve();
    throw new Error(`orders table is locked (user ${userId})`);
  }

  findByUser$(userId: number): Observable<number[]> {
    return of(userId).pipe(
      map(() => {
        throw new Error(`orders table is locked (user ${userId})`);
      })
    );
  }
}

class OrdersService {
  constructor(private readonly repository = new OrdersRepository()) {}

  async getTotal(userId: number) {
    const orders = await this.repository.findByUser(userId);
    return orders.length;
  }

  getTotal$(userId: number) {
    return of(userId).pipe(
      switchMap((id) => this.repository.findByUser$(id)),
      map((orders) => orders.length)
    );
  }
}

async function handleRequestWithPromise() {
  return new OrdersService().getTotal(7);
}

async function handleRequestWithObservable() {
  return lastValueFrom(new OrdersService().getTotal$(7));
}

for (const [label, handler] of [
  ['async/await', handleRequestWithPromise],
  ['RxJS', handleRequestWithObservable],
] as const) {
  try {
    await handler();
  } catch (error) {
    console.log(`\n--- ${label} ---`);
    console.log((error as Error).stack?.split('\n').slice(0, 12).join('\n'));
  }
}
