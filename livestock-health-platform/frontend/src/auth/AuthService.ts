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
    // Map the requested role to the demo credentials seeded in the backend
    let username = '';
    let password = '';
    if (role === 'farmer') {
      username = 'farmer.demo';
      password = 'farmer123';
    } else if (role === 'veterinary_officer') {
      username = 'vet.demo';
      password = 'vet123';
    } else if (role === 'government_official') {
      username = 'gov.demo';
      password = 'gov123';
    }
    
    // Use the newly real backend login for demo login
    return this.login(username, password);
  }

  public static async login(identifier: string, pass: string): Promise<AuthSession> {
    if (!identifier || !pass) {
      throw new Error('Please enter valid credentials.');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', identifier);
      formData.append('password', pass);

      const baseUrl = 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      const token = data.access_token;
      
      // Determine role safely
      const roleStr = (data.role || 'farmer').toLowerCase();
      let role: UserRole = 'farmer';
      if (roleStr === 'veterinarian' || roleStr === 'veterinary_officer') role = 'veterinary_officer';
      if (roleStr === 'government' || roleStr === 'government_official') role = 'government_official';

      const profile: UserProfile = {
        id: data.farmer_id || `usr-${Date.now()}`,
        auth_user_id: `auth-${identifier}`,
        full_name: identifier,
        role: role,
        preferred_language: 'en',
        is_demo: true,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const session: AuthSession = {
        user: profile,
        authMode: 'REAL',
        token: token
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      throw new Error(err.message || 'Login failed.');
    }
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

