import { z } from 'zod';

export type UserRole = 'ADMIN' | 'PUBLIC';

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<UserEntity, 'password_hash'>;

export const RegisterUserSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255),
  password: z.string().min(8, 'Password minimal 8 karakter').max(100),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

