import { Controller, Get, Post, Body, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { RecordsService } from './records.service';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener registros con filtros dinámicos y paginación' })
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filters: GetRecordsFilterDto) {
    return this.recordsService.findAll(filters);
  }

  @Get('stats/by-client')
  @ApiOperation({ summary: 'Obtener totales agrupados por cliente' })
  getStatsByClient() {
    return this.recordsService.getStatsByClient();
  }

  @Get('stats/by-agent')
  @ApiOperation({ summary: 'Obtener totales agrupados por agente' })
  getStatsByAgent() {
    return this.recordsService.getStatsByAgent();
  }

  @Get('stats/amount-summary')
  @ApiOperation({ summary: 'Obtener resumen de montos agrupados por tipo' })
  getAmountSummary(@Query('date_from') date_from?: string, @Query('date_to') date_to?: string) {
    return this.recordsService.getAmountSummary(date_from, date_to);
  }

  @Post('search')
  @ApiOperation({ summary: 'Búsqueda avanzada usando payload JSON (Ideal para múltiples IN, OR)' })
  advancedSearch(@Body() searchPayload: any) {
    return this.recordsService.advancedSearch(searchPayload);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }
}