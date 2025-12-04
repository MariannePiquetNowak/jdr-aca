import React from 'react'

const StateHealth = ({onChange, health}) => {
  const healthStates = ['Blessure grave', 'Blessure sévère', 'Blessure légère', 'Forme'];
  
  // Déterminer la valeur actuelle du slider (0-3)
  let currentValue = 3; // Forme par défaut
  if (health.seriousInjury) currentValue = 0;
  else if (health.severeInjury) currentValue = 1;
  else if (health.minorInjury) currentValue = 2;
  
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    // Mapper les valeurs du slider aux noms attendus par le parent
    const nameMapping = ['seriousInjury', 'severeInjury', 'minorInjury', 'forme'];
    const event = {
      target: {
        value: healthStates[value],
        name: nameMapping[value]
      }
    };
    onChange(event);
  };
  
  return (
    <div className="card state" >
        <h3>État de santé</h3>
        <div className="health-slider-container">
            <div className="health-slider-label">{healthStates[currentValue]}</div>
            <input 
              type="range" 
              min="0" 
              max="3" 
              value={currentValue}
              onChange={handleSliderChange}
              className="health-slider"
              data-value={currentValue}
            />
            <div className="health-slider-markers">
              <span>Grave</span>
              <span>Sévère</span>
              <span>Légère</span>
              <span>Forme</span>
            </div>
        </div>
    </div>
  )
}

export default StateHealth;
