import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/app";
import { resetStore } from "../src/store";

beforeEach(() => {
  resetStore();
});

async function post(path: string, body: object) {
  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, data: await res.json() };
}

async function get(path: string) {
  const res = await app.handle(new Request(`http://localhost${path}`));
  return { status: res.status, data: await res.json() };
}

const validOrder = {
  items: [{ name: "Pizza", price: 12.5, quantity: 2 }],
  distance: 5,
  weight: 2,
  promoCode: null,
  hour: 15,
  dayOfWeek: "tuesday",
};

describe("POST /orders/simulate", () => {
  it("should return 200 with price details for valid order", async () => {
    const { status, data } = await post("/orders/simulate", validOrder);
    expect(status).toBe(200);
    expect(data.subtotal).toBe(25);
    expect(data.total).toBe(28);
  });

  it("should apply promo code and return discount", async () => {
    const { status, data } = await post("/orders/simulate", {
      ...validOrder,
      promoCode: "BIENVENUE20",
    });
    expect(status).toBe(200);
    expect(data.discount).toBe(5);
    expect(data.total).toBe(23);
  });

  it("should return 400 when promo code is expired", async () => {
    const { status, data } = await post("/orders/simulate", {
      ...validOrder,
      promoCode: "EXPIRE",
    });
    expect(status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when items array is empty", async () => {
    const { status } = await post("/orders/simulate", {
      ...validOrder,
      items: [],
    });
    expect(status).toBe(400);
  });

  it("should return 400 when distance exceeds 10km", async () => {
    const { status } = await post("/orders/simulate", {
      ...validOrder,
      distance: 15,
    });
    expect(status).toBe(400);
  });

  it("should return 400 when restaurant is closed", async () => {
    const { status } = await post("/orders/simulate", {
      ...validOrder,
      hour: 23,
    });
    expect(status).toBe(400);
  });

  it("should apply surge multiplier to delivery fee", async () => {
    const { data } = await post("/orders/simulate", {
      ...validOrder,
      hour: 20,
      dayOfWeek: "friday",
    });
    expect(data.surge).toBe(1.8);
    expect(data.deliveryFee).toBe(5.4);
  });
});

describe("POST /orders", () => {
  it("should return 201 with order including ID", async () => {
    const { status, data } = await post("/orders", validOrder);
    expect(status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.subtotal).toBe(25);
  });

  it("should make order retrievable via GET /orders/:id", async () => {
    const { data: created } = await post("/orders", validOrder);
    const { status, data } = await get(`/orders/${created.id}`);
    expect(status).toBe(200);
    expect(data.subtotal).toBe(25);
  });

  it("should assign different IDs to different orders", async () => {
    const { data: first } = await post("/orders", validOrder);
    const { data: second } = await post("/orders", validOrder);
    expect(first.id).not.toBe(second.id);
  });

  it("should return 400 for invalid order", async () => {
    const { status } = await post("/orders", { ...validOrder, items: [] });
    expect(status).toBe(400);
  });

  it("should not store invalid orders", async () => {
    await post("/orders", { ...validOrder, items: [] });
    const { status } = await get("/orders/1");
    expect(status).toBe(404);
  });
});

describe("GET /orders/:id", () => {
  it("should return 200 with order when ID exists", async () => {
    const { data: created } = await post("/orders", validOrder);
    const { status } = await get(`/orders/${created.id}`);
    expect(status).toBe(200);
  });

  it("should return 404 when ID does not exist", async () => {
    const { status } = await get("/orders/999");
    expect(status).toBe(404);
  });

  it("should return complete order structure", async () => {
    const { data: created } = await post("/orders", validOrder);
    const { data } = await get(`/orders/${created.id}`);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("subtotal");
    expect(data).toHaveProperty("discount");
    expect(data).toHaveProperty("deliveryFee");
    expect(data).toHaveProperty("surge");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("createdAt");
  });
});

describe("POST /promo/validate", () => {
  it("should return 200 with discount details for valid code", async () => {
    const { status, data } = await post("/promo/validate", {
      code: "BIENVENUE20",
      subtotal: 50,
    });
    expect(status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.discountedAmount).toBe(40);
    expect(data.discount).toBe(10);
  });

  it("should return 400 when code is expired", async () => {
    const { status, data } = await post("/promo/validate", {
      code: "EXPIRE",
      subtotal: 50,
    });
    expect(status).toBe(400);
    expect(data.valid).toBe(false);
  });

  it("should return 400 when subtotal below minimum", async () => {
    const { status, data } = await post("/promo/validate", {
      code: "BIENVENUE20",
      subtotal: 5,
    });
    expect(status).toBe(400);
    expect(data.valid).toBe(false);
  });

  it("should return 400 when code is unknown", async () => {
    const { status, data } = await post("/promo/validate", {
      code: "FAKE",
      subtotal: 50,
    });
    expect(status).toBe(400);
    expect(data.valid).toBe(false);
  });

  it("should return 400 when no code provided", async () => {
    const { status } = await post("/promo/validate", { subtotal: 50 });
    expect(status).toBe(400);
  });
});
