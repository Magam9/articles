export interface IDepartment {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DepartmentCreationAttributes = Omit<IDepartment, 'id' | 'createdAt' | 'updatedAt'>;
