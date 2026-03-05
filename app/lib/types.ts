// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Election Types
export interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  changeVotes: number;
  color: string;
  imageUrl: string;
  partySymbol?: string;
}

export interface ElectionRegion {
  id: string;
  name: string;
  nepaliName: string;
  totalCountPercent: number;
  candidates: Candidate[];
  status: 'active' | 'completed' | 'pending';
  lastUpdated: string;
}

export interface DashboardStats {
  totalRegions: number;
  activeRegions: number;
  totalVotesCasted: number;
  countingProgress: number;
}

// Form Data Types
export interface CandidateFormData {
  name: string;
  party: string;
  votes: number;
  color: string;
  imageUrl: string;
  partySymbol?: string;
}

export interface RegionFormData {
  name: string;
  nepaliName: string;
  status: 'active' | 'completed' | 'pending';
  totalCountPercent: number;
  candidates: CandidateFormData[];
}
