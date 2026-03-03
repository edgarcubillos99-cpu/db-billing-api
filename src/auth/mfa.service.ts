// src/auth/mfa.service.ts
import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { toDataURL } from 'qrcode';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MfaService {
  
  // 1. Generar el secreto para un usuario que quiere activar MFA
  public async generateMfaSecret(user: User) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'DB Billing API',
      label: user.username,
      secret,
    });

    return {
      secret,
      qrCodeUrl: await toDataURL(otpauthUrl),
    };
  }

  // 2. Validar el código ingresado por el usuario
  public isMfaCodeValid(mfaCode: string, user: User): boolean {
    if (!user.mfaSecret) return false;
    
    const result = verifySync({
      token: mfaCode,
      secret: user.mfaSecret,
    });
    return result.valid;
  }
}