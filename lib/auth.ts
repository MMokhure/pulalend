import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import pool from './db';
import { RowDataPacket } from 'mysql2';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get session user from request
 * Supports multiple authentication methods:
 * 1. Authorization header: "Bearer {userId}"
 * 2. Explicit userId parameter passed by caller
 * Returns the user object if found, null otherwise
 */
export async function getSessionUser(
  request: NextRequest,
  userId?: number
): Promise<any | null> {
  try {
    let resolvedUserId = userId;

    // If userId not provided, try to get from Authorization header
    if (!resolvedUserId) {
      const authHeader = request.headers.get('authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        resolvedUserId = parseInt(authHeader.substring(7));
      }
    }

    // If no valid userId found, return null
    if (!resolvedUserId || !Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
      return null;
    }

    // Get user from database
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, first_name, last_name, user_type FROM users WHERE id = ?',
      [resolvedUserId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      email: rows[0].email,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      user_type: rows[0].user_type,
    };
  } catch (error) {
    console.error('Error in getSessionUser:', error);
    return null;
  }
}
