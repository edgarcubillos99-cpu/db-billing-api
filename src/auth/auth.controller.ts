import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from './decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario (Requiere token)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El nombre de usuario ya existe.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async register(@Body() authCredentialsDto: LoginDto) {
    const { username, password } = authCredentialsDto;
    
    // Al no pasar un tercer parámetro, los usuarios creados aquí serán Role.USER por defecto
    const newUser = await this.usersService.create(username, password, UserRole.USER);
    
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