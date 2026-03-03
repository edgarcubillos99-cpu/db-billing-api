import { Controller, Get, Post, Body, Param, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AdvancedSearchDto } from './dto/advanced-search.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Records')
@ApiBearerAuth() // Le dice a Swagger que estos endpoints requieren un token JWT
@UseGuards(AuthGuard('jwt')) // Protege TODAS las rutas de este controlador
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
  @ApiQuery({ name: 'date_from', required: false, example: '2026-01-01', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'date_to', required: false, example: '2026-01-31', description: 'Fecha de fin (YYYY-MM-DD)' })
  getAmountSummary(@Query('date_from') date_from?: string, @Query('date_to') date_to?: string) {
    return this.recordsService.getAmountSummary(date_from, date_to);
  }

  @Post('search')
  @ApiOperation({ summary: 'Búsqueda avanzada usando payload JSON (Ideal para múltiples IN, OR)' })
  @ApiBody({
    type: AdvancedSearchDto,
    examples: {
      ejemploBasico: {
        summary: 'Búsqueda solo por tipos',
        value: { types: ['pago', 'suscripcion'] }
      },
      ejemploComplejo: {
        summary: 'Búsqueda por clientes y tipos',
        value: { types: ['reembolso'], client_ids: ['C-100', 'C-200'] }
      }
    }
  })
  advancedSearch(@Body() searchPayload: AdvancedSearchDto) { 
    return this.recordsService.advancedSearch(searchPayload);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  @ApiParam({ name: 'id', example: '9847583', description: 'ID único del registro' })
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }
}