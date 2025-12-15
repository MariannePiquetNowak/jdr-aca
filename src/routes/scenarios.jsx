import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/components/_info-page.scss';
import '../styles/components/_bestiaire.scss';
import Toast from '../components/Toast';
import BookReader from '../components/BookReader';
import { remoteImage } from '../services/utils';
import RouteModal from '../components/RouteModal';
import PNJCard from '../components/PNJCard';
import EnemyCard from '../components/EnemyCard';
import dataJson from '../data.json';

const API = process.env.REACT_APP_BASE_URL_API || '/api';
const STORAGE_KEY = 'scenarios-data';

const emptyScenario = () => ({
    id: `scn-${Date.now()}`,
    title: 'Trame principale',
    pitch: '',
    objective: '',
    locations: [],
    pnjs: [],
    pnjDetails: [],
    monsters: [],
    monsterDetails: [],
    playerChoices: [],
    subTrames: [],
    notes: ''
});

const Scenarios = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [pnjOptions, setPnjOptions] = useState([]);
    const [monsterOptions, setMonsterOptions] = useState([]);
    const [playerOptions, setPlayerOptions] = useState([]);
    const [viewMode, setViewMode] = useState('book'); // 'book' or 'normal'
    const [allowBook, setAllowBook] = useState(true);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [previewType, setPreviewType] = useState(null); // 'pnj' or 'monster'
    const [editingSubId, setEditingSubId] = useState(null);
    const autosaveTimer = useRef(null);
    const clearToastTimer = useRef(null);
    const getImageSrc = (item) => {
        if (!item) return null;
        return item.portrait || item.image || item.thumbnail || item.avatar || item.picture || item.src || null;
    };
    // Try to extract an image URL from various nested fields and common names
    const normalizeImage = useCallback((obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        // already has simple fields
        if (obj.portrait || obj.image || obj.thumbnail || obj.avatar || obj.picture || obj.src) return { ...obj };
        // nested common structures
        const tryPath = (o, path) => path.reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), o);
        const candidates = [
            tryPath(obj, ['images', 0, 'url']),
            tryPath(obj, ['images', 0, 'src']),
            tryPath(obj, ['media', 0, 'url']),
            tryPath(obj, ['media', 0, 'src']),
            tryPath(obj, ['picture', 'url']),
            tryPath(obj, ['picture', 'src']),
            tryPath(obj, ['file', 'url']),
            tryPath(obj, ['file', 'src']),
            obj.icon,
            obj.thumb,
            obj.imageUrl,
            obj.srcUrl
        ].filter(Boolean);
        const found = candidates.length ? candidates[0] : null;
        if (found) {
            return { ...obj, portrait: found };
        }
        return { ...obj };
    }, []);
    // Resolve a full object from an id/key or return the object as-is
    const resolveFull = (item, list) => {
        if (!item) return null;
        if (typeof item === 'string' || typeof item === 'number') {
            return list.find((o) => (o.id && String(o.id) === String(item)) || (o.key && String(o.key) === String(item))) || null;
        }
        if (typeof item === 'object') return item;
        return null;
    };

    useEffect(() => {
        // Déterminer le contexte MJ (mja / mjj) pour pointer vers les bonnes API
        const getMJContext = () => {
            const referrer = sessionStorage.getItem('mjContext');
            if (referrer === 'mja') return 'mja';
            if (referrer === 'mjj') return 'mjj';
            return null;
        };

        const mjContext = getMJContext();
        const pnjApiPath = mjContext ? `/${mjContext}/pnj` : '/pnj';
        const bestiaireApiPath = mjContext ? `/${mjContext}/bestiaire` : '/bestiaire';
        const playersApiPath = mjContext ? `/${mjContext}/players` : '/players';
        const scenariosApiPath = mjContext ? `/${mjContext}/scenarios` : '/scenarios';

        // Charger références (PNJ, Bestiaire) et normaliser image
        if (API) {
            fetch(`${API}${pnjApiPath}`).then(r => r.json()).then(d => {
                const arr = (d || []).map(normalizeImage);
                setPnjOptions(arr);
                try { window.__pnjSample = arr && arr[0] ? arr[0] : null; } catch (e) {}
            }).catch(() => setPnjOptions((dataJson.pnj || []).map(normalizeImage)));
            fetch(`${API}${bestiaireApiPath}`).then(r => r.json()).then(d => {
                const arr = (d || []).map(normalizeImage);
                setMonsterOptions(arr);
            }).catch(() => setMonsterOptions((dataJson.bestiaire || []).map(normalizeImage)));
            // try load players list for scenarios choices
            const players = [
                { key: 'armand', name: 'Armand', portrait: '/images/armand/Portrait_Armand.png' },
                { key: 'bernard', name: 'Bernard', portrait: '/images/bernard/Portrait_Bernard.png' },
                { key: 'etienne', name: 'Etienne', portrait: '/images/etienne/Portrait_Etienne.png' },
                { key: 'stephane', name: 'Stephane', portrait: '/images/stephane/Portrait_Stephane.png' },
                { key: 'theodore', name: 'Théodore', slug: 'theodore', portrait: '/images/theodore/Portrait_Theodore.png' },
                { key: 'valentine', name: 'Valentine', portrait: '/images/valentine/Portrait_Valentine.png' },
                { key: 'vera', name: 'Vera', portrait: '/images/vera/Vera_portrait.jpg' }
            ];
            setPlayerOptions(players);
        } else {
            setPnjOptions((dataJson.pnj || []).map(normalizeImage));
            setMonsterOptions((dataJson.bestiaire || []).map(normalizeImage));
            const players = [
                { key: 'armand', name: 'Armand', portrait: '/images/armand/Portrait_Armand.png' },
                { key: 'bernard', name: 'Bernard', portrait: '/images/bernard/Portrait_Bernard.png' },
                { key: 'etienne', name: 'Etienne', portrait: '/images/etienne/Portrait_Etienne.png' },
                { key: 'stephane', name: 'Stephane', portrait: '/images/stephane/Portrait_Stephane.png' },
                { key: 'theodore', name: 'Théodore', slug: 'theodore', portrait: '/images/theodore/Portrait_Theodore.png' },
                { key: 'valentine', name: 'Valentine', portrait: '/images/valentine/Portrait_Valentine.png' },
                { key: 'vera', name: 'Vera', portrait: '/images/vera/Vera_portrait.jpg' }
            ];
            setPlayerOptions(players);
        }
        // debug: log first PNJ/Monster entries to help diagnose missing portraits
        setTimeout(() => {
            try {
                    /* debug: pnj sample available in window.__pnjSample for manual inspection */
            } catch (e) {}
        }, 1000);

        // Charger les scénarios
        const load = async () => {
            setLoading(true);
            try {
                if (API) {
                    const res = await fetch(`${API}${scenariosApiPath}`);
                    if (res.ok) {
                        const json = await res.json();
                        const migrated = (json || []).map(s => {
                            if (s.subScenarios) {
                                s.subScenarios = s.subScenarios.map(sub => ({
                                    ...sub,
                                    pitch: sub.pitch || '',
                                    objective: sub.objective || ''
                                }));
                            }
                            return s;
                        });
                        setScenarios(migrated);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // ignore
            }
            // fallback localStorage -> data.json
            const local = localStorage.getItem(STORAGE_KEY);
            if (local) {
                try { 
                    const parsed = JSON.parse(local);
                    const migrated = parsed.map(s => {
                        if (s.subScenarios) {
                            s.subScenarios = s.subScenarios.map(sub => ({
                                ...sub,
                                pitch: sub.pitch || '',
                                objective: sub.objective || ''
                            }));
                        }
                        return s;
                    });
                    setScenarios(migrated);
                } catch (e) { setScenarios([]); }
            } else {
                const dataScenarios = dataJson.scenarios || [];
                const migrated = dataScenarios.map(s => {
                    if (s.subScenarios) {
                        s.subScenarios = s.subScenarios.map(sub => ({
                            ...sub,
                            pitch: sub.pitch || '',
                            objective: sub.objective || ''
                        }));
                    }
                    return s;
                });
                setScenarios(migrated);
            }
            setLoading(false);
        };
        load();
    }, [normalizeImage]);

    useEffect(() => {
        if (pnjOptions && pnjOptions.length > 0) {
            try { /* PNJ options loaded */ } catch(e) {}
        }
        if (monsterOptions && monsterOptions.length > 0) {
            try { /* Monster options loaded */ } catch(e) {}
        }
    }, [pnjOptions, monsterOptions]);

    // Disable book view on portrait / vertical windows
    useEffect(() => {
        const handleOrientation = () => {
            try {
                const isPortrait = window.innerHeight > window.innerWidth;
                setAllowBook(!isPortrait);
                if (isPortrait) setViewMode('normal');
            } catch (e) {}
        };
        handleOrientation();
        window.addEventListener('resize', handleOrientation);
        window.addEventListener('orientationchange', handleOrientation);
        return () => {
            window.removeEventListener('resize', handleOrientation);
            window.removeEventListener('orientationchange', handleOrientation);
        };
    }, []);

    useEffect(() => {
        // persist locally if no API
        if (!API) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
        }
    }, [scenarios]);

    const createScenario = () => {
        const s = emptyScenario();
        setScenarios((prev) => [s, ...prev]);
        setSelected(s);
        setIsEditing(true);
        setToast({ message: 'Nouveau scénario créé', type: 'success' });
    };

    const removeScenario = async (id) => {
        const ok = window.confirm('Confirmer la suppression de ce scénario ? Cette action est irréversible.');
        if (!ok) return;
        // remove from state
        setScenarios(prev => {
            const next = (prev || []).filter(p => p.id !== id);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
            return next;
        });
        // clear selected if needed
        if (selected && selected.id === id) {
            setSelected(null);
            setIsEditing(false);
        }
        // remove draft
        try { localStorage.removeItem(`scenarios-draft-${id}`); } catch (e) {}

        // try persist to API
        try {
            if (API) {
                await fetch(`${API}/scenarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scenarios.filter(p => p.id !== id))
                }).then(res => {
                    if (!res.ok) {
                        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios.filter(p => p.id !== id))); } catch (e) {}
                        setToast({ message: `Impossible de supprimer sur l'API (${res.status}). Supprimé localement.`, type: 'warning' });
                    } else {
                        setToast({ message: 'Scénario supprimé', type: 'success' });
                    }
                }).catch(() => {
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios.filter(p => p.id !== id))); } catch (e) {}
                    setToast({ message: 'Erreur réseau. Scénario supprimé localement.', type: 'warning' });
                });
            } else {
                setToast({ message: 'Scénario supprimé localement', type: 'success' });
            }
        } catch (e) {
            // ignore
        }
    };

    const selectScenario = (s) => {
        // check for a local draft for this scenario and offer restoration
        try {
            const key = `scenarios-draft-${s.id}`;
            const raw = localStorage.getItem(key);
            if (raw) {
                const draft = JSON.parse(raw);
                // if draft differs from remote version, ask user
                if (JSON.stringify(draft) !== JSON.stringify(s)) {
                    const restore = window.confirm('Un brouillon existe pour ce scénario. Voulez-vous restaurer le brouillon ?');
                    if (restore) {
                        setSelected(draft);
                        // ensure scenarios list reflects restored draft
                        setScenarios(prev => prev.map(it => it.id === draft.id ? draft : it));
                        setIsEditing(true);
                        return;
                    }
                }
            }
        } catch (e) {
            // ignore parse errors
        }
        setSelected(s);
        setIsEditing(false);
    };

    const updateField = (key, value) => {
        setSelected((prev) => ({ ...prev, [key]: value }));
        // update in list
        setScenarios((prev) => prev.map(item => item.id === selected.id ? { ...item, [key]: value } : item));
        // If updating pnjs or monsters, also update details from available options
        if (key === 'pnjs') {
            const details = (value || []).map(id => pnjOptions.find(p => String(p.key || p.id) === String(id)) || { id });
            setSelected(prev => ({ ...prev, pnjDetails: details }));
            setScenarios(prev => prev.map(item => item.id === selected.id ? { ...item, pnjDetails: details } : item));
        }
        if (key === 'monsters') {
            const details = (value || []).map(id => monsterOptions.find(m => String(m.key || m.id) === String(id)) || { id });
            setSelected(prev => ({ ...prev, monsterDetails: details }));
            setScenarios(prev => prev.map(item => item.id === selected.id ? { ...item, monsterDetails: details } : item));
        }
    };

    // importPnjDetails / importMonsterDetails removed: selection now stores IDs only and details are resolved on demand

    // legacy helpers for detailed import removed — selection now uses IDs and grids





    const removeSubScenario = (id) => {
        setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).filter(s => s.id !== id) }));
        setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).filter(s => s.id !== id) } : it));
    };

    const addSubScenario = () => {
        const newSub = { id: `sub-${Date.now()}`, title: 'Nouvelle trame secondaire', conditions: '', pitch: '', objective: '', pnjs: [], monsters: [], playerChoices: [] };
        setSelected(prev => ({ ...prev, subScenarios: [...(prev.subScenarios || []), newSub] }));
        setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: [...(it.subScenarios || []), newSub] } : it));
    };

    const saveScenariosToAPI = async () => {
        try {
            const res = await fetch(`${API}/scenarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenarios)
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                // Fallback: save locally if remote endpoint not available (404 etc.)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
                setToast({ message: `Sauvegarde distante impossible (${res.status}). Sauvegardé localement.`, type: 'warning' });
                console.warn('Remote save failed:', res.status, txt);
                return true; // treat as success because data saved locally
            }
            setToast({ message: 'Trames sauvegardées sur l\'API', type: 'success' });
            return true;
        } catch (e) {
            // network error -> fallback to local
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios)); } catch (err) {}
            setToast({ message: 'Erreur réseau lors de la sauvegarde distante. Sauvegardé localement.', type: 'warning' });
            console.warn('Remote save exception:', e);
            return true;
        }
    };

    const handleSave = async () => {
        // If API available, try to persist
        if (API) {
            const ok = await saveScenariosToAPI();
            if (!ok) return;
            // refetch remote
            try {
                const res = await fetch(`${API}/scenarios`);
                if (res.ok) {
                    const j = await res.json();
                    setScenarios(j || scenarios);
                }
            } catch (e) {}
        } else {
            // persist local
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
            setToast({ message: 'Trames sauvegardées localement', type: 'success' });
        }
        // remove draft for selected scenario if present
        try {
            if (selected && selected.id) {
                localStorage.removeItem(`scenarios-draft-${selected.id}`);
            }
        } catch (e) {}
        setIsEditing(false);
    };

    // Autosave draft to localStorage while editing (debounced)
    useEffect(() => {
        if (!isEditing || !selected) return;
        const key = `scenarios-draft-${selected.id}`;
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(selected));
                setToast({ message: 'Brouillon sauvegardé', type: 'info' });
                if (clearToastTimer.current) clearTimeout(clearToastTimer.current);
                clearToastTimer.current = setTimeout(() => setToast(null), 1400);
            } catch (e) {
                // ignore
            }
        }, 1400);
        return () => {
            if (autosaveTimer.current) { clearTimeout(autosaveTimer.current); autosaveTimer.current = null; }
        };
    }, [selected, isEditing]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
            if (clearToastTimer.current) clearTimeout(clearToastTimer.current);
        };
    }, []);

    const scenarioToMarkdown = (s) => {
        if (!s) return '';
        const lines = [];
        lines.push(`# ${s.title}`);
        lines.push('');
        // Insérer un placeholder de sommaire compatible avec generateEnhancedContent
        // Le generateEnhancedContent attend un bloc "## Sommaire" suivi de "---"
        // puis cherche les titres après le séparateur pour reconstruire le sommaire.
        lines.push('## Sommaire');
        lines.push('---');
        lines.push('');
        // helper pour générer des ancres uniques par scénario
        const anchor = (key) => `${s.id}-${key}`;
        if (s.pitch) {
            lines.push('## Pitch');
            lines.push(s.pitch);
            lines.push('');
        }
        if (s.objective) {
            lines.push('## Objectif');
            lines.push(s.objective);
            lines.push('');
        }
        if (s.locations && s.locations.length) {
            lines.push(`## <a name="${anchor('lieux')}"></a>Lieux`);
            s.locations.forEach(l => lines.push(`- ${l}`));
            lines.push('');
        }
        if ((s.pnjDetails && s.pnjDetails.length) || (s.pnjs && s.pnjs.length)) {
            lines.push(`## <a name="${anchor('pnj')}"></a>PNJ`);
                    if (s.pnjDetails && s.pnjDetails.length) {
                        lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                s.pnjDetails.forEach(p => {
                    const img = getImageSrc(p);
                    const idVal = p.key || p.id;
                    if (img) {
                        lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${p.label || p.name || p.key || p.id}</span></div>`);
                    } else {
                        lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${p.label || p.name || p.key || p.id}</span></div>`);
                    }
                });
                        lines.push('</div>');
                    } else {
                        lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                        s.pnjs.forEach(id => {
                    const p = pnjOptions.find(p => String(p.key) === String(id) || String(p.id) === String(id)) || {};
                    const img = getImageSrc(p);
                    if (img) {
                        lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${p.label || p.name || id}</span></div>`);
                    } else {
                        lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${p.label || id}</span></div>`);
                    }
                });
                        lines.push('</div>');
            }
            lines.push('');
        }
        if ((s.monsterDetails && s.monsterDetails.length) || (s.monsters && s.monsters.length)) {
            lines.push(`## <a name="${anchor('monstres')}"></a>Monstres`);
                if (s.monsterDetails && s.monsterDetails.length) {
                        lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                s.monsterDetails.forEach(m => {
                    const img = getImageSrc(m);
                    const idVal = m.key || m.id;
                    if (img) {
                        lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${m.label || m.name || m.key || m.id}</span></div>`);
                    } else {
                        lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${m.label || m.name || m.key || m.id}</span></div>`);
                    }
                });
                        lines.push('</div>');
                    } else {
                        lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                        s.monsters.forEach(id => {
                    const m = monsterOptions.find(p => String(p.key) === String(id) || String(p.id) === String(id)) || {};
                    const img = getImageSrc(m);
                    if (img) {
                        lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${m.label || m.name || id}</span></div>`);
                    } else {
                        lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${m.label || id}</span></div>`);
                    }
                });
                        lines.push('</div>');
            }
            lines.push('');
        }
        if (s.subScenarios && s.subScenarios.length) {
            lines.push(`## <a name="${anchor('trames-secondaires')}"></a>Trames secondaires`);
            s.subScenarios.forEach((sub, i) => {
                lines.push(`### ${sub.title}`);
                lines.push(`#### <a name="${i + 1}-pitch"></a>Pitch`);
                lines.push(sub.pitch || '');
                lines.push(`#### <a name="${i + 1}-objectif"></a>Objectif`);
                lines.push(sub.objective || '');
                if (sub.conditions) lines.push(`**Conditions à remplir:** ${sub.conditions}`);
                if (sub.pnjs && sub.pnjs.length) {
                    lines.push(`#### <a name="${i + 1}-pnj"></a>PNJ`);
                    lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                    sub.pnjs.forEach(id => {
                        const p = pnjOptions.find(p => String(p.key || p.id) === String(id)) || {};
                        const img = getImageSrc(p);
                        if (img) {
                            lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${p.label || p.name || id}</span></div>`);
                        } else {
                            lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${p.label || id}</span></div>`);
                        }
                    });
                    lines.push('</div>');
                    lines.push('');
                }
                if (sub.monsters && sub.monsters.length) {
                    lines.push(`#### <a name="${i + 1}-monstres"></a>Monstres`);
                    lines.push('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 1rem;">');
                    sub.monsters.forEach(id => {
                        const m = monsterOptions.find(p => String(p.key || p.id) === String(id)) || {};
                        const img = getImageSrc(m);
                        if (img) {
                            lines.push(`<div style="text-align: center;"><img src="${remoteImage(img)}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" /><br/><span style="display: block; white-space: normal; word-break: break-word;">${m.label || m.name || id}</span></div>`);
                        } else {
                            lines.push(`<div style="text-align: center; padding: 40px 0; background: #eee; border-radius: 6px;"><span style="display: block; white-space: normal; word-break: break-word;">${m.label || id}</span></div>`);
                        }
                    });
                    lines.push('</div>');
                    lines.push('');
                }
                lines.push('');
            });
        }
        if (s.notes) {
            lines.push(`## <a name="${anchor('notes')}"></a>Notes`);
            lines.push(s.notes);
            lines.push('');
        }
        return lines.join('\n');
    };

    // Fonction pour générer le sommaire enrichi (copié depuis Regles/Lore)
    const generateEnhancedContent = (text) => {
        if (!text) return text;
        const lines = text.split('\n');
        const enhancedLines = [];
        let inSommaire = false;

        const toRoman = (num) => {
            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            return romanNumerals[num - 1] || num.toString();
        };

        // Collecter tous les titres après le séparateur
        const titles = [];
        let foundSeparator = false;
        lines.forEach(line => {
            if (line.trim() === '---') foundSeparator = true;
            if (foundSeparator && line.startsWith('## ') && !line.includes('Sommaire')) {
                const title = line.substring(3);
                const anchorMatch = title.match(/<a name="(.*?)"><\/a>(.*)/);
                if (anchorMatch) {
                    titles.push({ id: anchorMatch[1], text: anchorMatch[2] });
                }
            }
        });

        lines.forEach(line => {
            if (line.trim() === '## Sommaire') {
                inSommaire = true;
                enhancedLines.push(line);
            } else if (inSommaire && line.trim() === '---') {
                // Reconstruire le sommaire avec chiffres romains
                titles.forEach((title, i) => {
                    const romanNumeral = toRoman(i + 1);
                    enhancedLines.push(`${romanNumeral}. [${title.text}](#${title.id})`);

                    // Trouver les sous-titres
                    let foundTitle = false;
                    let subTitleIndex = 0;
                    const subTitles = [];
                    lines.forEach(subLine => {
                        if (subLine.includes(`<a name="${title.id}"></a>`)) {
                            foundTitle = true;
                        } else if (foundTitle && subLine.startsWith('## ') && !subLine.includes('Sommaire')) {
                            foundTitle = false;
                        } else if (foundTitle && subLine.startsWith('### ')) {
                            subTitleIndex++;
                            const subtitle = subLine.substring(4).replace(/\s*:$/, '');
                            const anchorId = subtitle.toLowerCase()
                                .replace(/[àáâãäå]/g, 'a')
                                .replace(/[èéêë]/g, 'e')
                                .replace(/[ìíîï]/g, 'i')
                                .replace(/[òóôõö]/g, 'o')
                                .replace(/[ùúûü]/g, 'u')
                                .replace(/[^a-z0-9]/g, '-')
                                .replace(/-+/g, '-')
                                .replace(/^-|-$/g, '');
                            const subRomanNumeral = toRoman(subTitleIndex).toLowerCase();
                            subTitles.push({ subRomanNumeral, subtitle, anchorId, subSubTitles: [] });
                        } else if (foundTitle && subLine.startsWith('#### ')) {
                            if (subTitles.length > 0) {
                                const subSubTitle = subLine.substring(5).replace(/<a name=".*?"><\/a>/, '').replace(/\s*:$/, '');
                                const subSubAnchorId = `${subTitleIndex}-${subSubTitle.toLowerCase()
                                    .replace(/[àáâãäå]/g, 'a')
                                    .replace(/[èéêë]/g, 'e')
                                    .replace(/[ìíîï]/g, 'i')
                                    .replace(/[òóôõö]/g, 'o')
                                    .replace(/[ùúûü]/g, 'u')
                                    .replace(/[^a-z0-9]/g, '-')
                                    .replace(/-+/g, '-')
                                    .replace(/^-|-$/g, '')}`;
                                subTitles[subTitles.length - 1].subSubTitles.push({ subSubTitle, subSubAnchorId });
                            }
                        }
                    });
                    subTitles.forEach(sub => {
                        enhancedLines.push(`    ${sub.subRomanNumeral}. [${sub.subtitle}](#${sub.anchorId})`);
                        sub.subSubTitles.forEach((subSub, j) => {
                            const subSubRomanNumeral = String.fromCharCode(97 + j); // a, b, c...
                            enhancedLines.push(`        ${subSubRomanNumeral}. [${subSub.subSubTitle}](#${subSub.subSubAnchorId})`);
                        });
                    });
                });
                enhancedLines.push('');
                enhancedLines.push(line);
                inSommaire = false;
            } else if (inSommaire && line.match(/^\d+\.\s/)) {
                // Ignorer les anciennes lignes du sommaire
            } else {
                enhancedLines.push(line);
            }
        });

        return enhancedLines.join('\n');
    };

    // Fonction pour convertir le Markdown basique en HTML (identique à Regles/Lore)
    const renderMarkdown = (text) => {
        if (!text) return null;

        const enhancedText = generateEnhancedContent(text);
        const lines = enhancedText.split('\n');
        const elements = [];
        let inList = false;
        let listItems = [];
        let inTable = false;
        let tableRows = [];
        let inHtmlBlock = false;
        let htmlBlock = [];

        const flushList = () => {
            flushHtmlBlock();
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} style={{marginLeft: '1.5rem', marginBottom: '1rem', listStyle: 'disc'}}>
                        {listItems}
                    </ul>
                );
                listItems = [];
            }
            inList = false;
        };

        const flushTable = () => {
            flushHtmlBlock();
            if (tableRows.length > 0) {
                elements.push(
                    <div key={`table-${elements.length}`} style={{border: '1px solid #ddd', marginBottom: '1rem', overflow: 'auto'}}>
                        {tableRows}
                    </div>
                );
                tableRows = [];
            }
            inTable = false;
        };

        const flushHtmlBlock = () => {
            if (htmlBlock.length > 0) {
                elements.push(
                    <div key={`html-${elements.length}`} dangerouslySetInnerHTML={{__html: htmlBlock.join('\n')}} />
                );
                htmlBlock = [];
            }
            inHtmlBlock = false;
        };

        lines.forEach((line, index) => {
            if (inHtmlBlock) {
                htmlBlock.push(line);
                if (line.trim() === '</div>') {
                    flushHtmlBlock();
                }
                return;
            }
            // Titres avec ancres
            if (line.startsWith('# ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                elements.push(<h1 key={index} style={{fontSize: '2rem', marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a', fontWeight: 'bold'}}>{line.substring(2)}</h1>);
            }
            else if (line.startsWith('## ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                const title = line.substring(3);
                const anchorMatch = title.match(/<a name="(.*?)"><\/a>(.*)/);
                if (anchorMatch) {
                    elements.push(
                        <h2 key={index} id={anchorMatch[1]} style={{fontSize: '1.75rem', marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50', fontWeight: 'bold', scrollMarginTop: '2rem'}}>
                            {anchorMatch[2]}
                        </h2>
                    );
                } else {
                    elements.push(<h2 key={index} style={{fontSize: '1.75rem', marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50', fontWeight: 'bold'}}>{title}</h2>);
                }
            }
            else if (line.startsWith('### ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                const subtitle = line.substring(4).replace(/\s*:$/, '');
                const anchorId = subtitle.toLowerCase()
                    .replace(/[àáâãäå]/g, 'a')
                    .replace(/[èéêë]/g, 'e')
                    .replace(/[ìíîï]/g, 'i')
                    .replace(/[òóôõö]/g, 'o')
                    .replace(/[ùúûü]/g, 'u')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                elements.push(<h3 key={index} id={anchorId} style={{fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#34495e', fontWeight: 'bold', scrollMarginTop: '2rem'}}>{subtitle}</h3>);
            }
            else if (line.startsWith('#### ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                const subSubTitle = line.substring(5).replace(/<a name=".*?"><\/a>/, '').replace(/\s*:$/, '');
                const anchorMatch = line.match(/<a name="(.*?)"><\/a>/);
                const id = anchorMatch ? anchorMatch[1] : subSubTitle.toLowerCase()
                    .replace(/[àáâãäå]/g, 'a')
                    .replace(/[èéêë]/g, 'e')
                    .replace(/[ìíîï]/g, 'i')
                    .replace(/[òóôõö]/g, 'o')
                    .replace(/[ùúûü]/g, 'u')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                elements.push(<h4 key={index} id={id} style={{fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#34495e', fontWeight: 'bold', scrollMarginTop: '2rem'}}>{subSubTitle}</h4>);
            }
            // Ligne horizontale
            else if (line.trim() === '---') {
                flushList();
                flushTable();
                flushHtmlBlock();
                elements.push(<hr key={index} style={{margin: '2rem 0', border: 'none', borderTop: '2px solid #ddd'}} />);
            }
            // Liste avec chiffres romains ou numéros
            else if (line.match(/^\s*(?:[IVX]+|[ivx]+|[a-z]|\d+)\.\s/)) {
                flushTable();
                const match = line.match(/^\s*([IVX]+|[ivx]+|[a-z]|\d+)\.\s(.*)/);
                if (match) {
                    const romanNumeral = match[1];
                    const content = match[2];
                    const linkMatch = content.match(/\[(.+?)\]\((#.+?)\)/);
                    const isSubItem = romanNumeral === romanNumeral.toLowerCase();

                    const handleClick = (e, targetId) => {
                        e.preventDefault();
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    };

                    if (linkMatch) {
                        const targetId = linkMatch[2].substring(1);
                        listItems.push(
                            <li key={index} style={{
                                marginBottom: '0.5rem',
                                marginLeft: isSubItem ? '1.5rem' : '0',
                                listStyleType: 'none',
                                display: 'flex',
                                fontFamily: romanNumeral.match(/[IVXivx]/) ? 'Garamond, "Times New Roman", serif' : 'inherit'
                            }}>
                                <span style={{minWidth: '2.5rem', fontWeight: '600', flexShrink: 0}}>{romanNumeral}.</span>
                                <a 
                                    href={linkMatch[2]} 
                                    onClick={(e) => handleClick(e, targetId)}
                                    style={{color: '#667eea', textDecoration: 'none', cursor: 'pointer', flex: 1}}
                                >
                                    {linkMatch[1]}
                                </a>
                            </li>
                        );
                    } else {
                        listItems.push(
                            <li key={index} style={{
                                marginBottom: '0.5rem',
                                marginLeft: isSubItem ? '1.5rem' : '0'
                            }}>
                                {content}
                            </li>
                        );
                    }
                    inList = true;
                }
            }
            // Liste à puces
            else if (line.startsWith('• ')) {
                flushTable();
                let content = line.substring(2);
                content = content.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                content = content.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                listItems.push(
                    <li key={index} style={{marginBottom: '0.5rem'}} dangerouslySetInnerHTML={{__html: content}} />
                );
                inList = true;
            }
            // Ligne de tableau
            else if (line.includes('|') && line.trim().startsWith('|')) {
                flushList();
                const cells = line.split('|').filter(cell => cell.trim());
                if (cells.length > 0 && !line.includes('---')) {
                    const isFirstRow = tableRows.length === 0;
                    tableRows.push(
                        <div key={`row-${index}`} style={{display: 'flex', borderBottom: '1px solid #ddd'}}>
                            {cells.map((cell, i) => {
                                let cellContent = cell.trim();
                                cellContent = cellContent.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                                cellContent = cellContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                cellContent = cellContent.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                                return (
                                    <div key={i} style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        fontWeight: isFirstRow ? 'bold' : 'normal',
                                        background: isFirstRow ? '#f8f9fa' : 'white',
                                        borderRight: i < cells.length - 1 ? '1px solid #ddd' : 'none',
                                        textAlign: 'center'
                                    }} dangerouslySetInnerHTML={{__html: cellContent}}>
                                    </div>
                                );
                            })}
                        </div>
                    );
                    inTable = true;
                }
            }
            // Ligne vide
            else if (line.trim() === '') {
                if (inList) flushList();
                if (inTable) flushTable();
            }
            // Texte normal avec gras
            else {
                if (inList) flushList();
                if (inTable) flushTable();
                let formattedText = line;
                formattedText = formattedText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedText = formattedText.replace(/\*([^*]+?)\*/g, '<em>$1</em>');

                // Detecter PNJ / Monstre injectés avec data attributes
                const pnjMatch = formattedText.match(/<div[^>]*data-pnj-id\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/div>/i);
                const monsterMatch = formattedText.match(/<div[^>]*data-monster-id\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/div>/i);
                if (pnjMatch) {
                    const id = pnjMatch[1];
                    const inner = pnjMatch[2];
                    const imgMatch = inner.match(/<img[^>]*src\s*=\s*"([^"]+)"[^>]*>/i);
                    if (imgMatch) {
                        const imgSrc = imgMatch[1];
                        const rest = inner.replace(imgMatch[0], '');
                        elements.push(
                            <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                <img src={imgSrc} alt="" style={{width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: 'pointer'}} onClick={() => {
                                    const full = (pnjOptions || []).find(p => String(p.key || p.id) === String(id)) || (selected.pnjDetails || []).find(p => String(p.key || p.id) === String(id)) || { id };
                                    setPreviewItem(full);
                                    setPreviewType('pnj');
                                    setPreviewModalOpen(true);
                                }} />
                                <div style={{flex: 1}} dangerouslySetInnerHTML={{__html: rest}} />
                            </div>
                        );
                    } else {
                        // No image: render normally without making entire block clickable
                        elements.push(<div key={index} dangerouslySetInnerHTML={{__html: inner}} />);
                    }
                } else if (monsterMatch) {
                    const id = monsterMatch[1];
                    const inner = monsterMatch[2];
                    const imgMatch = inner.match(/<img[^>]*src\s*=\s*"([^"]+)"[^>]*>/i);
                    if (imgMatch) {
                        const imgSrc = imgMatch[1];
                        const rest = inner.replace(imgMatch[0], '');
                        elements.push(
                            <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                <img src={imgSrc} alt="" style={{width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: 'pointer'}} onClick={() => {
                                    const full = (monsterOptions || []).find(m => String(m.key || m.id) === String(id)) || (selected.monsterDetails || []).find(m => String(m.key || m.id) === String(id)) || { id };
                                    setPreviewItem(full);
                                    setPreviewType('monster');
                                    setPreviewModalOpen(true);
                                }} />
                                <div style={{flex: 1}} dangerouslySetInnerHTML={{__html: rest}} />
                            </div>
                        );
                    } else {
                        elements.push(<div key={index} dangerouslySetInnerHTML={{__html: inner}} />);
                    }
                } else {
                    if (line.trim().startsWith('<div')) {
                        inHtmlBlock = true;
                        htmlBlock = [line];
                        if (line.trim().endsWith('</div>')) {
                            flushHtmlBlock();
                        }
                    } else {
                        elements.push(<p key={index} style={{marginBottom: '0.75rem', lineHeight: '1.8', fontSize: '1rem'}} dangerouslySetInnerHTML={{__html: formattedText}} />);
                    }
                }
            }
        });

        // Vider les listes/tableaux restants
        flushList();
        flushTable();
        flushHtmlBlock();

        return elements;
    };

    return (
        <main className="info-page" style={{display: 'flex', gap: '1rem', padding: '1rem'}}>
            <aside style={{width: 220, borderRight: '1px solid #eee', paddingRight: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>Trames</h2>
                    <div>
                        <button className="save-btn" onClick={createScenario} title="Créer">➕</button>
                        <button className="save-btn" onClick={handleSave} title="Enregistrer">💾</button>
                    </div>
                </div>
                {loading ? <p>Chargement...</p> : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '.25rem', marginTop: '.5rem'}}>
                        {scenarios.length === 0 ? <div style={{fontStyle: 'italic', color: '#999'}}>Aucun scénario</div> : null}
                        {scenarios.map(s => (
                            <div key={s.id} style={{display: 'flex', gap: '.25rem', alignItems: 'center'}}>
                                <button className="header-nav__btn" onClick={() => selectScenario(s)} style={{textAlign: 'left', flex: 1}}>
                                    {s.title}
                                </button>
                                <button onClick={() => removeScenario(s.id)} title="Supprimer" style={{background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '.25rem'}}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </aside>

            <section style={{flex: 1.2}}>
                {!selected ? (
                    <div style={{padding: '1rem'}}>Sélectionnez un scénario ou cliquez sur ➕ pour en créer un.</div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {/* Title removed as requested */}

                        {!isEditing ? (
                            viewMode === 'book' ? (
                                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'center'}}>
                                    <div style={{position: 'relative'}}>
                                        <div style={{position: 'absolute', left: -120, top: 8, display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 20}}>
                                            <button 
                                                onClick={() => setViewMode('normal')} 
                                                className="view-mode-btn"
                                                style={{padding: '0.75rem', fontSize: '1rem'}}
                                                title="Vue normale"
                                            >
                                                📄
                                            </button>
                                            <button 
                                                onClick={() => setIsEditing(true)} 
                                                className="view-mode-btn"
                                                style={{padding: '0.75rem', fontSize: '1rem'}}
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                        <BookReader content={scenarioToMarkdown(selected)} robust={true} onOpenItem={(type, id) => {
                                            if (type === 'pnj') {
                                                const full = (pnjOptions || []).find(p => String(p.key || p.id) === String(id)) || (selected.pnjDetails || []).find(p => String(p.key || p.id) === String(id));
                                                setPreviewItem(full || { id });
                                                setPreviewType('pnj');
                                                setPreviewModalOpen(true);
                                            }
                                            if (type === 'monster') {
                                                const full = (monsterOptions || []).find(m => String(m.key || m.id) === String(id)) || (selected.monsterDetails || []).find(m => String(m.key || m.id) === String(id));
                                                setPreviewItem(full || { id });
                                                setPreviewType('monster');
                                                setPreviewModalOpen(true);
                                            }
                                        }} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, marginRight: '2rem'}}>
                                        {allowBook && (
                                            <button 
                                                onClick={() => setViewMode('book')} 
                                                className="view-mode-btn"
                                                style={{padding: '0.75rem', fontSize: '1rem'}}
                                                title="Mode livre"
                                            >
                                                📖
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="view-mode-btn"
                                            style={{padding: '0.75rem', fontSize: '1rem'}}
                                            title="Modifier"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div className="info-content">
                                            {!isEditing ? (
                                                <div className="content-display">
                                                    {scenarioToMarkdown(selected) ? (
                                                        <div>{renderMarkdown(scenarioToMarkdown(selected))}</div>
                                                    ) : (
                                                        <p style={{fontStyle: 'italic', color: '#999'}}>Aucun contenu.</p>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <input type="text" value={selected.title} onChange={(e) => updateField('title', e.target.value)} style={{flex: 1}} />
                                    <input type="text" value={selected.locations?.join(', ') || ''} onChange={(e) => updateField('locations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="Lieux (séparés par ,)" />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '.5rem'}}>
                                    <textarea value={selected.pitch} onChange={(e) => updateField('pitch', e.target.value)} placeholder="Pitch / résumé" rows={3} style={{flex: 1}} />
                                    <textarea value={selected.objective} onChange={(e) => updateField('objective', e.target.value)} placeholder="Objectif clair" rows={3} style={{flex: 1}} />
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '.5rem'}}>
                                    <div style={{display: 'flex', gap: '1rem'}}>
                                        <div className="scen-block" style={{flex: 1}}>
                                            <label>PNJ (référence)</label>
                                            <div style={{display: 'flex', gap: '1rem', marginTop: '.5rem'}}>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>PNJ disponibles</div>
                                                    <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(pnjOptions || []).filter(p => !(selected.pnjs || []).some(id => String(id) === String(p.key || p.id))).map(p => (
                                                            <div key={p.key || p.id} className="scen-tile" data-tooltip={p.label || p.name || p.key || p.id} onClick={() => {
                                                                const id = p.key || p.id;
                                                                const next = Array.from(new Set([...(selected.pnjs || []), String(id)]));
                                                                updateField('pnjs', next);
                                                            }} role="button" tabIndex={0} style={{cursor: 'pointer', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                {getImageSrc(p) ? (
                                                                    <img src={remoteImage(getImageSrc(p))} alt={p.label || p.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                ) : (
                                                                    <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>PNJ sélectionnés</div>
                                                        <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(selected.pnjs || []).map(id => pnjOptions.find(p => String(p.key || p.id) === String(id)) || { id }).map(resolved => {
                                                            const idVal = resolved && (resolved.key || resolved.id);
                                                            return (
                                                                <div key={String(idVal)} className="scen-tile" style={{position: 'relative', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                    <div role="button" tabIndex={0} onClick={() => { const full = resolveFull(resolved, pnjOptions); setPreviewItem(full || resolved); setPreviewType('pnj'); setPreviewModalOpen(true); }} style={{cursor: 'pointer'}}>
                                                                        {getImageSrc(resolved) ? (
                                                                            <img src={remoteImage(getImageSrc(resolved))} alt={resolved.label || resolved.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                        ) : (
                                                                            <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                        )}
                                                                    </div>
                                                                    <button type="button" onClick={() => {
                                                                        const id = idVal;
                                                                        const next = (selected.pnjs || []).filter(x => String(x) !== String(id));
                                                                        updateField('pnjs', next);
                                                                    }} title="Retirer" style={{position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 12, background: '#ff4d4f', color: '#fff', border: 'none', cursor: 'pointer'}}>✕</button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{display: 'flex', gap: '1rem'}}>
                                        <div className="scen-block" style={{flex: 1}}>
                                            <label>Monstres (référence)</label>
                                            <div style={{display: 'flex', gap: '1rem', marginTop: '.5rem'}}>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Bestiaire disponible</div>
                                                        <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(monsterOptions || []).filter(m => !(selected.monsters || []).some(id => String(id) === String(m.key || m.id))).map(m => (
                                                            <div key={m.key || m.id} className="scen-tile" data-tooltip={m.label || m.name || m.key || m.id} onClick={() => {
                                                                const id = m.key || m.id;
                                                                const next = Array.from(new Set([...(selected.monsters || []), String(id)]));
                                                                updateField('monsters', next);
                                                            }} role="button" tabIndex={0} style={{cursor: 'pointer', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                {getImageSrc(m) ? (
                                                                    <img src={remoteImage(getImageSrc(m))} alt={m.label || m.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                ) : (
                                                                    <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Bestiaire sélectionnés</div>
                                                    <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(selected.monsters || []).map(id => monsterOptions.find(m => String(m.key || m.id) === String(id)) || { id }).map(resolved => {
                                                            const idVal = resolved && (resolved.key || resolved.id);
                                                            return (
                                                                <div key={String(idVal)} className="scen-tile" style={{position: 'relative', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                    <div role="button" tabIndex={0} onClick={() => { const full = resolveFull(resolved, monsterOptions); setPreviewItem(full || resolved); setPreviewType('monster'); setPreviewModalOpen(true); }} style={{cursor: 'pointer'}}>
                                                                        {getImageSrc(resolved) ? (
                                                                            <img src={remoteImage(getImageSrc(resolved))} alt={resolved.label || resolved.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                        ) : (
                                                                            <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                        )}
                                                                    </div>
                                                                    <button type="button" onClick={() => {
                                                                        const id = idVal;
                                                                        const next = (selected.monsters || []).filter(x => String(x) !== String(id));
                                                                        updateField('monsters', next);
                                                                    }} title="Retirer" style={{position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 12, background: '#ff4d4f', color: '#fff', border: 'none', cursor: 'pointer'}}>✕</button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>

                                    {/* Players choices block */}
                                    <div style={{display: 'flex', gap: '1rem', marginTop: '.75rem'}}>
                                        <div className="scen-block" style={{flex: 1}}>
                                            <label>Choix joueurs (référence)</label>
                                            <div style={{display: 'flex', gap: '1rem', marginTop: '.5rem'}}>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Joueurs disponibles</div>
                                                    <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(playerOptions || []).filter(p => !(selected.playerChoices || []).some(id => String(id) === String(p.key || p.id))).map(p => (
                                                            <div key={p.key || p.id} className="scen-tile" data-tooltip={p.label || p.name || p.key || p.id} onClick={() => {
                                                                const id = p.key || p.id;
                                                                const next = Array.from(new Set([...(selected.playerChoices || []), String(id)]));
                                                                updateField('playerChoices', next);
                                                            }} role="button" tabIndex={0} style={{cursor: 'pointer', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                {getImageSrc(p) ? (
                                                                    <img src={remoteImage(getImageSrc(p))} alt={p.label || p.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                ) : (
                                                                    <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="scen-block" style={{flex: 1}}>
                                                    <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Joueurs sélectionnés</div>
                                                    <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                        {(selected.playerChoices || []).map(id => playerOptions.find(p => String(p.key || p.id) === String(id)) || { id }).map(resolved => {
                                                            const idVal = resolved && (resolved.key || resolved.id);
                                                            return (
                                                                <div key={String(idVal)} className="scen-tile" style={{position: 'relative', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                    <div role="button" tabIndex={0} onClick={() => { const full = resolveFull(resolved, playerOptions); setPreviewItem(full || resolved); setPreviewType('player'); setPreviewModalOpen(true); }} style={{cursor: 'pointer'}}>
                                                                        {getImageSrc(resolved) ? (
                                                                            <img src={remoteImage(getImageSrc(resolved))} alt={resolved.label || resolved.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                        ) : (
                                                                            <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                        )}
                                                                    </div>
                                                                    <button type="button" onClick={() => {
                                                                        const id = idVal;
                                                                        const next = (selected.playerChoices || []).filter(x => String(x) !== String(id));
                                                                        updateField('playerChoices', next);
                                                                    }} title="Retirer" style={{position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 12, background: '#ff4d4f', color: '#fff', border: 'none', cursor: 'pointer'}}>✕</button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                {(selected.subScenarios || []).map(sub => (
                                    <div key={sub.id} style={{marginBottom: '1rem', border: '1px solid #ccc', padding: '.5rem', borderRadius: 6}}>
                                        <div style={{display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.25rem'}}>
                                            <input value={sub.title} onChange={(e) => {
                                                const title = e.target.value;
                                                setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, title } : s) }));
                                                setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, title } : s) } : it));
                                            }} style={{flex: 1}} />
                                            <input value={sub.conditions} onChange={(e) => {
                                                const conditions = e.target.value;
                                                setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, conditions } : s) }));
                                                setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, conditions } : s) } : it));
                                            }} placeholder="Conditions à remplir" />
                                            <button onClick={() => removeSubScenario(sub.id)} title="Supprimer">✕</button>
                                        </div>
                                        {editingSubId === sub.id ? (
                                            <div>
                                                <div style={{marginBottom: '.5rem'}}>
                                                    <label>Pitch</label>
                                                    <textarea value={sub.pitch || ''} onChange={(e) => {
                                                        const pitch = e.target.value;
                                                        setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, pitch } : s) }));
                                                        setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, pitch } : s) } : it));
                                                    }} rows={2} style={{width: '100%'}} />
                                                </div>
                                                <div style={{marginBottom: '.5rem'}}>
                                                    <label>Objectif</label>
                                                    <textarea value={sub.objective || ''} onChange={(e) => {
                                                        const objective = e.target.value;
                                                        setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, objective } : s) }));
                                                        setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, objective } : s) } : it));
                                                    }} rows={2} style={{width: '100%'}} />
                                                </div>
                                                {/* PNJ block */}
                                                <div style={{display: 'flex', gap: '1rem', marginTop: '.75rem'}}>
                                                    <div className="scen-block" style={{flex: 1}}>
                                                        <label>PNJ (référence)</label>
                                                        <div style={{display: 'flex', gap: '1rem', marginTop: '.5rem'}}>
                                                            <div className="scen-block" style={{flex: 1}}>
                                                                <div style={{fontWeight: 600, marginBottom: '.5rem'}}>PNJ disponibles</div>
                                                                <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                                    {(pnjOptions || []).filter(p => !(sub.pnjs || []).some(id => String(id) === String(p.key || p.id))).map(p => (
                                                                        <div key={p.key || p.id} className="scen-tile" data-tooltip={p.label || p.name || p.key || p.id} onClick={() => {
                                                                            const id = p.key || p.id;
                                                                            const next = Array.from(new Set([...(sub.pnjs || []), String(id)]));
                                                                            setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, pnjs: next } : s) }));
                                                                            setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, pnjs: next } : s) } : it));
                                                                        }} role="button" tabIndex={0} style={{cursor: 'pointer', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                            {getImageSrc(p) ? (
                                                                                <img src={remoteImage(getImageSrc(p))} alt={p.label || p.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                            ) : (
                                                                                <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="scen-block" style={{flex: 1}}>
                                                                <div style={{fontWeight: 600, marginBottom: '.5rem'}}>PNJ sélectionnés</div>
                                                                <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                                    {(sub.pnjs || []).map(id => pnjOptions.find(p => String(p.key || p.id) === String(id)) || { id }).map(resolved => {
                                                                        const idVal = resolved && (resolved.key || resolved.id);
                                                                        return (
                                                                            <div key={String(idVal)} className="scen-tile" style={{position: 'relative', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                                <div role="button" tabIndex={0} onClick={() => { const full = resolveFull(resolved, pnjOptions); setPreviewItem(full || resolved); setPreviewType('pnj'); setPreviewModalOpen(true); }} style={{cursor: 'pointer'}}>
                                                                                    {getImageSrc(resolved) ? (
                                                                                        <img src={remoteImage(getImageSrc(resolved))} alt={resolved.label || resolved.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                                    ) : (
                                                                                        <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                                    )}
                                                                                </div>
                                                                                <button type="button" onClick={() => {
                                                                                    const id = idVal;
                                                                                    const next = (sub.pnjs || []).filter(x => String(x) !== String(id));
                                                                                    setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, pnjs: next } : s) }));
                                                                                    setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, pnjs: next } : s) } : it));
                                                                                }} title="Retirer" style={{position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 12, background: '#ff4d4f', color: '#fff', border: 'none', cursor: 'pointer'}}>✕</button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Monsters block */}
                                                <div style={{display: 'flex', gap: '1rem', marginTop: '.75rem'}}>
                                                    <div className="scen-block" style={{flex: 1}}>
                                                        <label>Monstres (référence)</label>
                                                        <div style={{display: 'flex', gap: '1rem', marginTop: '.5rem'}}>
                                                            <div className="scen-block" style={{flex: 1}}>
                                                                <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Monstres disponibles</div>
                                                                <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                                    {(monsterOptions || []).filter(m => !(sub.monsters || []).some(id => String(id) === String(m.key || m.id))).map(m => (
                                                                        <div key={m.key || m.id} className="scen-tile" data-tooltip={m.label || m.name || m.key || m.id} onClick={() => {
                                                                            const id = m.key || m.id;
                                                                            const next = Array.from(new Set([...(sub.monsters || []), String(id)]));
                                                                            setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, monsters: next } : s) }));
                                                                            setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, monsters: next } : s) } : it));
                                                                        }} role="button" tabIndex={0} style={{cursor: 'pointer', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                            {getImageSrc(m) ? (
                                                                                <img src={remoteImage(getImageSrc(m))} alt={m.label || m.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                            ) : (
                                                                                <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="scen-block" style={{flex: 1}}>
                                                                <div style={{fontWeight: 600, marginBottom: '.5rem'}}>Monstres sélectionnés</div>
                                                                <div className="scenarios-portrait-grid" style={{display: 'grid', gap: '.5rem'}}>
                                                                    {(sub.monsters || []).map(id => monsterOptions.find(m => String(m.key || m.id) === String(id)) || { id }).map(resolved => {
                                                                        const idVal = resolved && (resolved.key || resolved.id);
                                                                        return (
                                                                            <div key={String(idVal)} className="scen-tile" style={{position: 'relative', textAlign: 'center', padding: '.25rem', border: '1px solid #eee', borderRadius: 6}}>
                                                                                <div role="button" tabIndex={0} onClick={() => { const full = resolveFull(resolved, monsterOptions); setPreviewItem(full || resolved); setPreviewType('monster'); setPreviewModalOpen(true); }} style={{cursor: 'pointer'}}>
                                                                                    {getImageSrc(resolved) ? (
                                                                                        <img src={remoteImage(getImageSrc(resolved))} alt={resolved.label || resolved.name || ''} style={{width: '100%', height: 72, objectFit: 'cover', borderRadius: 6}} />
                                                                                    ) : (
                                                                                        <div style={{width: '100%', height: 72, background: '#eee', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>?</div>
                                                                                    )}
                                                                                </div>
                                                                                <button type="button" onClick={() => {
                                                                                    const id = idVal;
                                                                                    const next = (sub.monsters || []).filter(x => String(x) !== String(id));
                                                                                    setSelected(prev => ({ ...prev, subScenarios: (prev.subScenarios || []).map(s => s.id === sub.id ? { ...s, monsters: next } : s) }));
                                                                                    setScenarios(prev => prev.map(it => it.id === selected.id ? { ...it, subScenarios: (it.subScenarios || []).map(s => s.id === sub.id ? { ...s, monsters: next } : s) } : it));
                                                                                }} title="Retirer" style={{position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 12, background: '#ff4d4f', color: '#fff', border: 'none', cursor: 'pointer'}}>✕</button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setEditingSubId(null)}>Fermer l'édition</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setEditingSubId(sub.id)}>Éditer PNJ/Monstres</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addSubScenario}>Ajouter une trame secondaire</button>

                                <div style={{marginTop: '.5rem'}}>
                                    <label>Notes complémentaires</label>
                                    <textarea value={selected.notes || ''} onChange={(e) => updateField('notes', e.target.value)} rows={4} style={{width: '100%'}} />
                                </div>

                                <div style={{marginTop: '.5rem', display: 'flex', gap: '.5rem'}}>
                                    <button className="save-btn" onClick={handleSave}>💾 Enregistrer</button>
                                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>✕ Annuler</button>
                                    <button className="cancel-btn" onClick={() => removeScenario(selected.id)} style={{background: '#ff4d4f', color: '#fff'}}>🗑️ Supprimer</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {previewModalOpen && (
                <RouteModal contentClassName="preview-modal" isOpen={previewModalOpen} onClose={() => { setPreviewModalOpen(false); setPreviewItem(null); setPreviewType(null); }} title={''}>
                    {previewType === 'pnj' ? (
                        <PNJCard pnj={previewItem} onEdit={null} onDelete={null} onShare={null} />
                    ) : previewType === 'monster' ? (
                        <EnemyCard enemy={previewItem} onEdit={null} onDelete={null} onShare={null} />
                    ) : previewType === 'player' ? (
                        <PNJCard pnj={previewItem} onEdit={null} onDelete={null} onShare={null} />
                    ) : null}
                </RouteModal>
            )}
        </main>
    );
};

export default Scenarios;
