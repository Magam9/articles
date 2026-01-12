import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export class CreateUserBody {
  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'ada@company.test' })
  email!: string;
}

export const createUserSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
  })
  .strict();
