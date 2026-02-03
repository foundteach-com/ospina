import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating token payload:', { 
      sub: payload.sub, 
      username: payload.username, 
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat 
    });
    
    if (!payload.sub || !payload.username) {
      console.error('[JwtStrategy] Invalid token payload - missing required fields');
      throw new UnauthorizedException('Invalid token payload');
    }
    
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
