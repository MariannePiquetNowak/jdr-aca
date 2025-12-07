import { useEffect } from "react";

const Features = ({onFeatureChange, features}) => {

    const addTooltipTrigger = () => {
        const featureItems = document.querySelectorAll(".feature_item");
        // Renvoit un tableau avec les inputs
        featureItems.forEach(item => {
            if(features.stars.type === item.name) {
                let tooltip = "<span class='features__tooltip'></span>";
                item.previousSibling.innerHTML = `${features.stars.name} ${tooltip}`;
            }
        });
    }

    const addTooltipBox = () => {
        let tooltip = document.querySelector('.features__tooltip');
        let tooltipBox = "<div class='tooltip_box hidden'></div>";
        if(!tooltip || tooltip != undefined || tooltip != null) {
            tooltip.innerHTML = tooltipBox;       
        }
    }

    const toggleTooltipBox = () => {
        let tooltip = document.querySelector(".features__tooltip");
        const tooltipBox = document.querySelector(".tooltip_box");

        if(tooltipBox) {
            tooltip.addEventListener('mouseover', () => {
                tooltipBox.classList.remove("hidden");
                tooltipBox.classList.add("visible");
            });

           tooltip.addEventListener('mouseout', () => {
                tooltipBox.classList.remove("visible");
                tooltipBox.classList.add("hidden");
            }); 
        }
    }

    const displayTooltipContent = () => {
        const tooltipBox = document.querySelector(".tooltip_box");
        features.stars.description != null || features.stars.description != undefined ? tooltipBox.innerHTML = features.stars.description : tooltipBox.innerHTML = "Pas de description pour cette caractéristique."
    }

    useEffect(() => {
        addTooltipTrigger();
        // Je retarde la dispo de 1/2 seconde pour être sur d'avoir le span features__tooltip
        setTimeout(() => { addTooltipBox() }, 250);
        setTimeout(() => { 
            toggleTooltipBox(); 
            displayTooltipContent()
        }, 350);
    }, [])

    return (
        <div className="card features">
            <h3>Caratéristiques</h3>
            <div>
                <label>Affinité</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.affinity : ""} name="affinity" id="affinity" />
            </div>
            <div>
                <label>Savoir</label>
                <input className="feature_item" type="number" onChange={onFeatureChange} value={features ? features.knowledge : ""} name="knowledge" id="knowledge" />
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