import React, { useState } from 'react';
import { Item } from '../types';
import { Card } from './Card';
import { Search } from './Search';
import { TagFilter } from './TagFilter';
import { FolderTree } from './FolderTree';

interface FileViewProps {
  items: Array<{ item: Item; path: string }>;
  tree: any[];
  allTags: string[];
  onAdd: () => void;
  onEdit: (item: Item, path: string) => void;
  onDelete: (item: Item, path: string) => void;
  onRefresh: () => void;
  onVisit: (path: string) => void;
  resolveIcon?: (iconPath: string) => string | undefined;
  openIconPicker?: (currentIcon: string | null, onSelect: (icon: string | null) => void) => void;
  onFolderIconChange?: (folderPath: string, iconPath: string | null) => void;
  tabIcons: {
    analytics: string;
    collections: string;
    items: string;
    search: string;
  };
}

type ViewType = 'analytics' | 'collections' | 'items' | 'search';

export const FileView: React.FC<FileViewProps> = ({
  items,
  tree,
  allTags,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onVisit,
  resolveIcon,
  openIconPicker,
  onFolderIconChange,
  tabIcons,
}) => {
  const [activeView, setActiveView] = useState<ViewType>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Filter items based on current filters
  const filteredItems = items.filter(({ item }) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    if (selectedTags.length > 0) {
      const hasSelectedTag = selectedTags.some(tag => item.tags.includes(tag));
      if (!hasSelectedTag) return false;
    }

    if (selectedFolder) {
      if (!item.folder.startsWith(selectedFolder)) return false;
    }

    return true;
  });

  const handleOpenItem = (item: Item, path: string) => {
    // Open item in native Obsidian tab
    onVisit(path);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const handleFolderSelect = (folder: string | null) => {
    setSelectedFolder(folder);
  };

  const handleFolderIconRequest = (node: any) => {
    if (!openIconPicker || !onFolderIconChange) return;
    openIconPicker(node.icon ?? null, iconPath => {
      onFolderIconChange(node.path, iconPath);
    });
  };

  // Calculate stats
  const recentItems = items
    .filter(({ item }) => {
      const updatedDate = new Date(item.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedDate >= weekAgo;
    })
    .sort((a, b) => 
      new Date(b.item.updatedAt).getTime() - new Date(a.item.updatedAt).getTime()
    )
    .slice(0, 5);

  const renderAnalytics = () => (
    <div className="file-view-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">{tabIcons.analytics}</div>
          <div className="stat-value">{tree.length}</div>
          <div className="stat-label">Collections</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">{tabIcons.items}</div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-value">{allTags.length}</div>
          <div className="stat-label">Tags</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{recentItems.length}</div>
          <div className="stat-label">Recent</div>
        </div>
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="file-view-section">
      <h3>Collections</h3>
      <FolderTree
        tree={tree}
        selectedFolder={selectedFolder}
        onFolderSelect={(folder) => {
          handleFolderSelect(folder);
        }}
        onItemSelect={(path) => {
          const itemData = items.find(i => i.path === path);
          if (itemData) {
            handleOpenItem(itemData.item, itemData.path);
          }
        }}
        resolveIcon={resolveIcon}
        onFolderIconRequest={handleFolderIconRequest}
      />
    </div>
  );

  const renderItems = () => (
    <div className="file-view-section">
      <div className="items-header">
        <div className="items-info">
          Showing {filteredItems.length} of {items.length} items
        </div>
        {selectedFolder && (
          <button
            className="clear-filter-btn"
            onClick={() => handleFolderSelect(null)}
          >
            Clear folder filter
          </button>
        )}
      </div>
      
      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Adjust your filters or create some new items</p>
          </div>
        ) : (
          filteredItems.map(({ item, path }) => (
            <Card
              key={item.id}
              item={item}
              onEdit={item => onEdit(item, path)}
              onDelete={item => onDelete(item, path)}
              onView={handleOpenItem}
              path={path}
              resolveIcon={resolveIcon}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="file-view-section">
      <div className="search-controls">
        <div className="search-input-wrapper">
          <Search value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="tag-filter-wrapper">
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearTags}
          />
        </div>
      </div>

      {selectedFolder && (
        <div className="active-filter">
          Filtered by: {selectedFolder}
          <button onClick={() => handleFolderSelect(null)}>×</button>
        </div>
      )}

      <div className="search-results">
        <div className="results-info">
          Found {filteredItems.length} items
        </div>
        
        <div className="results-grid">
          {filteredItems.map(({ item, path }) => (
            <Card
              key={item.id}
              item={item}
              onEdit={item => onEdit(item, path)}
              onDelete={item => onDelete(item, path)}
              onView={handleOpenItem}
              path={path}
              resolveIcon={resolveIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="file-view">
      {/* Header */}
      <header className="file-view-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="file-view-title">Item Manager</h1>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={onRefresh}>
              🔄 Refresh
            </button>
            <button className="add-btn" onClick={onAdd}>
              ➕ Add Item
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="file-view-tabs">
        <button
          className={`file-view-tab ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          <span className="tab-icon">{tabIcons.analytics}</span>
          <span className="tab-label">Analytics</span>
        </button>
        <button
          className={`file-view-tab ${activeView === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveView('collections')}
        >
          <span className="tab-icon">{tabIcons.collections}</span>
          <span className="tab-label">Collections</span>
        </button>
        <button
          className={`file-view-tab ${activeView === 'items' ? 'active' : ''}`}
          onClick={() => setActiveView('items')}
        >
          <span className="tab-icon">{tabIcons.items}</span>
          <span className="tab-label">All Items</span>
        </button>
        <button
          className={`file-view-tab ${activeView === 'search' ? 'active' : ''}`}
          onClick={() => setActiveView('search')}
        >
          <span className="tab-icon">{tabIcons.search}</span>
          <span className="tab-label">Search</span>
        </button>
      </div>

      {/* Content */}
      <div className="file-view-content">
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'collections' && renderCollections()}
        {activeView === 'items' && renderItems()}
        {activeView === 'search' && renderSearch()}
      </div>
    </div>
  );
};