import React from 'react'

const StateHealth = ({onChange, health}) => {
  return (
    <div className="card state" >
        <h3>Etat de santé</h3>
        <div className="input_rb_ckb">
            <label htmlFor="forme">Forme</label>
            <input type="radio" onChange={onChange} value="Forme" checked={health.forme === true} name="forme" id="forme" />
        </div>
        <div className="input_rb_ckb">
            <label htmlFor="minorInjury">Blessure légère</label>
            <input type="radio" onChange={onChange} value="Blessure légère" checked={health.minorInjury === true} name="minorInjury" id="minorInjury" />
        </div>
        <div className="input_rb_ckb">
            <label htmlFor="severeInjury">Blessure sévère</label>
            <input type="radio" onChange={onChange} value="Blessure sévère" checked={health.severeInjury === true} name="severeInjury" id="severeInjury" />
        </div>
        <div className="input_rb_ckb">
            <label htmlFor="seriousInjury">Blessure grave</label>
            <input type="radio" onChange={onChange} value="Blessure grave" checked={health.seriousInjury === true} name="seriousInjury" id="seriousInjury" />
        </div>
    </div>
  )
}

export default StateHealth;
