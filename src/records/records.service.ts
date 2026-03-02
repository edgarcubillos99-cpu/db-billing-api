import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RecordEntity } from './entities/record.entity';
import { GetRecordsFilterDto } from './dto/get-records-filter.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordsRepository: Repository<RecordEntity>,
  ) {}

  async findAll(filters: GetRecordsFilterDto) {
    const { 
      client_id, client, type, agent, date_from, date_to, 
      amount_min, amount_max, limit = 50, page = 1, sort_by = 'created_at', order = 'DESC' 
    } = filters;

    const query = this.recordsRepository.createQueryBuilder('record')
      // Evitamos SELECT * - Seleccionamos explícitamente las columnas necesarias
      .select([
        'record.id', 'record.client_id', 'record.client', 'record.date', 
        'record.type', 'record.amount', 'record.agent', 'record.created_at'
      ]);

    // Aplicación de filtros dinámicos
    if (client_id) query.andWhere('record.client_id = :client_id', { client_id });
    if (client) query.andWhere('record.client LIKE :client', { client: `%${client}%` });
    if (type) query.andWhere('record.type = :type', { type });
    if (agent) query.andWhere('record.agent = :agent', { agent });
    
    if (date_from) query.andWhere('record.date >= :date_from', { date_from });
    if (date_to) query.andWhere('record.date <= :date_to', { date_to });
    
    if (amount_min) query.andWhere('record.amount >= :amount_min', { amount_min });
    if (amount_max) query.andWhere('record.amount <= :amount_max', { amount_max });

    // Paginación y Ordenamiento
    query.orderBy(`record.${sort_by}`, order)
         .skip((page - 1) * limit)
         .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const record = await this.recordsRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  // --- AGREGACIONES ---
  async getStatsByClient() {
    return this.recordsRepository.createQueryBuilder('record')
      .select('record.client_id', 'client_id')
      .addSelect('record.client', 'client')
      .addSelect('SUM(record.amount)', 'total_amount')
      .addSelect('COUNT(record.id)', 'total_transactions')
      .groupBy('record.client_id')
      .addGroupBy('record.client')
      .getRawMany();
  }

  async getStatsByAgent() {
    return this.recordsRepository.createQueryBuilder('record')
      .select('record.agent', 'agent')
      .addSelect('SUM(record.amount)', 'total_amount')
      .addSelect('COUNT(record.id)', 'total_transactions')
      .groupBy('record.agent')
      .getRawMany();
  }

  async getAmountSummary(date_from?: string, date_to?: string) {
    const query = this.recordsRepository.createQueryBuilder('record')
      .select('record.type', 'type')
      .addSelect('SUM(record.amount)', 'total_amount');

    if (date_from) query.andWhere('record.date >= :date_from', { date_from });
    if (date_to) query.andWhere('record.date <= :date_to', { date_to });

    return query.groupBy('record.type').getRawMany();
  }

  // Búsqueda Avanzada (Usualmente manejada por POST para soportar payloads JSON complejos como arrays de IDs)
  async advancedSearch(searchPayload: any) {
    // Aquí puedes expandir para soportar operadores lógicos complejos (OR, IN, NOT IN) 
    // que son engorrosos de enviar por query params.
    const query = this.recordsRepository.createQueryBuilder('record');
    
    if (searchPayload.types && searchPayload.types.length > 0) {
      query.andWhere('record.type IN (:...types)', { types: searchPayload.types });
    }
    // ... más lógica de filtros complejos ...

    return query.take(100).getMany();
  }
}