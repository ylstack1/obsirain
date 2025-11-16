import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { Item } from '../types';

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
	    const frontmatter = [
	      '---',
	      `id: ${item.id}`,
	      `title: ${item.title}`,
	      `link: ${item.link}`,
	      `tags: [${item.tags.map(tag => `"${tag}"`).join(', ')}]`,
	      `collectionPath: ${item.folder}`,
	      `created: ${item.createdAt}`,
	      `lastupdate: ${item.updatedAt}`,
	      '---',
	      '',
	      `# ${item.title}`,
	      '',
	      `## Description`,
	      item.description,
	      '',
	      `---`,
	      `## Details`,
	      `- **Link**: [Source](${item.link})`,
	      `- **Collection**: ${item.folder}`,
	      `- **Tags**: ${item.tags.join(', ')}`,
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

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

	      const key = line.substring(0, colonIndex).trim();
	      let value = line.substring(colonIndex + 1).trim();
	
	      if (key === 'tags') {
        // Parse tags array
        const tagsMatch = value.match(/\[(.*?)\]/);
        if (tagsMatch) {
          data[key] = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
            .filter(tag => tag.length > 0);
        } else {
          data[key] = [];
        }
      } else {
        data[key] = value;
      }
    }

	    // Validate required fields
	    if (!data.id || !data.title) {
	      return null;
	    }
	
	    // Handle new/renamed frontmatter keys
	    const folder = (typeof data.collectionPath === 'string' ? data.collectionPath : typeof data.folder === 'string' ? data.folder : filePath.substring(0, filePath.lastIndexOf('/')));
	    const createdAt = typeof data.created === 'string' ? data.created : typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString();
	    const updatedAt = typeof data.lastupdate === 'string' ? data.lastupdate : typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString();
	
	    return {
	      id: typeof data.id === 'string' ? data.id : '',
	      title: typeof data.title === 'string' ? data.title : '',
	      description: typeof data.description === 'string' ? data.description : '',
	      link: typeof data.link === 'string' ? data.link : '',
	      tags: Array.isArray(data.tags) ? data.tags : [],
	      folder: folder,
	      createdAt: createdAt,
	      updatedAt: updatedAt,
	    };
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
}
