import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    DeleteDateColumn, 
    Index 
  } from 'typeorm';
  
  @Entity('records')
  @Index(['client_id', 'date']) // Índice compuesto para búsquedas comunes
  export class RecordEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string; // BigInt se mapea como string en JS para evitar pérdida de precisión
  
    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;
  
    @DeleteDateColumn({ type: 'datetime', nullable: true })
    deleted_at: Date;
  
    @Index()
    @Column({ type: 'varchar', length: 100, nullable: true })
    client_id: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    client: string;
  
    @Index()
    @Column({ type: 'datetime', precision: 3, nullable: true })
    date: Date;
  
    @Index()
    @Column({ type: 'varchar', length: 100, nullable: true })
    type: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number;
  
    @Index()
    @Column({ type: 'varchar', length: 100, nullable: true })
    agent: string;
  }