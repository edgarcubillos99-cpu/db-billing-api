import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // private readonly usersService: UsersService // <-- Para validar que el usuario aún existe
  ) {
    super({
      // Extrae el token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rechaza tokens expirados
      secretOrKey: 'super_secret_key_change_me_in_production', // Debe ser EXACTAMENTE el mismo secret del AuthModule
    });
  }

  // Este método se ejecuta automáticamente si el token es válido y no ha expirado
  async validate(payload: any) {
    // El "payload" es la información que guardaste al hacer el login (ej: el ID del usuario)
    
    // Opcional pero recomendado: Verificar en base de datos si el usuario sigue activo
    // const user = await this.usersService.findOne(payload.sub);
    // if (!user) throw new UnauthorizedException();

    // Lo que retornes aquí se inyectará en los controladores dentro de `req.user`
    return { userId: payload.sub, username: payload.username };
  }
}