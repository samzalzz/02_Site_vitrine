import { auth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.getToken()}`,
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images?: string[];
  deployedUrl?: string;
  githubUrl?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
}

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface NewsletterData {
  email: string;
}

export const api = {
  projects: {
    async getAll(): Promise<Project[]> {
      const res = await fetch(`${API_BASE_URL}/projects`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    async getById(id: string): Promise<Project> {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
  },
  experiences: {
    async getAll(): Promise<Experience[]> {
      const res = await fetch(`${API_BASE_URL}/experiences`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch experiences');
      return res.json();
    },
  },
  skills: {
    async getAll(): Promise<Skill[]> {
      const res = await fetch(`${API_BASE_URL}/skills`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch skills');
      return res.json();
    },
  },
  contact: {
    async submit(data: ContactData): Promise<void> {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit contact form');
    },
  },
  newsletter: {
    async subscribe(email: string): Promise<void> {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to subscribe to newsletter');
    },
  },
  client: {
    async login(email: string, password: string): Promise<{ token: string; client: any }> {
      const res = await fetch(`${API_BASE_URL}/client-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid email or password');
      return res.json();
    },
    async me(token: string): Promise<any> {
      const res = await fetch(`${API_BASE_URL}/client-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthenticated');
      return res.json();
    },
    async getProjects(token: string): Promise<any[]> {
      const res = await fetch(`${API_BASE_URL}/clients/me/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    async getProjectById(token: string, id: string): Promise<any> {
      const res = await fetch(`${API_BASE_URL}/clients/me/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
  },
  admin: {
    async login(email: string, password: string): Promise<{ token: string }> {
      const res = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid email or password');
      return res.json();
    },
    async getUsers() {
      return this.getAll<{ id: string; email: string; name: string; role: string; createdAt: string }>('users');
    },
    async createUser(data: { email: string; password: string; name: string }) {
      return this.create<{ id: string; email: string; name: string; role: string }>('users', data);
    },
    async deleteUser(id: string) {
      return this.remove('users', id);
    },
    async changePassword(id: string, currentPassword: string, newPassword: string) {
      const res = await fetch(`${API_BASE_URL}/users/${id}/password`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error(await res.json().then((d: any) => d.error ?? 'Failed'));
      return res.json();
    },
    async me() {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: adminHeaders() });
      if (!res.ok) throw new Error('Unauthenticated');
      return res.json();
    },
    async getAll<T>(resource: string): Promise<T[]> {
      const res = await fetch(`${API_BASE_URL}/${resource}`, {
        headers: adminHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
      return res.json();
    },
    async create<T>(resource: string, data: unknown): Promise<T> {
      const res = await fetch(`${API_BASE_URL}/${resource}`, {
        method: 'POST', headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to create ${resource}`);
      return res.json();
    },
    async update<T>(resource: string, id: string, data: unknown): Promise<T> {
      const res = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to update ${resource}`);
      return res.json();
    },
    async remove(resource: string, id: string): Promise<void> {
      const res = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: 'DELETE', headers: adminHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to delete from ${resource}`);
    },
    async getClients() {
      return this.getAll<{
        id: string;
        email: string;
        name: string;
        company?: string;
        phone?: string;
        status: string;
        canLogin: boolean;
        createdAt: string;
        _count: { projects: number };
      }>('clients');
    },
    async createClient(data: { email: string; name: string; company?: string; phone?: string; canLogin?: boolean }) {
      return this.create<{ id: string; email: string; name: string; company?: string; phone?: string; status: string; canLogin: boolean; createdAt: string }>('clients', data);
    },
    async updateClient(id: string, data: { name?: string; company?: string; phone?: string; status?: string; canLogin?: boolean }) {
      return this.update<{ id: string; email: string; name: string; company?: string; phone?: string; status: string; canLogin: boolean }>('clients', id, data);
    },
    async deleteClient(id: string) {
      return this.remove('clients', id);
    },
    async sendPasswordReset(clientId: string) {
      const res = await fetch(`${API_BASE_URL}/clients/${clientId}/send-password-reset`, {
        method: 'POST',
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error(await res.json().then(d => d.error ?? 'Failed'));
      return res.json();
    },
    async getProjects() {
      return this.getAll<{
        id: string;
        title: string;
        description: string;
        budget?: number;
        timeline?: string;
        status: string;
        clientId: string;
        client: { id: string; name: string; email: string; company?: string };
        _count: { messages: number };
        createdAt: string;
      }>('client-projects');
    },
    async getProjectById(id: string) {
      const res = await fetch(`${API_BASE_URL}/client-projects/${id}`, {
        headers: adminHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json() as Promise<{
        id: string;
        title: string;
        description: string;
        budget?: number;
        timeline?: string;
        status: string;
        clientId: string;
        client: { id: string; name: string; email: string; company?: string };
        messages: {
          id: string;
          content: string;
          senderType: string;
          senderName: string;
          createdAt: string;
          attachments: { id: string; fileName: string; originalName: string; fileUrl: string }[];
        }[];
      }>;
    },
    async createProject(data: { title: string; description: string; clientId: string; budget?: number; timeline?: string; status?: string }) {
      return this.create<{ id: string; title: string; description: string; clientId: string; status: string; createdAt: string }>('client-projects', data);
    },
    async updateProject(id: string, data: { title?: string; description?: string; budget?: number; timeline?: string; status?: string; clientId?: string }) {
      return this.update<{ id: string; title: string; description: string; status: string }>('client-projects', id, data);
    },
    async deleteProject(id: string) {
      return this.remove('client-projects', id);
    },
  },
};
