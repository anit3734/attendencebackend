import { CompanyRepository } from "@/repositories/company.repository";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateGeofenceInput,
  UpdateSettingsInput,
} from "@/validations/company.validation";
import { ConflictError, NotFoundError } from "@/errors/app-error";
import { ICompany } from "@/models/company.model";
import mongoose from "mongoose";

export class CompanyService {
  private companyRepository: CompanyRepository;

  constructor() {
    this.companyRepository = new CompanyRepository();
  }

  public async createCompany(input: CreateCompanyInput, createdByUserId: string): Promise<ICompany> {
    const existingCompany = await this.companyRepository.findByCode(input.code);
    if (existingCompany) {
      throw new ConflictError(`Company with code '${input.code}' already exists`);
    }

    return await this.companyRepository.create({
      ...input,
      createdBy: new mongoose.Types.ObjectId(createdByUserId),
    });
  }

  public async getCompanyById(id: string): Promise<ICompany> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }
    return company;
  }

  public async getAllCompanies(): Promise<ICompany[]> {
    return await this.companyRepository.findAll();
  }

  public async updateCompany(id: string, input: UpdateCompanyInput): Promise<ICompany> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    if (input.code && input.code !== company.code) {
      const existing = await this.companyRepository.findByCode(input.code);
      if (existing) {
        throw new ConflictError(`Company code '${input.code}' is already taken`);
      }
    }

    const updated = await this.companyRepository.update(id, input);
    if (!updated) {
      throw new NotFoundError("Failed to update company");
    }
    return updated;
  }

  public async updateGeofence(id: string, input: UpdateGeofenceInput): Promise<ICompany> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const updated = await this.companyRepository.updateGeofence(id, input);
    if (!updated) {
      throw new NotFoundError("Failed to update company geofence");
    }
    return updated;
  }

  public async updateSettings(id: string, input: UpdateSettingsInput): Promise<ICompany> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const mergedSettings = {
      ...company.settings,
      ...input,
    };

    const updated = await this.companyRepository.updateSettings(id, mergedSettings);
    if (!updated) {
      throw new NotFoundError("Failed to update company settings");
    }
    return updated;
  }
}
