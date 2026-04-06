-- Notification Enhancements Migration
-- Adds action buttons and improves notification interactivity

USE pulalend;

-- Add action columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url VARCHAR(500) NULL COMMENT 'URL for notification action button',
ADD COLUMN IF NOT EXISTS action_label VARCHAR(100) NULL COMMENT 'Label for action button';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_created_at ON notifications(created_at DESC);
