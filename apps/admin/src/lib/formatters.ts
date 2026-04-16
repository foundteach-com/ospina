export const formatCurrency = (value: number | string | undefined) => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumber = (value: number | string | undefined) => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return num.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calculateSellingPrice = (
  purchasePrice: number | string | undefined,
  purchaseIvaPercent: number | string | undefined,
  utilityPercent: number | string | undefined
) => {
  const pPriceFull = typeof purchasePrice === 'string' ? parseFloat(purchasePrice) : (purchasePrice || 0);
  const pIvaP = typeof purchaseIvaPercent === 'string' ? parseFloat(purchaseIvaPercent) : (purchaseIvaPercent || 0);
  const uP = typeof utilityPercent === 'string' ? parseFloat(utilityPercent) : (utilityPercent || 0);

  if (pPriceFull === 0) return 0;

  // 1. Quitar IVA del costo: Costo sin IVA = Precio de compra / (1 + IVA)
  const purchasePriceNet = pPriceFull / (1 + (pIvaP / 100));

  // 2. Definir precio de venta (sin IVA) usando MARGEN: Precio = Costo / (1 - margen)
  const divisor = (1 - (uP / 100));
  const sellingPriceNet = divisor > 0 ? (purchasePriceNet / divisor) : 0;

  return sellingPriceNet;
};

