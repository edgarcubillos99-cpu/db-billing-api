import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca si la ruta tiene el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si no tiene el decorador, permite el paso (significa que es una ruta pública o solo requiere JWT normal)
    if (!requiredRoles) {
      return true;
    }
    
    // Extrae al usuario que el JwtStrategy acaba de validar
    const { user } = context.switchToHttp().getRequest();
    
    // Verifica si el rol del usuario está dentro de los roles permitidos para esta ruta
    return requiredRoles.some((role) => user.role === role);
  }
}