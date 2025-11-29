import React, { useEffect, useState } from 'react';
import { Item, TreeNode } from '../types';
import { Card } from './Card';
import { Search } from './Search';
import { TagFilter } from './TagFilter';
import { FolderTree } from './FolderTree';
import { AddButton } from './AddButton';
import { ItemDetailModal, FolderFilterState } from './ItemDetailModal';

interface DashboardProps {
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
}

type TabType = 'analytics' | 'collections' | 'items' | 'add';

export const Dashboard: React.FC<DashboardProps> = ({
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
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [activeItemPath, setActiveItemPath] = useState<string | null>(null);
  const [folderFilters, setFolderFilters] = useState<FolderFilterState>({
    include: [],
    exclude: [],
  });

  useEffect(() => {
    if (activeItemPath && !items.some(({ path }) => path === activeItemPath)) {
      setActiveItemPath(null);
    }
  }, [activeItemPath, items]);

  const handleOpenDetail = (_item: Item, path: string) => {
    setActiveItemPath(path);
  };

  const handleCloseDetail = () => {
    setActiveItemPath(null);
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

  const handleFolderFilterToggle = (folder: string, mode: 'include' | 'exclude') => {
    setFolderFilters(prev => {
      const includeSet = new Set(prev.include);
      const excludeSet = new Set(prev.exclude);

      if (mode === 'include') {
        if (includeSet.has(folder)) {
          includeSet.delete(folder);
        } else {
          includeSet.add(folder);
          excludeSet.delete(folder);
        }
      } else {
        if (excludeSet.has(folder)) {
          excludeSet.delete(folder);
        } else {
          excludeSet.add(folder);
          includeSet.delete(folder);
        }
      }

      return {
        include: Array.from(includeSet),
        exclude: Array.from(excludeSet),
      };
    });
  };

  const handleClearFolderFilters = () => {
    setFolderFilters({ include: [], exclude: [] });
  };

  const activeItemData = activeItemPath
    ? items.find(({ path }) => path === activeItemPath) ?? null
    : null;

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

    if (folderFilters.include.length > 0) {
      const matchesIncluded = folderFilters.include.some(folder =>
        item.folder.startsWith(folder)
      );
      if (!matchesIncluded) return false;
    }

    if (folderFilters.exclude.length > 0) {
      const matchesExcluded = folderFilters.exclude.some(folder =>
        item.folder.startsWith(folder)
      );
      if (matchesExcluded) return false;
    }

    return true;
  });

  // Get collection stats
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

  // Recent items (last 7 days)
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
    <div className="dashboard-tab-content dashboard-analytics-tab">
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">📁</div>
          <div className="dashboard-stat-value">{tree.length}</div>
          <div className="dashboard-stat-label">Collections</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">🔗</div>
          <div className="dashboard-stat-value">{items.length}</div>
          <div className="dashboard-stat-label">Total Items</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">🏷️</div>
          <div className="dashboard-stat-value">{allTags.length}</div>
          <div className="dashboard-stat-label">Tags</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">⏰</div>
          <div className="dashboard-stat-value">{recentItems.length}</div>
          <div className="dashboard-stat-label">Recent (7 days)</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Collection Breakdown</h2>
        <div className="dashboard-collection-list">
          {collectionStats.length === 0 ? (
            <p className="dashboard-empty-message">No collections yet</p>
          ) : (
            collectionStats.map(stat => (
              <div
                key={stat.path}
                className="dashboard-collection-item"
                onClick={() => handleFolderSelect(stat.path)}
              >
                <span className="dashboard-collection-icon">📁</span>
                <span className="dashboard-collection-name">{stat.name}</span>
                <span className="dashboard-collection-count">{stat.itemCount} items</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Activity</h2>
        <div className="dashboard-recent-list">
          {recentItems.length === 0 ? (
            <p className="dashboard-empty-message">No recent activity</p>
          ) : (
            recentItems.map(({ item, path }) => (
              <div
                key={item.id}
                className="dashboard-recent-item"
                onClick={() => handleOpenDetail(item, path)}
              >
                <div className="dashboard-recent-info">
                  <span className="dashboard-recent-title">{item.title}</span>
                  <span className="dashboard-recent-collection">{item.collectionTitle}</span>
                </div>
                <span className="dashboard-recent-date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="dashboard-tab-content dashboard-collections-tab">
      <h2 className="dashboard-section-title">All Collections</h2>
      <div className="item-dashboard-left">
        <FolderTree
          tree={tree}
          selectedFolder={selectedFolder}
          onFolderSelect={(folder) => {
            handleFolderSelect(folder);
            setActiveTab('items');
          }}
          onItemSelect={(path) => {
            const itemData = items.find(i => i.path === path);
            if (itemData) {
              handleOpenDetail(itemData.item, itemData.path);
            }
          }}
          resolveIcon={resolveIcon}
          onFolderIconRequest={handleFolderIconRequest}
        />
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="dashboard-tab-content dashboard-items-tab">
      <div className="item-dashboard-stats">
        <span>
          Showing {filteredItems.length} of {items.length} items
        </span>
        {selectedFolder && (
          <button
            className="dashboard-clear-folder"
            onClick={() => handleFolderSelect(null)}
          >
            Clear folder filter
          </button>
        )}
      </div>

      <div className="item-dashboard-grid">
        {filteredItems.length === 0 ? (
          <div className="item-dashboard-empty">
            <p>No items found. Adjust your filters or select a different collection.</p>
          </div>
        ) : (
          filteredItems.map(({ item, path }) => (
            <Card
              key={item.id}
              item={item}
              onEdit={item => onEdit(item, path)}
              onDelete={item => onDelete(item, path)}
              onView={handleOpenDetail}
              path={path}
              resolveIcon={resolveIcon}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderAdd = () => (
    <div className="dashboard-tab-content dashboard-add-tab">
      <div className="dashboard-add-content">
        <div className="dashboard-add-icon">➕</div>
        <h2 className="dashboard-add-title">Add New Item</h2>
        <p className="dashboard-add-description">
          Create a new item to add to your collection
        </p>
        <button className="dashboard-add-button mod-cta" onClick={onAdd}>
          Create Item
        </button>
      </div>
    </div>
  );

  return (
    <div className="item-dashboard">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-block">
            <h3>Search</h3>
            <Search value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="dashboard-sidebar-block">
            <h3>Tags</h3>
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearTags}
            />
          </div>
          <div className="dashboard-sidebar-block">
            <FolderTree
              tree={tree}
              selectedFolder={selectedFolder}
              onFolderSelect={folder => {
                handleFolderSelect(folder);
                if (folder) {
                  setActiveTab('items');
                }
              }}
              onItemSelect={path => {
                const itemData = items.find(i => i.path === path);
                if (itemData) {
                  handleOpenDetail(itemData.item, itemData.path);
                }
              }}
              resolveIcon={resolveIcon}
              onFolderIconRequest={handleFolderIconRequest}
            />
          </div>
        </aside>

        <section className="dashboard-main">
          <div className="dashboard-tabs-header">
            <h1 className="item-dashboard-title">Item Manager</h1>
            <div className="dashboard-tabs-nav">
              <button
                className={`dashboard-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                📊 Analytics
              </button>
              <button
                className={`dashboard-tab ${activeTab === 'collections' ? 'active' : ''}`}
                onClick={() => setActiveTab('collections')}
              >
                📁 Collections
              </button>
              <button
                className={`dashboard-tab ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                🔗 All Items
              </button>
              <button
                className={`dashboard-tab ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
              >
                ➕ Add
              </button>
            </div>
            <button className="dashboard-refresh-btn" onClick={onRefresh}>
              🔄 Refresh
            </button>
          </div>

          <div className="dashboard-tabs-body">
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'collections' && renderCollections()}
            {activeTab === 'items' && renderItems()}
            {activeTab === 'add' && renderAdd()}
          </div>
        </section>
      </div>

      <AddButton onClick={onAdd} />

      {activeItemData && (
        <ItemDetailModal
          item={activeItemData.item}
          path={activeItemData.path}
          onClose={handleCloseDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onVisit={onVisit}
          folderFilters={folderFilters}
          onToggleFolderFilter={handleFolderFilterToggle}
          onClearFolderFilters={handleClearFolderFilters}
        />
      )}
    </div>
  );
};
