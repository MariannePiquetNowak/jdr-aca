import React from 'react';
import '../styles/components/_viewToggle.scss';

const ViewToggle = ({ currentView, onViewChange }) => {
    return (
        <div className="view-toggle">
            <button
                className={currentView === 'grid' ? 'active' : ''}
                onClick={() => onViewChange('grid')}
                title="Affichage en grille"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                </svg>
            </button>
            <button
                className={currentView === 'list' ? 'active' : ''}
                onClick={() => onViewChange('list')}
                title="Affichage en liste"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                </svg>
            </button>
            <button
                className={currentView === 'gallery' ? 'active' : ''}
                onClick={() => onViewChange('gallery')}
                title="Affichage en galerie"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                </svg>
            </button>
        </div>
    );
};

export default ViewToggle;
