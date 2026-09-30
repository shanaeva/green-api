export type GreenApiRequestInput = Record<string, unknown>;

export type GreenApiCredentials = {
  idInstance: string;
  apiTokenInstance: string;
  phoneNumber: string;
};

export const readJsonObject = async (
  request: Request,
): Promise<GreenApiRequestInput | null> => {
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
};

export const getNonEmptyString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const getGreenApiCredentials = (
  input: GreenApiRequestInput,
): GreenApiCredentials => ({
  idInstance: getNonEmptyString(input.idInstance),
  apiTokenInstance: getNonEmptyString(input.apiTokenInstance),
  phoneNumber: getNonEmptyString(input.phoneNumber).replace(/\D/g, ""),
});

export const getGreenApiBaseUrl = () =>
  process.env.GREEN_API_URL?.replace(/\/+$/, "");

const isRecord = (value: unknown): value is GreenApiRequestInput =>
  typeof value === "object" && value !== null && !Array.isArray(value);
