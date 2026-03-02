import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetRecordsFilterDto {
  @ApiPropertyOptional({ description: 'ID único del cliente', example: 'C-1029' }) 
  @IsOptional() @IsString()
  client_id?: string;

  @ApiPropertyOptional({ description: 'Nombre o razón social del cliente', example: 'ACME Corp' }) 
  @IsOptional() @IsString()
  client?: string;

  @ApiPropertyOptional({ description: 'Tipo de transacción', example: 'pago' }) 
  @IsOptional() @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Agente que registró la operación', example: 'agente_04' }) 
  @IsOptional() @IsString()
  agent?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO 8601)', example: '2026-01-01T00:00:00Z' }) 
  @IsOptional() @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO 8601)', example: '2026-01-31T23:59:59Z' }) 
  @IsOptional() @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Monto mínimo a buscar', example: 100.50 }) 
  @IsOptional() @Type(() => Number) @IsNumber()
  amount_min?: number;

  @ApiPropertyOptional({ description: 'Monto máximo a buscar', example: 5000.00 }) 
  @IsOptional() @Type(() => Number) @IsNumber()
  amount_max?: number;

  @ApiPropertyOptional({ description: 'Cantidad de registros por página', default: 50, example: 20 }) 
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Página actual para paginación', default: 1, example: 1 }) 
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Columna por la que se ordenarán los resultados', default: 'created_at', example: 'amount' }) 
  @IsOptional() @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Dirección del ordenamiento', enum: SortOrder, default: SortOrder.DESC, example: SortOrder.DESC }) 
  @IsOptional() @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}