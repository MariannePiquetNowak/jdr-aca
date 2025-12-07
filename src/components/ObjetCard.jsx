import React from 'react';

const ObjetCard = ({ objet, onDelete, onEdit, onShare, viewMode = 'grid' }) => {
    // List view
    if (viewMode === 'list') {
        return (
            <div className="objet-list-item" title={objet.description || ''}>
                <div className="list-image">
                    {objet.image ? (
                        <img src={objet.image} alt={objet.name} />
                    ) : (
                        <div className="no-image">📦</div>
                    )}
                </div>
                <div className="list-content">
                    <h3>{objet.name || 'Sans nom'}</h3>
                    {objet.type && <span className="type-badge">{objet.type}</span>}
                    {objet.description && <p className="description-short">{objet.description.substring(0, 100)}...</p>}
                </div>
                <div className="list-actions">
                    {onShare && <button className="objet-share-btn" onClick={() => onShare(objet)} title="Partager">📚</button>}
                    {onEdit && <button className="objet-edit-btn" onClick={() => onEdit(objet)} title="Modifier">✏️</button>}
                    {onDelete && <button className="objet-delete-btn" onClick={() => onDelete(objet.id)} title="Supprimer">✕</button>}
                </div>
            </div>
        );
    }

    // Gallery view
    if (viewMode === 'gallery') {
        return (
            <div className="objet-gallery-item" title={objet.description || ''}>
                <div className="gallery-image">
                    {objet.image ? (
                        <img src={objet.image} alt={objet.name} />
                    ) : (
                        <div className="no-image">📦</div>
                    )}
                </div>
                <div className="gallery-overlay">
                    <h4>{objet.name || 'Sans nom'}</h4>
                    {objet.type && <span className="type-badge">{objet.type}</span>}
                    <div className="gallery-actions">
                        {onShare && <button className="objet-share-btn" onClick={() => onShare(objet)}>📚</button>}
                        {onEdit && <button className="objet-edit-btn" onClick={() => onEdit(objet)}>✏️</button>}
                        {onDelete && <button className="objet-delete-btn" onClick={() => onDelete(objet.id)}>✕</button>}
                    </div>
                </div>
            </div>
        );
    }

    // Grid view (default)
    return (
        <div className="objet-card">
            {objet.image && (
                <div className="objet-image">
                    <img src={objet.image} alt={objet.name || 'Image'} />
                </div>
            )}
            
            <h3 className="objet-name">{objet.name || 'Sans nom'}</h3>
            
            {objet.type && (
                <div className="objet-type">
                    <span className="type-badge">{objet.type}</span>
                </div>
            )}
            
            {objet.description && (
                <div className="objet-section">
                    <p>{objet.description}</p>
                </div>
            )}
            
            {objet.effets && objet.effets.length > 0 && (
                <div className="objet-section">
                    <h4>Effets :</h4>
                    {objet.effets.map((effet, idx) => (
                        <div 
                            key={idx} 
                            className="objet-effet"
                            data-tooltip={effet.description}
                        >
                            <strong>{effet.name}</strong>
                        </div>
                    ))}
                </div>
            )}
            
            {objet.rarete && (
                <div className="objet-section">
                    <h4>Rareté :</h4>
                    <p className="objet-rarete">{objet.rarete}</p>
                </div>
            )}

            <div className="objet-card-actions">
                {onShare && (
                    <button 
                        type="button" 
                        className="objet-share-btn"
                        onClick={() => onShare(objet)}
                        aria-label="Partager dans la bibliothèque"
                        title="Partager dans la bibliothèque"
                    >
                        📚
                    </button>
                )}
                {onEdit && (
                    <button 
                        type="button" 
                        className="objet-edit-btn"
                        onClick={() => onEdit(objet)}
                        aria-label="Modifier cet objet"
                    >
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button 
                        type="button" 
                        className="objet-delete-btn"
                        onClick={() => onDelete(objet.id)}
                        aria-label="Supprimer cet objet"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default ObjetCard;
