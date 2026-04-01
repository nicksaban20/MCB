export type OrderSampleInput = {
  no?: string | number | null;
  hash?: string | number | null;
  name?: string | null;
  sampleName?: string | null;
  notes?: string | null;
  specialInstruction?: string | null;
};

export type OrderPayload = {
  sampleType?: string;
  sample_type?: string;
  dnaType?: string;
  dna_type?: string;
  dnaQuantity?: string | number | null;
  dna_quantity?: string | number | null;
  primerDetails?: string | null;
  primer_details?: string | null;
  plateName?: string | null;
  plate_name?: string | null;
  samples?: OrderSampleInput[];
};

export function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredString(value: unknown) {
  const normalized = normalizeOptionalString(value);
  return normalized ?? '';
}

export function normalizeOrderPayload(payload: OrderPayload) {
  const sampleType = normalizeRequiredString(payload.sampleType ?? payload.sample_type);
  const dnaType = normalizeOptionalString(payload.dnaType ?? payload.dna_type);
  const dnaQuantity = normalizeOptionalString(
    payload.dnaQuantity?.toString() ?? payload.dna_quantity?.toString()
  );
  const primerDetails = normalizeOptionalString(payload.primerDetails ?? payload.primer_details);
  const plateName = normalizeOptionalString(payload.plateName ?? payload.plate_name);
  const rawSamples = Array.isArray(payload.samples) ? payload.samples : [];

  const samples = rawSamples
    .map((sample, index) => ({
      sample_no: normalizeOptionalString(
        sample.no?.toString() ?? sample.hash?.toString() ?? `${index + 1}`
      ),
      name: normalizeOptionalString(sample.name ?? sample.sampleName) ?? `Sample ${index + 1}`,
      notes: normalizeOptionalString(sample.notes ?? sample.specialInstruction),
    }))
    .filter((sample) => sample.name);

  return {
    sampleType,
    dnaType,
    dnaQuantity,
    primerDetails,
    plateName,
    samples,
  };
}

export function validateOrderPayload(payload: ReturnType<typeof normalizeOrderPayload>) {
  const errors: string[] = [];

  if (!payload.sampleType) {
    errors.push('sampleType is required');
  }

  return errors;
}
