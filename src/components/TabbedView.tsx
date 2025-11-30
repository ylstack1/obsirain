import React, { useState, useEffect } from 'react';
import { Item, TreeNode } from '../types';
import { TabBar, Tab } from './TabBar';
import { TabContent } from './TabContent';
import { AddButton } from './AddButton';
import { ItemDetailModal, FolderFilterState } from './ItemDetailModal';

interface TabbedViewProps {
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

export const TabbedView: React.FC<TabbedViewProps> = ({
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
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'analytics', title: 'Analytics', icon: tabIcons.analytics, isActive: true },
    { id: 'collections', title: 'Collections', icon: tabIcons.collections, isActive: false },
    { id: 'items', title: 'All Items', icon: tabIcons.items, isActive: false },
    { id: 'search', title: 'Search', icon: tabIcons.search, isActive: false },
  ]);
  
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [activeItemPath, setActiveItemPath] = useState<string | null>(null);
  const [folderFilters, setFolderFilters] = useState<FolderFilterState>({
    include: [],
    exclude: [],
  });

  // Update tab icons when settings change
  useEffect(() => {
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === 'analytics') return { ...tab, icon: tabIcons.analytics };
        if (tab.id === 'collections') return { ...tab, icon: tabIcons.collections };
        if (tab.id === 'items') return { ...tab, icon: tabIcons.items };
        if (tab.id === 'search') return { ...tab, icon: tabIcons.search };
        return tab;
      })
    );
  }, [tabIcons]);

  useEffect(() => {
    if (activeItemPath && !items.some(({ path }) => path === activeItemPath)) {
      setActiveItemPath(null);
    }
  }, [activeItemPath, items]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setTabs(prevTabs =>
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
  };

  const handleOpenDetail = (item: Item, path: string) => {
    // Create a new tab for the item if it doesn't exist
    const existingTab = tabs.find(tab => tab.id === path);
    if (!existingTab) {
      const newTab: Tab = {
        id: path,
        title: item.title,
        icon: '📄',
        isActive: true,
        onClose: () => handleCloseTab(path),
      };
      
      setTabs(prevTabs => [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        newTab,
      ]);
      setActiveTab(path);
    } else {
      handleTabClick(path);
    }
    
    setActiveItemPath(path);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      if (activeTab === tabId) {
        // Activate the first tab if the current tab is closed
        if (newTabs.length > 0) {
          const nextTab = newTabs[0];
          nextTab.isActive = true;
          setActiveTab(nextTab.id);
        }
      }
      
      return newTabs;
    });

    if (activeItemPath === tabId) {
      setActiveItemPath(null);
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

  const handleCloseDetail = () => {
    setActiveItemPath(null);
  };

  const activeItemData = activeItemPath
    ? items.find(({ path }) => path === activeItemPath) ?? null
    : null;

  return (
    <div className="tabbed-view">
      <div className="tabbed-view-header">
        <div className="tabbed-view-title">
          <h1>Item Manager</h1>
          <button className="refresh-btn" onClick={onRefresh}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <TabBar tabs={tabs} onTabClick={handleTabClick} />

      <div className="tabbed-view-content">
        {activeItemData && activeTab === activeItemPath ? (
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
        ) : (
          <TabContent
            tabId={activeTab}
            items={items}
            tree={tree}
            allTags={allTags}
            searchQuery={searchQuery}
            selectedTags={selectedTags}
            selectedFolder={selectedFolder}
            onEdit={onEdit}
            onDelete={onDelete}
            onVisit={onVisit}
            onOpenDetail={handleOpenDetail}
            onSearchChange={setSearchQuery}
            onTagToggle={handleTagToggle}
            onClearTags={handleClearTags}
            onFolderSelect={handleFolderSelect}
            resolveIcon={resolveIcon}
            onFolderIconRequest={handleFolderIconRequest}
          />
        )}
      </div>

      <AddButton onClick={onAdd} />
    </div>
  );
};