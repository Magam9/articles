import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const error = result.error as ZodError;
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.format(),
      });
    }

    return result.data;
  }
}
