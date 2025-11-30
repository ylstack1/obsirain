export interface Item {
  id: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
  folder: string; // The internal path used by Obsidian. Maps to collectionPath in frontmatter.
  collectionId: string;
  collectionTitle: string;
  collectionPath: string; // Redundant with folder, but kept for Raindrop compatibility
  collectionParentId?: string; // Optional for sub-collections
  banner?: string; // URL for the banner image
  type?: string; // e.g., 'link', 'article'
  icon?: string; // Custom icon path from .obsidian/icons folder
  createdAt: string;
  updatedAt: string;
}

export interface PluginSettings {
  defaultFolder: string;
  predefinedTags: string[];
  enableAutoSave: boolean;
  folderIcons: Record<string, string>; // Maps folder paths to icon paths
  tabIcons: {
    analytics: string;
    collections: string;
    items: string;
    search: string;
  };
}

export const DEFAULT_SETTINGS: PluginSettings = {
  defaultFolder: 'Items',
  predefinedTags: ['important', 'todo', 'reference', 'project'],
  enableAutoSave: true,
  folderIcons: {},
  tabIcons: {
    analytics: '📊',
    collections: '📁',
    items: '🔗',
    search: '🔍',
  },
};

export interface TreeNode {
  name: string;
  path: string;
  type: 'folder' | 'item';
  children?: TreeNode[];
  item?: Item; // Only present if type is 'item'
  icon?: string; // Custom icon for this node
  itemCount?: number; // Only meaningful for folders
}
