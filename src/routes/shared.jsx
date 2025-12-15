import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import ViewToggle from '../components/ViewToggle';
import '../styles/sections/_shared.scss';

const SharedLibrary = () => {
    const [activeTab, setActiveTab] = useState('bestiaire');
    const [viewMode, setViewMode] = useState(localStorage.getItem('sharedViewMode') || 'grid');
    const [bestiaire, setBestiaire] = useState([]);
    const [pnj, setPNJ] = useState([]);
    const [objets, setObjets] = useState([]);
    const [localBestiaire, setLocalBestiaire] = useState([]);
    const [localPNJ, setLocalPNJ] = useState([]);
    const [localObjets, setLocalObjets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', item: null });
    const [toast, setToast] = useState(null);
    const API = process.env.REACT_APP_BASE_URL_API || '/api';

    const handleViewChange = (view) => {
        setViewMode(view);
        localStorage.setItem('sharedViewMode', view);
    };

    const getMJContext = () => {
        const context = sessionStorage.getItem('mjContext');
        return context === 'mja' || context === 'mjj' ? context : null;
    };

    

    const fetchLocalData = useCallback(async () => {
        const mjContext = getMJContext();
        if (!mjContext || !API) return;

        try {
            const [bestiaireRes, pnjRes, objetsRes] = await Promise.all([
                fetch(`${API}/${mjContext}/bestiaire`),
                fetch(`${API}/${mjContext}/pnj`),
                fetch(`${API}/${mjContext}/objets`)
            ]);

            const [bestiaireData, pnjData, objetsData] = await Promise.all([
                bestiaireRes.json(),
                pnjRes.json(),
                objetsRes.json()
            ]);

            setLocalBestiaire(Array.isArray(bestiaireData) ? bestiaireData : []);
            setLocalPNJ(Array.isArray(pnjData) ? pnjData : []);
            setLocalObjets(Array.isArray(objetsData) ? objetsData : []);
        } catch (error) {
            console.error('Erreur lors du chargement des données locales:', error);
        }
    }, [API]);

    const fetchSharedData = useCallback(async () => {
        if (!API) {
            setLoading(false);
            return;
        }
        try {
            const [bestiaireRes, pnjRes, objetsRes] = await Promise.all([
                fetch(`${API}/shared/bestiaire`),
                fetch(`${API}/shared/pnj`),
                fetch(`${API}/shared/objets`)
            ]);
            
            const [bestiaireData, pnjData, objetsData] = await Promise.all([
                bestiaireRes.json(),
                pnjRes.json(),
                objetsRes.json()
            ]);

            setBestiaire(Array.isArray(bestiaireData) ? bestiaireData : []);
            setPNJ(Array.isArray(pnjData) ? pnjData : []);
            setObjets(Array.isArray(objetsData) ? objetsData : []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement de la bibliothèque:', error);
            setLoading(false);
        }
    }, [API]);

    const isAlreadyImported = (sharedItem, localItems) => {
        return localItems.some(local => 
            local.name === sharedItem.name || 
            (local.importedFrom === 'shared' && local.originalName === sharedItem.name)
        );
    };

    // run initial loads after helper functions are defined
    useEffect(() => {
        fetchSharedData();
        fetchLocalData();
    }, [fetchSharedData, fetchLocalData]);

    const handleImport = async (type, id) => {
        const mjContext = getMJContext();
        if (!mjContext) {
            alert('Vous devez être sur une table MJ (MJA ou MJJ) pour importer');
            return;
        }

        setConfirmModal({
            isOpen: true,
            type: 'import',
            item: { type, id, mjContext }
        });
    };

    const confirmImport = async () => {
        const { type, id, mjContext } = confirmModal.item;
        setConfirmModal({ isOpen: false, type: '', item: null });

        try {
            const response = await fetch(`${API}/${mjContext}/import/${type}/${id}`, {
                method: 'POST'
            });
            if (response.ok) {
                setToast({ message: 'Élément importé avec succès !', type: 'success' });
                fetchLocalData(); // Refresh local data
            } else {
                setToast({ message: 'Erreur lors de l\'importation', type: 'error' });
            }
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            setToast({ message: 'Erreur lors de l\'importation', type: 'error' });
        }
    };

    const handleDelete = async (type, id) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            item: { type, id }
        });
    };

    const confirmDelete = async () => {
        const { type, id } = confirmModal.item;
        setConfirmModal({ isOpen: false, type: '', item: null });

        try {
            await fetch(`${API}/shared/${type}/${id}`, {
                method: 'DELETE'
            });
            fetchSharedData();
            setToast({ message: 'Élément retiré de la bibliothèque partagée !', type: 'success' });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setToast({ message: 'Erreur lors de la suppression', type: 'error' });
        }
    };

    const cancelModal = () => {
        setConfirmModal({ isOpen: false, type: '', item: null });
    };

    const renderBestiaireCard = (item, mode) => {
        const alreadyImported = isAlreadyImported(item, localBestiaire);
        const dangerStars = '★'.repeat(item.danger || 1);

        if (mode === 'list') {
            return (
                <div key={item.id} className="shared-item-list" title={item.description || ''}>
                    <div className="list-image">
                        {item.portrait ? (
                            <img src={item.portrait} alt={item.name} />
                        ) : (
                            <div className="no-image">👹</div>
                        )}
                    </div>
                    <div className="list-content">
                        <h3>{item.name}</h3>
                        <div className="danger-level">{dangerStars}</div>
                        {item.description && <p className="description-short">{item.description.substring(0, 100)}...</p>}
                    </div>
                    <div className="list-badges">
                        {alreadyImported && <span className="already-imported-badge">✅ Déjà importé</span>}
                    </div>
                    <div className="list-actions">
                        <button className="btn-import" onClick={() => handleImport('bestiaire', item.id)} disabled={alreadyImported}>⬇️</button>
                        <button className="btn-delete" onClick={() => handleDelete('bestiaire', item.id)}>🗑️</button>
                    </div>
                </div>
            );
        }

        if (mode === 'gallery') {
            return (
                <div key={item.id} className="shared-item-gallery" title={item.description || ''}>
                    <div className="gallery-image">
                        {item.portrait ? (
                            <img src={item.portrait} alt={item.name} />
                        ) : (
                            <div className="no-image">👹</div>
                        )}
                    </div>
                    <div className="gallery-overlay">
                        <h4>{item.name}</h4>
                        <div className="danger-level">{dangerStars}</div>
                        {alreadyImported && <span className="already-imported-badge">✅</span>}
                        <div className="gallery-actions">
                            <button className="btn-import" onClick={() => handleImport('bestiaire', item.id)} disabled={alreadyImported}>⬇️</button>
                            <button className="btn-delete" onClick={() => handleDelete('bestiaire', item.id)}>🗑️</button>
                        </div>
                    </div>
                </div>
            );
        }

        // Grid mode (default)
        return (
            <div key={item.id} className="shared-bestiaire-card" title={item.description || ''}>
                <div className="bestiaire-image">
                    {item.portrait ? (
                        <img src={item.portrait} alt={item.name} />
                    ) : (
                        <div className="no-image">👹</div>
                    )}
                </div>
                <div className="bestiaire-info">
                    <h3>{item.name}</h3>
                    <div className="danger-level" title={`Niveau de danger: ${item.danger || 1}`}>
                        {dangerStars}
                    </div>
                    {alreadyImported && (
                        <span className="already-imported-badge">✅ Déjà importé</span>
                    )}
                </div>
                <div className="shared-item-actions">
                    <button 
                        className="btn-import"
                        onClick={() => handleImport('bestiaire', item.id)}
                        title="Importer dans ma table"
                        disabled={alreadyImported}
                    >
                        ⬇️ Importer
                    </button>
                    <button 
                        className="btn-delete"
                        onClick={() => handleDelete('bestiaire', item.id)}
                        title="Retirer de la bibliothèque"
                    >
                        🗑️ Retirer
                    </button>
                </div>
            </div>
        );
    };

    const renderItems = () => {
        let items = [];
        let type = '';
        let localItems = [];

        switch (activeTab) {
            case 'bestiaire':
                items = bestiaire;
                type = 'bestiaire';
                localItems = localBestiaire;
                break;
            case 'pnj':
                items = pnj;
                type = 'pnj';
                localItems = localPNJ;
                break;
            case 'objets':
                items = objets;
                type = 'objets';
                localItems = localObjets;
                break;
            default:
                return null;
        }

        if (items.length === 0) {
            return <p className="empty-message">Aucun élément partagé pour le moment</p>;
        }

        const containerClass = viewMode === 'list' ? 'shared-items-list' : 
                              viewMode === 'gallery' ? 'shared-items-gallery' : 
                              'shared-items-grid';

        // Special rendering for bestiaire
        if (activeTab === 'bestiaire') {
            return (
                <div className={containerClass}>
                    {items.map(item => renderBestiaireCard(item, viewMode))}
                </div>
            );
        }

        // Default rendering for PNJ and Objets with view modes
        return (
            <div className={containerClass}>
                {items.map(item => {
                    const alreadyImported = isAlreadyImported(item, localItems);
                    
                    if (viewMode === 'list') {
                        return (
                            <div key={item.id} className="shared-item-list">
                                <div className="list-icon">
                                    {(item.portrait || item.image) ? (
                                        <img src={item.portrait || item.image} alt={item.name || item.nom} />
                                    ) : (
                                        activeTab === 'pnj' ? '👤' : '📦'
                                    )}
                                </div>
                                <div className="list-content">
                                    <h3>{item.name || item.nom || 'Sans nom'}</h3>
                                    {item.description && <p className="description-short">{item.description.substring(0, 100)}...</p>}
                                </div>
                                <div className="list-badges">
                                    {alreadyImported && <span className="already-imported-badge">✅</span>}
                                </div>
                                <div className="list-actions">
                                    <button className="btn-import" onClick={() => handleImport(type, item.id)} disabled={alreadyImported}>⬇️</button>
                                    <button className="btn-delete" onClick={() => handleDelete(type, item.id)}>🗑️</button>
                                </div>
                            </div>
                        );
                    }

                    if (viewMode === 'gallery') {
                        return (
                            <div key={item.id} className="shared-item-gallery">
                                {(item.portrait || item.image) ? (
                                    <img src={item.portrait || item.image} alt={item.name || item.nom} className="gallery-image" />
                                ) : (
                                    <div className="gallery-icon">{activeTab === 'pnj' ? '👤' : '📦'}</div>
                                )}
                                <div className="gallery-overlay">
                                    <h4>{item.name || item.nom || 'Sans nom'}</h4>
                                    {alreadyImported && <span className="already-imported-badge">✅</span>}
                                    <div className="gallery-actions">
                                        <button className="btn-import" onClick={() => handleImport(type, item.id)} disabled={alreadyImported}>⬇️</button>
                                        <button className="btn-delete" onClick={() => handleDelete(type, item.id)}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Grid mode
                    return (
                        <div key={item.id} className="shared-item-card">
                            {(item.portrait || item.image) && (
                                <div className="shared-item-image">
                                    <img src={item.portrait || item.image} alt={item.name || item.nom} />
                                </div>
                            )}
                            <div className="shared-item-header">
                                <h3>{item.name || item.nom || 'Sans nom'}</h3>
                                <span className="shared-badge">📚 Partagé</span>
                            </div>
                            {alreadyImported && (
                                <span className="already-imported-badge">✅ Déjà importé</span>
                            )}
                            <div className="shared-item-content">
                                {item.description && <p>{item.description}</p>}
                                {item.type && <p><strong>Type:</strong> {item.type}</p>}
                                {item.sante !== undefined && <p><strong>Santé:</strong> {item.sante}</p>}
                                {item.attaque && <p><strong>Attaque:</strong> {item.attaque}</p>}
                                {item.defense && <p><strong>Défense:</strong> {item.defense}</p>}
                                {item.sharedAt && (
                                    <p className="shared-date">
                                        Partagé le {new Date(item.sharedAt).toLocaleDateString('fr-FR')}
                                    </p>
                                )}
                            </div>
                            <div className="shared-item-actions">
                                <button 
                                    className="btn-import"
                                    onClick={() => handleImport(type, item.id)}
                                    title="Importer dans ma table"
                                    disabled={alreadyImported}
                                >
                                    ⬇️ Importer
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDelete(type, item.id)}
                                    title="Retirer de la bibliothèque"
                                >
                                    🗑️ Retirer
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <div className="shared-library"><p>Chargement...</p></div>;
    }

    return (
        <div className="shared-library">
            <header className="shared-header">
                <h1>📚 Bibliothèque Partagée</h1>
                <p>Éléments partagés entre les tables MJA et MJJ</p>
            </header>

            <div className="shared-controls">
                <div className="shared-tabs">
                <button 
                    className={activeTab === 'bestiaire' ? 'active' : ''}
                    onClick={() => setActiveTab('bestiaire')}
                >
                    Bestiaire ({bestiaire.length})
                </button>
                <button 
                    className={activeTab === 'pnj' ? 'active' : ''}
                    onClick={() => setActiveTab('pnj')}
                >
                    PNJ ({pnj.length})
                </button>
                <button 
                    className={activeTab === 'objets' ? 'active' : ''}
                    onClick={() => setActiveTab('objets')}
                >
                    Objets ({objets.length})
                </button>
                </div>
                <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
            </div>

            <div className="shared-content">
                {renderItems()}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onConfirm={confirmModal.type === 'import' ? confirmImport : confirmDelete}
                onCancel={cancelModal}
                title={confirmModal.type === 'import' ? 'Confirmer l\'importation' : 'Confirmer la suppression'}
                message={
                    confirmModal.type === 'import' 
                        ? 'Voulez-vous importer cet élément dans votre table ?'
                        : 'Voulez-vous retirer cet élément de la bibliothèque partagée ?'
                }
                confirmText={confirmModal.type === 'import' ? 'Importer' : 'Supprimer'}
                cancelText="Annuler"
            />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default SharedLibrary;
