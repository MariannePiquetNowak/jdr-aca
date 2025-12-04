import React from 'react';

const EnemyCard = ({ enemy, onDelete, onEdit }) => {
    // Generate stars based on danger level (1-10)
    const renderStars = (level) => {
        return '★'.repeat(Math.min(Math.max(level, 1), 10));
    };

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
