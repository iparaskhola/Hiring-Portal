# Hirewise Faculty Recruitment System - AI Agent Guide

## Project Overview
Full-stack faculty hiring platform with automated scoring, ML predictions, and document generation. **Dual-server architecture**: Vite React frontend + Express backend, both connecting to Supabase PostgreSQL.

## Architecture & Key Components

### Three-Tier Stack
1. **Frontend**: `vite-admin/hirewise-admin-vite/` - React 19 + Vite + TailwindCSS
2. **Backend**: `vite-admin/server/` - Express.js with ES modules (`"type": "module"`)
3. **Database**: Supabase PostgreSQL (cloud-hosted)

### Critical Architectural Patterns

#### Dual Supabase Client Pattern
- **Frontend client** (`src/lib/supabase-client.js`): Anonymous key for auth/public operations
- **Backend client** (`config/db.js`): Service role key for privileged operations
- **Never mix**: Frontend must use `supabase-client.js`, backend uses `db.js`

#### API Configuration
Frontend talks to backend via `API_BASE` (`src/lib/config.js`):
```javascript
// Development: http://localhost:5000
// Production: Set VITE_API_BASE_URL env var to deployed backend URL
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
```

#### Backend Service Layer
Express routes delegate to services (NOT direct Supabase calls):
- `services/scoringService.js` - 7-criteria weighted scoring algorithm
- `services/documentService.js` - PDF/HTML report generation
- `services/mlService.js` - ML prediction simulation
- Routes in `routes/applications.js`, `routes/ml.js`, `routes/documents.js`

### Database Schema Essentials
Core tables (see `database_updates.sql`):
- `faculty_applications` - Main application data with `score` and `rank` fields
- `teaching_experiences` + `research_experiences` - 1:many relationships
- `research_info` - 1:1 with publications/IDs (Scopus, ORCID, Scholar)
- `application_scores` - Breakdown by 7 scoring criteria
- `scoring_criteria` - Configurable weights for scoring algorithm
- Triggers auto-calculate scores and rankings when `application_scores` changes

## Development Workflow

### Starting Development (Windows)
```powershell
# Option 1: Automated (opens 2 terminals)
.\start.ps1

# Option 2: Manual
# Terminal 1 - Backend
cd vite-admin/server; npm start

# Terminal 2 - Frontend  
cd vite-admin/hirewise-admin-vite; npm run dev
```
Frontend: http://localhost:5173 | Backend: http://localhost:5000

### Key npm Scripts
**Frontend** (`vite-admin/hirewise-admin-vite`):
- `npm run dev` - Auto-generates country/college lists BEFORE starting (via `predev` hook)
- `npm run build` - Production build (also runs `prebuild`)

**Backend** (`vite-admin/server`):
- `npm start` - Production mode
- `npm run dev` - Dev mode with nodemon

### File Upload Handling
Backend uses `multer` for multipart/form-data (see `routes/applications.js`):
- Max 10MB per file, only PDF/DOC/DOCX allowed
- Uploads to Supabase Storage bucket `application-reports`
- Form data fields are **strings** - parse JSON for arrays: `JSON.parse(req.body.teachingExperiences)`

## Critical Conventions & Patterns

### Scoring System Architecture
7 weighted criteria (configurable in `scoring_criteria` table):
```javascript
{
  'Education & Qualifications': 0.20,      // Degree, uni tier, recency
  'Research Experience': 0.25,             // Years, institution prestige
  'Teaching Experience': 0.20,             // Duration, positions
  'Industry Experience': 0.15,             // Professional background
  'Publications & Citations': 0.10,        // Scopus papers (prioritized)
  'Awards & Recognition': 0.05,
  'Communication Skills': 0.05             // Application completeness
}
```
**Key implementation** (`services/scoringService.js`):
- Each criterion scored 0-100, then weighted
- University ranking boost uses in-memory NIRF/QS rankings lookup
- Final score normalized to 0-100, triggers DB ranking update
- Rankings partition by `(department, position)` - candidates only compete within their track

### Performance Optimizations

