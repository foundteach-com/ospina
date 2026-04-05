export const formatCurrency = (value: number | string | undefined) => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  const rounded = Math.round(num);
  return rounded.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatNumber = (value: number | string | undefined) => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  const rounded = Math.round(num);
  return rounded.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

