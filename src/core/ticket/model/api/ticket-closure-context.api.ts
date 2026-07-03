import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import { rawActionRequestReferenceSchema } from "@/core/reference/model/schemas/reference-attachment.schema";
import type { TicketClosureContext } from "../ticket.types";

const closureContextResponseSchema = z
  .object({
    attachedReferences: z.array(rawActionRequestReferenceSchema).default([]),
    attached_references: z.array(rawActionRequestReferenceSchema).optional(),
  })
  .passthrough()
  .transform<TicketClosureContext>((value) => ({
    attachedReferences:
      value.attachedReferences ?? value.attached_references ?? [],
  }));

export async function getTicketClosureContext(
  ticketId: string,
): Promise<TicketClosureContext> {
  const response = await apiClient.get<unknown>(
    `/tickets/${ticketId}/closure-context`,
  );

  return closureContextResponseSchema.parse(response);
}
