import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export class DepartmentStatusBody {
  @ApiProperty({ enum: ['deactivation'] })
  action!: 'deactivation';
}

export const departmentStatusSchema = z
  .object({
    action: z.literal('deactivation'),
  })
  .strict();
