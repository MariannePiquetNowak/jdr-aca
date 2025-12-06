import React from 'react';

const PNJCard = ({ pnj, onDelete, onEdit, onShare, viewMode = 'grid' }) => {
    // List view
    if (viewMode === 'list') {
        return (
            <div className="pnj-list-item" title={pnj.description || ''}>
                <div className="list-image">
                    {pnj.portrait ? (
                        <img src={pnj.portrait} alt={pnj.name} />
                    ) : (
                        <div className="no-image">👤</div>
                    )}
                </div>
                <div className="list-content">
                    <h3>{pnj.name || 'Sans nom'}</h3>
                    {pnj.role && <span className="role-badge">{pnj.role}</span>}
                    {pnj.description && <p className="description-short">{pnj.description.substring(0, 100)}...</p>}
                </div>
                <div className="list-actions">
                    {onShare && <button className="pnj-share-btn" onClick={() => onShare(pnj)} title="Partager">📚</button>}
                    {onEdit && <button className="pnj-edit-btn" onClick={() => onEdit(pnj)} title="Modifier">✏️</button>}
                    {onDelete && <button className="pnj-delete-btn" onClick={() => onDelete(pnj.id)} title="Supprimer">✕</button>}
                </div>
            </div>
        );
    }

    // Gallery view
    if (viewMode === 'gallery') {
        return (
            <div className="pnj-gallery-item" title={pnj.description || ''}>
                <div className="gallery-image">
                    {pnj.portrait ? (
                        <img src={pnj.portrait} alt={pnj.name} />
                    ) : (
                        <div className="no-image">👤</div>
                    )}
                </div>
                <div className="gallery-overlay">
                    <h4>{pnj.name || 'Sans nom'}</h4>
                    {pnj.role && <span className="role-badge">{pnj.role}</span>}
                    <div className="gallery-actions">
                        {onShare && <button className="pnj-share-btn" onClick={() => onShare(pnj)}>📚</button>}
                        {onEdit && <button className="pnj-edit-btn" onClick={() => onEdit(pnj)}>✏️</button>}
                        {onDelete && <button className="pnj-delete-btn" onClick={() => onDelete(pnj.id)}>✕</button>}
                    </div>
                </div>
            </div>
        );
    }

    // Grid view (default)
    return (
        <div className="pnj-card">
            {pnj.portrait && (
                <div className="pnj-portrait">
                    <img src={pnj.portrait} alt={pnj.name || 'Portrait'} />
                </div>
            )}
            
            <h3 className="pnj-name">{pnj.name || 'Sans nom'}</h3>
            
            {pnj.role && (
                <div className="pnj-role">
                    <span className="role-badge">{pnj.role}</span>
                </div>
            )}
            
            {pnj.description && (
                <div className="pnj-section">
                    <h4>Description :</h4>
                    <p>{pnj.description}</p>
                </div>
            )}
            
            {pnj.caractere && pnj.caractere.length > 0 && (
                <div className="pnj-section">
                    <h4>Caractère :</h4>
                    {pnj.caractere.map((trait, idx) => (
                        <div 
                            key={idx} 
                            className="pnj-trait"
                            data-tooltip={trait.description}
                        >
                            <strong>{trait.name}</strong>
                        </div>
                    ))}
                </div>
            )}
            
            {pnj.informations && pnj.informations.length > 0 && (
                <div className="pnj-section">
                    <h4>Informations :</h4>
                    {pnj.informations.map((info, idx) => (
                        <div 
                            key={idx} 
                            className="pnj-info"
                            data-tooltip={info.description}
                        >
                            <strong>{info.name}</strong>
                        </div>
                    ))}
                </div>
            )}
            
            {pnj.localisation && (
                <div className="pnj-section">
                    <h4>Localisation :</h4>
                    <p className="pnj-location">📍 {pnj.localisation}</p>
                </div>
            )}

            <div className="pnj-card-actions">
                {onShare && (
                    <button 
                        type="button" 
                        className="pnj-share-btn"
                        onClick={() => onShare(pnj)}
                        aria-label="Partager dans la bibliothèque"
                        title="Partager dans la bibliothèque"
                    >
                        📚
                    </button>
                )}
                {onEdit && (
                    <button 
                        type="button" 
                        className="pnj-edit-btn"
                        onClick={() => onEdit(pnj)}
                        aria-label="Modifier ce PNJ"
                    >
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button 
                        type="button" 
                        className="pnj-delete-btn"
                        onClick={() => onDelete(pnj.id)}
                        aria-label="Supprimer ce PNJ"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default PNJCard;
