import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id || user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, username: string, pass: string) {
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new UnauthorizedException('Username already taken');
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({ 
      email, 
      username, 
      password: hashedPassword 
    });
    return this.login(user);
  }

  async getUserProfile(userId: number) {
    return this.usersService.findOne(userId);
  }

  async updateProfile(userId: number, data: any) {
    return this.usersService.update(userId, data);
  }
}
