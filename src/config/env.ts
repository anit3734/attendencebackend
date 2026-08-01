import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z
    .string()
    .default("mongodb://localhost:27017/attendance_db"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, { message: "JWT_ACCESS_SECRET must be at least 32 characters long" })
    .default("super_secret_access_token_key_change_in_production_32chars"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: "JWT_REFRESH_SECRET must be at least 32 characters long" })
    .default("super_secret_refresh_token_key_change_in_production_32chars"),
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
