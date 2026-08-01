import { Holiday, IHoliday, HolidayType } from "@/models/holiday.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class HolidayRepository {
  public async create(holidayData: Partial<IHoliday>): Promise<IHoliday> {
    await connectDB();
    const holiday = new Holiday(holidayData);
    return await holiday.save();
  }

  public async findById(id: string): Promise<IHoliday | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Holiday.findById(id).populate("createdBy", "name email").exec();
  }

  public async findByCompanyAndDate(companyId: string, date: string): Promise<IHoliday | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return null;
    }
    return await Holiday.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      date,
      isActive: true,
    }).exec();
  }

  public async findCompanyHolidays(
    companyId: string,
    year?: number,
    type?: HolidayType
  ): Promise<IHoliday[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isActive: true,
    };

    if (year) query.year = year;
    if (type) query.type = type;

    return await Holiday.find(query).sort({ date: 1 }).exec();
  }

  public async update(id: string, updateData: Partial<IHoliday>): Promise<IHoliday | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Holiday.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  public async delete(id: string): Promise<boolean> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const res = await Holiday.findByIdAndUpdate(id, { $set: { isActive: false } }).exec();
    return !!res;
  }
}
