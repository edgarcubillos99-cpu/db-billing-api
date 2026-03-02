import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetRecordsFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  client_id?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  client?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  type?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  agent?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  date_from?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  date_to?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  amount_min?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  amount_max?: number;

  @ApiPropertyOptional({ default: 50 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional() @IsOptional() @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({ enum: SortOrder }) @IsOptional() @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}