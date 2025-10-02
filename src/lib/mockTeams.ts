import { User } from './mockAuth';

export interface Team {
  id: number;
  name: string;
  description: string;
  avatar_url: string;
  creator_id: number;
  created_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: number;
  username: string;
  email: string;
  role: 'creator' | 'admin' | 'member';
  joined_at: string;
}

const STORAGE_TEAMS_KEY = 'manhwa_teams';
const STORAGE_MEMBERS_KEY = 'manhwa_team_members';

let mockTeams: Team[] = [];
let mockMembers: Map<number, TeamMember[]> = new Map();
let nextTeamId = 1;

const loadFromStorage = () => {
  try {
    const teamsData = localStorage.getItem(STORAGE_TEAMS_KEY);
    const membersData = localStorage.getItem(STORAGE_MEMBERS_KEY);
    
    if (teamsData) {
      mockTeams = JSON.parse(teamsData);
      nextTeamId = Math.max(...mockTeams.map(t => t.id), 0) + 1;
    }
    
    if (membersData) {
      const parsed = JSON.parse(membersData);
      mockMembers = new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v as TeamMember[]]));
    }
  } catch (e) {
    console.error('Failed to load teams from storage', e);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(mockTeams));
    const membersObj = Object.fromEntries(mockMembers.entries());
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(membersObj));
  } catch (e) {
    console.error('Failed to save teams to storage', e);
  }
};

loadFromStorage();

export const mockTeamsAPI = {
  getTeams: async (): Promise<{ teams: Team[] }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const teamsWithCount = mockTeams.map(team => ({
      ...team,
      member_count: mockMembers.get(team.id)?.length || 0
    }));
    
    return { teams: teamsWithCount };
  },

  getTeam: async (id: number): Promise<Team & { members: TeamMember[] } | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const team = mockTeams.find(t => t.id === id);
    if (!team) return null;
    
    const members = mockMembers.get(id) || [];
    
    return {
      ...team,
      member_count: members.length,
      members
    };
  },

  createTeam: async (name: string, description: string, avatar_url: string, creator: User): Promise<Team> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const team: Team = {
      id: nextTeamId++,
      name,
      description,
      avatar_url,
      creator_id: creator.id,
      created_at: new Date().toISOString(),
      member_count: 1
    };
    
    mockTeams.push(team);
    
    const creatorMember: TeamMember = {
      id: creator.id,
      username: creator.username,
      email: creator.email,
      role: 'creator',
      joined_at: new Date().toISOString()
    };
    
    mockMembers.set(team.id, [creatorMember]);
    saveToStorage();
    
    return team;
  },

  updateTeam: async (teamId: number, userId: number, updates: Partial<Team>): Promise<Team | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const team = mockTeams.find(t => t.id === teamId);
    if (!team) return null;
    
    if (team.creator_id !== userId) {
      throw new Error('Only team creator can edit');
    }
    
    Object.assign(team, updates);
    saveToStorage();
    
    return team;
  },

  addMember: async (teamId: number, user: User, role: 'admin' | 'member' = 'member'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const members = mockMembers.get(teamId) || [];
    
    if (members.some(m => m.id === user.id)) {
      return false;
    }
    
    const newMember: TeamMember = {
      id: user.id,
      username: user.username,
      email: user.email,
      role,
      joined_at: new Date().toISOString()
    };
    
    members.push(newMember);
    mockMembers.set(teamId, members);
    saveToStorage();
    
    return true;
  },

  removeMember: async (teamId: number, userId: number, removerId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const team = mockTeams.find(t => t.id === teamId);
    if (!team || team.creator_id !== removerId) {
      throw new Error('Only team creator can remove members');
    }
    
    const members = mockMembers.get(teamId) || [];
    const filtered = members.filter(m => m.id !== userId);
    
    mockMembers.set(teamId, filtered);
    saveToStorage();
    
    return true;
  }
};
