const Features = ({onFeatureChange, features}) => {
    return (
        <div className="card features">
            <h3>Caratéristiques</h3>
            <div>
                <label>Affinité</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.affinity : ""} name="affinity" id="affinity" />
            </div>
            <div>
                <label>Savoir</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.knowledge : ""} name="knowledge" id="knowledge" />
            </div>
            <div>
                <label>Charisme</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.charism : ""} name="charism" id="charism" />
            </div>
            <div>
                <label>Intuition</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.intuition : ""} name="intuition" id="intuition" />
            </div>
            <div>
                <label>Technique</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.technical : ""} name="technical" id="technical" />
            </div>
            <div>
                <label>Action</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.action : ""} name="action" id="action" />
            </div>
        </div>
    )
}

export default Features
