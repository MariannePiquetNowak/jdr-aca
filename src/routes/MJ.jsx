import React, {useEffect, useState} from 'react';
import '../styles/components/_mj.scss';
import Features from '../components/Features';
import Identity from '../components/Identity';
import StateHealth from '../components/StateHealth';
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

const MJ = () => {
    const [selected, setSelected] = useState([]); // array of player keys
    const [playersData, setPlayersData] = useState({}); // key -> data
    const API = process.env.REACT_APP_BASE_URL_API;
    // configurable timers so tests can speed things up
    // use nullish coalescing so a value of '0' is respected (0 is a valid override in tests)
    const SAVE_DEBOUNCE_MS = Number(process.env.REACT_APP_SAVE_DEBOUNCE_MS ?? 450); // keep save idle timer unchanged
    const QUICK_SAVE_MS = Number(process.env.REACT_APP_QUICK_SAVE_MS ?? 200);
    const IDLE_CLEAR_MS = Number(process.env.REACT_APP_SAVE_IDLE_MS ?? 1800);
    const [saveStatus, setSaveStatus] = useState({}); // key -> 'Inactif'|'Sauvegarde...'|'Sauvegardé'|'Erreur'
    const saveTimers = React.useRef({});
    // removed dock feature - no docked state

    // toggle selection
    const togglePlayer = (key) => {
        setSelected((prev) => {
            if (prev.includes(key)) return prev.filter(k => k !== key);
            return [...prev, key];
        });
    };

    // fetch a player's data (and store into playersData)
    // memoize with useCallback so ESLint's hook dependency check is satisfied
    const fetchPlayer = React.useCallback((key) => {
        if (!API) return;
        fetch(`${API}/${key}`)
        .then(res => res.json())
        .then(data => {
            setPlayersData(prev => ({...prev, [key]: data}));
        })
        .catch(() => {
            // fallback: empty shape
            setPlayersData(prev => ({...prev, [key]: { identity: {}, features: {}, health: {}, stuff: [], inventory: {}, notes: '', inspiration: false, agentType: '' }}));
        });
    }, [API]);

    // whenever a player is selected that we don't yet have, fetch them
    useEffect(() => {
        selected.forEach(k => {
            if (!playersData[k]) fetchPlayer(k);
        });
    }, [selected, playersData, fetchPlayer]);

    // helper to save updated player data to API with status tracking
    const savePlayer = async (key, explicitPayload) => {
        const payload = explicitPayload || playersData[key];
        if (!API || !key || !payload) return;
        // set saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));
        try {
            await fetch(`${API}/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setSaveStatus(prev => ({...prev, [key]: 'saved'}));
            // clear saved label after a short delay
            if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
            saveTimers.current[key] = setTimeout(() => {
                setSaveStatus(prev => ({...prev, [key]: 'idle'}));
            }, IDLE_CLEAR_MS);
        } catch (err) {
            setSaveStatus(prev => ({...prev, [key]: 'error'}));
            console.error('Save failed', err);
        }
    };

    // dock feature removed

    // generic update helpers — each returns a handler bound to the player key
    const makeFeatureChange = (key) => (e) => {
        // inspect playersData at change time
        const name = e.target.name;
        const value = Number(e.target.value);
        // mark as saving immediately for responsive feedback
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        // build the new player state from current playersData so we can save immediately
        const prevPlayer = playersData[key] || {};
        const p = {...prevPlayer, features: {...(prevPlayer.features || {}), [name]: value}};
        setPlayersData(prev => ({...prev, [key]: p}));
        // optimistic save
        // debounce saves: clear existing timer and set a new one
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        if (SAVE_DEBOUNCE_MS <= 0) {
            // immediate save for tests or very low debounce
            savePlayer(key, p); // pass explicit payload
        } else {
            saveTimers.current[key] = setTimeout(() => savePlayer(key), SAVE_DEBOUNCE_MS);
        }
    };

    const makeInventoryChange = (key) => (e) => {
        const k = e.target.getAttribute('data-key');
        const value = e.target.value;
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const currentInv = playersData[key] || {};
        const pInv = {...currentInv, inventory: {...(currentInv.inventory || {}), [k]: value}};
        setPlayersData(prev => ({...prev, [key]: pInv}));
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        if (SAVE_DEBOUNCE_MS <= 0) {
            savePlayer(key, pInv);
        } else {
            saveTimers.current[key] = setTimeout(() => savePlayer(key), SAVE_DEBOUNCE_MS);
        }
    };

    const makeIdentityChange = (key) => (newAgentType) => {
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const currentId = playersData[key] || {};
        const pId = {...currentId, agentType: newAgentType};
        setPlayersData(prev => ({...prev, [key]: pId}));
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        if (SAVE_DEBOUNCE_MS <= 0) {
            savePlayer(key, pId);
        } else {
            saveTimers.current[key] = setTimeout(() => savePlayer(key), SAVE_DEBOUNCE_MS);
        }
    };

    const makeInspirationToggle = (key) => () => {
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const current = playersData[key] || {};
        const p = {...current, inspiration: !current.inspiration};
        setPlayersData(prev => ({...prev, [key]: p}));
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        if (SAVE_DEBOUNCE_MS <= 0) {
            savePlayer(key, p);
        } else {
            saveTimers.current[key] = setTimeout(() => savePlayer(key), SAVE_DEBOUNCE_MS);
        }
    };

    const makeHealthChange = (key) => (e) => {
        // e.target.name will be one of forme/minorInjury/severeInjury/seriousInjury
        const name = e.target.name;
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const current = playersData[key] || {};
        const p = {...current, health: { forme: false, minorInjury: false, severeInjury: false, seriousInjury: false }};
        p.health[name] = true;
        setPlayersData(prev => ({...prev, [key]: p}));
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        if (SAVE_DEBOUNCE_MS <= 0) {
            savePlayer(key, p);
        } else {
            saveTimers.current[key] = setTimeout(() => savePlayer(key), SAVE_DEBOUNCE_MS);
        }
    };

    const makeAmmoChange = (key) => (e) => {
        const index = Number(e.target.getAttribute('data-index'));
        const ammoKey = e.target.getAttribute('data-key');
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const current = playersData[key] || {};
        const p = {...current};
        p.stuff = p.stuff ? [...p.stuff] : [];
        const item = {...(p.stuff[index] || {})};
        item.ammo = {...(item.ammo || {})};
        item.ammo[ammoKey] = !item.ammo[ammoKey];
        p.stuff[index] = item;
        setPlayersData(prev => ({...prev, [key]: p}));
        if (QUICK_SAVE_MS <= 0) {
            savePlayer(key, p);
        } else {
            setTimeout(() => savePlayer(key), QUICK_SAVE_MS);
        }
    };

    const makeNotesChange = (key) => (e) => {
        const value = e.target.value;
        // mark saving
        setSaveStatus(prev => ({...prev, [key]: 'saving'}));

        const current = playersData[key] || {};
        const p = {...current, notes: value};
        setPlayersData(prev => ({...prev, [key]: p}));
        if (QUICK_SAVE_MS <= 0) {
            savePlayer(key, p);
        } else {
            setTimeout(() => savePlayer(key), QUICK_SAVE_MS);
        }
    };

    // helper to render player's content panel
    const PlayerPanel = ({playerKey}) => {
        const data = playersData[playerKey] || {};
        const status = saveStatus[playerKey] || 'idle';

            return (
                <section className="player-panel" key={playerKey}>
                <div className="panel-header">
                    <h3>{data.identity?.name || playerKey}</h3>
                    <div style={{display:'flex', gap: '.5rem', alignItems:'center'}}>
                        {/* dock functionality removed */}
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
                    </div>
                </div>
                <div className="panel-body">
                    <Identity
                        identity={data.identity || {}}
                        setAgentType={(val) => makeIdentityChange(playerKey)(val)}
                        agentType={data.agentType || ''}
                        setInspiration={makeInspirationToggle(playerKey)}
                        inspiration={data.inspiration || false}
                    />

                    <Features features={data.features || {}} onFeatureChange={makeFeatureChange(playerKey)} />

                    <StateHealth health={data.health || {}} onChange={makeHealthChange(playerKey)} />

                    <div className="card inventory-inline">
                        <h3>Inventaire</h3>
                        {data.inventory && Object.entries(data.inventory).length > 0 ? (
                            Object.entries(data.inventory).map(([k,v]) => (
                                <div key={k}>
                                    <label>{k}</label>
                                    <input value={v} data-key={k} onChange={makeInventoryChange(playerKey)} />
                                </div>
                            ))
                        ) : (
                            <p>Aucun objet</p>
                        )}
                    </div>

                    <Stuff stuff={data.stuff || []} onAmmoChange={makeAmmoChange(playerKey)} />

                    <div className="card notes">
                        <h3>Notes</h3>
                        <textarea value={data.notes || ''} onChange={makeNotesChange(playerKey)} />
                    </div>
                </div>
            </section>
        );
    };

    return (
        <main className="main mj-fullwidth">
            <div className="container">
                <h2>Table du MJ — Gestion des personnages</h2>

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
                                selected.map(k => <PlayerPanel playerKey={k} key={k} />)
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