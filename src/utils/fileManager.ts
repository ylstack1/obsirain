import { App, TFile, TFolder, normalizePath } from 'obsidian';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Item, TreeNode } from '../types';

export class FileManager {
  constructor(private app: App) {}

  async createItem(item: Item): Promise<void> {
    const folderPath = normalizePath(item.folder);
    await this.ensureFolderExists(folderPath);

    const fileName = `${this.sanitizeFileName(item.title)}.md`;
    const filePath = normalizePath(`${folderPath}/${fileName}`);

    const content = this.generateMarkdownContent(item);

    try {
      await this.app.vault.create(filePath, content);
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(`Failed to create item: ${error}`);
    }
  }

  async updateItem(oldPath: string, item: Item): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(oldPath);
    if (!(file instanceof TFile)) {
      throw new Error('File not found');
    }

    const content = this.generateMarkdownContent(item);
    await this.app.vault.modify(file, content);

    // If title or folder changed, rename/move the file
    const newFileName = `${this.sanitizeFileName(item.title)}.md`;
    const newPath = normalizePath(`${item.folder}/${newFileName}`);

    if (oldPath !== newPath) {
      await this.ensureFolderExists(item.folder);
      await this.app.fileManager.renameFile(file, newPath);
    }
  }

  async deleteItem(path: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      await this.app.vault.delete(file);
    }
  }

  async getAllItems(folderPath?: string): Promise<Array<{ item: Item; path: string }>> {
    const files = this.app.vault.getMarkdownFiles();
    const items: Array<{ item: Item; path: string }> = [];

    for (const file of files) {
      if (folderPath && !file.path.startsWith(folderPath)) {
        continue;
      }

      try {
        const content = await this.app.vault.read(file);
        const item = this.parseMarkdownContent(content, file.path);
        if (item) {
          items.push({ item, path: file.path });
        }
      } catch (error) {
        console.error(`Error reading file ${file.path}:`, error);
      }
    }

    return items;
  }

  private generateMarkdownContent(item: Item): string {
    const tagList = item.tags.map(tag => `  - ${tag}`).join('\n');

    const frontmatter = [
      '---',
      `id: ${item.id}`,
      `title: "${item.title}"`,
      `source: ${item.link}`,
      `created: ${item.createdAt}`,
      `lastupdate: ${item.updatedAt}`,
      `collectionId: ${item.collectionId}`,
      `collectionTitle: "${item.collectionTitle}"`,
      `collectionPath: "${item.folder}"`,
      item.collectionParentId ? `collectionParentId: ${item.collectionParentId}` : '',
      item.banner ? `banner: ${item.banner}` : '',
      item.type ? `type: ${item.type}` : '',
      item.icon ? `icon: ${item.icon}` : '',
      'tags:',
      tagList,
      '---',
      '',
      `# ${item.title}`,
      '',
      item.banner ? `![Banner](${item.banner})` : '',
      '',
      `## Description`,
      item.description,
      '',
      `---`,
      `## Details`,
      `- **Link**: [Source](${item.link})`,
      `- **Type**: ${item.type || 'link'}`,
      `- **Collection**: ${item.collectionTitle} (${item.folder})`,
      `- **Tags**: ${item.tags.map(t => `#${t}`).join(', ')}`,
      `- **Created**: ${new Date(item.createdAt).toLocaleDateString()}`,
      `- **Updated**: ${new Date(item.updatedAt).toLocaleDateString()}`,
      '',
    ];

    return frontmatter.join('\n');
  }

  private parseMarkdownContent(content: string, filePath: string): Item | null {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return null;
    }

    const frontmatter = match[1];
    const lines = frontmatter.split('\n');
    const data: Record<string, string | string[]> = {};

    // 1. Parse simple key: value pairs
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if (key === 'tags') {
        // Handled separately below
        continue;
      } else {
        data[key] = value.replace(/^"|"$/g, ''); // Remove quotes from values
      }
    }

    // 2. Handle YAML list tags: Look for lines starting with '- ' after 'tags:'
    const tagsIndex = lines.findIndex(l => l.trim() === 'tags:');
    const tags: string[] = [];
    if (tagsIndex !== -1) {
      for (let i = tagsIndex + 1; i < lines.length; i++) {
        const tagLine = lines[i].trim();
        if (tagLine.startsWith('- ')) {
          tags.push(tagLine.substring(2).trim());
        } else if (tagLine.includes(':')) {
          // Stop if we hit the next frontmatter key
          break;
        }
      }
    }
    data.tags = tags;

    // Validate required fields
    if (!data.id || !data.title) {
      return null;
    }

    // Handle new/renamed frontmatter keys and defaults
    const folder = (typeof data.collectionPath === 'string' ? data.collectionPath : filePath.substring(0, filePath.lastIndexOf('/')));
    const createdAt = typeof data.created === 'string' ? data.created : new Date().toISOString();
    const updatedAt = typeof data.lastupdate === 'string' ? data.lastupdate : new Date().toISOString();

    return {
      id: typeof data.id === 'string' ? data.id : '',
      title: typeof data.title === 'string' ? data.title : '',
      description: typeof data.description === 'string' ? data.description : '',
      link: typeof data.source === 'string' ? data.source : '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      folder: folder,
      collectionId: typeof data.collectionId === 'string' ? data.collectionId : '',
      collectionTitle: typeof data.collectionTitle === 'string' ? data.collectionTitle : folder.split('/').pop() || '',
      collectionPath: typeof data.collectionPath === 'string' ? data.collectionPath : folder,
      collectionParentId: typeof data.collectionParentId === 'string' ? data.collectionParentId : undefined,
      banner: typeof data.banner === 'string' ? data.banner : undefined,
      type: typeof data.type === 'string' ? data.type : undefined,
      icon: typeof data.icon === 'string' ? data.icon : undefined,
      createdAt: createdAt,
      updatedAt: updatedAt,
    } as Item;
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);

    if (!folder) {
      await this.app.vault.createFolder(normalizedPath);
    }
  }

  private sanitizeFileName(name: string): string {
    // Remove invalid characters for file names
    return name.replace(/[\\/:*?"<>|]/g, '-').trim();
  }

  async getHierarchicalTree(folderIcons?: Record<string, string>): Promise<TreeNode[]> {
    const items = await this.getAllItems();
    const tree: Record<string, TreeNode> = {};

    // Helper to get or create a folder node
    const getOrCreateFolder = (path: string): TreeNode => {
      if (tree[path]) return tree[path];

      const parts = path.split('/');
      const name = parts.pop() || '';
      const parentPath = parts.join('/');

      const node: TreeNode = {
        name,
        path,
        type: 'folder',
        children: [],
        icon: folderIcons?.[path],
        itemCount: 0,
      };
      tree[path] = node;

      if (parentPath) {
        const parentNode = getOrCreateFolder(parentPath);
        if (parentNode.children) {
          parentNode.children.push(node);
        }
      }
      return node;
    };

    // 1. Add all folders from the vault
    const allAbstractFiles = this.app.vault.getAllLoadedFiles();
    for (const abstractFile of allAbstractFiles) {
      if (abstractFile instanceof TFolder) {
        getOrCreateFolder(abstractFile.path);
      }
    }

    // 2. Add all items
    for (const { item, path } of items) {
      const folderPath = item.folder;
      const folderNode = getOrCreateFolder(folderPath);

      const itemNode: TreeNode = {
        name: item.title,
        path: path,
        type: 'item',
        item: item,
        icon: item.icon,
      };

      if (folderNode.children) {
        folderNode.children.push(itemNode);
      }
    }

    // 3. Calculate item counts for folders recursively
    const calculateItemCount = (node: TreeNode): number => {
      if (node.type === 'item') return 1;
      let count = 0;
      if (node.children) {
        for (const child of node.children) {
          count += calculateItemCount(child);
        }
      }
      node.itemCount = count;
      return count;
    };

    // 4. Filter for root nodes (nodes without a parent in the tree)
    const rootNodes = Object.values(tree).filter(node => {
      const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
      return !parentPath || !tree[parentPath];
    });

    // 5. Sort children (folders first, then items)
    const sortTree = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'item') return -1;
        if (a.type === 'item' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children) {
          sortTree(node.children);
        }
      });
    };

    sortTree(rootNodes);

    // Calculate item counts for all nodes
    rootNodes.forEach(node => calculateItemCount(node));

    return rootNodes;
  }

  // Keep getFolderTree for backward compatibility in ItemModal
  async getFolderTree(): Promise<string[]> {
    const folders = new Set<string>();
    const allAbstractFiles = this.app.vault.getAllLoadedFiles();

    for (const abstractFile of allAbstractFiles) {
      if (abstractFile instanceof TFolder) {
        folders.add(abstractFile.path);
      }
    }

    // Also include folders from item paths in case they are not empty folders
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const folderPath = file.path.substring(0, file.path.lastIndexOf('/'));
      if (folderPath) {
        folders.add(folderPath);
      }
    }

    return Array.from(folders).sort();
  }

  async fetchLinkMetadata(url: string): Promise<{ title: string; description: string; banner: string }> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Obsidian Item Manager Plugin',
        },
        timeout: 5000,
      });
      const $ = cheerio.load(response.data);

      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const banner = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';

      return {
        title: title.trim(),
        description: description.trim(),
        banner: banner.trim(),
      };
    } catch (error) {
      console.error('Error fetching link metadata:', error);
      return { title: '', description: '', banner: '' };
    }
  }

  async getAllTags(): Promise<string[]> {
    const items = await this.getAllItems();
    const tags = new Set<string>();

    for (const { item } of items) {
      for (const tag of item.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort();
  }
  async getItemByPath(path: string): Promise<{ item: Item; path: string } | null> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      return null;
    }

    try {
      const content = await this.app.vault.read(file);
      const item = this.parseMarkdownContent(content, file.path);
      if (item) {
        return { item, path: file.path };
      }
    } catch (error) {
      console.error(`Error reading file ${file.path}:`, error);
    }
    return null;
  }
}
