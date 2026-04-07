export interface StoredOrder {
  id: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  surge: number;
  total: number;
  createdAt: string;
}

let orders: Map<string, StoredOrder> = new Map();
let nextId = 1;

export function addOrder(order: Omit<StoredOrder, "id" | "createdAt">): StoredOrder {
  const id = String(nextId++);
  const stored: StoredOrder = { ...order, id, createdAt: new Date().toISOString() };
  orders.set(id, stored);
  return stored;
}

export function getOrder(id: string): StoredOrder | undefined {
  return orders.get(id);
}

export function resetStore(): void {
  orders = new Map();
  nextId = 1;
}
