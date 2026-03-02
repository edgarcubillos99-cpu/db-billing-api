// src/records/dto/advanced-search.dto.ts
import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdvancedSearchDto {
  @ApiPropertyOptional({
    description: 'Lista de tipos de registro a filtrar',
    example: ['pago', 'reembolso'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional({
    description: 'Lista de IDs de clientes',
    example: ['C-1029', 'C-3045'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  client_ids?: string[];
}