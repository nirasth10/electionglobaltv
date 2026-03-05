import { ElectionRegion, Candidate } from './types';

const STORAGE_KEY = 'election_regions_data';

export const DEFAULT_ELECTION_DATA: ElectionRegion = {
  id: 'region-1',
  name: 'Jhapa-5',
  nepaliName: 'झापा-५',
  totalCountPercent: 65.4,
  status: 'active',
  lastUpdated: new Date().toISOString(),
  candidates: [
    {
      id: 'cand-1',
      name: 'केपी शर्मा ओली',
      party: 'CPN-UML',
      votes: 12450,
      changeVotes: 120,
      color: '#ef4444',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      partySymbol: '🔴',
    },
    {
      id: 'cand-2',
      name: 'शेर बहादुर देउवा',
      party: 'NC',
      votes: 11890,
      changeVotes: 85,
      color: '#22c55e',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      partySymbol: '🟢',
    },
    {
      id: 'cand-3',
      name: 'पुष्पकमल दाहाल',
      party: 'MC',
      votes: 9430,
      changeVotes: 42,
      color: '#dc2626',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      partySymbol: '📍',
    },
    {
      id: 'cand-4',
      name: 'रवि लामिछाने',
      party: 'RSP',
      votes: 8120,
      changeVotes: 310,
      color: '#06b6d4',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      partySymbol: '🔵',
    },
  ],
};

// Simulate data storage
let electionRegions: ElectionRegion[] = [];

// Initialize with default data
const initializeData = (): void => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        electionRegions = JSON.parse(stored);
      } catch {
        electionRegions = [DEFAULT_ELECTION_DATA];
        saveToStorage();
      }
    } else {
      electionRegions = [DEFAULT_ELECTION_DATA];
      saveToStorage();
    }
  }
};

const saveToStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(electionRegions));
  }
};

export const getElectionRegions = async (): Promise<ElectionRegion[]> => {
  initializeData();
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  return electionRegions;
};

export const getElectionRegionById = async (id: string): Promise<ElectionRegion | null> => {
  initializeData();
  return electionRegions.find((r) => r.id === id) || null;
};

export const createElectionRegion = async (region: ElectionRegion): Promise<ElectionRegion> => {
  initializeData();
  const newRegion = {
    ...region,
    id: `region-${Date.now()}`,
    lastUpdated: new Date().toISOString(),
  };
  electionRegions.push(newRegion);
  saveToStorage();
  return newRegion;
};

export const updateElectionRegion = async (
  id: string,
  updates: Partial<ElectionRegion>
): Promise<ElectionRegion | null> => {
  initializeData();
  const index = electionRegions.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated = {
    ...electionRegions[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  electionRegions[index] = updated;
  saveToStorage();
  return updated;
};

export const deleteElectionRegion = async (id: string): Promise<boolean> => {
  initializeData();
  const index = electionRegions.findIndex((r) => r.id === id);
  if (index === -1) return false;

  electionRegions.splice(index, 1);
  saveToStorage();
  return true;
};

export const updateCandidate = async (
  regionId: string,
  candidateId: string,
  candidateData: Partial<Candidate>
): Promise<Candidate | null> => {
  const region = await getElectionRegionById(regionId);
  if (!region) return null;

  const candidateIndex = region.candidates.findIndex((c) => c.id === candidateId);
  if (candidateIndex === -1) return null;

  const updated = {
    ...region.candidates[candidateIndex],
    ...candidateData,
  };
  region.candidates[candidateIndex] = updated;

  await updateElectionRegion(regionId, region);
  return updated;
};

export const addCandidate = async (
  regionId: string,
  candidate: Candidate
): Promise<Candidate | null> => {
  const region = await getElectionRegionById(regionId);
  if (!region) return null;

  const newCandidate = {
    ...candidate,
    id: `cand-${Date.now()}`,
  };
  region.candidates.push(newCandidate);
  await updateElectionRegion(regionId, region);
  return newCandidate;
};
