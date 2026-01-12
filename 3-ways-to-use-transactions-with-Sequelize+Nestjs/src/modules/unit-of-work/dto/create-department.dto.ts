import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export class CreateDepartmentBody {
  @ApiProperty({ example: 'Engineering' })
  name!: string;
}

export const createDepartmentSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();
