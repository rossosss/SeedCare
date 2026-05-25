import { adminPlantSchema } from "@/lib/validation";

export type AdminPlantBody = unknown;

export function validatePlantPayload(body: AdminPlantBody) {
  const parsed = adminPlantSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Проверьте данные растения."
    };
  }

  return {
    ok: true as const,
    data: parsed.data
  };
}
