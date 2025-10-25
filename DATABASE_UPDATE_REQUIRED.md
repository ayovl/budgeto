# Database Update Required

## New Features Added: Goal Categories & Initial Money

The savings goals now support:
1. **Budget Category Selection** - Choose if the goal is part of Needs, Wants, or Savings budget
2. **Initial Money Input** - Add starting amount when creating goals or current saved amount when editing

## Database Migration Needed

To use these new features, you need to add a `category` field to your `savings_goals` table.

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run this query:
```sql
ALTER TABLE savings_goals 
ADD COLUMN category TEXT NOT NULL DEFAULT 'savings' CHECK (category IN ('needs', 'wants', 'savings'));

CREATE INDEX IF NOT EXISTS idx_savings_goals_category ON savings_goals(category);
```

### Option 2: Using Local Supabase (if running locally)
```bash
npx supabase db reset
```

### What This Update Does:
- Adds `category` field to savings goals (defaults to 'savings' for existing goals)
- Goal monthly savings now contribute to budget pie chart in selected category  
- Better integration between savings goals and monthly budget allocation
- Allows tracking which budget area each goal belongs to

### After Migration:
- Existing goals will default to "Savings" category
- You can edit existing goals to change their category
- New goals can be created with category selection from the start
- Monthly goal contributions appear in the budget pie chart