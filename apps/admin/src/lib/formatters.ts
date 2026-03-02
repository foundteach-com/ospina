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
