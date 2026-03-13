/**
 * Amortization schedule generator for fixed-rate mortgages.
 * Module G — principal vs interest by month, remaining balance over time.
 */

export type AmortizationRow = {
  monthIndex: number;
  date: string; // YYYY-MM-DD
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type AmortizationInput = {
  originalLoanAmount: number;
  annualInterestRate: number;
  termYears: number;
  startDate: Date;
  monthlyPayment: number;
};

/**
 * Generate full amortization schedule for a fixed-rate loan.
 * Each row: month index, date, payment, principal, interest, remaining balance.
 */
export function generateAmortizationSchedule(input: AmortizationInput): AmortizationRow[] {
  const {
    originalLoanAmount,
    annualInterestRate,
    termYears,
    startDate,
    monthlyPayment,
  } = input;

  if (originalLoanAmount <= 0 || monthlyPayment <= 0) {
    return [];
  }

  const monthlyRate = annualInterestRate / 12;
  const totalMonths = termYears * 12;
  const schedule: AmortizationRow[] = [];

  let balance = originalLoanAmount;
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  for (let monthIndex = 0; monthIndex < totalMonths && balance > 0; monthIndex++) {
    const periodStart = new Date(start.getFullYear(), start.getMonth() + monthIndex, 1);
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;

    // Last payment: pay off remaining balance
    if (principal >= balance || monthIndex === totalMonths - 1) {
      principal = balance;
    }
    const payment = principal + interest;
    balance = Math.max(0, balance - principal);

    schedule.push({
      monthIndex,
      date: periodStart.toISOString().slice(0, 10),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}
