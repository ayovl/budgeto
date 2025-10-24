# Supabase Setup Instructions

## Step-by-Step Supabase Configuration

### 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Click "New Project"
5. Fill in:
   - **Name**: budgeto (or your preferred name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (sufficient for this app)
6. Click "Create new project"
7. Wait 2-3 minutes for project initialization

### 2. Get Your API Credentials

1. In your Supabase project dashboard
2. Click on "Settings" (gear icon in sidebar)
3. Click "API" under "Configuration"
4. You'll see two important sections:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this entire URL

   **Project API keys:**
   - `anon` `public` - Copy this key (it's safe to use in client-side code)
   - `service_role` `secret` - Copy this key (keep it secret!)

### 3. Create Database Tables

1. In Supabase Dashboard, click "SQL Editor" in the sidebar
2. Click "New query"
3. Copy the entire contents from `supabase/schema.sql` in this project
4. Paste it into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

You should see success messages like:
```
Success. No rows returned
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
```

### 4. Verify Tables Were Created

1. Click "Table Editor" in the sidebar
2. You should see 4 tables:
   - `user_settings`
   - `expenses`
   - `savings_goals`
   - `investment_plans`

3. Click on each table to verify the columns exist

### 5. Set Up Environment Variables

1. In your project root, create `.env.local` file:

```env
# Replace these with your actual values from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

2. Replace the placeholder values with your actual credentials from Step 2

### 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Open browser DevTools (F12) > Console

4. If you see no errors, the connection is working!

5. Try entering a monthly income and adding an expense

6. Go back to Supabase > Table Editor > `user_settings`
   - You should see a new row with your data

## Troubleshooting Supabase Setup

### Error: "Missing Supabase environment variables"

**Solution:**
- Verify `.env.local` exists in project root (not in `src/`)
- Check variable names are EXACTLY as shown above
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
- Check for typos in variable names

### Error: "Invalid API key"

**Solution:**
- Go to Supabase Dashboard > Settings > API
- Copy the keys again (don't copy extra spaces)
- Make sure you're using `anon public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you're using `service_role secret` key for `SUPABASE_SERVICE_KEY`

### Error: "relation does not exist"

**Solution:**
- The database tables weren't created properly
- Go back to SQL Editor
- Run the schema.sql file again
- Check for any error messages in red

### Error: "new row violates row-level security policy"

**Solution:**
- RLS policies might not have been created
- Go to SQL Editor
- Run only the RLS policy section from schema.sql:
  ```sql
  -- Starting from "Row Level Security (RLS) Policies"
  -- to the end of the file
  ```

### Project is paused / inactive

**Solution:**
- Free tier projects pause after 7 days of inactivity
- The heartbeat cron job prevents this when deployed to Vercel
- Manually: Go to Supabase dashboard and click "Resume" if needed
- For local dev: Just unpause and continue

## Understanding the Database Schema

### user_settings Table
Stores the user's monthly income and budget allocation percentages.

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - User identifier (TEXT) - currently set to "default-user"
- `monthly_income` - Monthly income amount (DECIMAL)
- `needs_percentage` - Percentage for needs (INTEGER, default: 50)
- `wants_percentage` - Percentage for wants (INTEGER, default: 30)
- `savings_percentage` - Percentage for savings (INTEGER, default: 20)
- `created_at` - When the record was created
- `updated_at` - When the record was last updated

### expenses Table
Stores all expenses categorized by type.

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - User identifier (TEXT)
- `category` - Type: 'needs', 'wants', or 'savings'
- `name` - Expense name (e.g., "Internet Bill")
- `amount` - Expense amount (DECIMAL)
- `date` - Date of expense (DATE)
- `created_at` - When the record was created
- `updated_at` - When the record was last updated

### savings_goals Table
Stores savings goals with target amounts and dates.

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - User identifier (TEXT)
- `name` - Goal name (e.g., "Travel to Turkey")
- `type` - Goal type: 'short-term', 'medium-term', or 'long-term'
- `target_amount` - Amount to save (DECIMAL)
- `start_date` - When to start saving (DATE)
- `target_date` - When to reach the goal (DATE)
- `monthly_savings` - Amount to save per month (DECIMAL)
- `created_at` - When the record was created
- `updated_at` - When the record was last updated

### investment_plans Table
Stores investment plans with projections.

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - User identifier (TEXT)
- `name` - Investment plan name
- `monthly_investment` - Monthly investment amount (DECIMAL)
- `duration_months` - Investment duration in months (INTEGER)
- `estimated_return_rate` - Expected annual return rate (DECIMAL, e.g., 7.0 for 7%)
- `total_return` - Calculated total return (DECIMAL)
- `created_at` - When the record was created
- `updated_at` - When the record was last updated

## Security Notes

### Row Level Security (RLS)

The database uses RLS to control access:
- For simplicity, this app allows full access (`true` policy)
- In production with multiple users, you should:
  1. Enable Supabase Authentication
  2. Update policies to use `auth.uid()`
  3. Filter by user: `USING (user_id = auth.uid())`

### API Keys

- **Public/Anon Key**: Safe to use in client-side code
  - Used for read/write operations
  - Limited by RLS policies
  
- **Service Role Key**: MUST be kept secret
  - Used only for server-side operations (heartbeat)
  - Bypasses RLS policies
  - Never expose in client-side code

## Advanced Configuration

### Enable Real-time Updates (Optional)

To enable real-time syncing across devices:

1. In Supabase Dashboard > Database > Replication
2. Enable replication for desired tables
3. In your code, use Supabase real-time subscriptions:

```typescript
const subscription = supabase
  .channel('expenses-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'expenses' },
    (payload) => {
      console.log('Change received!', payload)
      // Update your UI
    }
  )
  .subscribe()
```

### Backup Your Database

1. Go to Supabase Dashboard > Database > Backups
2. Free tier: Daily backups for 7 days
3. Download backups as needed

### Monitor Database Usage

1. Go to Settings > Usage
2. Monitor:
   - Database size
   - API requests
   - Bandwidth
   - Number of rows

Free tier limits:
- 500 MB database space
- 2 GB bandwidth/month
- 50,000 monthly active users

## Next Steps After Setup

1. ✅ Verify all tables exist
2. ✅ Test creating and reading data
3. ✅ Configure environment variables
4. ✅ Test the app locally
5. 🚀 Deploy to Vercel
6. ✅ Verify heartbeat is working
7. 🎉 Start using your budget planner!

## Helpful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/sql-editor)

---

Need help? Check the main SETUP_GUIDE.md or open an issue on GitHub.
