export function formatCurrency(value: number): string {
  if (Number.isNaN(value) || value === null || value === undefined) {
    return '₨0';
  }

  // Use custom formatting for Pakistani Rupees since 'en-PK' may not be fully supported
  return `₨${Math.round(value).toLocaleString('en-US')}`;
}
