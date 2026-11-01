import { userRepository } from '../repositories/UserRepository.js';
import { hashPassword, comparePassword, generateToken } from '../utils/crypto.js';
import type { RegisterUserDTO, LoginUserDTO, SafeUser } from '../models/user.dto.js';

export class AuthService {
  async register(data: RegisterUserDTO): Promise<{ user: SafeUser; token: string }> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const error: any = new Error('Email sudah terdaftar.');
      error.statusCode = 400;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await userRepository.create({
      email: data.email,
      password_hash: passwordHash,
      full_name: data.full_name,
      role: 'PUBLIC',
    });

    const token = generateToken(newUser);
    return { user: newUser, token };
  }

  async login(data: LoginUserDTO): Promise<{ user: SafeUser; token: string }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      const error: any = new Error('Email atau password tidak sesuai.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await comparePassword(data.password, user.password_hash);
    if (!isMatch) {
      const error: any = new Error('Email atau password tidak sesuai.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    const token = generateToken(safeUser);
    return { user: safeUser, token };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  }
}

export const authService = new AuthService();

