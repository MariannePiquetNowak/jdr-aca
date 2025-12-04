import React, {useEffect, useState, useCallback, memo} from 'react';
import '../styles/components/_mj.scss';
import FeaturesMJ from '../components/FeaturesMJ';
import IdentityMJ from '../components/IdentityMJ';
import StateHealthMj from '../components/StateHealthMj';
import Stuff from '../components/Stuff';

const PLAYERS = [
    { key: 'armand', label: 'Armand' },
    { key: 'bernard', label: 'Bernard' },
    { key: 'etienne', label: 'Etienne' },
    { key: 'stephane', label: 'Stephane' },
    { key: 'theodore', label: 'Théodore' },
    { key: 'valentine', label: 'Valentine' },
    { key: 'vera', label: 'Vera' },
];

// Composant mémoïsé pour l'indicateur de sauvegarde
const SaveIndicator = memo(({ status }) => (
    <div className={`save-indicator ${status}`} aria-hidden>
        {status === 'saving' ? (
            <>
                <span className="spinner" aria-hidden></span>
                <span>Sauvegarde…</span>
            </>
        ) : status === 'saved' ? (
            'Sauvegardé'
        ) : status === 'error' ? (
            'Erreur de sauvegarde'
        ) : null}
    </div>
));

// Composant PlayerPanel mémoïsé pour éviter les re-renders inutiles
const PlayerPanel = memo(({ 
    playerKey, 
    data, 
    status,
    onFeatureChange,
    onInventoryChange,
    onIdentityChange,
    onInspirationToggle,
    onHealthChange,
    onAmmoChange,
    onNotesChange
}) => {
    return (
        <section className="player-panel">
            <div className="panel-header">
                <h3>{data.identity?.name || playerKey}</h3>
                <div style={{display:'flex', gap: '.5rem', alignItems:'center'}}>
                    <SaveIndicator status={status} />
                </div>
            </div>
            <div className="panel-body">
                <IdentityMJ
                    identity={data.identity || {}}
                    setAgentType={onIdentityChange}
                    agentType={data.agentType || ''}
                    setInspiration={onInspirationToggle}
                    inspiration={data.inspiration || false}
                />

                <FeaturesMJ features={data.features || {}} onFeatureChange={onFeatureChange} />

                <StateHealthMj health={data.health || {}} onChange={onHealthChange} />

                <div className="card inventory-inline">
                    <h3>Inventaire</h3>
                    {data.inventory && Object.entries(data.inventory).length > 0 ? (
                        Object.entries(data.inventory).map(([k,v]) => (
                            <div key={k}>
                                <label>{k}</label>
                                <input value={v} data-key={k} onChange={onInventoryChange} />
                            </div>
                        ))
                    ) : (
                        <p>Aucun objet</p>
                    )}
                </div>

                <Stuff stuff={data.stuff || []} onAmmoChange={onAmmoChange} />

                <div className="card notes">
                    <h3>Notes</h3>
                    <textarea value={data.notes || ''} onChange={onNotesChange} />
                </div>
            </div>
        </section>
    );
});

