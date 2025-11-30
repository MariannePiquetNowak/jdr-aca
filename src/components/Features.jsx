const Features = ({onFeatureChange, features}) => {

    const featureItems = document.querySelectorAll(".feature_item");
    // Renvoit un tableau avec les inputs
    featureItems.forEach(item => {
        if(features.stars.type === item.name) {
            let tooltip = "<a href='#' className='tooltip_feature'>*</a>";
            item.previousSibling.innerHTML = `${features.stars.name} ${tooltip}`;
        }
    })

    return (
        <div className="card features">
            <h3>Caratéristiques</h3>
            <div>
                <label>Affinité</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.affinity : ""} name="affinity" id="affinity" />
            </div>
            <div>
                <label>Savoir</label>
                <input type="number" onChange={onFeatureChange} value={features ? features.knowledge : ""} name="knowledge" id="knowledge" />
            </div>
            <div>
                <label>Charisme</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.charism : ""} name="charism" id="charism" />
            </div>
            <div>
                <label>Intuition</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.intuition : ""} name="intuition" id="intuition" />
            </div>
            <div>
                <label>Technique</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.technical : ""} name="technical" id="technical" />
            </div>
            <div>
                <label>Action</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.action : ""} name="action" id="action" />
            </div>
        </div>
    )
}

export default Features
