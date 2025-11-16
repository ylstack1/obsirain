import { App, Modal, Notice } from 'obsidian';
import { Item } from '../types';
import { FileManager } from '../utils/fileManager';

export class ItemModal extends Modal {
  private item: Item | null;
  private onSubmit: (item: Item) => void;
  private fileManager: FileManager;
  private predefinedTags: string[];
  private defaultFolder: string;

  constructor(
    app: App,
    fileManager: FileManager,
    predefinedTags: string[],
    defaultFolder: string,
    item: Item | null,
    onSubmit: (item: Item) => void
  ) {
    super(app);
    this.item = item;
    this.onSubmit = onSubmit;
    this.fileManager = fileManager;
    this.predefinedTags = predefinedTags;
    this.defaultFolder = defaultFolder;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: this.item ? 'Edit Item' : 'Add New Item' });

    // Title input
    const titleContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    titleContainer.createEl('label', { text: 'Title' });
    const titleInput = titleContainer.createEl('input', {
      type: 'text',
      placeholder: 'Enter title',
      value: this.item?.title || '',
    });
    titleInput.addClass('item-modal-input');

    // Link input
    const linkContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    linkContainer.createEl('label', { text: 'Link/URL' });
    const linkInput = linkContainer.createEl('input', {
      type: 'url',
      placeholder: 'Enter source URL (e.g., https://example.com)',
      value: this.item?.link || '',
    });
    linkInput.addClass('item-modal-input');

    // Description input
    const descContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    descContainer.createEl('label', { text: 'Description' });
    const descInput = descContainer.createEl('textarea', {
      placeholder: 'Enter description',
      value: this.item?.description || '',
    });
    descInput.addClass('item-modal-textarea');

    // Folder input (Dropdown)
    const folderContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    folderContainer.createEl('label', { text: 'Folder' });
    const folderSelect = folderContainer.createEl('select');
    folderSelect.addClass('item-modal-input');

    // Get all existing folders for the dropdown
    this.fileManager.getFolderTree().then(folders => {
      const currentFolder = this.item?.folder || this.defaultFolder;
      let folderFound = false;

      // Add all existing folders
      for (const folder of folders) {
        const option = folderSelect.createEl('option', { value: folder, text: folder });
        if (folder === currentFolder) {
          option.selected = true;
          folderFound = true;
        }
      }

      // If the current folder is new or not in the list, add it as the selected option
      if (!folderFound && currentFolder) {
        const option = folderSelect.createEl('option', { value: currentFolder, text: currentFolder });
        option.selected = true;
      }
    });

    // Tags input
    const tagsContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    tagsContainer.createEl('label', { text: 'Tags (comma-separated, e.g., tag1, tag2)' });
    const tagsInput = tagsContainer.createEl('input', {
      type: 'text',
      placeholder: 'Enter tags',
      value: this.item?.tags.join(', ') || '',
    });
    tagsInput.addClass('item-modal-input');

    // Predefined tags
    if (this.predefinedTags.length > 0) {
      const predefinedContainer = contentEl.createDiv({ cls: 'item-modal-predefined-tags' });
      predefinedContainer.createEl('label', { text: 'Quick tags:' });
      const tagsWrapper = predefinedContainer.createDiv({ cls: 'item-modal-tags-wrapper' });

      for (const tag of this.predefinedTags) {
        const tagButton = tagsWrapper.createEl('button', {
          text: tag,
          cls: 'item-modal-tag-button',
        });
        tagButton.addEventListener('click', e => {
          e.preventDefault();
          const currentTags = tagsInput.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
          if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            tagsInput.value = currentTags.join(', ');
          }
        });
      }
    }

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'item-modal-buttons' });

    const submitButton = buttonContainer.createEl('button', {
      text: this.item ? 'Update' : 'Create',
      cls: 'mod-cta',
    });

    submitButton.addEventListener('click', async e => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const link = linkInput.value.trim();
      const description = descInput.value.trim();
      const folder = folderSelect.value.trim(); // Use folderSelect value
      const tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !tag.includes(' ')); // Filter out empty tags and tags with spaces

      // If the folder is not in the list, we assume the user wants to create a new one.
      // We will rely on fileManager.ensureFolderExists to handle creation.

      if (!title) {
        new Notice('Title is required');
        return;
      }

      if (!folder) {
        new Notice('Folder is required');
        return;
      }

      // Check for tags with spaces, which are invalid in Obsidian
      if (tags.some(tag => tag.includes(' '))) {
        new Notice('Tags cannot contain spaces. Please use hyphens or underscores.');
        return;
      }

      const now = new Date().toISOString();
      const item: Item = {
        id: this.item?.id || `item-${Date.now()}`,
        title,
        link,
        description,
        tags,
        folder,
        createdAt: this.item?.createdAt || now,
        updatedAt: now,
      };

      try {
        this.onSubmit(item);
        this.close();
      } catch (error) {
        new Notice(`Error: ${error}`);
      }
    });

    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.addEventListener('click', () => {
      this.close();
    });

    // Focus on title input
    titleInput.focus();

    // Handle Enter key in title input
    titleInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitButton.click();
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