#### Caching Strategy (`config/cache.js`)
- **Upstash Redis** for production (serverless, 10k requests/day free)
- **In-memory fallback** for dev (Map with TTL, max 100 entries)
- Express middleware: `cache.middleware(ttl_seconds)` on GET routes
- Cache invalidation: `await cache.delPattern('req:/api/applications/*')` after mutations

#### Query Optimization Patterns
```javascript
// ❌ BAD: N+1 queries in frontend
candidates.forEach(c => fetch(`/api/applications/${c.id}`))

// ✅ GOOD: Single join query with all relations
supabase.from('faculty_applications')
  .select('*, teaching_experiences(*), research_experiences(*), research_info(*)')
```
See `GET /api/applications/all/detailed` endpoint for reference.

#### Parallel Fetches
```javascript
// Batch independent queries with Promise.all (not sequential awaits)
const [teachingData, researchData, infoData] = await Promise.all([
  supabase.from('teaching_experiences').select('*').in('application_id', ids),
  supabase.from('research_experiences').select('*').in('application_id', ids),
  supabase.from('research_info').select('*').in('application_id', ids)
]);
```

### Error Handling & User Experience

#### Fire-and-Forget Pattern
Heavy operations (scoring, ML predictions, report generation) run async **after** responding to user:
```javascript
res.status(201).json({ success: true, applicationId });

// Don't await - these can take 10-30 seconds
Promise.all([
  scoringService.submitApplication(applicationId),
  documentService.generateInitialReport(applicationId)
]).catch(err => console.error('Background task error:', err));
```

#### Idempotency Guard
Prevent duplicate submissions (see `POST /api/applications`):
```javascript
const { data: existing } = await supabase
  .from('faculty_applications')
  .select('id')
  .eq('user_id', user_id)
  .eq('position', position)
  .eq('department', department)
  .limit(1);
if (existing?.length > 0) return res.status(409).json({ error: 'Already submitted' });
```

### Environment Configuration

#### Backend `.env` (vite-admin/server/)
```
SUPABASE_URL=https://dgefgxcxyyflxklptyln.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...  # Service role key (privileged)
PORT=5000
UPSTASH_REDIS_REST_URL=...       # Optional: for production caching
UPSTASH_REDIS_REST_TOKEN=...
```

#### Frontend env (Vercel/build time)
```
VITE_API_BASE_URL=https://your-backend.onrender.com  # Production backend URL
```

## Common Pitfalls & Solutions

### CORS Issues
Backend allows localhost:5173 + Vercel domains (see `server.js`). Add new origins to `allowedOrigins` array.

### Auth Flow
- User registers → creates Supabase auth user → gets `user_id`
- Application submission requires `user_id` in request body
- Protected routes use `ProtectedRoute` component checking Supabase session

### Research Data Access
Research info stored in separate table (1:1 relation):
```javascript
// Frontend: Join on fetch
const { data } = await supabase
  .from('faculty_applications')
  .select('*, research_info(*)')
  .eq('id', appId);

// Access: app.research_info[0].scopus_general_papers (array from Supabase join)
```

### Deployment Architecture
- **Frontend**: Vercel (static Vite build from `vite-admin/hirewise-admin-vite`)
- **Backend**: Render.com (Node server from `vite-admin/server`)
- **Database**: Supabase (already cloud-hosted)
- Must set `VITE_API_BASE_URL` in Vercel to Render backend URL

## Testing & Debugging

### Check Scoring Works
```javascript
// In backend console or via API
const score = await scoringService.calculateApplicationScore(applicationId);
console.log('Score:', score);
```

### Inspect Cache
Add header check: `X-Cache: HIT` or `MISS` in response headers

### Database Triggers
Scoring auto-updates via trigger on `application_scores` table. Manually trigger: `SELECT update_application_rankings();`

## Key Files Reference
- `START_HERE.md` - Project overview & startup instructions
- `IMPLEMENTATION_SUMMARY.md` - Feature completion status
- `database_updates.sql` - Schema with triggers/functions
- `vite-admin/server/routes/applications.js` - Main API endpoints (500+ lines)
- `vite-admin/server/services/scoringService.js` - Scoring algorithm (900+ lines)
- `vite-admin/hirewise-admin-vite/src/App.jsx` - React Router setup with protected routes
