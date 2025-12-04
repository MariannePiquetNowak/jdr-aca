import React from 'react';

const ObjetCard = ({ objet, onDelete, onEdit }) => {
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
