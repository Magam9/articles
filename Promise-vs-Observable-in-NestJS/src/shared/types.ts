export type User = { id: number; name: string; plan: string };
export type Order = { id: number; total: number; status: string };
export type Recommendation = { sku: string };
export type Report = { id: string; rows: number };

export type Dashboard = {
  user: User;
  orders: Order[];
  recommendations: Recommendation[];
  totalSpent: number;
};

export const DOWNSTREAM_TIMEOUT_MS = 500;
export const RECOMMENDATION_RETRIES = 2;
export const RETRY_DELAY_MS = 50;

export function toDashboard(user: User, orders: Order[], recommendations: Recommendation[]): Dashboard {
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  return { user, orders, recommendations, totalSpent };
}
