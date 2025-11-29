import { App, Modal, Notice } from 'obsidian';
import { Item } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { FileManager } from '../utils/fileManager';
import { IconPickerModal } from './IconPickerModal';

export class ItemModal extends Modal {
  private item: Item | null;
  private onSubmit: (item: Item) => void;
  private fileManager: FileManager;
  private predefinedTags: string[];
  private defaultFolder: string;
  private selectedIcon: string | null = null;

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
    this.selectedIcon = item?.icon ?? null;
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

    const fetchMetadata = async (url: string) => {
      if (!url || !url.startsWith('http')) return;

      new Notice('Fetching link metadata...');
      const metadata = await this.fileManager.fetchLinkMetadata(url);

      if (metadata.title && !titleInput.value) {
        titleInput.value = metadata.title;
      }
      if (metadata.description && !descInput.value) {
        descInput.value = metadata.description;
      }
      if (metadata.banner && !bannerInput.value) {
        bannerInput.value = metadata.banner;
      }
      new Notice('Metadata fetched!');
    };

    linkInput.addEventListener('change', (e) => {
      fetchMetadata((e.target as HTMLInputElement).value);
    });

    // Banner input (hidden unless a banner is present or link is being edited)
    const bannerContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    bannerContainer.createEl('label', { text: 'Banner URL (Optional)' });
    const bannerInput = bannerContainer.createEl('input', {
      type: 'url',
      placeholder: 'Enter banner image URL',
      value: this.item?.banner || '',
    });
    bannerInput.addClass('item-modal-input');
    bannerContainer.style.display = this.item?.banner || this.item?.link ? 'flex' : 'none';

    // Show banner input if link is entered
    linkInput.addEventListener('input', () => {
      if (linkInput.value.length > 0) {
        bannerContainer.style.display = 'flex';
      } else if (!this.item?.banner) {
        bannerContainer.style.display = 'none';
      }
    });

    // Description input
    const descContainer = contentEl.createDiv({ cls: 'item-modal-field' });
    descContainer.createEl('label', { text: 'Description' });
    const descInput = descContainer.createEl('textarea', {
      placeholder: 'Enter description',
      value: this.item?.description || '',
    });
    descInput.addClass('item-modal-textarea');

    // Icon picker
    const iconContainer = contentEl.createDiv({ cls: 'item-modal-field item-modal-icon-field' });
    iconContainer.createEl('label', { text: 'Icon (optional)' });
    const iconPreview = iconContainer.createDiv({ cls: 'item-modal-icon-preview' });

    const refreshIconPreview = () => {
      iconPreview.empty();
      if (!this.selectedIcon) {
        iconPreview.createSpan({ text: 'No icon selected' });
        return;
      }
      const resourcePath = this.app.vault.adapter.getResourcePath(this.selectedIcon);
      const previewWrapper = iconPreview.createDiv({ cls: 'item-modal-icon-preview-inner' });
      const svgObject = previewWrapper.createEl('object', {
        cls: 'item-modal-icon-svg',
        attr: { data: resourcePath, type: 'image/svg+xml' },
      });
      svgObject.addEventListener('error', () => {
        svgObject.replaceWith(previewWrapper.createSpan({ text: '🖼️' }));
      });
      previewWrapper.createSpan({ cls: 'item-modal-icon-label', text: this.selectedIcon.split('/').pop() || '' });
    };

    const iconActions = iconContainer.createDiv({ cls: 'item-modal-icon-actions' });
    const pickIconButton = iconActions.createEl('button', {
      text: this.selectedIcon ? 'Change icon' : 'Select icon',
      cls: 'item-modal-icon-btn',
    });
    pickIconButton.addEventListener('click', e => {
      e.preventDefault();
      new IconPickerModal(this.app, this.selectedIcon, iconPath => {
        this.selectedIcon = iconPath;
        refreshIconPreview();
        pickIconButton.setText(this.selectedIcon ? 'Change icon' : 'Select icon');
      }).open();
    });

    const clearIconButton = iconActions.createEl('button', {
      text: 'Clear',
      cls: 'item-modal-icon-btn mod-muted',
    });
    clearIconButton.addEventListener('click', e => {
      e.preventDefault();
      this.selectedIcon = null;
      refreshIconPreview();
      pickIconButton.setText('Select icon');
    });

    refreshIconPreview();

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
      const banner = bannerInput.value.trim();
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
      // Simple logic to derive collectionTitle from folder path for new items
      const collectionTitle = folder.split('/').pop() || folder;
      const collectionPath = folder;
      const collectionParentId = folder.includes('/') ? uuidv4() : undefined; // Simple placeholder logic

      const item: Item = {
        id: this.item?.id || uuidv4(),
        title,
        link,
        description,
        tags,
        folder,
        collectionId: this.item?.collectionId || uuidv4(),
        collectionTitle: this.item?.collectionTitle || collectionTitle,
        collectionPath: this.item?.collectionPath || collectionPath,
        collectionParentId: this.item?.collectionParentId || collectionParentId,
        banner: banner || undefined,
        type: this.item?.type || 'link', // Default to 'link'
        icon: this.selectedIcon || undefined,
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
