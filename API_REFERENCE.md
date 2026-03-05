# 🔌 API Reference & Hook Documentation

## 🔐 Authentication Hooks & Functions

### `useAuth()` - Main Authentication Hook

**Location**: `app/context/AuthContext.tsx`

```tsx
const {
  user,              // Current logged-in user (User | null)
  isLoading,         // Loading state (boolean)
  isAuthenticated,   // Is user logged in? (boolean)
  login,             // Async function to login
  logout,            // Function to logout
  error              // Error message (string | null)
} = useAuth();
```

**Example Usage**:
```tsx
'use client';
import { useAuth } from '@/app/context/AuthContext';

export default function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Hello, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🗳️ Election Data Hooks & Functions

### `useElection()` - Main Election Context Hook

**Location**: `app/context/ElectionContext.tsx`

```tsx
const {
  regions,                    // All election regions (ElectionRegion[])
  currentRegion,              // Active region (ElectionRegion | null)
  isLoading,                  // Loading state (boolean)
  error,                      // Error message (string | null)
  setCurrentRegion,           // Switch to region (async)
  refreshRegions,             // Reload all data (async)
  updateRegion,               // Modify region (async)
  updateCandidateVotes        // Modify votes (async)
} = useElection();
```

**Example Usage**:
```tsx
'use client';
import { useElection } from '@/app/context/ElectionContext';

export default function Dashboard() {
  const { regions, currentRegion, updateRegion } = useElection();

  const handleUpdateCount = async () => {
    if (currentRegion) {
      await updateRegion(currentRegion.id, {
        totalCountPercent: 75
      });
    }
  };

  return (
    <div>
      <h1>{currentRegion?.nepaliName}</h1>
      <button onClick={handleUpdateCount}>Update</button>
    </div>
  );
}
```

---

## 📐 Type Definitions

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}
```

### Candidate

```typescript
interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  changeVotes: number;        // Vote change indicator
  color: string;              // Hex color for UI
  imageUrl: string;           // Photo URL
  partySymbol?: string;       // Optional party symbol
}
```

### ElectionRegion

```typescript
interface ElectionRegion {
  id: string;
  name: string;               // English name
  nepaliName: string;         // Nepali name
  totalCountPercent: number;  // Counting percentage (0-100)
  candidates: Candidate[];    // List of candidates
  status: 'active' | 'completed' | 'pending';
  lastUpdated: string;        // ISO timestamp
}
```

### AuthResponse

```typescript
interface AuthResponse {
  user: User;
  token: string;
}
```

---

## 🔑 Auth Module Functions

### `authenticateUser(credentials)`

**Location**: `app/lib/auth.ts`

```tsx
import { authenticateUser } from '@/app/lib/auth';

const response = await authenticateUser({
  email: 'admin@electionglobal.com',
  password: 'admin123'
});

if (response) {
  console.log('User:', response.user);
  console.log('Token:', response.token);
} else {
  console.log('Login failed');
}
```

**Returns**: `AuthResponse | null`

---

### `getCurrentUser()`

Get the currently logged-in user from localStorage.

```tsx
import { getCurrentUser } from '@/app/lib/auth';

const user = getCurrentUser();
if (user) {
  console.log('Current user:', user.name);
}
```

**Returns**: `User | null`

---

### `getAuthToken()`

Retrieve the authentication token.

```tsx
import { getAuthToken } from '@/app/lib/auth';

const token = getAuthToken();
if (token) {
  // Use token for API calls
}
```

**Returns**: `string | null`

---

### `setAuthToken(token)`

Store an authentication token.

```tsx
import { setAuthToken } from '@/app/lib/auth';

setAuthToken('abc123token');
```

---

### `removeAuthToken()`

Remove the authentication token (logout).

```tsx
import { removeAuthToken } from '@/app/lib/auth';

removeAuthToken();
```

---

### `isAuthenticated()`

Check if user is logged in.

```tsx
import { isAuthenticated } from '@/app/lib/auth';

if (isAuthenticated()) {
  console.log('User is authenticated');
}
```

**Returns**: `boolean`

---

### `isAdmin()`

Check if current user is an admin.

```tsx
import { isAdmin } from '@/app/lib/auth';

if (isAdmin()) {
  console.log('User is admin');
}
```

**Returns**: `boolean`

---

## 📊 Election Data Module Functions

### `getElectionRegions()`

Fetch all election regions.

```tsx
import { getElectionRegions } from '@/app/lib/electionData';

const regions = await getElectionRegions();
```

**Returns**: `Promise<ElectionRegion[]>`

---

### `getElectionRegionById(id)`

Get a specific region.

