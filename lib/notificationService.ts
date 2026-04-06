// Notification Service
// Handles creating and managing user notifications

import pool from './db';
import { RowDataPacket } from 'mysql2';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  readStatus: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
}

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async create(
    userId: number,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actionUrl?: string,
    actionLabel?: string
  ): Promise<boolean> {
    try {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, action_label) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, message, type, actionUrl || null, actionLabel || null]
      );
      
      console.log(`[Notification] Created for user ${userId}: ${title}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error creating notification:', error);
      return false;
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnread(userId: number, limit: number = 10): Promise<Notification[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, user_id as userId, title, message, type, read_status as readStatus,
                action_url as actionUrl, action_label as actionLabel, created_at as createdAt
         FROM notifications
         WHERE user_id = ? AND read_status = FALSE
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return rows as Notification[];
    } catch (error) {
      console.error('[Notification] Error getting unread notifications:', error);
      return [];
    }
  }

  /**
   * Get all notifications for a user (with pagination)
   */
  static async getAll(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, user_id as userId, title, message, type, read_status as readStatus,
                action_url as actionUrl, action_label as actionLabel, created_at as createdAt
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return rows as Notification[];
    } catch (error) {
      console.error('[Notification] Error getting all notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      console.log(`[Notification] Marked as read: ${notificationId}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error marking as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<boolean> {
    try {
      await pool.execute(
        'UPDATE notifications SET read_status = TRUE WHERE user_id = ? AND read_status = FALSE',
        [userId]
      );

      console.log(`[Notification] Marked all as read for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async delete(notificationId: number, userId: number): Promise<boolean> {
    try {
      await pool.execute(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      console.log(`[Notification] Deleted: ${notificationId}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE',
        [userId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('[Notification] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Delete old read notifications (cleanup)
   */
  static async cleanup(daysOld: number = 30): Promise<void> {
    try {
      await pool.execute(
        'DELETE FROM notifications WHERE read_status = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysOld]
      );

      console.log('[Notification] Cleanup completed');
    } catch (error) {
      console.error('[Notification] Error during cleanup:', error);
    }
  }
}
