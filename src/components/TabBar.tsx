import React from 'react';

export interface Tab {
  id: string;
  title: string;
  icon?: string;
  isActive: boolean;
  onClose?: () => void;
}

interface TabBarProps {
  tabs: Tab[];
  onTabClick: (tabId: string) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, onTabClick, className = '' }) => {
  return (
    <div className={`tab-bar ${className}`}>
      <div className="tab-bar-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.isActive ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-title">{tab.title}</span>
            {tab.onClose && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  tab.onClose?.();
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};