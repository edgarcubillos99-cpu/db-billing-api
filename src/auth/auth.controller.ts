import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El nombre de usuario ya existe.' })
  async register(@Body() authCredentialsDto: LoginDto) {
    const { username, password } = authCredentialsDto;
    
    // Llamamos al UsersService para crear al usuario en la base de datos
    const newUser = await this.usersService.create(username, password);
    
    return {
      message: 'Usuario creado exitosamente',
      userId: newUser.id,
      username: newUser.username
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() authCredentialsDto: LoginDto) {
    const { username, password } = authCredentialsDto;
    
    // 1. Validamos que el usuario y la contraseña sean correctos
    const user = await this.authService.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificamos si tiene MFA activo
    if (user.isMfaEnabled) {
      return { 
        mfaRequired: true, 
        userId: user.id, 
        message: 'Se requiere verificación de dos pasos (MFA)' 
      }; 
    }
    
    // 3. Si no tiene MFA, generamos y devolvemos el token JWT directamente
    return this.authService.login(user);
  }
}