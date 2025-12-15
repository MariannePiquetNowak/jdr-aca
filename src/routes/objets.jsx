import React, { useState, useEffect } from 'react';
import ObjetCard from '../components/ObjetCard';
import ObjetForm from '../components/ObjetForm';
import ViewToggle from '../components/ViewToggle';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import '../styles/sections/_objets.scss';

const Objets = () => {
    const [objets, setObjets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingObjet, setEditingObjet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(localStorage.getItem('objetsViewMode') || 'grid');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, objet: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, objetId: null });
    const [toast, setToast] = useState(null);
    const API = process.env.REACT_APP_BASE_URL_API || '/api';

    const handleViewChange = (view) => {
        setViewMode(view);
        localStorage.setItem('objetsViewMode', view);
    };

    const getMJContext = () => {
        const referrer = sessionStorage.getItem('mjContext');
        if (referrer === 'mja') return 'mja';
        if (referrer === 'mjj') return 'mjj';
        return null;
    };
    const mjContext = getMJContext();
    const apiPath = mjContext ? `/${mjContext}/objets` : '/objets';

    useEffect(() => {
        fetchObjets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiPath]);

    const fetchObjets = async () => {
        if (!API) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API}${apiPath}`);
            const data = await response.json();
            setObjets(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des objets:', error);
            setObjets([]);
            setLoading(false);
        }
    };

    const handleAddObjet = async (objet) => {
        if (API) {
            try {
                const response = await fetch(`${API}${apiPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(objet),
                });
                await response.json();
                // Mise à jour optimiste de l'état local
                setObjets(prev => [...prev, objet]);
            } catch (err) {
                console.error('Erreur lors de l\'ajout de l\'objet:', err);
                // Fallback vers l'état local si l'API échoue
                setObjets(prev => [...prev, objet]);
            }
        } else {
            setObjets(prev => [...prev, objet]);
        }
        setShowForm(false);
        setEditingObjet(null);
    };

    const handleUpdateObjet = async (updatedObjet) => {
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${updatedObjet.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedObjet),
                });
                setObjets(prev => prev.map(o => o.id === updatedObjet.id ? updatedObjet : o));
                setToast({ message: `"${updatedObjet.name}" modifié avec succès !`, type: 'success' });
            } catch (err) {
                console.error('Erreur lors de la modification de l\'objet:', err);
                setObjets(prev => prev.map(o => o.id === updatedObjet.id ? updatedObjet : o));
                setToast({ message: 'Erreur lors de la modification', type: 'error' });
            }
        } else {
            setObjets(prev => prev.map(o => o.id === updatedObjet.id ? updatedObjet : o));
            setToast({ message: `"${updatedObjet.name}" modifié avec succès !`, type: 'success' });
        }
        setShowForm(false);
        setEditingObjet(null);
    };

    const handleDeleteObjet = async (id) => {
        setDeleteModal({ isOpen: true, objetId: id });
    };

    const confirmDeleteObjet = async () => {
        const { objetId } = deleteModal;
        const objetToDelete = objets.find(o => o.id === objetId);
        setDeleteModal({ isOpen: false, objetId: null });
        
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${objetId}`, {
                    method: 'DELETE',
                });
                setObjets(prev => prev.filter(o => o.id !== objetId));
                setToast({ message: `"${objetToDelete?.name || 'Objet'}" supprimé avec succès !`, type: 'success' });
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'objet:', error);
                setObjets(prev => prev.filter(o => o.id !== objetId));
                setToast({ message: 'Erreur lors de la suppression', type: 'error' });
            }
        } else {
            setObjets(prev => prev.filter(o => o.id !== objetId));
            setToast({ message: `"${objetToDelete?.name || 'Objet'}" supprimé avec succès !`, type: 'success' });
        }
    };

    const cancelDeleteModal = () => {
        setDeleteModal({ isOpen: false, objetId: null });
    };

    const handleEditObjet = (objet) => {
        setEditingObjet(objet);
        setShowForm(true);
    };

    const handleShareObjet = async (objet) => {
        setConfirmModal({ isOpen: true, objet });
    };

    const confirmShareObjet = async () => {
        const { objet } = confirmModal;
        setConfirmModal({ isOpen: false, objet: null });

        if (!API) {
            setToast({ message: 'API non disponible', type: 'error' });
            return;
        }

        try {
            // Vérifier si l'élément existe déjà dans la bibliothèque partagée
            const checkResponse = await fetch(`${API}/shared/objets`);
            const sharedItems = await checkResponse.json();
            const alreadyExists = sharedItems.some(item => item.id === objet.id);
            
            if (alreadyExists) {
                setToast({ message: `"${objet.name}" est déjà dans la bibliothèque partagée !`, type: 'info' });
                return;
            }

            const url = API ? `${API}/shared/objets` : '/api/shared/objets';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objet),
            });
            setToast({ message: `"${objet.name}" partagé avec succès !`, type: 'success' });
        } catch (error) {
            console.error('Erreur lors du partage:', error);
            setToast({ message: 'Erreur lors du partage', type: 'error' });
        }
    };

    const cancelShareModal = () => {
        setConfirmModal({ isOpen: false, objet: null });
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingObjet(null);
    };

    const containerClass = viewMode === 'list' ? 'objets-list' : 
                          viewMode === 'gallery' ? 'objets-gallery' : 
                          'objets-grid';

    if (loading) {
        return <div className="objets-page"><p>Chargement...</p></div>;
    }

    return (
        <div className="objets-page">
            {showForm && (
                <div className="objet-modal-overlay" onClick={handleCancelForm}>
                    <div className="objet-modal-content" onClick={(e) => e.stopPropagation()}>
                        <ObjetForm 
                            onAddObjet={editingObjet ? handleUpdateObjet : handleAddObjet} 
                            onCancel={handleCancelForm}
                            initialData={editingObjet}
                        />
                    </div>
                </div>
            )}

            <section className="objets-section">
                <div className="objets-header">
                    <h1>🎁 Objets</h1>
                    <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
                </div>
                
                <div className={containerClass}>
                    <div 
                        className={viewMode === 'list' ? 'objet-list-item empty-card' : viewMode === 'gallery' ? 'objet-gallery-item empty-card' : 'objet-card empty-card'}
                        onClick={() => setShowForm(true)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') setShowForm(true);
                        }}
                    >
                        <div className="empty-card-content">
                            <div className="empty-card-icon">+</div>
                            <div className="empty-card-text">Ajouter un objet</div>
                        </div>
                    </div>

                    {objets.map((objet) => (
                        <ObjetCard 
                            key={objet.id} 
                            objet={objet} 
                            onDelete={handleDeleteObjet}
                            onEdit={handleEditObjet}
                            onShare={handleShareObjet}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </section>

            {/* Confirmation modal for sharing */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onConfirm={confirmShareObjet}
                onCancel={cancelShareModal}
                title="Partager dans la bibliothèque"
                message={`Voulez-vous partager "${confirmModal.objet?.name}" dans la bibliothèque partagée ?`}
                confirmText="Partager"
                cancelText="Annuler"
            />

            {/* Confirmation modal for deletion */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onConfirm={confirmDeleteObjet}
                onCancel={cancelDeleteModal}
                title="Supprimer l'objet"
                message="Êtes-vous sûr de vouloir supprimer cet objet ?"
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

export default Objets;
