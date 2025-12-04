import React from 'react';

const PNJCard = ({ pnj, onDelete, onEdit }) => {
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
