import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const deletePermanentAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmText: z.literal("DELETE", {
    message:
      "Confirmation required: type DELETE to permanently delete your account",
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type DeletePermanentAccountInput = z.infer<
  typeof deletePermanentAccountSchema
>;
