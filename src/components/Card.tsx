import React from 'react';
import { Item } from '../types';

interface CardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onView: (item: Item) => void;
}

export const Card: React.FC<CardProps> = ({ item, onEdit, onDelete, onView }) => {
  const domain = item.link ? (new URL(item.link).hostname) : '';

  return (
    <div className="item-card" onClick={() => onView(item)}>
      <div className="item-card-header">
        <h3 className="item-card-title">{item.title}</h3>
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
        <span className="item-card-folder">📁 {item.folder}</span>
        <span className="item-card-date">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
