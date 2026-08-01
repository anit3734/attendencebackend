import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z
    .string()
    .min(1, { message: "MONGODB_URI is required" })
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      { message: "MONGODB_URI must start with mongodb:// or mongodb+srv://" }
    ),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, { message: "JWT_ACCESS_SECRET must be at least 32 characters long" }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: "JWT_REFRESH_SECRET must be at least 32 characters long" }),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Environment Variable Validation Errors:", result.error.format());
    throw new Error("Invalid Environment Variables");
  }
  return result.data;
};

export const env = parseEnv();
