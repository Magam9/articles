export interface IUserDepartment {
  userId: number;
  departmentId: number;
  createdAt: Date;
}

export type UserDepartmentCreationAttributes = Omit<IUserDepartment, 'createdAt'>;
