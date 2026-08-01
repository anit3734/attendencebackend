import bcrypt from "bcryptjs";

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
