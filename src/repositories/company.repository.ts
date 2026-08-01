import { Company, ICompany, IOfficeLocation, ICompanySettings } from "@/models/company.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class CompanyRepository {
  public async create(companyData: Partial<ICompany>): Promise<ICompany> {
    await connectDB();
    const company = new Company(companyData);
    return await company.save();
  }

  public async findById(id: string): Promise<ICompany | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Company.findById(id).exec();
  }

  public async findByCode(code: string): Promise<ICompany | null> {
    await connectDB();
    return await Company.findOne({ code: code.toUpperCase() }).exec();
  }

  public async findAll(): Promise<ICompany[]> {
    await connectDB();
    return await Company.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  public async update(id: string, updateData: Partial<ICompany>): Promise<ICompany | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Company.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  public async updateGeofence(id: string, officeData: IOfficeLocation): Promise<ICompany | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Company.findByIdAndUpdate(
      id,
      { $set: { office: officeData } },
      { new: true }
    ).exec();
  }

  public async updateSettings(id: string, settingsData: Partial<ICompanySettings>): Promise<ICompany | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Company.findByIdAndUpdate(
      id,
      { $set: { settings: settingsData } },
      { new: true }
    ).exec();
  }
}
