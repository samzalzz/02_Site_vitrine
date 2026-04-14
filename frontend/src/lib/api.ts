const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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
};
