import { z } from "zod";

export const contactFormSchema = z.object({
  email: z.string().email("Valid email is required").max(255),
  subject: z.enum(
    ["general", "billing", "bug_report", "feature_request", "other"],
    { message: "Please select a subject" }
  ),
  message: z.string().min(1, "Message is required").max(5000),
  website: z.string().max(0).optional(), // honeypot - must be empty
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
