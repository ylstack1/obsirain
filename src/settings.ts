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
      .setDesc('Icon for the Analytics tab')
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
      .setDesc('Icon for the Collections tab')
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
      .setDesc('Icon for the All Items tab')
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
      .setDesc('Icon for the Search tab')
      .addText(text =>
        text
          .setPlaceholder('🔍')
          .setValue(this.plugin.settings.tabIcons.search)
          .onChange(async value => {
            this.plugin.settings.tabIcons.search = value || '🔍';
            await this.plugin.saveSettings();
          })
      );
  }
}
