export function formatCurrency(value: number): string {
  if (Number.isNaN(value) || value === null || value === undefined) {
    return '₹0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return formatter.format(value);
}
