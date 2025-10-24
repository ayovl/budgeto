# Budget Planner App - Development Plan

## Project Overview
A mobile-first budget planning application with monthly income tracking, expense management following the 50/30/20 rule, savings goals, and investment planning. All data stored in Supabase with automatic keep-alive functionality.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Charts**: Recharts (lightweight and performant)
- **Deployment**: Vercel with Cron Jobs
- **Language**: TypeScript

## Core Features

### 1. Monthly Income Input
- Single input field for monthly income
- Auto-calculates 50/30/20 allocation

### 2. Budget Allocation Chart
- Visual representation of Needs (50%), Wants (30%), Savings (20%)
- Real-time updates based on budget modifications
- Interactive and intuitive design

### 3. Expense Detail Sections
**Three separate sections:**
- **Needs (50%)** - Default placeholder: "Internet Bill"
- **Wants (30%)**
- **Savings (20%)**

**Each section includes:**
- Individual budget allocation (editable)
- Amount spent (calculated from expenses)
- Remaining amount
- Progress bar visualization
- Add/Edit/Delete expenses functionality

**Global Summary (above sections):**
- Total allocated budget
- Total spent across all sections
- Total remaining budget (prominent display)

### 4. Savings Goals Section
- Add/Edit/Delete multiple goals
- Default goal: "Travel to Turkey"

**Per goal inputs:**
- Goal name
- Type selector: Short-term / Medium-term / Long-term
- Target amount
- Starting date (default: current date)
- Target date
- **Auto-calculated fields:**
  - Monthly savings required
  - Time duration (months/years)
- **Dynamic recalculation** when any field changes

### 5. Investment Plans Section
- Add/Edit/Delete multiple plans
- Monthly investment amount
- Duration
- Total investment return (calculated)
- Dynamic recalculation on any change

### 6. Supabase Integration
- All data persisted in Supabase
- Real-time sync
- Proper error handling

### 7. Keep-Alive System
- Vercel cron job pinging every 6 days
- Prevents Supabase project pausing

## Development Steps

### Phase 1: Setup & Configuration
1. ✅ Create project plan document
2. Access Context7 for Supabase documentation
3. Access Context7 for Recharts documentation
4. Install required dependencies
5. Configure Supabase client
6. Set up environment variables structure

### Phase 2: Database Schema Design
1. Design Supabase tables:
   - `user_settings` (monthly_income, budget_allocations)
   - `expenses` (category, name, amount, date)
   - `savings_goals` (name, type, target_amount, start_date, target_date, monthly_savings)
   - `investment_plans` (name, monthly_investment, duration, total_return)
2. Create migration SQL
3. Set up Row Level Security (RLS) policies

### Phase 3: Core Layout & UI Components
1. Create single-page layout structure
2. Build reusable components:
   - Income input component
   - Budget allocation chart component
   - Progress bar component
   - Expense item component
   - Section container component
3. Implement responsive mobile-first design

### Phase 4: Budget Management Features
1. Monthly income input with 50/30/20 auto-calculation
2. Budget allocation chart with real-time updates
3. Global summary section (total budget, spent, remaining)
4. Individual expense sections (Needs/Wants/Savings):
   - Budget input per section
   - Add/Edit/Delete expenses
   - Auto-calculate spent & remaining
   - Progress bars

### Phase 5: Savings Goals Feature
1. Savings goals list view
2. Add/Edit/Delete goal functionality
3. Dynamic calculation engine:
   - Monthly savings ↔ Duration
   - Target amount changes
   - Date changes
4. Goal type selector (short/medium/long-term)
5. Visual indicators and progress

### Phase 6: Investment Plans Feature
1. Investment plans list view
2. Add/Edit/Delete plan functionality
3. Dynamic calculation:
   - Monthly investment ↔ Duration
   - Total return calculation
4. Visual representation

### Phase 7: Supabase Integration
1. Create Supabase utilities and hooks
2. Implement CRUD operations for all features
3. Set up real-time subscriptions (optional)
4. Error handling and loading states
5. Data validation

### Phase 8: Keep-Alive System
1. Create `/app/api/heartbeat/route.ts`
2. Implement minimal Supabase query
3. Configure `vercel.json` with cron schedule
4. Test heartbeat endpoint

### Phase 9: Optimization & Polish
1. Code splitting and lazy loading
2. Image optimization
3. Performance testing and optimization
4. Mobile responsiveness testing
5. Accessibility improvements
6. Error boundaries

### Phase 10: Testing & Deployment
1. Test all CRUD operations
2. Test calculations and dynamic updates
3. Verify Supabase connection
4. Set up Vercel environment variables
5. Deploy to Vercel
6. Verify cron job execution

## Design Principles
- **Mobile-First**: Optimized for mobile devices
- **Single-Page**: No navigation, everything on one scrollable page
- **Visual Clarity**: Easy to understand at a glance
- **Performance**: Lightning fast, optimized code
- **Intuitive**: Minimal learning curve
- **Beautiful**: Modern, clean, professional UI

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Lighthouse Score: > 90
- Bundle Size: Optimized and minimal

## Color Scheme Suggestion
- Needs: Blue tones
- Wants: Orange/Amber tones
- Savings: Green tones
- Neutral: Gray scale for backgrounds

## Notes
- All calculations happen client-side for instant feedback
- Debounce database updates to reduce API calls
- Use optimistic UI updates for better UX
- Implement proper error boundaries
- Add loading skeletons for better perceived performance
