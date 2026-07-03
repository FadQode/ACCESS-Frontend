import { z } from "zod";
import { quickResponseTargetSchema } from "./quick-response.schema";

const quickResponseReferenceUsageTypeSchema = z.enum([
  "response_basis",
  "template_used",
  "policy_support",
  "known_issue",
  "previous_resolution",
  "action_closure",
  "closure_support",
]);

const nullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const finalClosureSchema = z.object({
  complaintId: z.string().trim().min(1, "Complaint wajib dipilih."),
  references: z
    .array(
      z.object({
        note: nullableTextSchema,
        referenceSourceId: z.string().trim().min(1),
        selectionSource: z
          .enum(["agent_selected", "manager_attached"])
          .optional(),
        usageType: quickResponseReferenceUsageTypeSchema,
      }),
    )
    .max(10, "Maksimal 10 referensi dapat dicatat.")
    .optional(),
  response: z.object({
    finalResponse: z
      .string()
      .trim()
      .min(5, "Balasan akhir minimal 5 karakter.")
      .max(2000, "Balasan akhir maksimal 2000 karakter."),
    outcome: z.literal("sent_resolved"),
    responseTarget: quickResponseTargetSchema.default("public_reply"),
    responseTone: nullableTextSchema,
    selectedApologize: nullableTextSchema,
    selectedEmpathize: nullableTextSchema,
    selectedHear: nullableTextSchema,
    selectedTakeAction: nullableTextSchema,
  }),
  ticketId: z.string().trim().min(1, "Ticket wajib dipilih."),
});

export type FinalClosureSchemaInput = z.input<typeof finalClosureSchema>;
