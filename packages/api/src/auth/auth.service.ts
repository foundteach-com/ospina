import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('[AuthService] Validating user:', email);
    const user = await this.usersService.findOne(email);
    
    if (!user) {
      console.error('[AuthService] User not found:', email);
      return null;
    }
    
    console.log('[AuthService] User found, checking password');
    const passwordMatch = await bcrypt.compare(pass, user.password);
    
    if (passwordMatch) {
      console.log('[AuthService] Password match successful');
      const { password, ...result } = user;
      return result;
    }
    
    console.error('[AuthService] Password mismatch for user:', email);
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };

    // Calcular segundos hasta las 23:59:59 del día actual (hora del servidor)
    const now = new Date();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 0
    );
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    // Mínimo 60 segundos para no bloquear un login justo antes de medianoche
    const expiresIn = Math.max(secondsUntilEndOfDay, 60);

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(user: any) {
    // Check if user exists
    const existingUser = await this.usersService.findOne(user.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newUser = await this.usersService.createUser({
      ...user,
      password: hashedPassword,
    });
    
    return this.login(newUser);
  }
}
