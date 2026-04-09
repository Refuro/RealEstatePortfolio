/**
 * Rent-vs-buy educational calculator — pure functions.
 * Model uses yearly simulation with mortgage amortization, appreciation, and rent growth.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function monthlyMortgagePayment(loanAmount: number, monthlyRate: number, termMonths: number): number {
  if (loanAmount <= 0 || termMonths <= 0) return 0;
  if (monthlyRate === 0) return loanAmount / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

export type RentVsBuyInput = {
  monthlyRent: number;
  annualRentGrowthPercent: number;
  homePrice: number;
  downPaymentPercent: number;
  mortgageRatePercent: number;
  loanTermYears: number;
  annualAppreciationPercent: number;
  investmentReturnPercent: number;
  annualPropertyTaxPercent: number;
  monthlyInsuranceAndMaintenance: number;
  horizonYears: number;
};

export type RentVsBuyYearData = {
  year: number;
  cumulativeRentCost: number;
  cumulativeOwnCost: number;
  ownNetCost: number;
};

export type RentVsBuyResult = {
  breakEvenYear: number | null;
  yearData: RentVsBuyYearData[];
  costAt5Years: { rent: number; own: number; delta: number };
  costAt10Years: { rent: number; own: number; delta: number };
  costAt20Years: { rent: number; own: number; delta: number };
};

export function computeRentVsBuyResult(input: RentVsBuyInput): RentVsBuyResult {
  const monthlyRent = Math.max(0, input.monthlyRent);
  const annualRentGrowth = clamp(input.annualRentGrowthPercent, -10, 20) / 100;
  const homePrice = Math.max(0, input.homePrice);
  const downPaymentPercent = clamp(input.downPaymentPercent, 0, 100);
  const mortgageRate = clamp(input.mortgageRatePercent, 0, 30) / 100;
  const loanTermYears = clamp(input.loanTermYears, 1, 50);
  const annualAppreciation = clamp(input.annualAppreciationPercent, -10, 20) / 100;
  const investmentReturn = clamp(input.investmentReturnPercent, -20, 30) / 100;
  const annualPropertyTaxRate = clamp(input.annualPropertyTaxPercent, 0, 10) / 100;
  const monthlyInsuranceAndMaintenance = Math.max(0, input.monthlyInsuranceAndMaintenance);
  const horizonYears = Math.round(clamp(input.horizonYears, 1, 30));

  const downPayment = homePrice * (downPaymentPercent / 100);
  const initialLoanAmount = Math.max(0, homePrice - downPayment);
  const termMonths = Math.round(loanTermYears * 12);
  const monthlyRate = mortgageRate / 12;
  const payment = monthlyMortgagePayment(initialLoanAmount, monthlyRate, termMonths);

  let remainingBalance = initialLoanAmount;
  let cumulativeRentPayments = 0;
  let cumulativeOwnerOutflows = downPayment;

  const yearData: RentVsBuyYearData[] = [];
  let breakEvenYear: number | null = null;

  for (let year = 1; year <= horizonYears; year++) {
    const annualRent = monthlyRent * Math.pow(1 + annualRentGrowth, year - 1) * 12;
    cumulativeRentPayments += annualRent;

    let annualMortgagePaid = 0;
    for (let month = 0; month < 12; month++) {
      const monthIndex = (year - 1) * 12 + month;
      if (monthIndex >= termMonths || remainingBalance <= 0) break;
      const interest = remainingBalance * monthlyRate;
      let principal = payment - interest;
      if (principal < 0) principal = 0;
      if (principal > remainingBalance) principal = remainingBalance;
      remainingBalance = Math.max(0, remainingBalance - principal);
      annualMortgagePaid += principal + interest;
    }

    const homeValue = homePrice * Math.pow(1 + annualAppreciation, year);
    const annualPropertyTax = homeValue * annualPropertyTaxRate;
    const annualInsuranceMaintenance = monthlyInsuranceAndMaintenance * 12;
    cumulativeOwnerOutflows += annualMortgagePaid + annualPropertyTax + annualInsuranceMaintenance;

    const foregoneReturns = downPayment * (Math.pow(1 + investmentReturn, year) - 1);
    const cumulativeRentCost = cumulativeRentPayments + foregoneReturns;

    const principalPaydown = initialLoanAmount - remainingBalance;
    const appreciationGain = homeValue - homePrice;
    const equityGained = principalPaydown + appreciationGain;
    const ownNetCost = cumulativeOwnerOutflows - equityGained;

    const row: RentVsBuyYearData = {
      year,
      cumulativeRentCost,
      cumulativeOwnCost: cumulativeOwnerOutflows,
      ownNetCost,
    };
    yearData.push(row);

    if (breakEvenYear == null && ownNetCost < cumulativeRentCost) {
      breakEvenYear = year;
    }
  }

  const costAt = (targetYear: number) => {
    const row = yearData[Math.min(targetYear, horizonYears) - 1] ?? yearData[yearData.length - 1];
    const rent = row?.cumulativeRentCost ?? 0;
    const own = row?.ownNetCost ?? 0;
    return { rent, own, delta: own - rent };
  };

  return {
    breakEvenYear,
    yearData,
    costAt5Years: costAt(5),
    costAt10Years: costAt(10),
    costAt20Years: costAt(20),
  };
}
