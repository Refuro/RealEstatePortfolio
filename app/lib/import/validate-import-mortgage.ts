import type { ImportRow } from "@/lib/import/csv-parser";
import {
  validateEscrowAmount,
  validateMortgagePiCoversInterestFields,
} from "@/lib/validations/mortgage";

/**
 * When CSV rows include enough mortgage fields to create a loan, enforce the same
 * escrow and P&I rules as `createMortgageSchema` / mortgage API routes.
 * @returns error message if invalid; `null` if no mortgage or valid.
 */
export function getImportMortgageValidationError(r: ImportRow): string | null {
  const hasMortgage =
    r.mortgageBalance != null &&
    r.mortgageBalance > 0 &&
    r.monthlyPayment != null &&
    r.monthlyPayment > 0 &&
    r.mortgageRate != null &&
    r.mortgageTerm != null;
  if (!hasMortgage) return null;

  const termYears = r.mortgageTerm;
  if (termYears == null) return null;

  const monthlyStr = String(r.monthlyPayment);
  const escrowStr =
    r.escrowAmount != null && r.escrowAmount > 0
      ? String(r.escrowAmount)
      : null;

  const escrowCheck = validateEscrowAmount(escrowStr, monthlyStr);
  if (!escrowCheck.success) return escrowCheck.error;

  const originalLoan = r.originalLoanAmount ?? r.mortgageBalance;
  const pi = validateMortgagePiCoversInterestFields({
    originalLoanAmount: String(originalLoan),
    currentBalance: String(r.mortgageBalance),
    interestRate: String(r.mortgageRate),
    termYears,
    startDate: r.mortgageStartDate ?? r.purchaseDate,
    monthlyPayment: monthlyStr,
    escrowIncluded: escrowStr != null,
    escrowAmount: escrowStr,
  });
  if (!pi.ok) return pi.message;
  return null;
}
