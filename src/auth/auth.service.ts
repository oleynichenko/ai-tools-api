import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456',
    },
  ];

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // В реальном приложении здесь будет JWT токен
    const token = `fake-jwt-token-${user.id}`;

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { name, email, password } = registerDto;

    // Проверяем, существует ли пользователь
    const existingUser = this.users.find((u) => u.email === email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Создаем нового пользователя
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
      password,
    };
    this.users.push(newUser);

    // В реальном приложении здесь будет JWT токен
    const token = `fake-jwt-token-${newUser.id}`;

    return {
      access_token: token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  async validateUser(
    token: string,
  ): Promise<{ id: number; name: string; email: string }> {
    // В реальном приложении здесь будет валидация JWT токена
    const userId = token.replace('fake-jwt-token-', '');
    const user = this.users.find((u) => u.id === parseInt(userId));

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
