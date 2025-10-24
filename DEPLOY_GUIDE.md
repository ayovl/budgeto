# GitHub & Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Name your repository: `budgeto` (or any name you prefer)
3. Keep it **Public** or **Private** (your choice)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/budgeto.git

# Push your code
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Alternative with SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/budgeto.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (`budgeto`)
4. Vercel will auto-detect it's a Next.js project
5. **IMPORTANT**: Add Environment Variables:

   Click **"Environment Variables"** and add these **3 variables**:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://yxzmckjxbdgplaprsmsg.supabase.co

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4em1ja2p4YmRncGxhcHJzbXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDg2OTgsImV4cCI6MjA3Njg4NDY5OH0.AH4WrImxChKwwODtBdut-MHk3CVT0yjUlMMo_FRDEqU

   Name: SUPABASE_SERVICE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4em1ja2p4YmRncGxhcHJzbXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDg2OTgsImV4cCI6MjA3Njg4NDY5OH0.AH4WrImxChKwwODtBdut-MHk3CVT0yjUlMMo_FRDEqU
   ```

   **Note:** You need to get the actual `SUPABASE_SERVICE_KEY` (service_role key) from:
   - Supabase Dashboard → Settings → API → service_role key

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

### Step 4: Set Up Supabase Tables

**BEFORE testing your app**, you need to create the database tables:

1. Go to [https://yxzmckjxbdgplaprsmsg.supabase.co](https://yxzmckjxbdgplaprsmsg.supabase.co)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy the **entire contents** of `supabase/schema.sql` from your project
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see success messages

### Step 5: Verify Deployment

After Vercel finishes deploying:

1. Click **"Visit"** to open your deployed app
2. The URL will be something like: `https://budgeto-xxxxx.vercel.app`
3. Test the app:
   - Enter monthly income
   - Add expenses
   - Create savings goals
   - Verify data persists after refresh

### Step 6: Check Database Connection

Visit your deployed app's database check endpoint:
```
https://your-app.vercel.app/api/setup-db
```

You should see a JSON response showing all tables exist.

## 🔄 Future Updates

Whenever you make changes to your code:

```bash
# Save your changes
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

Vercel will **automatically deploy** your changes within 1-2 minutes!

## ✅ Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add all 3 environment variables in Vercel
- [ ] Run SQL schema in Supabase Dashboard
- [ ] Test the deployed app
- [ ] Verify data persistence

## 🆘 Troubleshooting

### "Missing Supabase environment variables" error

- Check that all 3 environment variables are added in Vercel
- Make sure there are no extra spaces in the values
- Redeploy after adding variables

### "relation does not exist" error

- You haven't run the SQL schema yet
- Go to Supabase SQL Editor and run `supabase/schema.sql`

### Vercel deployment fails

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

## 📱 Your Deployed App

Once deployed, you can access your app from:
- Computer: `https://your-app.vercel.app`
- Phone: Same URL (works on mobile!)
- Share with others: Just send them the URL

## 🎯 Vercel Cron Job

The heartbeat cron job will automatically start working after deployment. It will:
- Run every 6 days
- Keep your Supabase project active
- Prevent automatic pausing

You can check cron jobs in: **Vercel Dashboard → Your Project → Settings → Cron Jobs**

---

Need help? All your code is committed and ready to push! Just follow Step 1 to create your GitHub repo.
