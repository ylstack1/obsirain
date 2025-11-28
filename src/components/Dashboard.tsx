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
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  tree,
  allTags,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onVisit,
}) => {
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

  return (
    <div className="item-dashboard">
      <div className="item-dashboard-header">
        <h1 className="item-dashboard-title">Item Manager</h1>
        <button className="item-dashboard-refresh" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="item-dashboard-content">
        <div className="item-dashboard-left">
          <FolderTree
            tree={tree}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            onItemSelect={(path) => {
              const itemData = items.find(i => i.path === path);
              if (itemData) {
                handleOpenDetail(itemData.item, itemData.path);
              }
            }}
          />
        </div>

        <div className="item-dashboard-main">
          <div className="item-dashboard-filters">
            <Search value={searchQuery} onChange={setSearchQuery} />
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearTags}
            />
          </div>

          <div className="item-dashboard-stats">
            <span>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>

          <div className="item-dashboard-grid">
            {filteredItems.length === 0 ? (
              <div className="item-dashboard-empty">
                <p>No items found</p>
                <button className="item-dashboard-add-first" onClick={onAdd}>
                  Add your first item
                </button>
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
                />
              ))
            )}
          </div>
        </div>
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
