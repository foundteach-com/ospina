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
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
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
