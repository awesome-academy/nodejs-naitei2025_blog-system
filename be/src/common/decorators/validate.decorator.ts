import { applyDecorators } from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const Required = (name: string) =>
  applyDecorators(IsNotEmpty({ message: `${name} should not be empty` }));

const Optional = (name: string) => applyDecorators(IsOptional());

export const StringRequired = (name: string) =>
  applyDecorators(
    Required(name),
    IsString({ message: `${name} must be a string` }),
  );

export const NumberRequired = (name: string) =>
  applyDecorators(
    Required(name),
    IsNumber({}, { message: `${name} must be a number` }),
  );

export const EmailRequired = (name: string) =>
  applyDecorators(
    Required(name),
    IsEmail({}, { message: `${name} must be a valid email` }),
  );

export const StringOptional = (name: string) =>
  applyDecorators(
    Optional(name),
    IsString({ message: `${name} must be a string` }),
  );

export const NumberOptional = (name: string) =>
  applyDecorators(
    Optional(name),
    IsNumber({}, { message: `${name} must be a number` }),
  );

export const LengthDistance = (min: number, max: number, name: string) =>
  applyDecorators(
    MinLength(min, {
      message: `${name} must be at least ${min} characters long`,
    }),
    MaxLength(max, {
      message: `${name} must be at most ${max} characters long`,
    }),
  );
