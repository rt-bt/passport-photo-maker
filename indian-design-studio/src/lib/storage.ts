import { DesignProject, UserProfile } from '@/types';
import { SAMPLE_TEMPLATES } from './templatesData';

const STORAGE_PROJECTS_KEY = 'ids_saved_projects_v1';
const STORAGE_USER_KEY = 'ids_user_profile_v1';
const STORAGE_UPLOADS_KEY = 'ids_user_uploads_v1';

// Default initial user
export const DEFAULT_USER: UserProfile = {
  id: 'usr_demo_indian_designer',
  name: 'Aaditya Sharma',
  email: 'aaditya@designstudio.in',
  role: 'admin',
  plan: 'pro',
  aiCredits: 250,
  createdAt: new Date().toISOString(),
};

/**
 * Get all saved projects from storage (with fallback sample projects)
 */
export function getSavedProjects(): DesignProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      // Seed initial sample projects from templates
      const seeded: DesignProject[] = SAMPLE_TEMPLATES.slice(0, 3).map((tpl, i) => ({
        id: `proj_seeded_${i + 1}`,
        title: `My ${tpl.title}`,
        category: tpl.category,
        subcategory: tpl.subcategory,
        width: tpl.width,
        height: tpl.height,
        thumbnail: tpl.thumbnail,
        createdAt: new Date(Date.now() - (i + 1) * 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
        pages: [
          {
            id: 'page_1',
            name: 'Page 1',
            canvasData: tpl.canvasData,
          },
        ],
      }));
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [];
  }
}

/**
 * Save or update a project
 */
export function saveProject(project: DesignProject): DesignProject {
  if (typeof window === 'undefined') return project;
  try {
    const projects = getSavedProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    project.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }

    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    return project;
  } catch (err) {
    console.error('Failed to save project:', err);
    return project;
  }
}

/**
 * Get single project by ID
 */
export function getProjectById(id: string): DesignProject | null {
  const projects = getSavedProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Duplicate a project
 */
export function duplicateProject(id: string): DesignProject | null {
  const target = getProjectById(id);
  if (!target) return null;

  const duplicated: DesignProject = {
    ...target,
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${target.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveProject(duplicated);
}

/**
 * Delete a project
 */
export function deleteProject(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return false;
  }
}

/**
 * User Profile helpers
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function updateUserProfile(profile: Partial<UserProfile>): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const current = getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_USER;
  }
}

/**
 * Uploaded images persistence
 */
export function getUploadedImages(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_UPLOADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addUploadedImage(base64: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getUploadedImages();
    const updated = [base64, ...current.slice(0, 20)]; // store up to 20 recent uploads
    localStorage.setItem(STORAGE_UPLOADS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
