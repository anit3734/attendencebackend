import { User, IUser } from "@/models/user.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class UserRepository {
  public async create(userData: Partial<IUser>): Promise<IUser> {
    await connectDB();
    const user = new User(userData);
    return await user.save();
  }

  public async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    await connectDB();
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  public async findById(id: string, includeRefreshToken = false): Promise<IUser | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const query = User.findById(id);
    if (includeRefreshToken) {
      query.select("+refreshToken");
    }
    return await query.exec();
  }

  public async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }
    await User.findByIdAndUpdate(id, { $set: { refreshToken } }, { new: true }).exec();
  }
}
