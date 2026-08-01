import { EmployeeRepository } from "@/repositories/employee.repository";
import { UserRepository } from "@/repositories/user.repository";
import { CompanyRepository } from "@/repositories/company.repository";
import { PasswordUtil } from "@/utils/password.util";
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/validations/employee.validation";
import { ConflictError, NotFoundError, BadRequestError } from "@/errors/app-error";
import { IEmployee, EmployeeStatus } from "@/models/employee.model";
import { UserRole } from "@/constants/roles";
import { User } from "@/models/user.model";
import mongoose from "mongoose";

export class EmployeeService {
  private employeeRepository: EmployeeRepository;
  private userRepository: UserRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
  }

  public async createEmployee(input: CreateEmployeeInput): Promise<IEmployee> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new NotFoundError("Target company does not exist");
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const existingEmpId = await this.employeeRepository.findByEmployeeId(input.employeeId, input.companyId);
    if (existingEmpId) {
      throw new ConflictError(`Employee ID '${input.employeeId}' already exists in this company`);
    }

    const hashedPassword = await PasswordUtil.hashPassword(input.password);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      companyId: new mongoose.Types.ObjectId(input.companyId),
    });

    const employee = await this.employeeRepository.create({
      userId: user._id,
      companyId: new mongoose.Types.ObjectId(input.companyId),
      employeeId: input.employeeId,
      designation: input.designation,
      department: input.department,
      joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
      phone: input.phone,
      emergencyContact: input.emergencyContact,
      salary: input.salary,
      employmentType: input.employmentType,
      managerId: input.managerId ? new mongoose.Types.ObjectId(input.managerId) : null,
    });

    const populated = await this.employeeRepository.findById(employee._id.toString());
    return populated || employee;
  }

  public async getEmployeeById(id: string): Promise<IEmployee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }
    return employee;
  }

  public async getEmployeesByCompany(companyId: string, status?: EmployeeStatus): Promise<IEmployee[]> {
    return await this.employeeRepository.findAllByCompany(companyId, status);
  }

  public async updateEmployeeProfile(id: string, input: UpdateEmployeeInput): Promise<IEmployee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }

    const updated = await this.employeeRepository.update(id, {
      ...input,
      managerId: input.managerId ? new mongoose.Types.ObjectId(input.managerId) : undefined,
    });

    if (!updated) {
      throw new NotFoundError("Failed to update employee profile");
    }
    return updated;
  }

  public async assignRole(id: string, role: UserRole): Promise<IEmployee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }

    await User.findByIdAndUpdate(employee.userId._id || employee.userId, { role }).exec();

    const updated = await this.employeeRepository.findById(id);
    if (!updated) {
      throw new BadRequestError("Failed to update role");
    }
    return updated;
  }

  public async updateStatus(id: string, status: EmployeeStatus): Promise<IEmployee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }

    const isActive = status === "ACTIVE";
    await User.findByIdAndUpdate(employee.userId._id || employee.userId, { isActive }).exec();

    const updated = await this.employeeRepository.updateStatus(id, status);
    if (!updated) {
      throw new BadRequestError("Failed to update employee status");
    }
    return updated;
  }
}