const MJ = ({ title = "Table du MJ — Gestion des personnages" }) => {
    const [selected, setSelected] = useState([]); // Tableau des clés des joueurs sélectionnés
    const [playersData, setPlayersData] = useState({}); // clé -> données
    const API = process.env.REACT_APP_BASE_URL_API;
    // Timers configurables pour que les tests puissent accélérer les choses
    // Utiliser la coalescence nulle pour qu'une valeur '0' soit respectée (0 est un override valide dans les tests)
    const SAVE_DEBOUNCE_MS = Number(process.env.REACT_APP_SAVE_DEBOUNCE_MS ?? 450); // Garder le timer de sauvegarde idle inchangé
    const QUICK_SAVE_MS = Number(process.env.REACT_APP_QUICK_SAVE_MS ?? 200);
    const IDLE_CLEAR_MS = Number(process.env.REACT_APP_SAVE_IDLE_MS ?? 1800);
    const [saveStatus, setSaveStatus] = useState({}); // clé -> 'Inactif'|'Sauvegarde...'|'Sauvegardé'|'Erreur'
    const saveTimers = React.useRef({});
    const playersDataRef = React.useRef(playersData);
    
    // Garder la ref synchronisée avec l'état
    React.useEffect(() => {
        playersDataRef.current = playersData;
    }, [playersData]);
    
    // Fonctionnalité de dock supprimée - pas d'état docké

    // Basculer la sélection
    const togglePlayer = (key) => {
        setSelected((prev) => {
            if (prev.includes(key)) return prev.filter(k => k !== key);
            return [...prev, key];
        });
    };

    // Récupérer les données d'un joueur (et les stocker dans playersData)
    // Mémoïser avec useCallback pour que la vérification des dépendances d'ESLint soit satisfaite
    const fetchPlayer = React.useCallback((key) => {
        if (!API) return;
        fetch(`${API}/${key}`)
        .then(res => res.json())
        .then(data => {
            setPlayersData(prev => ({...prev, [key]: data}));
        })
        .catch(() => {
            // Fallback : forme vide
            setPlayersData(prev => ({...prev, [key]: { identity: {}, features: {}, health: {}, stuff: [], inventory: {}, notes: '', inspiration: false, agentType: '' }}));
        });
    }, [API]);

    // Chaque fois qu'un joueur est sélectionné et qu'on ne l'a pas encore, le récupérer
    useEffect(() => {
        selected.forEach(k => {
            if (!playersData[k]) fetchPlayer(k);
        });
    }, [selected, playersData, fetchPlayer]);

    // Fonction helper pour sauvegarder les données mises à jour d'un joueur vers l'API avec suivi du statut
    const savePlayer = useCallback(async (key, explicitPayload) => {
        const payload = explicitPayload || playersDataRef.current[key];
        if (!API || !key || !payload) return;
        // Définir comme en cours de sauvegarde
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));
        try {
            await fetch(`${API}/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setSaveStatus(prev => ({...prev, [key]: 'saved'}));
            // Effacer le label "sauvegardé" après un court délai
            if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
            saveTimers.current[key] = setTimeout(() => {
                setSaveStatus(prev => ({...prev, [key]: 'idle'}));
            }, IDLE_CLEAR_MS);
        } catch (err) {
            setSaveStatus(prev => ({...prev, [key]: 'error'}));
            console.error('Save failed', err);
        }
    }, [API, IDLE_CLEAR_MS]);

    // Fonctionnalité de dock supprimée

    // Fonction helper pour déclencher une sauvegarde avec debounce
    const triggerSave = useCallback((key, data) => {
        setSaveStatus(s => ({...s, [key]: 'saving'}));
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        saveTimers.current[key] = setTimeout(() => savePlayer(key, data), SAVE_DEBOUNCE_MS);
    }, [SAVE_DEBOUNCE_MS, savePlayer]);

    const triggerQuickSave = useCallback((key, data) => {
        setSaveStatus(s => ({...s, [key]: 'saving'}));
        setTimeout(() => savePlayer(key, data), QUICK_SAVE_MS);
    }, [QUICK_SAVE_MS, savePlayer]);

    // Créer des handlers stables pour chaque joueur avec useMemo
    const playerHandlers = React.useMemo(() => {
        const handlers = {};
        selected.forEach(key => {
            handlers[key] = {
                onFeatureChange: (e) => {
                    const name = e.target.name;
                    const value = Number(e.target.value);
                    
                    setPlayersData(prev => {
                        const prevPlayer = prev[key] || {};
                        const p = {...prevPlayer, features: {...(prevPlayer.features || {}), [name]: value}};
                        
                        // Sauvegarder après la mise à jour
                        setTimeout(() => triggerSave(key, p), 0);
                        
                        return {...prev, [key]: p};
                    });
                },
                onInventoryChange: (e) => {
                    const k = e.target.getAttribute('data-key');
                    const value = e.target.value;
                    
                    setPlayersData(prev => {
                        const currentInv = prev[key] || {};
                        const pInv = {...currentInv, inventory: {...(currentInv.inventory || {}), [k]: value}};
                        
                        setTimeout(() => triggerSave(key, pInv), 0);
                        
                        return {...prev, [key]: pInv};
                    });
                },
                onIdentityChange: (newAgentType) => {
                    setPlayersData(prev => {
                        const currentId = prev[key] || {};
                        const pId = {...currentId, agentType: newAgentType};
                        
                        setTimeout(() => triggerSave(key, pId), 0);
                        
                        return {...prev, [key]: pId};
                    });
                },
                onInspirationToggle: () => {
                    setPlayersData(prev => {
                        const current = prev[key] || {};
                        const p = {...current, inspiration: !current.inspiration};
                        
                        setTimeout(() => triggerSave(key, p), 0);
                        
                        return {...prev, [key]: p};
                    });
                },
                onHealthChange: (e) => {
                    const name = e.target.name;
                    
                    setPlayersData(prev => {
                        const current = prev[key] || {};
                        const p = {...current, health: { forme: false, minorInjury: false, severeInjury: false, seriousInjury: false }};
                        p.health[name] = true;
                        
                        setTimeout(() => triggerSave(key, p), 0);
                        
                        return {...prev, [key]: p};
                    });
                },
                onAmmoChange: (e) => {
                    const index = Number(e.target.getAttribute('data-index'));
                    const ammoKey = e.target.getAttribute('data-key');
                    
                    setPlayersData(prev => {
                        const current = prev[key] || {};
                        const p = {...current};
                        p.stuff = p.stuff ? [...p.stuff] : [];
                        const item = {...(p.stuff[index] || {})};
                        item.ammo = {...(item.ammo || {})};
                        item.ammo[ammoKey] = !item.ammo[ammoKey];
                        p.stuff[index] = item;
                        
                        setTimeout(() => triggerQuickSave(key, p), 0);
                        
                        return {...prev, [key]: p};
                    });
                },
                onNotesChange: (e) => {
                    const value = e.target.value;
                    
                    setPlayersData(prev => {
                        const current = prev[key] || {};
                        const p = {...current, notes: value};
                        
                        setTimeout(() => triggerQuickSave(key, p), 0);
                        
                        return {...prev, [key]: p};
                    });
                }
            };
        });
        return handlers;
    }, [selected, triggerSave, triggerQuickSave]);

    return (
        <main className="main mj-fullwidth">
            <div className="container">
                <h2>{title}</h2>

                <div className="player-selectors" style={{display:'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                    {PLAYERS.map(p => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => togglePlayer(p.key)}
                            aria-pressed={selected.includes(p.key)}
                            className={`player-btn ${selected.includes(p.key) ? 'is-selected' : ''}`}
                            style={{padding: '.5rem 1rem', borderRadius: 6, border: '1px solid rgba(0,0,0,.12)', cursor: 'pointer'}}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="mj-layout">
                    <div style={{flex: 1}}>
                        <div className={`players-grid mj-grid ${selected.length === 1 ? 'one' : selected.length === 2 ? 'two' : 'many'}`}>
                            {selected.length === 0 ? (
                                <p>Sélectionne un ou plusieurs joueurs pour voir leur fiche.</p>
                            ) : (
                                selected.map(k => (
                                    <PlayerPanel 
                                        key={k}
                                        playerKey={k}
                                        data={playersData[k] || {}}
                                        status={saveStatus[k] || 'idle'}
                                        {...(playerHandlers[k] || {})}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* dock removed - all panels render in the main grid */}
                </div>
            </div>
        </main>
    );
};

export default MJ;