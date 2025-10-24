# Budgeto - Setup Guide

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Get Your API Keys**
   - Go to Project Settings > API
   - Copy the following:
     - `Project URL`
     - `anon public` key
     - `service_role` key (for heartbeat)

3. **Run Database Schema**
   - In Supabase Dashboard, go to SQL Editor
   - Create a new query
   - Copy the entire contents of `supabase/schema.sql`
   - Run the query
   - You should see success messages for tables creation

### 3. Configure Environment Variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Replace the values with your actual Supabase credentials.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Application

1. **Enter Monthly Income**: Try entering $5000
2. **View Budget Split**: See automatic 50/30/20 allocation
3. **Add Expenses**: Try adding expenses in each category
4. **Create Goals**: Add a savings goal like "Vacation"
5. **Plan Investments**: Create an investment plan

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repository
4. **IMPORTANT**: Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

5. Click "Deploy"

### 3. Verify Cron Job

After deployment:
1. Go to Project Settings > Cron Jobs in Vercel
2. You should see the heartbeat job scheduled
3. It will run every 6 days automatically

## Verifying Everything Works

### Check Database Connection

1. Open your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. You should NOT see any Supabase connection errors

### Check Heartbeat Endpoint

Visit: `https://your-app.vercel.app/api/heartbeat`

You should see:
```json
{
  "ok": true,
  "timestamp": "2024-...",
  "message": "Supabase connection maintained"
}
```

### Test Data Persistence

1. Add an expense
2. Refresh the page
3. The expense should still be there

## Troubleshooting

### "Missing Supabase environment variables"

- Verify `.env.local` exists
- Check variable names match exactly
- Restart dev server after adding variables

### "Error loading settings"

- Check if database schema was created successfully
- Verify Supabase project is active
- Check browser console for specific errors

### Data Not Saving

- Open browser DevTools > Network tab
- Try adding an expense
- Look for failed requests (red)
- Check the error message

### Build Errors on Vercel

- Ensure all environment variables are set in Vercel dashboard
- Check that TypeScript has no errors
- Review build logs for specific errors

## Database Schema Overview

The app uses 4 main tables:

1. **user_settings**: Stores monthly income and budget percentages
2. **expenses**: Tracks all expenses across categories
3. **savings_goals**: Manages savings goals with calculations
4. **investment_plans**: Stores investment plans with projections

All tables have:
- Automatic timestamps (created_at, updated_at)
- Row Level Security (RLS) enabled
- Indexes for performance

## Features Overview

### 50/30/20 Budget Rule
- 50% for Needs (essentials)
- 30% for Wants (lifestyle)
- 20% for Savings (future)

### Expense Tracking
- Add unlimited expenses
- Edit and delete functionality
- Real-time budget calculations
- Progress bars showing spending

### Savings Goals
- Multiple goals support
- Goal types: Short-term, Medium-term, Long-term
- Auto-calculates:
  - Monthly savings needed
  - Time to reach goal
  - Updates dynamically when you change any field

### Investment Plans
- Multiple investment plans
- Compound interest calculations
- Shows projected returns
- Displays profit estimates

## Mobile Optimization

The app is fully responsive and optimized for:
- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktops (1024px and up)

All interactions work smoothly on touch devices.

## Performance

The app is built with performance in mind:
- Optimized React components
- Efficient database queries
- Lazy loading where applicable
- Minimal bundle size

## Security

- Row Level Security (RLS) on all tables
- Environment variables for sensitive data
- No authentication required for local use
- Can be extended with Supabase Auth

## Next Steps

After setup, you can:

1. **Customize the UI**: Edit component styles in `src/components/`
2. **Add Authentication**: Integrate Supabase Auth for multi-user support
3. **Add More Features**: Recurring expenses, budgets history, etc.
4. **Customize Calculations**: Modify percentages or add custom rules

## Support

If you encounter issues:

1. Check this guide first
2. Review the main README.md
3. Check Supabase logs in dashboard
4. Review browser console errors
5. Check Vercel deployment logs

## Useful Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build (production)
npm run build

# Start production server
npm start
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Recharts Documentation](https://recharts.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

Happy budgeting! 💰📊
