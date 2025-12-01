import React from 'react';
import { Item } from '../types';

interface CardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onView: (item: Item, path: string) => void;
  path: string;
  resolveIcon?: (iconPath: string) => string | undefined;
}

export const Card: React.FC<CardProps> = ({ item, onEdit, onDelete, onView, path, resolveIcon }) => {
  const domain = item.link ? (new URL(item.link).hostname) : '';
  const iconSrc = item.icon && resolveIcon ? resolveIcon(item.icon) : undefined;

  return (
    <div className="item-card" onClick={() => onView(item, path)}>
      <div className="item-card-header">
        <div className="item-card-icon">
          {iconSrc ? (
            <img src={iconSrc} alt="Item icon" className="item-card-icon-img" />
          ) : (
            <span className="item-card-icon-placeholder">🔗</span>
          )}
        </div>
        <div className="item-card-content">
          <h3 className="item-card-title">{item.title}</h3>
          {item.collectionTitle && (
            <span className="item-card-collection">{item.collectionTitle}</span>
          )}
          {domain && (
            <span className="item-card-domain">{domain}</span>
          )}
        </div>
        <div className="item-card-actions">
          <button
            className="item-card-action-btn edit"
            onClick={e => {
              e.stopPropagation();
              onEdit(item);
            }}
            aria-label="Edit item"
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="item-card-action-btn delete"
            onClick={e => {
              e.stopPropagation();
              onDelete(item);
            }}
            aria-label="Delete item"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {item.description && (
        <div className="item-card-description">
          {item.description.length > 120 
            ? `${item.description.substring(0, 120)}...` 
            : item.description
          }
        </div>
      )}
      
      {item.tags.length > 0 && (
        <div className="item-card-tags">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="item-card-tag">
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="item-card-tag more">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};