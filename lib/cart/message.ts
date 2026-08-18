export type CheckoutCartItem = {
  name: string;
  quantity: number;
};

export function cartCheckoutMessage(items: CheckoutCartItem[]) {
  return [
    "Ideas I want, Plus some:",
    ...items.map((item, index) => `${index + 1}. ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)
  ].join("\n");
}

export function cartCheckoutWhatsappUrl(items: CheckoutCartItem[]) {
  return `http://wa.me/60176226280?text=${encodeURIComponent(cartCheckoutMessage(items))}`;
}
