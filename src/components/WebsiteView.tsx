import React, { useState } from 'react';
import { Item, TreeNode } from '../types';
import { Card } from './Card';
import { Search } from './Search';
import { TagFilter } from './TagFilter';
import { FolderTree } from './FolderTree';

interface WebsiteViewProps {
  items: Array<{ item: Item; path: string }>;
  tree: TreeNode[];
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

export const WebsiteView: React.FC<WebsiteViewProps> = ({
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
  const [activeView, setActiveView] = useState<ViewType>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleFolderIconRequest = (node: TreeNode) => {
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

  const collectionStats = tree.reduce((acc, node) => {
    const countItems = (n: TreeNode): number => {
      if (n.type === 'item') return 1;
      if (n.children) {
        return n.children.reduce((sum, child) => sum + countItems(child), 0);
      }
      return 0;
    };
    if (node.type === 'folder') {
      acc.push({
        name: node.name,
        path: node.path,
        itemCount: countItems(node),
      });
    }
    return acc;
  }, [] as Array<{ name: string; path: string; itemCount: number }>);

  const renderAnalytics = () => (
    <div className="dashboard-section">
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

      <div className="content-grid">
        <div className="content-card">
          <h3>Collections</h3>
          <div className="collection-list">
            {collectionStats.map(stat => (
              <div
                key={stat.path}
                className="collection-item"
                onClick={() => {
                  handleFolderSelect(stat.path);
                  setActiveView('items');
                }}
              >
                <span className="collection-icon">{tabIcons.collections}</span>
                <span className="collection-name">{stat.name}</span>
                <span className="collection-count">{stat.itemCount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h3>Recent Activity</h3>
          <div className="recent-list">
            {recentItems.map(({ item, path }) => (
              <div
                key={item.id}
                className="recent-item"
                onClick={() => handleOpenItem(item, path)}
              >
                <div className="recent-info">
                  <span className="recent-title">{item.title}</span>
                  <span className="recent-collection">{item.collectionTitle}</span>
                </div>
                <span className="recent-date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="dashboard-section">
      <div className="content-card full-width">
        <h3>Collections</h3>
        <FolderTree
          tree={tree}
          selectedFolder={selectedFolder}
          onFolderSelect={(folder) => {
            handleFolderSelect(folder);
            if (folder) {
              setActiveView('items');
            }
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
    </div>
  );

  const renderItems = () => (
    <div className="dashboard-section">
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
    <div className="dashboard-section">
      <div className="search-section">
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
    </div>
  );

  return (
    <div className="website-view">
      {/* Header */}
      <header className="website-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
            <h1 className="website-title">Item Manager</h1>
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

      {/* Main Layout */}
      <div className="website-layout">
        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2>Navigation</h2>
            </div>
            <nav className="sidebar-nav">
              <button
                className={`sidebar-nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveView('analytics')}
              >
                <span className="nav-icon">{tabIcons.analytics}</span>
                <span className="nav-label">Analytics</span>
              </button>
              <button
                className={`sidebar-nav-item ${activeView === 'collections' ? 'active' : ''}`}
                onClick={() => setActiveView('collections')}
              >
                <span className="nav-icon">{tabIcons.collections}</span>
                <span className="nav-label">Collections</span>
              </button>
              <button
                className={`sidebar-nav-item ${activeView === 'items' ? 'active' : ''}`}
                onClick={() => setActiveView('items')}
              >
                <span className="nav-icon">{tabIcons.items}</span>
                <span className="nav-label">All Items</span>
              </button>
              <button
                className={`sidebar-nav-item ${activeView === 'search' ? 'active' : ''}`}
                onClick={() => setActiveView('search')}
              >
                <span className="nav-icon">{tabIcons.search}</span>
                <span className="nav-label">Search</span>
              </button>
            </nav>

            {/* Quick Stats */}
            <div className="sidebar-stats">
              <h3>Quick Stats</h3>
              <div className="sidebar-stat">
                <span className="stat-label">Collections</span>
                <span className="stat-value">{tree.length}</span>
              </div>
              <div className="sidebar-stat">
                <span className="stat-label">Items</span>
                <span className="stat-value">{items.length}</span>
              </div>
              <div className="sidebar-stat">
                <span className="stat-label">Tags</span>
                <span className="stat-value">{allTags.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-nav-content">
            <button
              className={`mobile-nav-item ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('analytics');
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{tabIcons.analytics}</span>
              <span className="nav-label">Analytics</span>
            </button>
            <button
              className={`mobile-nav-item ${activeView === 'collections' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('collections');
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{tabIcons.collections}</span>
              <span className="nav-label">Collections</span>
            </button>
            <button
              className={`mobile-nav-item ${activeView === 'items' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('items');
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{tabIcons.items}</span>
              <span className="nav-label">All Items</span>
            </button>
            <button
              className={`mobile-nav-item ${activeView === 'search' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('search');
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{tabIcons.search}</span>
              <span className="nav-label">Search</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="website-main">
          <div className="main-content">
            {activeView === 'analytics' && renderAnalytics()}
            {activeView === 'collections' && renderCollections()}
            {activeView === 'items' && renderItems()}
            {activeView === 'search' && renderSearch()}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};