import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly age?: number;
}
