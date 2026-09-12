import { apiRequest } from './apiClient';

export const DEMO_ACCOUNTS = [
  {
    id: 'user-alice',
    username: 'alice_dev',
    email: 'alice@techscale.io',
    fullName: 'Alice Developer',
    role: 'Standard User',
    roleType: 'user',
    isAdmin: false,
  },
  {
    id: 'user-bob',
    username: 'bob_user',
    email: 'bob@cloud.dev',
    fullName: 'Bob Martinez',
    role: 'Standard User',
    roleType: 'user',
    isAdmin: false,
  },
  {
    id: 'user-admin',
    username: 'system-admin',
    email: 'admin@sho.rt',
    fullName: 'System Administrator',
    role: 'Lead Infrastructure Architect (Admin)',
    roleType: 'admin',
    isAdmin: true,
  },
];

export const isUserAdmin = (user) => Boolean(user?.isAdmin || user?.roleType === 'admin');

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async restoreSession() {
    try {
      const data = await apiRequest('/api/auth/me');
      this.currentUser = data.user;
    } catch {
      this.currentUser = null;
    }
    return this.currentUser;
  }

  async login(usernameOrEmail, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { usernameOrEmail, password },
    });
    this.currentUser = data.user;
    return this.currentUser;
  }

  async startRegister(form) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
      },
    });
  }

  async verifyRegister(email, code) {
    const data = await apiRequest('/api/auth/register/verify', {
      method: 'POST',
      body: { email, code },
    });
    this.currentUser = data.user;
    return this.currentUser;
  }

  async loginDemo(username) {
    const data = await apiRequest('/api/auth/demo', {
      method: 'POST',
      body: { username },
    });
    this.currentUser = data.user;
    return this.currentUser;
  }

  async updateProfile(updates) {
    const data = await apiRequest('/api/auth/me', {
      method: 'PATCH',
      body: updates,
    });
    this.currentUser = data.user;
    return this.currentUser;
  }

  async logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    this.currentUser = null;
    return null;
  }

  async switchUser(username) {
    return this.loginDemo(username);
  }
}

export const authService = new AuthService();
