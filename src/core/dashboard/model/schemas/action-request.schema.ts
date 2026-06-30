import { z } from "zod";

export const takeActionSchema = z.object({
  actionTaken: z.string().trim().min(5),
  closureMessage: z.string().trim().min(5),
});
