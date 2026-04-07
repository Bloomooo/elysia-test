import { Elysia } from "elysia";
import { calculateOrderTotal, applyPromoCode, DEFAULT_PROMO_CODES } from "./pricing";
import { addOrder, getOrder } from "./store";

export const app = new Elysia()
  .post("/orders/simulate", ({ body, set }) => {
    try {
      const { items, distance, weight, promoCode, hour, dayOfWeek } = body as Record<string, unknown>;
      const result = calculateOrderTotal(
        items as Parameters<typeof calculateOrderTotal>[0],
        distance as number,
        weight as number,
        (promoCode as string) ?? null,
        hour as number,
        dayOfWeek as string,
      );
      return result;
    } catch (e: unknown) {
      set.status = 400;
      return { error: (e as Error).message };
    }
  })

  .post("/orders", ({ body, set }) => {
    try {
      const { items, distance, weight, promoCode, hour, dayOfWeek } = body as Record<string, unknown>;
      const result = calculateOrderTotal(
        items as Parameters<typeof calculateOrderTotal>[0],
        distance as number,
        weight as number,
        (promoCode as string) ?? null,
        hour as number,
        dayOfWeek as string,
      );
      const order = addOrder({
        items: items as Array<{ name: string; price: number; quantity: number }>,
        ...result,
      });
      set.status = 201;
      return order;
    } catch (e: unknown) {
      set.status = 400;
      return { error: (e as Error).message };
    }
  })

  .get("/orders/:id", ({ params, set }) => {
    const order = getOrder(params.id);
    if (!order) {
      set.status = 404;
      return { error: "Commande non trouvee" };
    }
    return order;
  })

  .post("/promo/validate", ({ body, set }) => {
    try {
      const { code, subtotal } = body as Record<string, unknown>;
      if (!code) {
        set.status = 400;
        return { error: "Code promo requis" };
      }
      const discounted = applyPromoCode(subtotal as number, code as string, DEFAULT_PROMO_CODES);
      return {
        valid: true,
        originalAmount: subtotal,
        discountedAmount: discounted,
        discount: Math.round(((subtotal as number) - discounted) * 100) / 100,
      };
    } catch (e: unknown) {
      set.status = 400;
      return { valid: false, error: (e as Error).message };
    }
  });
