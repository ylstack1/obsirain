import { Notice, Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, Item } from './types';
import { ItemManagerSettingTab } from './settings';
import { FileManager } from './utils/fileManager';
import { ItemModal } from './modals/ItemModal';
import { ItemView, VIEW_TYPE_ITEM_MANAGER } from './views/ItemView';
import { registerCommands } from './commands';

export default class ItemManagerPlugin extends Plugin {
  settings!: PluginSettings;
  fileManager!: FileManager;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.fileManager = new FileManager(this.app);

    // Register views
    this.registerView(
      VIEW_TYPE_ITEM_MANAGER,
      leaf => new ItemView(leaf, this)
    );

    // Register commands
    registerCommands(this);

    // Add ribbon icon
    this.addRibbonIcon('layout-dashboard', 'Item Manager', () => {
      this.activateView();
    });

    // Add settings tab
    this.addSettingTab(new ItemManagerSettingTab(this.app, this));

    // Initialize default folder
    await this.initializeDefaultFolder();
  }

  async onunload(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_ITEM_MANAGER);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_ITEM_MANAGER);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_ITEM_MANAGER,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async openItemFile(path: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      new Notice('Unable to locate the selected item');
      return;
    }

    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
  }

  async refreshView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_ITEM_MANAGER);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof ItemView) {
        await view.render();
      }
    }
  }

  openAddModal(): void {
    new ItemModal(
      this.app,
      this.fileManager,
      this.settings.predefinedTags,
      this.settings.defaultFolder,
      null,
      async (item: Item) => {
        try {
          await this.fileManager.createItem(item);
          new Notice('Item created successfully');
          await this.refreshView();
        } catch (error) {
          new Notice(`Error creating item: ${error}`);
          console.error('Error creating item:', error);
        }
      }
    ).open();
  }

  openEditModal(item: Item, path: string): void {
    new ItemModal(
      this.app,
      this.fileManager,
      this.settings.predefinedTags,
      this.settings.defaultFolder,
      item,
      async (updatedItem: Item) => {
        try {
          await this.fileManager.updateItem(path, updatedItem);
          new Notice('Item updated successfully');
          await this.refreshView();
        } catch (error) {
          new Notice(`Error updating item: ${error}`);
          console.error('Error updating item:', error);
        }
      }
    ).open();
  }

  async deleteItem(item: Item, path: string): Promise<void> {
    const confirmed = await this.confirmDelete(item.title);
    if (!confirmed) return;

    try {
      await this.fileManager.deleteItem(path);
      new Notice('Item deleted successfully');
      await this.refreshView();
    } catch (error) {
      new Notice(`Error deleting item: ${error}`);
      console.error('Error deleting item:', error);
    }
  }

  private async confirmDelete(itemTitle: string): Promise<boolean> {
    return new Promise(resolve => {
      const modal = new (class extends ItemModal {
        onOpen() {
          const { contentEl } = this;
          contentEl.empty();

          contentEl.createEl('h2', { text: 'Confirm Delete' });
          contentEl.createEl('p', {
            text: `Are you sure you want to delete "${itemTitle}"?`,
          });

          const buttonContainer = contentEl.createDiv({
            cls: 'item-modal-buttons',
          });

          const confirmButton = buttonContainer.createEl('button', {
            text: 'Delete',
            cls: 'mod-warning',
          });
          confirmButton.addEventListener('click', () => {
            resolve(true);
            this.close();
          });

          const cancelButton = buttonContainer.createEl('button', {
            text: 'Cancel',
          });
          cancelButton.addEventListener('click', () => {
            resolve(false);
            this.close();
          });
        }
      })(this.app, this.fileManager, [], '', null, () => {});

      modal.open();
    });
  }

  private async initializeDefaultFolder(): Promise<void> {
    try {
      const folder = this.app.vault.getAbstractFileByPath(
        this.settings.defaultFolder
      );
      if (!folder) {
        await this.app.vault.createFolder(this.settings.defaultFolder);
      }
    } catch (error) {
      console.error('Error initializing default folder:', error);
    }
  }
}
