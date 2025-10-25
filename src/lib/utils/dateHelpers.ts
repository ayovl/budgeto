/**
 * Format date to display as "1 August 2026" instead of "8/1/2026"
 */
export const formatDateReadable = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }
  
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Calculate months between two dates
 */
export const calculateMonthsBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return 0;
  }
  
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  
  return yearDiff * 12 + monthDiff;
};

/**
 * Calculate remaining months based on current savings and monthly contribution
 */
export const calculateRemainingMonths = (
  targetAmount: number,
  currentSaved: number,
  monthlySavings: number
): number => {
  if (monthlySavings <= 0 || currentSaved >= targetAmount) {
    return 0;
  }
  
  const remaining = targetAmount - currentSaved;
  return Math.ceil(remaining / monthlySavings);
};

/**
 * Calculate new target date based on current progress
 */
export const calculateNewTargetDate = (
  currentSaved: number,
  targetAmount: number,
  monthlySavings: number,
  startDate: string,
  originalTargetDate?: string
): string => {
  // If no money saved yet, use the original target date
  if (currentSaved === 0 && originalTargetDate) {
    return originalTargetDate;
  }
  
  const remainingMonths = calculateRemainingMonths(targetAmount, currentSaved, monthlySavings);
  
  if (remainingMonths <= 0) {
    return new Date().toISOString().split('T')[0]; // Already achieved
  }
  
  // Calculate from current date forward
  const newDate = new Date();
  newDate.setMonth(newDate.getMonth() + remainingMonths);
  
  return newDate.toISOString().split('T')[0];
};