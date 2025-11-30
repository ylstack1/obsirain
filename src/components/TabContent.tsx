import React from 'react';
import { Item, TreeNode } from '../types';
import { Card } from './Card';
import { Search } from './Search';
import { TagFilter } from './TagFilter';
import { FolderTree } from './FolderTree';

interface TabContentProps {
  tabId: string;
  items: Array<{ item: Item; path: string }>;
  tree: TreeNode[];
  allTags: string[];
  searchQuery: string;
  selectedTags: string[];
  selectedFolder: string | null;
  onEdit: (item: Item, path: string) => void;
  onDelete: (item: Item, path: string) => void;
  onVisit: (path: string) => void;
  onOpenDetail: (item: Item, path: string) => void;
  onSearchChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  onFolderSelect: (folder: string | null) => void;
  resolveIcon?: (iconPath: string) => string | undefined;
  onFolderIconRequest?: (node: TreeNode) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  tabId,
  items,
  tree,
  allTags,
  searchQuery,
  selectedTags,
  selectedFolder,
  onEdit,
  onDelete,
  onVisit,
  onOpenDetail,
  onSearchChange,
  onTagToggle,
  onClearTags,
  onFolderSelect,
  resolveIcon,
  onFolderIconRequest,
}) => {
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

  // Render different content based on tab type
  const renderContent = () => {
    switch (tabId) {
      case 'analytics':
        return (
          <div className="tab-content analytics-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-value">{tree.length}</div>
                <div className="stat-label">Collections</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-value">{items.length}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏷️</div>
                <div className="stat-value">{allTags.length}</div>
                <div className="stat-label">Tags</div>
              </div>
            </div>
          </div>
        );

      case 'collections':
        return (
          <div className="tab-content collections-content">
            <div className="folder-tree-container">
              <FolderTree
                tree={tree}
                selectedFolder={selectedFolder}
                onFolderSelect={onFolderSelect}
                onItemSelect={(path) => {
                  const itemData = items.find(i => i.path === path);
                  if (itemData) {
                    onOpenDetail(itemData.item, itemData.path);
                  }
                }}
                resolveIcon={resolveIcon}
                onFolderIconRequest={onFolderIconRequest}
              />
            </div>
          </div>
        );

      case 'items':
        return (
          <div className="tab-content items-content">
            <div className="items-header">
              <div className="items-info">
                Showing {filteredItems.length} of {items.length} items
              </div>
              {selectedFolder && (
                <button
                  className="clear-folder-btn"
                  onClick={() => onFolderSelect(null)}
                >
                  Clear folder filter
                </button>
              )}
            </div>
            
            <div className="items-grid">
              {filteredItems.length === 0 ? (
                <div className="items-empty">
                  <p>No items found. Adjust your filters or select a different collection.</p>
                </div>
              ) : (
                filteredItems.map(({ item, path }) => (
                  <Card
                    key={item.id}
                    item={item}
                    onEdit={item => onEdit(item, path)}
                    onDelete={item => onDelete(item, path)}
                    onView={onOpenDetail}
                    path={path}
                    resolveIcon={resolveIcon}
                  />
                ))
              )}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="tab-content search-content">
            <div className="search-controls">
              <Search value={searchQuery} onChange={onSearchChange} />
              <div className="tag-filter-container">
                <TagFilter
                  tags={allTags}
                  selectedTags={selectedTags}
                  onTagToggle={onTagToggle}
                  onClearAll={onClearTags}
                />
              </div>
            </div>
            
            <div className="search-results">
              <div className="results-info">
                Found {filteredItems.length} items
              </div>
              
              {selectedFolder && (
                <div className="folder-filter-info">
                  Filtered by folder: {selectedFolder}
                  <button onClick={() => onFolderSelect(null)}>×</button>
                </div>
              )}
              
              <div className="results-grid">
                {filteredItems.map(({ item, path }) => (
                  <Card
                    key={item.id}
                    item={item}
                    onEdit={item => onEdit(item, path)}
                    onDelete={item => onDelete(item, path)}
                    onView={onOpenDetail}
                    path={path}
                    resolveIcon={resolveIcon}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="tab-content default-content">
            <p>Unknown tab content</p>
          </div>
        );
    }
  };

  return <div className="tab-content-wrapper">{renderContent()}</div>;
};