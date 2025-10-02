export interface User {
  id: number;
  email: string;
  username: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

const STORAGE_KEY = 'manhwa_auth_token';
const STORAGE_USER_KEY = 'manhwa_user';

const mockUsers: Map<string, { id: number; email: string; username: string; password: string; token: string }> = new Map();
let nextUserId = 1;

export const mockAuthAPI = {
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (mockUsers.has(normalizedEmail)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    const token = `mock_token_${Date.now()}_${Math.random()}`;
    const user = {
      id: nextUserId++,
      email: normalizedEmail,
      username: username.trim(),
      password,
      token
    };
    
    mockUsers.set(normalizedEmail, user);
    
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: new Date().toISOString()
    }));
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: new Date().toISOString()
      },
      token
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = mockUsers.get(normalizedEmail);
    
    if (!user || user.password !== password) {
      return { success: false, error: 'Неверный email или пароль' };
    }
    
    const token = `mock_token_${Date.now()}_${Math.random()}`;
    user.token = token;
    
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: new Date().toISOString()
    }));
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    };
  },

  verifySession: async (token: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    for (const user of mockUsers.values()) {
      if (user.token === token) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          }
        };
      }
    }
    
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return { success: true, user };
      } catch {
        return { success: false, error: 'Сессия истекла' };
      }
    }
    
    return { success: false, error: 'Сессия истекла' };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
  },

  getStoredUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
};
