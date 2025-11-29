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
        <div className="item-card-title-area">
          <h3 className="item-card-title">{item.title}</h3>
          <span className="item-card-folder">{item.collectionTitle}</span>
        </div>
        <div className="item-card-actions">
          <button
            className="item-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              onEdit(item);
            }}
            aria-label="Edit item"
          >
            ✏️
          </button>
          <button
            className="item-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              onDelete(item);
            }}
            aria-label="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>
      <p className="item-card-description">{item.description}</p>
      {item.link && (
        <div className="item-card-link">
          <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            🔗 {domain}
          </a>
        </div>
      )}
      {item.tags.length > 0 && (
        <div className="item-card-tags">
          {item.tags.map((tag, index) => (
            <span key={index} className="item-card-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="item-card-footer">
        <span className="item-card-date">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
