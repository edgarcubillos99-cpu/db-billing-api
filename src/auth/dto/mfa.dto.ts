import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class MfaDto {
  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos de tu Authenticator' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  mfaCode: string;
}