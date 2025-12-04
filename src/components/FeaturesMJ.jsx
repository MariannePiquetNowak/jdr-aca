const FeaturesMJ = ({onFeatureChange, features}) => {

    const handleIncrement = (name) => {
        const currentValue = features?.[name] || 0;
        const event = {
            target: {
                name: name,
                value: currentValue + 1
            }
        };
        onFeatureChange(event);
    };

    const handleDecrement = (name) => {
        const currentValue = features?.[name] || 0;
        const event = {
            target: {
                name: name,
                value: currentValue - 1
            }
        };
        onFeatureChange(event);
    };

    const featuresList = [
        { name: 'affinity', label: 'Affinité' },
        { name: 'knowledge', label: 'Savoir' },
        { name: 'charism', label: 'Charisme' },
        { name: 'intuition', label: 'Intuition' },
        { name: 'technical', label: 'Technique' },
        { name: 'action', label: 'Action' }
    ];

    return (
        <div className="card features">
            <h3>Caractéristiques</h3>
            {featuresList.map(feature => (
                <div key={feature.name} className="feature-row">
                    <label>{feature.label}</label>
                    <div className="feature-controls">
                        <button 
                            type="button"
                            className="feature-btn feature-btn-minus"
                            onClick={() => handleDecrement(feature.name)}
                        >
                            −
                        </button>
                        <span className="feature-value">{features?.[feature.name] || 0}</span>
                        <button 
                            type="button"
                            className="feature-btn feature-btn-plus"
                            onClick={() => handleIncrement(feature.name)}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FeaturesMJ;
