import { ItemView as ObsidianItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { FileView } from '../components/FileView';
import type ItemManagerPlugin from '../main';

export const VIEW_TYPE_ITEM_MANAGER = 'item-manager-view';

export class ItemView extends ObsidianItemView {
  plugin: ItemManagerPlugin;
  root: Root | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: ItemManagerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_ITEM_MANAGER;
  }

  getDisplayText(): string {
    return 'Item Manager';
  }

  getIcon(): string {
    return 'layout-dashboard';
  }

  async onOpen(): Promise<void> {
    // Initialize root if not already done
    if (!this.root) {
      const container = this.containerEl.children[1];
      container.empty();
      container.addClass('item-manager-view');

      this.root = createRoot(container);
    }

    await this.render();
  }

  async onClose(): Promise<void> {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  async render(): Promise<void> {
    if (!this.root) return;

    const items = await this.plugin.fileManager.getAllItems();
    const tree = await this.plugin.fileManager.getHierarchicalTree(this.plugin.settings.folderIcons);
    const allTags = await this.plugin.fileManager.getAllTags();

    this.root.render(
      <FileView
        items={items}
        tree={tree}
        allTags={allTags}
        onAdd={() => this.plugin.openAddModal()}
        onEdit={(item, path) => this.plugin.openEditModal(item, path)}
        onDelete={(item, path) => this.plugin.deleteItem(item, path)}
        onRefresh={() => this.render()}
        onVisit={(path: string) => this.plugin.openItemFile(path)}
        resolveIcon={(iconPath: string) => this.plugin.resolveIconPath(iconPath)}
        openIconPicker={(currentIcon, onSelect) => this.plugin.openIconPicker(currentIcon, onSelect)}
        onFolderIconChange={(folderPath, iconPath) => this.plugin.setFolderIcon(folderPath, iconPath)}
        tabIcons={this.plugin.settings.tabIcons}
      />
    );
  }
}