```tsx
import { getElectionRegionById } from '@/app/lib/electionData';

const region = await getElectionRegionById('region-1');
```

**Returns**: `Promise<ElectionRegion | null>`

---

### `updateElectionRegion(id, updates)`

Update a region.

```tsx
import { updateElectionRegion } from '@/app/lib/electionData';

const updated = await updateElectionRegion('region-1', {
  totalCountPercent: 75,
  status: 'active'
});
```

**Returns**: `Promise<ElectionRegion | null>`

---

### `createElectionRegion(region)`

Create a new region.

```tsx
import { createElectionRegion } from '@/app/lib/electionData';

const newRegion = await createElectionRegion({
  name: 'Kathmandu-1',
  nepaliName: 'काठमाडौँ-१',
  totalCountPercent: 0,
  status: 'pending',
  lastUpdated: new Date().toISOString(),
  candidates: []
});
```

**Returns**: `Promise<ElectionRegion>`

---

### `deleteElectionRegion(id)`

Delete a region.

```tsx
import { deleteElectionRegion } from '@/app/lib/electionData';

const success = await deleteElectionRegion('region-1');
```

**Returns**: `Promise<boolean>`

---

### `updateCandidate(regionId, candidateId, data)`

Update a candidate's votes.

```tsx
import { updateCandidate } from '@/app/lib/electionData';

const updated = await updateCandidate('region-1', 'cand-1', {
  votes: 12500,
  changeVotes: 50
});
```

**Returns**: `Promise<Candidate | null>`

---

### `addCandidate(regionId, candidate)`

Add a new candidate to a region.

```tsx
import { addCandidate } from '@/app/lib/electionData';

const newCandidate = await addCandidate('region-1', {
  id: '',  // Will be auto-generated
  name: 'New Candidate',
  party: 'Party Name',
  votes: 0,
  changeVotes: 0,
  color: '#3b82f6',
  imageUrl: 'https://...'
});
```

**Returns**: `Promise<Candidate | null>`

---

## 🎯 Common Patterns

### Pattern 1: Protected Route

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) router.push('/login');

  return <div>Protected Content</div>;
}
```

### Pattern 2: Update with Error Handling

```tsx
const handleUpdate = async () => {
  try {
    await updateRegion(regionId, { totalCountPercent: 75 });
    console.log('Updated successfully');
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### Pattern 3: Display List of Data

```tsx
const { regions, isLoading } = useElection();

if (isLoading) return <div>Loading...</div>;

return (
  <div>
    {regions.map(region => (
      <div key={region.id}>{region.nepaliName}</div>
    ))}
  </div>
);
```

### Pattern 4: Form Input with Update

```tsx
const [count, setCount] = useState('');
const { currentRegion, updateRegion } = useElection();

const handleSubmit = async (e) => {
  e.preventDefault();
  if (currentRegion) {
    await updateRegion(currentRegion.id, {
      totalCountPercent: parseFloat(count)
    });
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={count}
      onChange={(e) => setCount(e.target.value)}
    />
    <button type="submit">Save</button>
  </form>
);
```

---

## ⚡ Performance Tips

1. **Use Hooks at Top Level**
   ```tsx
   // ✅ Good
   const { currentRegion } = useElection();
   
   // ❌ Avoid
   if (condition) {
     const { currentRegion } = useElection();
   }
   ```

2. **Avoid Calling APIs in Loops**
   ```tsx
   // ✅ Good
   const regions = await getElectionRegions();
   
   // ❌ Avoid
   for (let i = 0; i < 10; i++) {
     await getElectionRegionById(i); // Too many calls
   }
   ```

3. **Memoize Components with useCallback**
   ```tsx
   const handleUpdate = useCallback(async () => {
     // expensive operation
   }, [dependencies]);
   ```

---

## 🔍 Debugging

### Log Context State
```tsx
const context = useElection();
console.log('Election Context:', context);
```

### Check localStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem('election_regions_data'))
JSON.parse(localStorage.getItem('election_auth_token'))
```

### Trace Updates
```tsx
useEffect(() => {
  console.log('currentRegion changed:', currentRegion);
}, [currentRegion]);
```

---

## 🚀 Production Checklist

- [ ] Replace localStorage with real API
- [ ] Add JWT authentication
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Optimize images
- [ ] Add analytics
- [ ] Set up monitoring
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Secure API keys

---

## 📞 Need Help?

Check these files:
- Implementation: `/app/context/` and `/app/lib/`
- Examples: `/app/page.tsx`, `/app/dashboard/page.tsx`
- Types: `/app/lib/types.ts`

All code is well-commented and uses clear naming conventions.
