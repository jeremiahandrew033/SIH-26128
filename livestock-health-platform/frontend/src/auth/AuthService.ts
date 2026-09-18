export type UserRole = 'farmer' | 'veterinary_officer' | 'government_official';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: UserRole;
  preferred_language: 'en' | 'te' | 'hi';
  phone?: string;
  email?: string;
  is_demo?: boolean;
  created_at: string;
}

export interface AuthSession {
  user: UserProfile;
  token?: string;
  authMode: 'REAL' | 'DEMO';
}

const STORAGE_KEY = 'livestock_auth_session';

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
      created_at: new Date().toISOString()
    }
  };

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

  public static async login(email: string, pass: string): Promise<AuthSession> {
    if (!email || !pass) {
      throw new Error('Please enter a valid email/user ID and password.');
    }

    // Default prototype fallback matching demo logins or real auth when configured
    let matchedRole: UserRole = 'farmer';
    if (email.includes('vet')) matchedRole = 'veterinary_officer';
    if (email.includes('gov') || email.includes('admin')) matchedRole = 'government_official';

    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      auth_user_id: `auth-${email}`,
      full_name: email.split('@')[0].toUpperCase(),
      role: matchedRole,
      preferred_language: 'en',
      email: email,
      is_demo: false,
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
