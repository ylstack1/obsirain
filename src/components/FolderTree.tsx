import React, { useState } from 'react';
import { TreeNode } from '../types';

interface FolderTreeProps {
  tree: TreeNode[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
  onItemSelect: (path: string) => void;
  resolveIcon?: (iconPath: string) => string | undefined;
  onFolderIconRequest?: (node: TreeNode) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  tree,
  selectedFolder,
  onFolderSelect,
  onItemSelect,
  resolveIcon,
  onFolderIconRequest,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  if (tree.length === 0) {
    return null;
  }

  const toggleExpand = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map(node => {
      const isFolder = node.type === 'folder';
      const isItem = node.type === 'item';
      const isSelected = isFolder && selectedFolder === node.path;
      const hasChildren = isFolder && node.children && node.children.length > 0;
      const isExpanded = isFolder && expandedFolders.has(node.path);

      const handleNodeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
          if (hasChildren) {
            toggleExpand(node.path);
          }
          onFolderSelect(isSelected ? null : node.path);
        } else if (isItem) {
          onItemSelect(node.path);
        }
      };

      const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder && hasChildren) {
          toggleExpand(node.path);
        }
      };

      const renderIcon = () => {
        if (node.icon && resolveIcon) {
          const iconSrc = resolveIcon(node.icon);
          if (iconSrc) {
            return (
              <img
                src={iconSrc}
                alt={node.name}
                className="folder-tree-icon-img"
              />
            );
          }
        }
        if (isFolder) {
          return <span className="folder-tree-icon">{isExpanded ? '📂' : '📁'}</span>;
        }
        return <span className="folder-tree-icon">🔗</span>;
      };

      return (
        <div key={node.path} className="folder-tree-node">
          <button
            className={`folder-tree-button ${isSelected ? 'active' : ''} ${isItem ? 'item' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={handleNodeClick}
          >
            {isFolder && hasChildren && (
              <span
                className={`folder-tree-collapse-icon ${isExpanded ? 'is-expanded' : ''}`}
                onClick={handleExpandClick}
              >
                {isExpanded ? '▼' : '►'}
              </span>
            )}
            {renderIcon()}
            <span className="folder-tree-name">{node.name}</span>
            {isFolder && node.itemCount !== undefined && node.itemCount > 0 && (
              <span className="folder-tree-count">{node.itemCount}</span>
            )}
            {isFolder && onFolderIconRequest && (
              <button
                className="folder-tree-icon-btn"
                onClick={e => {
                  e.stopPropagation();
                  onFolderIconRequest(node);
                }}
                title="Set icon"
                aria-label={`Set icon for ${node.name}`}
              >
                🎨
              </button>
            )}
          </button>
          {isFolder && hasChildren && isExpanded && (
            <div className="folder-tree-children">
              {renderTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="item-folder-tree">
      <div className="item-folder-tree-header">
        <span className="item-folder-tree-title">Collections</span>
        {selectedFolder && (
          <button
            className="item-folder-tree-clear"
            onClick={() => onFolderSelect(null)}
          >
            Clear
          </button>
        )}
      </div>
      <div className="item-folder-tree-list">
        {renderTree(tree)}
      </div>
    </div>
  );
};
