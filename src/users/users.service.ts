import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 1. Buscar usuario por nombre (Usado en el Login)
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  // 2. Buscar usuario por ID (Usado por el JwtStrategy y MFA)
  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 3. Crear un nuevo usuario
  async create(username: string, passwordPlain: string): Promise<User> {
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
      isMfaEnabled: true, // Por defecto el MFA está encendido
    });

    return this.userRepository.save(newUser);
  }

  // 4. Activar MFA y guardar el secreto generado por otplib
  async enableMfa(userId: string, secret: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.mfaSecret = secret;
    user.isMfaEnabled = true;
    await this.userRepository.save(user);
  }
}