/**
 * Image Organization Utility
 * Helps validate and organize images according to their intended usage
 */

export interface ImageUsageMap {
  category: string;
  expectedUsage: string;
  maxImages?: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export const IMAGE_USAGE_MAP: Record<string, ImageUsageMap> = {
  logo: {
    category: 'logo',
    expectedUsage: 'Header navigation logo',
    maxImages: 1,
    priority: 'high',
    description: 'Logo principal affiché dans l\'en-tête du site'
  },
  hero: {
    category: 'hero',
    expectedUsage: 'Homepage hero section and portfolio preview',
    maxImages: 3,
    priority: 'high',
    description: 'Images principales de la page d\'accueil (hero + 2 aperçus portfolio)'
  },
  about: {
    category: 'about',
    expectedUsage: 'About page story section',
    maxImages: 2,
    priority: 'medium',
    description: 'Images de l\'équipe et de l\'histoire (page À propos)'
  },
  services: {
    category: 'services',
    expectedUsage: 'Homepage portfolio preview section',
    priority: 'medium',
    description: 'Images des services (façade, PLV) utilisées sur la page d\'accueil'
  },
  portfolio: {
    category: 'portfolio',
    expectedUsage: 'Portfolio page main gallery',
    priority: 'low',
    description: 'Collection complète des projets pour la galerie portfolio'
  }
};

/**
 * Validates if an image category is properly configured
 */
export const validateImageCategory = (category: string): boolean => {
  return category in IMAGE_USAGE_MAP;
};

/**
 * Gets the expected usage for an image category
 */
export const getImageUsage = (category: string): ImageUsageMap | null => {
  return IMAGE_USAGE_MAP[category] || null;
};

/**
 * Gets all valid image categories
 */
export const getValidCategories = (): string[] => {
  return Object.keys(IMAGE_USAGE_MAP);
};

/**
 * Suggests the correct category based on filename patterns
 */
export const suggestCategory = (filename: string): string | null => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('logo')) return 'logo';
  if (lowerFilename.includes('hero') || lowerFilename.includes('main')) return 'hero';
  if (lowerFilename.includes('about') || lowerFilename.includes('team') || lowerFilename.includes('equipe')) return 'about';
  if (lowerFilename.includes('facade') || lowerFilename.includes('plv') || lowerFilename.includes('service')) return 'services';
  
  return 'portfolio'; // Default fallback
};

/**
 * Checks if a category has reached its maximum image limit
 */
export const isCategoryFull = (category: string, currentCount: number): boolean => {
  const usage = getImageUsage(category);
  return usage?.maxImages ? currentCount >= usage.maxImages : false;
};

/**
 * Gets priority color for UI display
 */
export const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'green';
    default: return 'gray';
  }
};