import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ResetMfaDto {
  @ApiProperty({ 
    example: '1c571b5a-21c2-4753-a1e1-a08ae9ae60e7', 
    description: 'ID único (UUID) del usuario al que se le va a resetear el MFA' 
  })
  @IsUUID(4, { message: 'El ID proporcionado no es un UUID válido' })
  @IsNotEmpty()
  userId: string;
}