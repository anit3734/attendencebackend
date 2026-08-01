import { HolidayRepository } from "@/repositories/holiday.repository";
import { CompanyRepository } from "@/repositories/company.repository";
import { CreateHolidayInput, UpdateHolidayInput } from "@/validations/holiday.validation";
import { ConflictError, NotFoundError } from "@/errors/app-error";
import { IHoliday, HolidayType } from "@/models/holiday.model";
import mongoose from "mongoose";

export class HolidayService {
  private holidayRepository: HolidayRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.holidayRepository = new HolidayRepository();
    this.companyRepository = new CompanyRepository();
  }

  public async createHoliday(input: CreateHolidayInput, createdByUserId: string): Promise<IHoliday> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new NotFoundError("Target company not found");
    }

    const existing = await this.holidayRepository.findByCompanyAndDate(input.companyId, input.date);
    if (existing) {
      throw new ConflictError(`A holiday on '${input.date}' already exists for this company`);
    }

    const year = parseInt(input.date.split("-")[0], 10);

    return await this.holidayRepository.create({
      companyId: new mongoose.Types.ObjectId(input.companyId),
      title: input.title,
      date: input.date,
      year,
      type: input.type,
      description: input.description,
      createdBy: new mongoose.Types.ObjectId(createdByUserId),
    });
  }

  public async getCompanyHolidays(companyId: string, year?: number, type?: HolidayType): Promise<IHoliday[]> {
    const targetYear = year || new Date().getFullYear();
    return await this.holidayRepository.findCompanyHolidays(companyId, targetYear, type);
  }

  public async getHolidayById(id: string): Promise<IHoliday> {
    const holiday = await this.holidayRepository.findById(id);
    if (!holiday || !holiday.isActive) {
      throw new NotFoundError("Holiday record not found");
    }
    return holiday;
  }

  public async updateHoliday(id: string, input: UpdateHolidayInput): Promise<IHoliday> {
    const holiday = await this.holidayRepository.findById(id);
    if (!holiday || !holiday.isActive) {
      throw new NotFoundError("Holiday record not found");
    }

    let year = holiday.year;
    if (input.date) {
      year = parseInt(input.date.split("-")[0], 10);
      const existing = await this.holidayRepository.findByCompanyAndDate(holiday.companyId.toString(), input.date);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`A holiday on '${input.date}' already exists for this company`);
      }
    }

    const updated = await this.holidayRepository.update(id, {
      ...input,
      year,
    });

    if (!updated) {
      throw new NotFoundError("Failed to update holiday record");
    }
    return updated;
  }

  public async deleteHoliday(id: string): Promise<void> {
    const holiday = await this.holidayRepository.findById(id);
    if (!holiday || !holiday.isActive) {
      throw new NotFoundError("Holiday record not found");
    }

    await this.holidayRepository.delete(id);
  }
}
