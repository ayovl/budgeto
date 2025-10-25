import jsPDF from 'jspdf';
import { formatCurrency } from './currency';
import { Expense, SavingsGoal, InvestmentPlan } from '@/lib/supabase/types';

interface ReportData {
  monthlyIncome: number;
  totalSpent: number;
  totalRemaining: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsTotal: number;
  wantsTotal: number;
  savingsTotal: number;
  needsExpenses: Expense[];
  wantsExpenses: Expense[];
  savingsExpenses: Expense[];
  goals?: SavingsGoal[];
  investments?: InvestmentPlan[];
}

export const generatePDFReport = (data: ReportData) => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Set up colors
  const primaryColor = '#3B82F6'; // Blue
  const secondaryColor = '#6B7280'; // Gray
  const accentColor = '#10B981'; // Green
  const warningColor = '#F59E0B'; // Orange
  
  // Helper function to add text with color
  const addColoredText = (text: string, x: number, y: number, color: string, fontSize = 12) => {
    doc.setTextColor(color);
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
  };

  // Helper function to draw a colored rectangle
  const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
    doc.setFillColor(color);
    doc.rect(x, y, width, height, 'F');
  };

  // Header Section
  drawRect(0, 0, 210, 30, primaryColor);
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Budgeto Monthly Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on ${currentDate}`, 150, 20);

  yPosition = 50;

  // Budget Overview Section
  doc.setTextColor('#000000');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Budget Overview', 20, yPosition);
  yPosition += 15;

  // Budget summary boxes
  const boxWidth = 50;
  const boxHeight = 25;
  const boxSpacing = 60;

  // Monthly Income Box
  drawRect(20, yPosition, boxWidth, boxHeight, '#E5F3FF');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('Monthly Income', 22, yPosition + 8);
  doc.setFontSize(14);
  doc.setTextColor('#000000');
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.monthlyIncome), 22, yPosition + 18);

  // Total Spent Box
  drawRect(20 + boxSpacing, yPosition, boxWidth, boxHeight, '#FEF3E2');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Spent', 22 + boxSpacing, yPosition + 8);
  doc.setFontSize(14);
  doc.setTextColor('#000000');
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.totalSpent), 22 + boxSpacing, yPosition + 18);

  // Remaining Budget Box
  drawRect(20 + (boxSpacing * 2), yPosition, boxWidth, boxHeight, '#F0FDF4');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Remaining', 22 + (boxSpacing * 2), yPosition + 8);
  doc.setFontSize(14);
  doc.setTextColor(data.totalRemaining >= 0 ? accentColor : '#EF4444');
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.totalRemaining), 22 + (boxSpacing * 2), yPosition + 18);

  yPosition += 40;

  // Category Breakdown Section
  doc.setTextColor('#000000');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Breakdown', 20, yPosition);
  yPosition += 10;

  // Needs Category
  const needsPercentageSpent = data.monthlyIncome > 0 ? Math.round((data.needsTotal / data.monthlyIncome) * 100) : 0;
  addColoredText(`Needs (${data.needsPercentage}%)`, 20, yPosition, primaryColor, 14);
  addColoredText(`${formatCurrency(data.needsTotal)} (${needsPercentageSpent}% of income)`, 80, yPosition, secondaryColor, 12);
  yPosition += 8;

  // Draw needs expenses
  if (data.needsExpenses.length > 0) {
    doc.setFontSize(10);
    data.needsExpenses.slice(0, 5).forEach((expense, index) => {
      doc.setTextColor(secondaryColor);
      doc.text(`• ${expense.name}`, 25, yPosition);
      doc.text(formatCurrency(expense.amount), 150, yPosition);
      yPosition += 6;
    });
    if (data.needsExpenses.length > 5) {
      doc.text(`... and ${data.needsExpenses.length - 5} more`, 25, yPosition);
      yPosition += 6;
    }
  }
  yPosition += 8;

  // Wants Category
  const wantsPercentageSpent = data.monthlyIncome > 0 ? Math.round((data.wantsTotal / data.monthlyIncome) * 100) : 0;
  addColoredText(`Wants (${data.wantsPercentage}%)`, 20, yPosition, warningColor, 14);
  addColoredText(`${formatCurrency(data.wantsTotal)} (${wantsPercentageSpent}% of income)`, 80, yPosition, secondaryColor, 12);
  yPosition += 8;

  // Draw wants expenses
  if (data.wantsExpenses.length > 0) {
    doc.setFontSize(10);
    data.wantsExpenses.slice(0, 5).forEach((expense, index) => {
      doc.setTextColor(secondaryColor);
      doc.text(`• ${expense.name}`, 25, yPosition);
      doc.text(formatCurrency(expense.amount), 150, yPosition);
      yPosition += 6;
    });
    if (data.wantsExpenses.length > 5) {
      doc.text(`... and ${data.wantsExpenses.length - 5} more`, 25, yPosition);
      yPosition += 6;
    }
  }
  yPosition += 8;

  // Savings Category
  const savingsPercentageSpent = data.monthlyIncome > 0 ? Math.round((data.savingsTotal / data.monthlyIncome) * 100) : 0;
  addColoredText(`Savings (${data.savingsPercentage}%)`, 20, yPosition, accentColor, 14);
  addColoredText(`${formatCurrency(data.savingsTotal)} (${savingsPercentageSpent}% of income)`, 80, yPosition, secondaryColor, 12);
  yPosition += 8;

  // Draw savings expenses
  if (data.savingsExpenses.length > 0) {
    doc.setFontSize(10);
    data.savingsExpenses.slice(0, 5).forEach((expense, index) => {
      doc.setTextColor(secondaryColor);
      doc.text(`• ${expense.name}`, 25, yPosition);
      doc.text(formatCurrency(expense.amount), 150, yPosition);
      yPosition += 6;
    });
    if (data.savingsExpenses.length > 5) {
      doc.text(`... and ${data.savingsExpenses.length - 5} more`, 25, yPosition);
      yPosition += 6;
    }
  }
  yPosition += 15;

  // Add new page if needed
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Savings Goals Section
  if (data.goals && data.goals.length > 0) {
    doc.setTextColor('#000000');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Savings Goals', 20, yPosition);
    yPosition += 15;

    data.goals.slice(0, 3).forEach((goal) => {
      // Calculate how much should be saved by now based on monthly savings and time elapsed
      const startDate = new Date(goal.start_date);
      const currentDate = new Date();
      const monthsElapsed = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const expectedSaved = monthsElapsed * goal.monthly_savings;
      const progress = goal.target_amount > 0 ? (expectedSaved / goal.target_amount) * 100 : 0;
      const progressColor = progress >= 100 ? accentColor : progress >= 50 ? warningColor : '#EF4444';
      
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.setFont('helvetica', 'bold');
      doc.text(goal.name, 20, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(`Target: ${formatCurrency(goal.target_amount)} by ${new Date(goal.target_date).toLocaleDateString()}`, 20, yPosition + 8);
      
      addColoredText(`Monthly Savings: ${formatCurrency(goal.monthly_savings)} • Progress: ${Math.round(progress)}%`, 20, yPosition + 16, progressColor);
      
      // Progress bar
      const barWidth = 120;
      const barHeight = 4;
      drawRect(20, yPosition + 20, barWidth, barHeight, '#E5E7EB');
      drawRect(20, yPosition + 20, (barWidth * progress) / 100, barHeight, progressColor);
      
      yPosition += 35;
    });
    yPosition += 10;
  }

  // Investment Plans Section
  if (data.investments && data.investments.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setTextColor('#000000');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Plans', 20, yPosition);
    yPosition += 15;

    data.investments.slice(0, 3).forEach((investment) => {
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.setFont('helvetica', 'bold');
      doc.text(investment.name, 20, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Investment: ${formatCurrency(investment.monthly_investment)}`, 20, yPosition + 8);
      doc.text(`Duration: ${investment.duration_months} months`, 20, yPosition + 16);
      doc.text(`Expected Return: ${investment.estimated_return_rate}% • Total: ${formatCurrency(investment.total_return)}`, 20, yPosition + 24);
      
      yPosition += 35;
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  drawRect(0, pageHeight - 20, 210, 20, '#F3F4F6');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('Generated by Budgeto - Your Personal Budget Planner', 20, pageHeight - 8);
  doc.text('budgeto.vercel.app', 170, pageHeight - 8);

  // Save the PDF
  const fileName = `Budgeto_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};