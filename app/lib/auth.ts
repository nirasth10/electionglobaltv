import { User, AuthCredentials, AuthResponse } from './types';

const STORAGE_KEY = 'election_auth_token';
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@electionglobal.com',
    name: 'Admin User',
    role: 'admin' as const,
    password: 'admin123',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'viewer@electionglobal.com',
    name: 'Viewer User',
    role: 'viewer' as const,
    password: 'viewer123',
    createdAt: new Date().toISOString(),
  },
];

export const generateToken = (userId: string): string => {
  return btoa(`${userId}:${Date.now()}`);
};

export const parseToken = (token: string): { userId: string; timestamp: number } | null => {
  try {
    const decoded = atob(token);
    const [userId, timestamp] = decoded.split(':');
    return { userId, timestamp: parseInt(timestamp) };
  } catch {
    return null;
  }
};

export const authenticateUser = async (
  credentials: AuthCredentials
): Promise<AuthResponse | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = DEMO_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    return null;
  }

  const token = generateToken(user.id);
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return null;

  const parsed = parseToken(token);
  if (!parsed) return null;

  const user = DEMO_USERS.find((u) => u.id === parsed.userId);
  if (!user) return null;

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin' || false;
};

// Demo credentials for login page
export const DEMO_CREDENTIALS = [
  {
    email: 'admin@electionglobal.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
  },
  {
    email: 'viewer@electionglobal.com',
    password: 'viewer123',
    role: 'viewer',
    name: 'Viewer User',
  },
];
