import React, { useState, useEffect } from 'react';
import PNJCard from '../components/PNJCard';
import PNJForm from '../components/PNJForm';
import ViewToggle from '../components/ViewToggle';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import '../styles/components/_pnj.scss';

const PNJ = () => {
    const [pnjs, setPnjs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPNJ, setEditingPNJ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(localStorage.getItem('pnjViewMode') || 'grid');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, pnj: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, pnjId: null });
    const [toast, setToast] = useState(null);
    const API = process.env.REACT_APP_BASE_URL_API || '/api';

    const handleViewChange = (view) => {
        setViewMode(view);
        localStorage.setItem('pnjViewMode', view);
    };
    
    // Déterminer le contexte MJ
    const getMJContext = () => {
        const referrer = sessionStorage.getItem('mjContext');
        if (referrer === 'mja') return 'mja';
        if (referrer === 'mjj') return 'mjj';
        return null;
    };
    
    const mjContext = getMJContext();
    const apiPath = mjContext ? `/${mjContext}/pnj` : '/pnj';

    useEffect(() => {
        fetchPNJs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPNJs = async () => {
        if (!API) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API}${apiPath}`);
            const data = await response.json();
            setPnjs(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des PNJs:', error);
            setPnjs([]);
            setLoading(false);
        }
    };

    const handleAddPNJ = async (pnj) => {
        if (API) {
            try {
                const pnjJson = JSON.stringify(pnj);
                const sizeInMB = new Blob([pnjJson]).size / (1024 * 1024);
                
                // debug: size check executed
                
                if (sizeInMB > 40) {
                    alert('Le PNJ est trop volumineux (> 40MB). Cela ne devrait pas arriver avec la compression automatique.');
                    return;
                }

                const response = await fetch(`${API}${apiPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: pnjJson,
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erreur serveur:', response.status, errorText);
                    throw new Error(`Erreur serveur: ${response.status}`);
                }
                
                await response.json();
                // Recharger les PNJ depuis le serveur pour avoir les données à jour
                await fetchPNJs();
                setToast({ message: 'PNJ ajouté avec succès !', type: 'success' });
            } catch (err) {
                console.error('Erreur lors de l\'ajout du PNJ:', err);
                setToast({ message: `Erreur: ${err.message}`, type: 'error' });
                return; // Ne pas ajouter en local si ça a échoué
            }
        } else {
            setPnjs(prev => [...prev, pnj]);
        }
        setShowForm(false);
        setEditingPNJ(null);
    };

    const handleSharePNJ = async (pnj) => {
        setConfirmModal({ isOpen: true, pnj });
    };

    const confirmSharePNJ = async () => {
        const { pnj } = confirmModal;
        setConfirmModal({ isOpen: false, pnj: null });

        if (!API) {
            setToast({ message: 'API non disponible', type: 'error' });
            return;
        }

        try {
            // Vérifier si l'élément existe déjà dans la bibliothèque partagée
            const checkResponse = await fetch(`${API}/shared/pnj`);
            const sharedItems = await checkResponse.json();
            const alreadyExists = sharedItems.some(item => item.id === pnj.id);
            
            if (alreadyExists) {
                setToast({ message: `"${pnj.name}" est déjà dans la bibliothèque partagée !`, type: 'info' });
                return;
            }

            const url = API ? `${API}/shared/pnj` : '/api/shared/pnj';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pnj),
            });
            setToast({ message: `"${pnj.name}" partagé avec succès !`, type: 'success' });
        } catch (error) {
            console.error('Erreur lors du partage:', error);
            setToast({ message: 'Erreur lors du partage', type: 'error' });
        }
    };

    const cancelShareModal = () => {
        setConfirmModal({ isOpen: false, pnj: null });
    };

    const handleUpdatePNJ = async (updatedPNJ) => {
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${updatedPNJ.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedPNJ),
                });
                setPnjs(prev => prev.map(p => p.id === updatedPNJ.id ? updatedPNJ : p));
                setToast({ message: `"${updatedPNJ.name}" modifié avec succès !`, type: 'success' });
            } catch (err) {
                console.error('Erreur lors de la modification du PNJ:', err);
                setPnjs(prev => prev.map(p => p.id === updatedPNJ.id ? updatedPNJ : p));
                setToast({ message: 'Erreur lors de la modification', type: 'error' });
            }
        } else {
            setPnjs(prev => prev.map(p => p.id === updatedPNJ.id ? updatedPNJ : p));
            setToast({ message: `"${updatedPNJ.name}" modifié avec succès !`, type: 'success' });
        }
        setShowForm(false);
        setEditingPNJ(null);
    };

    const handleDeletePNJ = async (id) => {
        setDeleteModal({ isOpen: true, pnjId: id });
    };

    const confirmDeletePNJ = async () => {
        const { pnjId } = deleteModal;
        const pnjToDelete = pnjs.find(p => p.id === pnjId);
        setDeleteModal({ isOpen: false, pnjId: null });
        
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${pnjId}`, {
                    method: 'DELETE',
                });
                setPnjs(prev => prev.filter(p => p.id !== pnjId));
                setToast({ message: `"${pnjToDelete?.name || 'PNJ'}" supprimé avec succès !`, type: 'success' });
            } catch (error) {
                console.error('Erreur lors de la suppression du PNJ:', error);
                setPnjs(prev => prev.filter(p => p.id !== pnjId));
                setToast({ message: 'Erreur lors de la suppression', type: 'error' });
            }
        } else {
            setPnjs(prev => prev.filter(p => p.id !== pnjId));
            setToast({ message: `"${pnjToDelete?.name || 'PNJ'}" supprimé avec succès !`, type: 'success' });
        }
    };

    const cancelDeleteModal = () => {
        setDeleteModal({ isOpen: false, pnjId: null });
    };

    const handleEditPNJ = (pnj) => {
        setEditingPNJ(pnj);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPNJ(null);
    };

    const containerClass = viewMode === 'list' ? 'pnjs-list' : 
                          viewMode === 'gallery' ? 'pnjs-gallery' : 
                          'pnjs-grid';

    if (loading) {
        return <div className="pnj-page"><p>Chargement...</p></div>;
    }

    return (
        <div className="pnj-page">
            {showForm && (
                <div className="pnj-modal-overlay" onClick={handleCancelForm}>
                    <div className="pnj-modal-content" onClick={(e) => e.stopPropagation()}>
                        <PNJForm 
                            onAddPNJ={editingPNJ ? handleUpdatePNJ : handleAddPNJ} 
                            onCancel={handleCancelForm}
                            initialData={editingPNJ}
                        />
                    </div>
                </div>
            )}

            <section className="pnj-section">
                <div className="pnj-header">
                    <h1>👥 Personnages Non-Joueurs</h1>
                    <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
                </div>
                
                <div className={containerClass}>
                    <div 
                        className={viewMode === 'list' ? 'pnj-list-item empty-card' : viewMode === 'gallery' ? 'pnj-gallery-item empty-card' : 'pnj-card empty-card'}
                        onClick={() => setShowForm(true)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') setShowForm(true);
                        }}
                    >
                        <div className="empty-card-content">
                            <div className="empty-card-icon">+</div>
                            <div className="empty-card-text">Ajouter un PNJ</div>
                        </div>
                    </div>

                    {pnjs.map((pnj) => (
                        <PNJCard 
                            key={pnj.id} 
                            pnj={pnj} 
                            onDelete={handleDeletePNJ}
                            onEdit={handleEditPNJ}
                            onShare={handleSharePNJ}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </section>

            {/* Confirmation modal for sharing */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onConfirm={confirmSharePNJ}
                onCancel={cancelShareModal}
                title="Partager dans la bibliothèque"
                message={`Voulez-vous partager "${confirmModal.pnj?.name}" dans la bibliothèque partagée ?`}
                confirmText="Partager"
                cancelText="Annuler"
            />

            {/* Confirmation modal for deletion */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onConfirm={confirmDeletePNJ}
                onCancel={cancelDeleteModal}
                title="Supprimer le PNJ"
                message="Êtes-vous sûr de vouloir supprimer ce PNJ ?"
                confirmText="Supprimer"
                cancelText="Annuler"
            />

            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default PNJ;
