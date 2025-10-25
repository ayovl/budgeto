-- Add current_saved field to savings_goals table for progress tracking

ALTER TABLE savings_goals 
ADD COLUMN current_saved DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Add index for better performance when querying current_saved
CREATE INDEX IF NOT EXISTS idx_savings_goals_current_saved ON savings_goals(current_saved);