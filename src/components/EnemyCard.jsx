import React from 'react';

const EnemyCard = ({ enemy, onDelete, onEdit, onShare, viewMode = 'grid' }) => {
    // Generate stars based on danger level (1-10)
    const renderStars = (level) => {
        return '★'.repeat(Math.min(Math.max(level, 1), 10));
    };

    // List view
    if (viewMode === 'list') {
        return (
            <div className="enemy-list-item" title={enemy.description || ''}>
                <div className="list-image">
                    {enemy.portrait ? (
                        <img src={enemy.portrait} alt={enemy.name} />
                    ) : (
                        <div className="no-image">👹</div>
                    )}
                </div>
                <div className="list-content">
                    <h3>{enemy.name || 'Sans nom'}</h3>
                    {enemy.dangerLevel && (
                        <div className="danger-level">{renderStars(enemy.dangerLevel)}</div>
                    )}
                    {enemy.description && (
                        <p className="description-short">{enemy.description.substring(0, 100)}...</p>
                    )}
                </div>
                <div className="list-actions">
                    {onShare && <button className="enemy-share-btn" onClick={() => onShare(enemy)} title="Partager">📚</button>}
                    {onEdit && <button className="enemy-edit-btn" onClick={() => onEdit(enemy)} title="Modifier">✏️</button>}
                    {onDelete && <button className="enemy-delete-btn" onClick={() => onDelete(enemy.id)} title="Supprimer">✕</button>}
                </div>
            </div>
        );
    }

    // Gallery view
    if (viewMode === 'gallery') {
        return (
            <div className="enemy-gallery-item" title={enemy.description || ''}>
                <div className="gallery-image">
                    {enemy.portrait ? (
                        <img src={enemy.portrait} alt={enemy.name} />
                    ) : (
                        <div className="no-image">👹</div>
                    )}
                </div>
                <div className="gallery-overlay">
                    <h4>{enemy.name || 'Sans nom'}</h4>
                    {enemy.dangerLevel && (
                        <div className="danger-level">{renderStars(enemy.dangerLevel)}</div>
                    )}
                    <div className="gallery-actions">
                        {onShare && <button className="enemy-share-btn" onClick={() => onShare(enemy)}>📚</button>}
                        {onEdit && <button className="enemy-edit-btn" onClick={() => onEdit(enemy)}>✏️</button>}
                        {onDelete && <button className="enemy-delete-btn" onClick={() => onDelete(enemy.id)}>✕</button>}
                    </div>
                </div>
            </div>
        );
    }

    // Grid view (default)
    return (
        <div className="enemy-card">
            {enemy.portrait && (
                <div className="enemy-portrait">
                    <img src={enemy.portrait} alt={enemy.name || 'Portrait'} />
                </div>
            )}
            
            <h3 className="enemy-name">{enemy.name || 'Sans nom'}</h3>
            
            {enemy.description && (
                <div className="enemy-section">
                    <h4>Description :</h4>
                    <p>{enemy.description}</p>
                </div>
            )}
            
            {enemy.dangerLevel && (
                <div className="enemy-section">
                    <h4>Dangerosité :</h4>
                    <p className="enemy-danger">
                        {renderStars(enemy.dangerLevel)}
                    </p>
                </div>
            )}
            
            {enemy.powers && enemy.powers.length > 0 && (
                <div className="enemy-section">
                    <h4>Pouvoirs :</h4>
                    {enemy.powers.map((power, idx) => (
                        <div key={idx} className="enemy-power">
                            <strong>{power.name}</strong>
                            {power.description && <p>{power.description}</p>}
                        </div>
                    ))}
                </div>
            )}
            
            {enemy.butin && enemy.butin.length > 0 && (
                <div className="enemy-section">
                    <h4>Butin :</h4>
                    {enemy.butin.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="enemy-butin-item"
                            data-tooltip={item.description}
                        >
                            <strong>{item.name}</strong>
                        </div>
                    ))}
                </div>
            )}

            <div className="enemy-card-actions">
                {onShare && (
                    <button 
                        type="button" 
                        className="enemy-share-btn"
                        onClick={() => onShare(enemy)}
                        aria-label="Partager dans la bibliothèque"
                        title="Partager dans la bibliothèque"
                    >
                        📚
                    </button>
                )}
                {onEdit && (
                    <button 
                        type="button" 
                        className="enemy-edit-btn"
                        onClick={() => onEdit(enemy)}
                        aria-label="Modifier cet ennemi"
                    >
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button 
                        type="button" 
                        className="enemy-delete-btn"
                        onClick={() => onDelete(enemy.id)}
                        aria-label="Supprimer cet ennemi"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default EnemyCard;
