-- Add category field to savings_goals table to integrate with budget allocation

ALTER TABLE savings_goals 
ADD COLUMN category TEXT NOT NULL DEFAULT 'savings' CHECK (category IN ('needs', 'wants', 'savings'));

-- Add index for better performance when querying by category
CREATE INDEX IF NOT EXISTS idx_savings_goals_category ON savings_goals(category);