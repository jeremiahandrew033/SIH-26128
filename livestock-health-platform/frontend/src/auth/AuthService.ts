export type UserRole = 'farmer' | 'veterinary_officer' | 'government_official';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: UserRole;
  preferred_language: 'en' | 'te' | 'hi';
  phone?: string;
  email?: string;
  is_demo?: boolean;
  status?: UserStatus;
  
  // Registration fields
  state?: string;
  district?: string;
  village?: string;
  livestock_species?: string;
  animal_count?: number;
  license_number?: string;
  organization?: string;
  password?: string; // Stored only in this mock for demo purposes

  created_at: string;
}

export interface AuthSession {
  user: UserProfile;
  token?: string;
  authMode: 'REAL' | 'DEMO';
}

const STORAGE_KEY = 'livestock_auth_session';
const LOCAL_USERS_KEY = 'livestock_local_users';

export class AuthService {
  private static demoUsers: Record<UserRole, UserProfile> = {
    farmer: {
      id: 'f1111111-1111-1111-1111-111111111111',
      auth_user_id: 'auth-demo-farmer',
      full_name: 'Ravi Kumar',
      role: 'farmer',
      preferred_language: 'en',
      phone: '+919876543210',
      email: 'farmer.demo@livestock.gov.in',
      is_demo: true,
      status: 'active',
      created_at: new Date().toISOString()
    },
    veterinary_officer: {
      id: 'demo-vet-001',
      auth_user_id: 'auth-demo-vet',
      full_name: 'Dr. Anita Sharma (Veterinary Officer)',
      role: 'veterinary_officer',
      preferred_language: 'en',
      phone: '+919876543211',
      email: 'dr.anita@vet.gov.in',
      is_demo: true,
      status: 'active',
      created_at: new Date().toISOString()
    },
    government_official: {
      id: 'demo-gov-001',
      auth_user_id: 'auth-demo-gov',
      full_name: 'Shri Rajesh Verma (District Director)',
      role: 'government_official',
      preferred_language: 'en',
      phone: '+919876543212',
      email: 'rajesh.verma@gov.in',
      is_demo: true,
      status: 'active',
      created_at: new Date().toISOString()
    }
  };

  private static getLocalUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalUsers(users: UserProfile[]): void {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }

  public static getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static async loginDemo(role: UserRole): Promise<AuthSession> {
    const profile = this.demoUsers[role];
    const session: AuthSession = {
      user: profile,
      authMode: 'DEMO',
      token: `demo-token-${role}`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  public static async login(identifier: string, pass: string): Promise<AuthSession> {
    if (!identifier || !pass) {
      throw new Error('Please enter valid credentials.');
    }

    // 1. Check local registered users first
    const users = this.getLocalUsers();
    const matchedUser = users.find(u => 
      (u.phone === identifier || u.email === identifier) && 
      u.password === pass
    );

    if (matchedUser) {
      const session: AuthSession = {
        user: matchedUser,
        authMode: 'REAL',
        token: `auth-token-${matchedUser.id}`
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    }

    // 2. Default prototype fallback
    let matchedRole: UserRole = 'farmer';
    if (identifier.includes('vet')) matchedRole = 'veterinary_officer';
    if (identifier.includes('gov') || identifier.includes('admin')) matchedRole = 'government_official';

    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      auth_user_id: `auth-${identifier}`,
      full_name: identifier.split('@')[0].toUpperCase(),
      role: matchedRole,
      preferred_language: 'en',
      email: identifier.includes('@') ? identifier : undefined,
      phone: !identifier.includes('@') ? identifier : undefined,
      is_demo: false,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const session: AuthSession = {
      user: profile,
      authMode: 'REAL',
      token: `auth-token-${Date.now()}`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  public static async registerFarmer(data: Partial<UserProfile>): Promise<AuthSession> {
    const users = this.getLocalUsers();
    if (users.find(u => u.phone === data.phone)) {
      throw new Error('A user with this mobile number already exists.');
    }

    const newUser: UserProfile = {
      id: `farmer-${Date.now()}`,
      auth_user_id: `auth-${data.phone}`,
      role: 'farmer',
      preferred_language: 'en',
      is_demo: false,
      status: 'active',
      created_at: new Date().toISOString(),
      full_name: data.full_name || '',
      phone: data.phone,
      password: data.password,
      state: data.state,
      district: data.district,
      village: data.village,
      livestock_species: data.livestock_species,
      animal_count: data.animal_count
    };

    this.saveLocalUsers([...users, newUser]);
    
    // Auto-login after registration
    const session: AuthSession = {
      user: newUser,
      authMode: 'REAL',
      token: `auth-token-${newUser.id}`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  public static async registerVet(data: Partial<UserProfile>): Promise<AuthSession> {
    const users = this.getLocalUsers();
    if (users.find(u => u.phone === data.phone || (data.email && u.email === data.email))) {
      throw new Error('A user with this contact information already exists.');
    }

    const newUser: UserProfile = {
      id: `vet-${Date.now()}`,
      auth_user_id: `auth-${data.phone}`,
      role: 'veterinary_officer',
      preferred_language: 'en',
      is_demo: false,
      status: 'pending', // Registration puts vet in pending state
      created_at: new Date().toISOString(),
      full_name: data.full_name || '',
      phone: data.phone,
      email: data.email,
      password: data.password,
      license_number: data.license_number,
      organization: data.organization,
      district: data.district
    };

    this.saveLocalUsers([...users, newUser]);
    
    // Auto-login (though they might be blocked by 'pending' state later)
    const session: AuthSession = {
      user: newUser,
      authMode: 'REAL',
      token: `auth-token-${newUser.id}`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  public static logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public static isAuthenticated(): boolean {
    return !!this.getSession();
  }

  public static getCurrentRole(): UserRole | null {
    const session = this.getSession();
    return session ? session.user.role : null;
  }
}

