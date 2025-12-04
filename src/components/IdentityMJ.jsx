const IdentityMJ = ({setAgentType, agentType, identity, setInspiration, inspiration}) => {
  return (
    <div className="card identity">
        <h3>Identité</h3>
        <div className="sub_section">
            <div>
                <p className="name_pj">{identity.name}</p> 
                <label>Agent</label>
                <select name="agent" id="agent" value={agentType} onChange={(e) => setAgentType(e.target.value)}>
                    <option value="Novice">Novice</option>
                    <option value="Confirmé">Confirmé</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Spécialiste">Spécialiste</option>
                    <option value="Expert">Expert</option>
                    <option value="Maître">Maître</option>
                </select>
            </div>
            <p>Style : {identity.style}</p>
            <p>Signe distinctif : {identity.distinctiveSign}</p>
            <div>
                <label>Inspiration</label>
                <input type="checkbox" checked={inspiration} onChange={() => setInspiration(!inspiration)} />
            </div>
        </div>
    </div>
  )
}

export default IdentityMJ;
