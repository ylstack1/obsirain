import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Item } from '../types';

export interface FolderFilterState {
  include: string[];
  exclude: string[];
}

interface ItemDetailModalProps {
  item: Item;
  path: string;
  onClose: () => void;
  onEdit: (item: Item, path: string) => void;
  onDelete: (item: Item, path: string) => void;
  onVisit: (path: string) => void;
  folderFilters: FolderFilterState;
  onToggleFolderFilter: (folder: string, mode: 'include' | 'exclude') => void;
  onClearFolderFilters: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  path,
  onClose,
  onEdit,
  onDelete,
  onVisit,
  folderFilters,
  onToggleFolderFilter,
  onClearFolderFilters,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const domain = useMemo(() => {
    if (!item.link) {
      return 'N/A';
    }

    try {
      return new URL(item.link).hostname;
    } catch {
      return item.link;
    }
  }, [item.link]);
  const isFolderIncluded = folderFilters.include.includes(item.folder);
  const isFolderExcluded = folderFilters.exclude.includes(item.folder);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleRequestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleRequestClose = () => {
    setIsClosing(prev => {
      if (prev) {
        return prev;
      }
      closeTimeoutRef.current = window.setTimeout(() => {
        onClose();
      }, 200);
      return true;
    });
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleRequestClose();
    }
  };

  const modalStateClass = `${isVisible ? 'is-visible' : ''} ${isClosing ? 'is-closing' : ''}`.trim();

  return (
    <div className={`item-detail-modal ${modalStateClass}`} onMouseDown={handleOverlayClick}>
      <div className="item-detail-modal-panel" onMouseDown={event => event.stopPropagation()}>
        <button
          className="item-detail-modal-close"
          onClick={handleRequestClose}
          aria-label="Close detail view"
        >
          ✕
        </button>

        <header className="item-detail-modal-header">
          <div>
            <p className="item-detail-modal-collection">{item.collectionTitle}</p>
            <h1 className="item-detail-title">{item.title}</h1>
          </div>
          <div className="item-detail-primary-actions">
            <button className="item-detail-action-btn mod-visit" onClick={() => onVisit(path)}>
              🔗 Visit note
            </button>
            <button className="item-detail-action-btn mod-cta" onClick={() => onEdit(item, path)}>
              ✏️ Edit
            </button>
            <button
              className="item-detail-action-btn mod-warning"
              onClick={() => onDelete(item, path)}
            >
              🗑️ Remove
            </button>
          </div>
        </header>

        {item.banner && (
          <div className="item-detail-banner-container">
            <img src={item.banner} alt="Banner" className="item-detail-banner" />
          </div>
        )}

        <div className="item-detail-content">
          <div className="item-detail-section">
            <h2>Description</h2>
            <p>{item.description || 'No description provided.'}</p>
          </div>

          <div className="item-detail-section">
            <h2>Metadata</h2>
            <div className="item-detail-metadata-grid">
              <div className="item-detail-metadata-item">
                <strong>Source:</strong>{' '}
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" title={item.link}>
                    {domain}
                  </a>
                ) : (
                  'N/A'
                )}
              </div>
              <div className="item-detail-metadata-item">
                <strong>Type:</strong> {item.type || 'N/A'}
              </div>
              <div className="item-detail-metadata-item">
                <strong>Collection:</strong> {item.collectionTitle}
                <div className="item-detail-sub-detail">
                  <small>Path: {item.collectionPath}</small>
                </div>
              </div>
              <div className="item-detail-metadata-item">
                <strong>Created:</strong>{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <div className="item-detail-metadata-item">
                <strong>Updated:</strong>{' '}
                {new Date(item.updatedAt).toLocaleDateString()}
              </div>
              <div className="item-detail-metadata-item">
                <strong>ID:</strong> {item.id}
              </div>
              {item.collectionParentId && (
                <div className="item-detail-metadata-item">
                  <strong>Parent ID:</strong> {item.collectionParentId}
                </div>
              )}
            </div>
          </div>

          <div className="item-detail-section">
            <h2>Tags</h2>
            <div className="item-detail-tags">
              {item.tags.length > 0 ? (
                item.tags.map(tag => (
                  <span key={tag} className="item-detail-tag">
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="item-detail-tag-empty">No tags</span>
              )}
            </div>
          </div>

          <div className="item-detail-section item-detail-folder-filters">
            <div className="item-detail-folder-filters-header">
              <h2>Folder filters</h2>
              {(folderFilters.include.length > 0 || folderFilters.exclude.length > 0) && (
                <button className="item-detail-action-btn" onClick={onClearFolderFilters}>
                  Reset filters
                </button>
              )}
            </div>
            <p className="item-detail-folder-filters-description">
              Quickly include or exclude folders without leaving the detail view.
            </p>
            <div className="item-detail-folder-filter-actions">
              <button
                className={`item-detail-folder-chip ${isFolderIncluded ? 'is-active' : ''}`}
                onClick={() => onToggleFolderFilter(item.folder, 'include')}
              >
                {isFolderIncluded ? 'Included in filters' : 'Include this folder'}
              </button>
              <button
                className={`item-detail-folder-chip ${isFolderExcluded ? 'is-active' : ''}`}
                onClick={() => onToggleFolderFilter(item.folder, 'exclude')}
              >
                {isFolderExcluded ? 'Excluded from view' : 'Exclude this folder'}
              </button>
            </div>
            {(folderFilters.include.length > 0 || folderFilters.exclude.length > 0) && (
              <div className="item-detail-folder-filter-summary">
                {folderFilters.include.length > 0 && (
                  <div>
                    <span className="item-detail-folder-filter-label">Included</span>
                    <div className="item-detail-folder-filter-list">
                      {folderFilters.include.map(folder => (
                        <button
                          key={`include-${folder}`}
                          className="item-detail-folder-filter-pill"
                          onClick={() => onToggleFolderFilter(folder, 'include')}
                          aria-label={`Remove include filter for ${folder}`}
                        >
                          {folder}
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {folderFilters.exclude.length > 0 && (
                  <div>
                    <span className="item-detail-folder-filter-label">Excluded</span>
                    <div className="item-detail-folder-filter-list">
                      {folderFilters.exclude.map(folder => (
                        <button
                          key={`exclude-${folder}`}
                          className="item-detail-folder-filter-pill"
                          onClick={() => onToggleFolderFilter(folder, 'exclude')}
                          aria-label={`Remove exclude filter for ${folder}`}
                        >
                          {folder}
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="item-detail-modal-footer">
          <button className="item-detail-action-btn" onClick={handleRequestClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
