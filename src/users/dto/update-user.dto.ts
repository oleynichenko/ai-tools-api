import { IsEmail, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly age?: number;
}
