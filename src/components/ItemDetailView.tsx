import React from 'react';
import { Item } from '../types';

interface ItemDetailViewProps {
  item: Item;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
}) => {
  const domain = item.link ? new URL(item.link).hostname : 'N/A';

  return (
    <div className="item-detail-view">
      <div className="item-detail-header">
        <h1 className="item-detail-title">{item.title}</h1>
        <div className="item-detail-actions">
          <button
            className="item-detail-action-btn mod-cta"
            onClick={() => onEdit(item)}
            title="Edit Item"
          >
            ✏️ Edit
          </button>
          <button
            className="item-detail-action-btn mod-warning"
            onClick={() => onDelete(item)}
            title="Delete Item"
          >
            🗑️ Delete
          </button>
          <button
            className="item-detail-action-btn"
            onClick={onClose}
            title="Close"
          >
            ❌ Close
          </button>
        </div>
      </div>

      <div className="item-detail-content">
        <div className="item-detail-section">
          <h2>Description</h2>
          <p>{item.description || 'No description provided.'}</p>
        </div>

        <div className="item-detail-section">
          <h2>Details</h2>
          <div className="item-detail-details-grid">
            <div className="item-detail-detail">
              <strong>Link:</strong>{' '}
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {domain}
                </a>
              ) : (
                'N/A'
              )}
            </div>
            <div className="item-detail-detail">
              <strong>Collection:</strong> {item.folder}
            </div>
            <div className="item-detail-detail">
              <strong>Created:</strong>{' '}
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="item-detail-detail">
              <strong>Updated:</strong>{' '}
              {new Date(item.updatedAt).toLocaleDateString()}
            </div>
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
      </div>
    </div>
  );
};
