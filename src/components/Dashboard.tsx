import React, { useState } from 'react';
import { Item } from '../types';
import { Card } from './Card';
import { ItemDetailView } from './ItemDetailView';
import { Search } from './Search';
import { TagFilter } from './TagFilter';
import { FolderTree } from './FolderTree';
import { AddButton } from './AddButton';

interface DashboardProps {
  items: Array<{ item: Item; path: string }>;
  folders: string[];
  allTags: string[];
  onAdd: () => void;
  onEdit: (item: Item, path: string) => void;
  onDelete: (item: Item, path: string) => void;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  folders,
  allTags,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<{ item: Item; path: string } | null>(null);

  const handleViewItem = (item: Item, path: string) => {
    setViewingItem({ item, path });
  };

  const handleCloseView = () => {
    setViewingItem(null);
  };

  const handleEditFromView = (item: Item) => {
    if (viewingItem) {
      onEdit(item, viewingItem.path);
      setViewingItem(null); // Close view after opening modal
    }
  };

  const handleDeleteFromView = (item: Item) => {
    if (viewingItem) {
      onDelete(item, viewingItem.path);
      setViewingItem(null); // Close view after deletion
    }
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

  if (viewingItem) {
    return (
      <ItemDetailView
        item={viewingItem.item}
        onClose={handleCloseView}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />
    );
  }

  // Filter items
  const filteredItems = items.filter(({ item }) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const hasSelectedTag = selectedTags.some(tag => item.tags.includes(tag));
      if (!hasSelectedTag) return false;
    }

    // Folder filter
    if (selectedFolder) {
      if (!item.folder.startsWith(selectedFolder)) return false;
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
        <div className="item-dashboard-sidebar">
          <Search value={searchQuery} onChange={setSearchQuery} />

          <div className="item-dashboard-filters">
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearTags}
            />
            <FolderTree
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={handleFolderSelect}
            />
          </div>
        </div>

        <div className="item-dashboard-main">
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
              onView={item => handleViewItem(item, path)}
            />
          ))
        )}
          </div>
        </div>
      </div>

      <AddButton onClick={onAdd} />
    </div>
  );
};
