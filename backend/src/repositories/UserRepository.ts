import { query } from '../config/database.js';
import type { UserEntity, SafeUser, UserRole } from '../models/user.dto.js';

export class UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const sql = `
      SELECT id, email, password_hash, full_name, role, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;
    const res = await query<UserEntity>(sql, [email.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<SafeUser | null> {
    const sql = `
      SELECT id, email, full_name, role, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await query<SafeUser>(sql, [id]);
    return res.rows[0] || null;
  }

  async create(data: {
    email: string;
    password_hash: string;
    full_name: string;
    role?: UserRole;
  }): Promise<SafeUser> {
    const sql = `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, role, created_at, updated_at;
    `;
    const values = [
      data.email.toLowerCase().trim(),
      data.password_hash,
      data.full_name.trim(),
      data.role || 'PUBLIC',
    ];
    const res = await query<SafeUser>(sql, values);
    return res.rows[0];
  }

  async listUsers(limit = 20, offset = 0): Promise<SafeUser[]> {
    const sql = `
      SELECT id, email, full_name, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const res = await query<SafeUser>(sql, [limit, offset]);
    return res.rows;
  }
}

export const userRepository = new UserRepository();

