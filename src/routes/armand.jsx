import { useState, useEffect, use } from "react";
import Logo from "../assets/global/logo.png";
import Loader from "../components/Loader";
import InventoryTrigger from "../components/triggers/InventoryTrigger";
import Inventory from "../components/Inventory";
import StateHealth from "../components/StateHealth";
import Identity from "../components/Identity";
import Features from "../components/Features";
import Notes from "../components/Notes";
import Stuff from "../components/Stuff";

const ArmandPage = () => {
    const [identity, setIdentity] = useState([]);
    const [features, setFeatures] = useState([]);
    const [health, setHealth] = useState([]);
    const [stuff, setStuff] = useState([]);
    const [state, setState] = useState("");
    const [notes, setNotes] = useState("");
    const [inspiration, setInspiration] = useState(false);
    const [agentType, setAgentType] = useState("Novice");
    const [inventory, setInventory] = useState({});

    // Chargement des données par catégories 
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/armand`)
        .then(res => res.json())
        .then(data => {
            setIdentity(data.identity);
            setFeatures(data.features);
            setStuff(data.stuff);
            setHealth(data.health);
            setNotes(data.notes || "");
            setInspiration(data.inspiration || false);
            setAgentType(data.agentType || "");
            setInventory(data.inventory || "");
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
    }

    const onFeatureChange = (e) => {
        // On incrémente ou décrémente l'input number
        setFeatures((prevFeatures) => ({
            ...prevFeatures, // renvoit le reste du tableau
            [e.target.name]: Number(e.target.value) // met à jour la valeur de l'input
        }));
    };

    const onAmmoChange = (e) => {
        const index = e.target.getAttribute('data-index');
        const key = e.target.getAttribute('data-key');

        setStuff((prevStuff) => {
            const newStuff = [...prevStuff];
            newStuff[index] = {
                ...newStuff[index],
                ammo: {
                    ...newStuff[index].ammo,
                    [key]: !newStuff[index].ammo[key]
                }
            };
            return newStuff;
        });
    }

    const inventoryChange = (e) => {
        const key = e.target.getAttribute('data-key');
        // J'ai besoin de set mes champs d'inventaire
        setInventory((prevInventory) => ({
            ...prevInventory, // renvoit le reste du tableau
            [key]: e.target.value // met à jour la valeur de l'input
        }));
    }


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
            fetch(`${process.env.REACT_APP_BASE_URL}/armand`, {
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
                    agentType,
                    inventory
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
    }, [identity, features, health, stuff, notes, inspiration, agentType, inventory]);
    
    if (
        identity.length === 0 ||
        features.length === 0 ||
        health.length === 0 ||
        stuff.length === 0
    ) {
        return (
            <main className="main">
                <Loader />
            </main>
        )
    }   else {
        return (
            <main className="main">
                <div className="container">
                    <InventoryTrigger />
                    <Inventory 
                        inventory={inventory} 
                        inventoryChange={inventoryChange}
                    />
                    
                    <div className="wrapper">
                        <img src={Logo} alt="" className="background_aca" />
                        <div className="main_info">
                            <div className="section section_first">
                                <img src={identity.image} className="pic" alt="vera pic" />
                                <StateHealth onChange={onOptionChange} health={health}/>
                            </div>
                            <div className="section section_second">
                                <div className="grid">
                                    <Identity 
                                        setAgentType={setAgentType} 
                                        agentType={agentType} 
                                        identity={identity} 
                                        setInspiration={setInspiration} 
                                        inspiration={inspiration}
                                    />
                                    {/* Renvoit une erreur dans la console - à étudier https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable */}
                                    <Features 
                                        onFeatureChange={onFeatureChange} 
                                        features={features}
                                    />
                                </div>
                                <Notes onNotesChange={onNotesChange} notes={notes}/>
                            </div>
                        </div>
                        <Stuff stuff={stuff} onAmmoChange={onAmmoChange}/>
                    </div>
                </div>
            </main>
        )
    }
}

export default ArmandPage;
