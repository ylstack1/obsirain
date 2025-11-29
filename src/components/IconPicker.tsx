import React, { useState, useEffect } from 'react';
import { App, TFile, TFolder } from 'obsidian';

interface IconPickerProps {
  app: App;
  currentIcon?: string;
  onSelect: (iconPath: string) => void;
  onClose: () => void;
}

interface IconGroup {
  folder: string;
  icons: string[];
}

export const IconPicker: React.FC<IconPickerProps> = ({
  app,
  currentIcon,
  onSelect,
  onClose,
}) => {
  const [iconGroups, setIconGroups] = useState<IconGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(currentIcon);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIcons();
  }, []);

  const loadIcons = async () => {
    setLoading(true);
    const iconsPath = '.obsidian/icons';
    const iconsFolder = app.vault.getAbstractFileByPath(iconsPath);

    if (!iconsFolder || !(iconsFolder instanceof TFolder)) {
      setIconGroups([]);
      setLoading(false);
      return;
    }

    const groups: Record<string, string[]> = {};

    const processFolder = (folder: TFolder, relativePath: string = '') => {
      for (const child of folder.children) {
        if (child instanceof TFile && child.extension === 'svg') {
          const groupName = relativePath || 'root';
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(child.path);
        } else if (child instanceof TFolder) {
          const newRelativePath = relativePath 
            ? `${relativePath}/${child.name}` 
            : child.name;
          processFolder(child, newRelativePath);
        }
      }
    };

    processFolder(iconsFolder);

    const groupsArray = Object.entries(groups).map(([folder, icons]) => ({
      folder,
      icons: icons.sort(),
    }));

    setIconGroups(groupsArray);
    
    // Expand all folders initially
    setExpandedFolders(new Set(groupsArray.map(g => g.folder)));
    setLoading(false);
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const getIconName = (path: string) => {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.svg', '');
  };

  const handleIconSelect = (iconPath: string) => {
    setSelectedIcon(iconPath);
  };

  const handleConfirm = () => {
    if (selectedIcon) {
      onSelect(selectedIcon);
    }
    onClose();
  };

  const filteredGroups = searchQuery
    ? iconGroups.map(group => ({
        ...group,
        icons: group.icons.filter(icon =>
          getIconName(icon).toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(group => group.icons.length > 0)
    : iconGroups;

  return (
    <div className="icon-picker-modal" onClick={onClose}>
      <div className="icon-picker-panel" onClick={e => e.stopPropagation()}>
        <div className="icon-picker-header">
          <h3>Select Icon</h3>
          <button className="icon-picker-close" onClick={onClose}>✕</button>
        </div>

        <div className="icon-picker-search">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="icon-picker-search-input"
          />
        </div>

        <div className="icon-picker-content">
          {loading ? (
            <div className="icon-picker-loading">Loading icons...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="icon-picker-empty">
              <p>No icons found in .obsidian/icons folder</p>
              <p className="icon-picker-hint">
                Add .svg files to .obsidian/icons folder to use custom icons
              </p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.folder} className="icon-picker-group">
                <button
                  className="icon-picker-group-header"
                  onClick={() => toggleFolder(group.folder)}
                >
                  <span className="icon-picker-group-toggle">
                    {expandedFolders.has(group.folder) ? '▼' : '►'}
                  </span>
                  <span className="icon-picker-group-name">
                    {group.folder} ({group.icons.length})
                  </span>
                </button>
                {expandedFolders.has(group.folder) && (
                  <div className="icon-picker-icons">
                    {group.icons.map(iconPath => (
                      <button
                        key={iconPath}
                        className={`icon-picker-icon ${selectedIcon === iconPath ? 'selected' : ''}`}
                        onClick={() => handleIconSelect(iconPath)}
                        title={getIconName(iconPath)}
                      >
                        <img
                          src={app.vault.adapter.getResourcePath(iconPath)}
                          alt={getIconName(iconPath)}
                          className="icon-picker-icon-img"
                        />
                        <span className="icon-picker-icon-name">
                          {getIconName(iconPath)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="icon-picker-footer">
          <button className="icon-picker-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="icon-picker-btn mod-cta"
            onClick={handleConfirm}
            disabled={!selectedIcon}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};
