// Phase E-2: Unified price resolution
// Returns the effective selling price (sale_price if valid, else price)
// + a flag indicating whether a sale is active.

export function getEffectivePrice(product) {
  if (!product) return { price: 0, originalPrice: 0, isOnSale: false };
  const original = Number(product.price) || 0;
  const sale = product.sale_price != null ? Number(product.sale_price) : null;
  if (sale != null && sale > 0 && sale < original) {
    return { price: sale, originalPrice: original, isOnSale: true };
  }
  return { price: original, originalPrice: original, isOnSale: false };
}
