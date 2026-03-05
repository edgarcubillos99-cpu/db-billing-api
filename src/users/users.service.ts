import { Injectable, ConflictException, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit{
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // 1. Crear el primer usuario administrador por defecto
  async onModuleInit() {
    const count = await this.userRepository.count();
    
    // Si la base de datos de usuarios está vacía, creamos el primer admin
    if (count === 0) {
      this.logger.log('Base de datos de usuarios vacía. Creando usuario administrador por defecto...');
      const adminUsername = this.configService.get<string>('DEFAULT_ADMIN_USER', 'admin');
      const adminPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD', 'Admin1234!');
      await this.create(adminUsername, adminPassword, UserRole.ADMIN); // ⚠️ Cambia esta contraseña luego
      this.logger.log(`Usuario "${adminUsername}" creado con éxito a partir de las variables de entorno.`);
    }
  }

  // 2. Buscar usuario por nombre (Usado en el Login)
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  // 3. Buscar usuario por ID (Usado por el JwtStrategy y MFA)
  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 4. Crear un nuevo usuario
  async create(username: string, passwordPlain: string, role: UserRole): Promise<User> {
    // Verificamos que el usuario no exista previamente
    const existingUser = await this.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hasheamos la contraseña antes de guardarla
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    // Creamos y guardamos el usuario
    const newUser = this.userRepository.create({
      username,
      passwordHash,
      role,
      isMfaEnabled: false,
    });

    return this.userRepository.save(newUser);
  }

  // 5. Activar MFA y guardar el secreto generado por otplib
  async enableMfa(userId: string, secret: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.mfaSecret = secret;
    user.isMfaEnabled = true;
    await this.userRepository.save(user);
  }

  async disableMfa(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Borramos el secreto anterior y apagamos la bandera
    user.mfaSecret = undefined; 
    user.isMfaEnabled = false;
    
    await this.userRepository.save(user);
  }
}