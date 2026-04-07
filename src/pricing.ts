export function calculateDeliveryFee(distance: number, weight: number): number {
  if (distance < 0 || weight < 0) {
    throw new Error("La distance et le poids doivent etre positifs");
  }
  if (distance > 10) {
    throw new Error("La distance de livraison ne peut pas depasser 10 km");
  }

  let fee = 2.0;
  if (distance > 3) {
    fee += (distance - 3) * 0.5;
  }
  if (weight > 5) {
    fee += 1.5;
  }

  return Math.round(fee * 100) / 100;
}
