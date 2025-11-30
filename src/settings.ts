import { App, PluginSettingTab, Setting } from 'obsidian';
import type ItemManagerPlugin from './main';

export class ItemManagerSettingTab extends PluginSettingTab {
  plugin: ItemManagerPlugin;

  constructor(app: App, plugin: ItemManagerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Item Manager Settings' });

    new Setting(containerEl)
      .setName('Default folder')
      .setDesc('Default folder for new items')
      .addText(text =>
        text
          .setPlaceholder('Items')
          .setValue(this.plugin.settings.defaultFolder)
          .onChange(async value => {
            this.plugin.settings.defaultFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Predefined tags')
      .setDesc('Comma-separated list of predefined tags')
      .addText(text =>
        text
          .setPlaceholder('important, todo, reference')
          .setValue(this.plugin.settings.predefinedTags.join(', '))
          .onChange(async value => {
            this.plugin.settings.predefinedTags = value
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable auto-save')
      .setDesc('Automatically save changes when editing items')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableAutoSave)
          .onChange(async value => {
            this.plugin.settings.enableAutoSave = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h3', { text: 'Tab Icons' });

    new Setting(containerEl)
      .setName('Analytics tab icon')
      .setDesc('Icon for Analytics tab')
      .addText(text =>
        text
          .setPlaceholder('📊')
          .setValue(this.plugin.settings.tabIcons.analytics)
          .onChange(async value => {
            this.plugin.settings.tabIcons.analytics = value || '📊';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Collections tab icon')
      .setDesc('Icon for Collections tab')
      .addText(text =>
        text
          .setPlaceholder('📁')
          .setValue(this.plugin.settings.tabIcons.collections)
          .onChange(async value => {
            this.plugin.settings.tabIcons.collections = value || '📁';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Items tab icon')
      .setDesc('Icon for All Items tab')
      .addText(text =>
        text
          .setPlaceholder('🔗')
          .setValue(this.plugin.settings.tabIcons.items)
          .onChange(async value => {
            this.plugin.settings.tabIcons.items = value || '🔗';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Search tab icon')
      .setDesc('Icon for Search tab')
      .addText(text =>
        text
          .setPlaceholder('🔍')
          .setValue(this.plugin.settings.tabIcons.search)
          .onChange(async value => {
            this.plugin.settings.tabIcons.search = value || '🔍';
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h3', { text: 'Folder Icons' });

    new Setting(containerEl)
      .setName('Folder icon input')
      .setDesc('Enter emoji or SVG path for folder icons (e.g., 📁 or icons/folder.svg)')
      .addText(text =>
        text
          .setPlaceholder('📁')
          .setValue(this.plugin.settings.defaultFolderIcon || '📁')
          .onChange(async value => {
            this.plugin.settings.defaultFolderIcon = value || '📁';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Custom folder icons')
      .setDesc('Manage custom folder icons. Click folders below to set individual icons.')
      .addText(text =>
        text
          .setPlaceholder('Click folders to manage icons')
          .setDisabled(true)
      );

    // Add folder icon management buttons
    const folderIconSection = containerEl.createDiv();
    folderIconSection.createEl('h4', { text: 'Quick Folder Icon Setup' });

    const iconPresets = [
      { name: 'Default', icon: '📁' },
      { name: 'Documents', icon: '📄' },
      { name: 'Projects', icon: '📂' },
      { name: 'Links', icon: '🔗' },
      { name: 'Media', icon: '🎬' },
      { name: 'Archive', icon: '📦' },
    ];

    iconPresets.forEach(preset => {
      const btn = folderIconSection.createEl('button');
      btn.textContent = `${preset.icon} ${preset.name}`;
      btn.style.margin = '4px 8px';
      btn.style.padding = '6px 12px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid var(--background-modifier-border)';
      btn.style.background = 'var(--background-secondary)';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        this.plugin.settings.defaultFolderIcon = preset.icon;
        this.plugin.saveSettings();
        // Update the input field
        const input = folderIconSection.querySelector('input');
        if (input) {
          input.value = preset.icon;
        }
      });
      folderIconSection.appendChild(btn);
    });
  }
}