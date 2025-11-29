import { App, Modal, TFile, TFolder } from 'obsidian';

interface IconEntry {
  path: string;
  name: string;
  group: string;
}

interface IconGroup {
  name: string;
  icons: IconEntry[];
}

export class IconPickerModal extends Modal {
  private onSelect: (iconPath: string | null) => void;
  private currentIcon?: string | null;
  private groups: IconGroup[] = [];
  private filteredGroups: IconGroup[] = [];
  private selectedIcon: string | null = null;
  private groupsContainer!: HTMLElement;
  private previewIconEl!: HTMLElement;
  private previewNameEl!: HTMLElement;
  private searchInput!: HTMLInputElement;
  private emptyStateEl!: HTMLElement;
  private expandedGroups: Set<string> = new Set();

  constructor(app: App, currentIcon: string | null, onSelect: (iconPath: string | null) => void) {
    super(app);
    this.onSelect = onSelect;
    this.currentIcon = currentIcon;
    this.selectedIcon = currentIcon ?? null;
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass('icon-picker-modal');

    const header = contentEl.createDiv('icon-picker-header');
    header.createEl('h2', { text: 'Choose icon' });
    const closeButton = header.createEl('button', { cls: 'icon-picker-close', text: '✕' });
    closeButton.addEventListener('click', () => this.close());

    const searchContainer = contentEl.createDiv('icon-picker-search');
    this.searchInput = searchContainer.createEl('input', {
      type: 'search',
      placeholder: 'Search icons...',
    });
    this.searchInput.addEventListener('input', () => this.handleSearch());

    const body = contentEl.createDiv('icon-picker-body');
    this.groupsContainer = body.createDiv('icon-picker-groups');

    this.emptyStateEl = body.createDiv('icon-picker-empty');
    this.emptyStateEl.hide();

    const previewPanel = contentEl.createDiv('icon-picker-preview');
    this.previewIconEl = previewPanel.createDiv('icon-picker-preview-icon');
    this.previewNameEl = previewPanel.createDiv('icon-picker-preview-name');

    const footer = contentEl.createDiv('icon-picker-footer');
    const clearButton = footer.createEl('button', { cls: 'icon-picker-btn', text: 'Clear icon' });
    clearButton.addEventListener('click', () => {
      this.selectedIcon = null;
      this.updatePreview();
    });

    const cancelButton = footer.createEl('button', { cls: 'icon-picker-btn', text: 'Cancel' });
    cancelButton.addEventListener('click', () => this.close());

    const confirmButton = footer.createEl('button', {
      cls: 'icon-picker-btn mod-cta',
      text: 'Use icon',
    });
    confirmButton.addEventListener('click', () => {
      this.onSelect(this.selectedIcon);
      this.close();
    });

    await this.loadIcons();
    this.handleSearch();
    this.updatePreview();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async loadIcons(): Promise<void> {
    const iconsPath = '.obsidian/icons';
    const abstract = this.app.vault.getAbstractFileByPath(iconsPath);
    this.groups = [];

    if (!abstract || !(abstract instanceof TFolder)) {
      return;
    }

    const groupMap = new Map<string, IconEntry[]>();

    const walkFolder = (folder: TFolder, relativePath: string) => {
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          const nextRelative = relativePath ? `${relativePath}/${child.name}` : child.name;
          walkFolder(child, nextRelative);
        } else if (child instanceof TFile && child.extension === 'svg') {
          const entry: IconEntry = {
            path: child.path,
            name: child.name.replace(/\.svg$/i, ''),
            group: relativePath || 'General',
          };
          if (!groupMap.has(entry.group)) {
            groupMap.set(entry.group, []);
          }
          groupMap.get(entry.group)!.push(entry);
        }
      }
    };

    walkFolder(abstract, '');

    this.groups = Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, icons]) => ({
        name,
        icons: icons.sort((a, b) => a.name.localeCompare(b.name)),
      }));

    this.groups.forEach(group => this.expandedGroups.add(group.name));
  }

  private handleSearch(): void {
    const query = this.searchInput.value.toLowerCase().trim();
    if (!query) {
      this.filteredGroups = this.groups;
    } else {
      this.filteredGroups = this.groups
        .map(group => ({
          name: group.name,
          icons: group.icons.filter(icon => icon.name.toLowerCase().includes(query)),
        }))
        .filter(group => group.icons.length > 0);
    }

    this.renderGroups();
  }

  private renderGroups(): void {
    this.groupsContainer.empty();

    if (this.filteredGroups.length === 0) {
      this.emptyStateEl.setText('No icons found. Place SVGs in .obsidian/icons');
      this.emptyStateEl.show();
      return;
    }
    this.emptyStateEl.hide();

    for (const group of this.filteredGroups) {
      const groupEl = this.groupsContainer.createDiv('icon-picker-group');
      const header = groupEl.createEl('button', {
        cls: 'icon-picker-group-header',
      });
      header.createSpan({ text: group.name });
      const toggle = header.createSpan({ cls: 'icon-picker-group-toggle' });
      toggle.setText(this.expandedGroups.has(group.name) ? '▼' : '►');
      header.addEventListener('click', () => {
        if (this.expandedGroups.has(group.name)) {
          this.expandedGroups.delete(group.name);
        } else {
          this.expandedGroups.add(group.name);
        }
        this.renderGroups();
      });

      if (!this.expandedGroups.has(group.name)) {
        continue;
      }

      const iconList = groupEl.createDiv('icon-picker-icon-list');
      for (const icon of group.icons) {
        const button = iconList.createEl('button', {
          cls: 'icon-picker-icon',
        });
        if (this.selectedIcon === icon.path) {
          button.addClass('is-selected');
        }

        const image = button.createEl('object', {
          cls: 'icon-picker-icon-preview',
          attr: {
            data: this.app.vault.adapter.getResourcePath(icon.path),
            type: 'image/svg+xml',
          },
        });
        image.addEventListener('error', () => {
          image.replaceWith(button.createSpan({ text: '🖼️' }));
        });

        button.createSpan({ cls: 'icon-picker-icon-label', text: icon.name });
        button.addEventListener('click', () => {
          this.selectedIcon = icon.path;
          this.updatePreview();
          this.renderGroups();
        });
      }
    }
  }

  private updatePreview(): void {
    this.previewIconEl.empty();
    this.previewNameEl.empty();

    if (!this.selectedIcon) {
      this.previewIconEl.createSpan({ text: 'No icon selected' });
      return;
    }

    const resource = this.app.vault.adapter.getResourcePath(this.selectedIcon);
    const preview = this.previewIconEl.createEl('object', {
      cls: 'icon-picker-preview-svg',
      attr: { data: resource, type: 'image/svg+xml' },
    });
    preview.addEventListener('error', () => {
      preview.replaceWith(this.previewIconEl.createSpan({ text: '🖼️' }));
    });

    const iconName = this.selectedIcon.split('/').pop() || this.selectedIcon;
    this.previewNameEl.setText(iconName.replace(/\.svg$/i, ''));
  }
}
