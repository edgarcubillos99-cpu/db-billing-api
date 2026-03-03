import { Controller, Post, Body, UnauthorizedException, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from './decorators/roles.decorator';
import { MfaDto } from './dto/mfa.dto';
import { MfaService } from './mfa.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mfaService: MfaService,
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('mfa/generate')
  @ApiOperation({ summary: 'Generar código QR para activar MFA' })
  async generateMfaSecret(@Req() req: any) {
    // 1. Buscamos al usuario en base a su token
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 2. Generamos el secreto y el QR
    const { secret, qrCodeUrl } = await this.mfaService.generateMfaSecret(user);
    
    // 3. Guardamos el secreto en la base de datos (y activamos el MFA)
    await this.usersService.enableMfa(user.id, secret);

    return {
      message: 'Escanea el código QR con tu aplicación de autenticación',
      qrCodeUrl // Esto es un string base64 que puedes poner en un tag <img> en tu frontend
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt')) // En un flujo real, aquí usarías un JWT 'parcial' o temporal
  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verificar código MFA' })
  async verifyMfa(@Req() req: any, @Body() mfaDto: MfaDto) {
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = this.mfaService.isMfaCodeValid(mfaDto.mfaCode, user);
    
    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    // Si es válido, devuelves un nuevo JWT o simplemente un mensaje de éxito
    return {
      message: 'MFA verificado correctamente',
      // access_token: this.authService.login(user).access_token // (Opcional) Retornar un token renovado
    };
  }
}

