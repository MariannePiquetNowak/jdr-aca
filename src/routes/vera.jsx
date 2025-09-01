import { useState, useEffect, use } from "react";
import Logo from "../assets/global/logo.png";
import VeraPic from "../assets/vera/Vera_portrait.jpg";

const VeraPage = () => {
    const [identity, setIdentity] = useState([]);
    const [features, setFeatures] = useState([]);
    const [health, setHealth] = useState([]);
    const [stuff, setStuff] = useState([]);
    const [state, setState] = useState("");
    const [notes, setNotes] = useState("");
    const [inspiration, setInspiration] = useState(false);
    const [agentType, setAgentType] = useState("Novice");

        // Chargement des données par catégories 
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/vera`)
        .then(res => res.json())
        .then(data => {
            setIdentity(data.identity);
            setFeatures(data.features);
            setStuff(data.stuff);
            setHealth(data.health);
            setNotes(data.notes || "");
            setInspiration(data.inspiration || false);
            setAgentType(data.agentType || "");
        })
    }, []);

    const onOptionChange = (e) => {
        if(e.target.name === "forme") {
            setState("forme");
        } else if (e.target.name === "minorInjury") {
            setState("minorInjury")
        } else if (e.target.name === "severeInjury") {
            setState("severeInjury")
        } else if (e.target.name === "seriousInjury") { 
            setState("seriousInjury")
        } 
    }

    const onNotesChange  = (e) => {
        setNotes(e.target.value);
        // console.log(notes)
    }

    const onFeatureChange = (e) => {
        // On incrémente ou décrémente l'input number
        setFeatures((prevFeatures) => ({
            ...prevFeatures, // renvoit le reste du tableau
            [e.target.name]: Number(e.target.value) // met à jour la valeur de l'input
        }));
    };

    // lorsque state change, update health
    useEffect(() => {
        if (state === "forme") {
            setHealth({
                "forme": true,
                "minorInjury": false,
                "severeInjury": false,
                "seriousInjury": false
            });
        } else if (state === "minorInjury") {
            setHealth({
                "forme": false,
                "minorInjury": true,
                "severeInjury": false,
                "seriousInjury": false
            });
        } else if (state === "severeInjury") {
            setHealth({
                "forme": false,
                "minorInjury": false,
                "severeInjury": true,
                "seriousInjury": false
            });
        } else if (state === "seriousInjury") {
            setHealth({
                "forme": false,
                "minorInjury": false,
                "severeInjury": false,
                "seriousInjury": true
            });
        }
    }, [state]);  

    // On renvoit les données de santé à l'API
    useEffect(() => {
        if (
            identity && Object.keys(identity).length > 0 &&
            features && Object.keys(features).length > 0 &&
            health && Object.keys(health).length > 0 &&
            stuff && stuff.length > 0 
        ) {
            fetch(`${process.env.REACT_APP_BASE_URL}/vera`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    identity,
                    features,
                    health,
                    stuff,
                    notes,
                    inspiration,
                    agentType
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }, [features, health, stuff, notes, inspiration, agentType]);

    //console.log("### health ###", health)
    
    return (
        <main className="main">
            <div className="container">
                <div className="wrapper">
                    <img src={Logo} alt="" className="background_aca" />
                    <div className="main_info">
                        <div className="section section_first">
                            <img src={VeraPic} className="pic" alt="vera pic" />
                            <div className="card state" >
                                <h3>Etat de santé</h3>
                                <div>
                                    <label htmlFor="forme">Forme</label>
                                    <input type="radio" onChange={onOptionChange} value="Forme" checked={health.forme === true} name="forme" id="forme" />
                                </div>
                                <div>
                                    <label htmlFor="minorInjury">Blessure légère</label>
                                    <input type="radio" onChange={onOptionChange} value="Blessure légère" checked={health.minorInjury === true} name="minorInjury" id="minorInjury" />
                                </div>
                                <div>
                                    <label htmlFor="severeInjury">Blessure sévère</label>
                                    <input type="radio" onChange={onOptionChange} value="Blessure sévère" checked={health.severeInjury === true} name="severeInjury" id="severeInjury" />
                                </div>
                                <div>
                                    <label htmlFor="seriousInjury">Blessure grave</label>
                                    <input type="radio" onChange={onOptionChange} value="Blessure grave" checked={health.seriousInjury === true} name="seriousInjury" id="seriousInjury" />
                                </div>
                            </div>
                        </div>
                        <div className="section section_second">
                            <div className="grid">
                                <div className="card identity">
                                    <h3>Identité</h3>
                                    <div className="sub_section">
                                        <div>
                                            <p className="name_pj">{identity.name}</p> 
                                            <label>Agent :</label>
                                            <select name="agent" id="agent" value={agentType} onChange={(e) => setAgentType(e.target.value)}>
                                                <option value="Novice">Novice</option>
                                                <option value="Expert">Expert</option>
                                                <option value="Maître">Maître</option>
                                            </select>
                                        </div>
                                        <p>Paranormal : {identity.paranormal}</p>
                                        <p>Style : {identity.style}</p>
                                        <p>Signe distinctif : {identity.distinctiveSign}</p>
                                        <div>
                                            <label>Inspiration</label>
                                            <input type="checkbox" checked={inspiration} onChange={() => setInspiration(!inspiration)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="card features">
                                    <h3>Caratéristiques</h3>
                                    <div>
                                        <label>Affinité</label>
                                        <input type="number" onChange={onFeatureChange} value={features.affinity} name="affinity" id="affinity" />
                                    </div>
                                    <div>
                                        <label>Savoir</label>
                                        <input type="number" onChange={onFeatureChange} value={features.knowledge} name="knowledge" id="knowledge" />
                                    </div>
                                    <div>
                                        <label>Charisme</label>
                                        <input type="number" onChange={onFeatureChange} value={features.charism} name="charism" id="charism" />
                                    </div>
                                    <div>
                                        <label>Intuition</label>
                                        <input type="number" onChange={onFeatureChange} value={features.intuition} name="intuition" id="intuition" />
                                    </div>
                                    <div>
                                        <label>Technique</label>
                                        <input type="number" onChange={onFeatureChange} value={features.technical} name="technical" id="technical" />
                                    </div>
                                    <div>
                                        <label>Action</label>
                                        <input type="number" onChange={onFeatureChange} value={features.action} name="action" id="action" />
                                    </div>
                                </div>
                            </div>
                            <div className="card notes">
                                <label>Notes</label>
                                <textarea onChange={onNotesChange} value={notes} name="notes" id="notes"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="section section_object">
                        {
                            stuff?.map((st, index) => {
                                let title = "Nom de l'artefact";
                                
                                return (
                                    <div className="card object" key={index}>
                                        <h3>{st.name.length === 0 ? title : st.name}</h3>
                                        <img src={st.image} width="82" height="82" />
                                        <div>
                                            <h4>Description</h4>
                                            <p>{st.description}</p>
                                        </div>
                                        <div>
                                            <h4>Effets</h4>
                                            <p dangerouslySetInnerHTML={{ __html: st.effect}}></p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </main>
    )
}

export default VeraPage;
