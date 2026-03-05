# Election Global TV - Dynamic System Documentation

## 🎯 Project Overview

A complete, fully dynamic election tracking system with authentication, role-based access control, and an admin dashboard for managing real-time election data.

## 📁 Project Structure

```
app/
├── lib/
│   ├── types.ts              # TypeScript interfaces for all data
│   ├── auth.ts               # Authentication, tokens, user management
│   └── electionData.ts       # Election data operations & storage
├── context/
│   ├── AuthContext.tsx       # Authentication context & hooks
│   └── ElectionContext.tsx   # Election data context & hooks
├── login/
│   └── page.tsx              # Login page with demo credentials
├── dashboard/
│   └── page.tsx              # Admin dashboard for managing data
├── ElectionTicker.tsx        # Dynamic bottom ticker component
├── page.tsx                  # Dynamic main display page
├── layout.tsx                # Root layout with providers
└── globals.css               # Global styles
```

## 🔐 Authentication System

### How It Works
- **Demo Users**: Two pre-configured users for testing
  - Admin: `admin@electionglobal.com` / `admin123`
  - Viewer: `viewer@electionglobal.com` / `viewer123`
- **Token Storage**: Uses browser localStorage for session persistence
- **Auth Context**: Provides `useAuth()` hook for accessing auth state across components

### Key Features
- Simple token-based authentication
- Auto-persistence of auth state
- Error handling and loading states
- Easy logout functionality

### Usage
```tsx
const { user, login, logout, isAuthenticated, error } = useAuth();
```

## 🗳️ Election Data Management

### Data Structure
```typescript
ElectionRegion
├── id: string
├── name: string (English)
├── nepaliName: string
├── totalCountPercent: number
├── status: 'active' | 'completed' | 'pending'
├── lastUpdated: timestamp
└── candidates: Candidate[]
    ├── id: string
    ├── name: string
    ├── party: string
    ├── votes: number
    ├── changeVotes: number
    ├── color: string
    └── imageUrl: string
```

### Data Storage
- **Backend**: Simulated with localStorage (can be replaced with real API)
- **Context**: Global state management via `useElection()` hook
- **Real-time Updates**: Automatic sync across all components

### Available Operations
```tsx
// Get all regions
const { regions } = useElection();

// Get current region
const { currentRegion } = useElection();

// Switch regions
setCurrentRegion(regionId);

// Update region settings
updateRegion(regionId, { totalCountPercent: 75, status: 'active' });

// Update candidate votes
updateCandidateVotes(regionId, candidateId, newVotes, newChangeVotes);

// Refresh data
refreshRegions();
```

## 📄 Component Structure

### Page Routes
1. **`/login`** - Authentication page
   - Shows demo credentials
   - Email/password form
   - Error handling

2. **`/`** (Main Display) - Election display page
   - Requires authentication
   - Shows dynamic ticker + candidate panel
   - Real-time vote updates
   - Responsive design

3. **`/dashboard`** - Admin management
   - Requires authentication
   - Three tabs: Overview, Candidates, Settings
   - Manage regions and vote counts
   - View statistics

### Components
1. **`ElectionTicker.tsx`** - Bottom fixed ticker
   - Shows party standings
   - Live data indicator
   - User menu
   - Responsive on all devices

2. **`page.tsx`** - Main display
   - Candidate list with photos
   - Vote counts and changes
   - Region information
   - Protected route

3. **Providers** - Context providers
   - AuthProvider: Manages authentication
   - ElectionProvider: Manages election data
   - Both wrap entire app in layout.tsx

## 🎨 Styling & Responsiveness

### Breakpoints Used
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `lg:` (≥ 1024px)

### Key CSS Classes
- `mukta-*`: Custom Mukta font weights
- `sm:`, `md:`, `lg:`: Tailwind responsive prefixes
- `backdrop-blur-*`: Glassmorphism effects
- `animate-*`: Tailwind animations

### Color Scheme
- **Background**: Dark gradient (`from-slate-900 via-slate-800 to-black`)
- **Primary**: Blue (`#2563eb`)
- **Secondary**: Slate gray (`#64748b`)
- **Success**: Emerald (`#10b981`)
- **Danger**: Red (`#ef4444`)

## 🚀 Getting Started

### First Time Setup
1. Open browser and navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click a demo credential card or enter:
   - Email: `admin@electionglobal.com`
   - Password: `admin123`

### Using the System

**Viewing Election Data**
- Main page shows real-time ticker and candidates
- Responsive design adapts to all screen sizes
- Live pulse indicator shows data is active

**Managing Data**
- Click "Dashboard" button in ticker
- **Overview Tab**: See all regions and statistics
- **Candidates Tab**: View all candidates in region
- **Settings Tab**: Update count percentage and status

## 🔗 Data Flow

```
User Login → Auth Context Updates
            ↓
User Navigates to Main Page → Redirect check in useAuth hook
            ↓
Load Election Data → useElection hook fetches regions
            ↓
Display in Components → Dynamic rendering from context
            ↓
Update Data in Dashboard → updateRegion() called
            ↓
Context State Updates → All subscribed components re-render
```

## 📱 Responsive Design Features

- **Mobile-First**: Base styles work on mobile, then enhanced with `sm:/md:/lg:`
- **Flexible Widths**: Widget uses `w-[calc(100vw-2rem)]` on mobile, `sm:w-[350px]` on desktop
- **Adaptive Typography**: Font sizes scale from mobile to desktop
- **Touch-Friendly**: Larger tap targets on mobile
- **Adaptive Spacing**: Padding and gaps adjust per breakpoint

## 🔒 Security Considerations

### Current Implementation
- Local session storage (suitable for demo/internal use)
- Token-based authentication
- Protected routes via `useAuth()` hook

### For Production
- Replace localStorage with secure cookies
- Add JWT tokens with expiration
- Implement refresh token rotation
- Add CSRF protection
- Use HTTPS only
- Add rate limiting on login attempts
- Implement real backend API

## 🧪 Testing Demo Users

### Admin User
- **Email**: `admin@electionglobal.com`
- **Password**: `admin123`
- **Access**: Full dashboard access

### Viewer User
- **Email**: `viewer@electionglobal.com`
- **Password**: `viewer123`
- **Access**: View-only (can implement role-based restrictions)

## 🛠️ Customization

### Add New Region
Edit `electionData.ts` and add to `DEFAULT_ELECTION_DATA`

### Change Colors
Update candidate `color` property in election data

### Modify Authentication
Edit `auth.ts` to connect real API

### Update Styles
All Tailwind classes can be modified in component files

## 📊 Key Technologies

- **Next.js 14**: Framework and routing
- **React 18**: UI components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Context API**: State management
- **Mukta Font**: Custom typography

## ⚡ Performance

- Lightweight context providers
- Efficient re-renders with proper memoization
- localStorage for fast data access
- Optimized responsive images
- CSS animations for smooth transitions

## 🚀 Deployment

1. Build: `npm run build`
2. Test: `npm run start`
3. Deploy to Vercel, Netlify, or any Next.js hosting

## 📝 Notes

- All data persists in localStorage between sessions
- Data resets if browser storage is cleared
- Auth token remains until logout
- Fully functional demo ready to use immediately
