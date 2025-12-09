import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/components/_bestiaire.scss';
import BestiaireForm from '../components/BestiaireForm';
import EnemyCard from '../components/EnemyCard';
import ViewToggle from '../components/ViewToggle';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Bestiaire = () => {
    const [enemies, setEnemies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEnemy, setEditingEnemy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(localStorage.getItem('bestiaireViewMode') || 'grid');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, enemy: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, enemyId: null });
    const [toast, setToast] = useState(null);
    const API = process.env.REACT_APP_BASE_URL_API || '/api';
    const location = useLocation();

    const handleViewChange = (view) => {
        setViewMode(view);
        localStorage.setItem('bestiaireViewMode', view);
    };
    
    // Déterminer le contexte MJ en fonction du referrer stocké dans sessionStorage
    const getMJContext = () => {
        const referrer = sessionStorage.getItem('mjContext');
        if (referrer === 'mja') return 'mja';
        if (referrer === 'mjj') return 'mjj';
        return null; // contexte par défaut (data.json principal)
    };
    
    const mjContext = getMJContext();
    const apiPath = mjContext ? `/${mjContext}/bestiaire` : '/bestiaire';

    // Récupérer les ennemis au montage
    useEffect(() => {
        if (!API) {
            setLoading(false);
            return;
        }
        fetch(`${API}${apiPath}`)
            .then(res => res.json())
            .then(data => {
                setEnemies(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch bestiaire:', err);
                setEnemies([]);
                setLoading(false);
            });
    }, [API, apiPath]);

    const handleAddEnemy = async (enemy) => {
        if (API) {
            try {
                const response = await fetch(`${API}${apiPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(enemy),
                });
                const savedEnemy = await response.json();
                setEnemies(prev => [...prev, savedEnemy]);
            } catch (err) {
                console.error('Failed to save enemy:', err);
                // Fallback to local state if API fails
                setEnemies(prev => [...prev, enemy]);
            }
        } else {
            setEnemies(prev => [...prev, enemy]);
        }
        setShowForm(false);
    };

    const handleDeleteEnemy = async (enemyId) => {
        setDeleteModal({ isOpen: true, enemyId });
    };

    const confirmDeleteEnemy = async () => {
        const { enemyId } = deleteModal;
        const enemyToDelete = enemies.find(e => e.id === enemyId);
        setDeleteModal({ isOpen: false, enemyId: null });

        if (API) {
            try {
                await fetch(`${API}${apiPath}/${enemyId}`, {
                    method: 'DELETE',
                });
                setEnemies(prev => prev.filter(e => e.id !== enemyId));
                setToast({ message: `"${enemyToDelete?.name || 'Ennemi'}" supprimé avec succès !`, type: 'success' });
            } catch (err) {
                console.error('Failed to delete enemy:', err);
                setEnemies(prev => prev.filter(e => e.id !== enemyId));
                setToast({ message: 'Erreur lors de la suppression', type: 'error' });
            }
        } else {
            setEnemies(prev => prev.filter(e => e.id !== enemyId));
            setToast({ message: `"${enemyToDelete?.name || 'Ennemi'}" supprimé avec succès !`, type: 'success' });
        }
    };

    const cancelDeleteModal = () => {
        setDeleteModal({ isOpen: false, enemyId: null });
    };

    const handleEditEnemy = (enemy) => {
        setEditingEnemy(enemy);
        setShowForm(true);
    };

    const handleShareEnemy = async (enemy) => {
        setConfirmModal({ isOpen: true, enemy });
    };

    const confirmShareEnemy = async () => {
        const { enemy } = confirmModal;
        setConfirmModal({ isOpen: false, enemy: null });

        if (!API) {
            setToast({ message: 'API non disponible', type: 'error' });
            return;
        }

        try {
            // Vérifier si l'élément existe déjà dans la bibliothèque partagée
            const checkResponse = await fetch(`${API}/shared/bestiaire`);
            const sharedItems = await checkResponse.json();
            const alreadyExists = sharedItems.some(item => item.id === enemy.id);
            
            if (alreadyExists) {
                setToast({ message: `"${enemy.name}" est déjà dans la bibliothèque partagée !`, type: 'info' });
                return;
            }

            const url = API ? `${API}/shared/bestiaire` : '/api/shared/bestiaire';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enemy),
            });
            setToast({ message: `"${enemy.name}" partagé avec succès !`, type: 'success' });
        } catch (error) {
            console.error('Erreur lors du partage:', error);
            setToast({ message: 'Erreur lors du partage', type: 'error' });
        }
    };

    const cancelShareModal = () => {
        setConfirmModal({ isOpen: false, enemy: null });
    };

    const handleUpdateEnemy = async (updatedEnemy) => {
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${updatedEnemy.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedEnemy),
                });
                setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));
                setToast({ message: `"${updatedEnemy.name}" modifié avec succès !`, type: 'success' });
            } catch (err) {
                console.error('Failed to update enemy:', err);
                setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));
                setToast({ message: 'Erreur lors de la modification', type: 'error' });
            }
        } else {
            setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));
            setToast({ message: `"${updatedEnemy.name}" modifié avec succès !`, type: 'success' });
        }
        setShowForm(false);
        setEditingEnemy(null);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingEnemy(null);
    };

    const containerClass = viewMode === 'list' ? 'enemies-list' : 
                          viewMode === 'gallery' ? 'enemies-gallery' : 
                          'enemies-grid';

    return (
        <main className="main bestiaire-page">
            <section className="bestiaire-section">
                <div className="bestiaire-header">
                    <h1>📚 Bestiaire</h1>
                    <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
                </div>

                {loading ? (
                    <p style={{textAlign: 'center', color: '#666', marginTop: '2rem'}}>Chargement...</p>
                ) : (
                    <div className={containerClass}>
                        {/* Empty card to add new enemy */}
                        <button 
                            className={viewMode === 'list' ? 'enemy-list-item empty-card' : 'enemy-card empty-card'}
                            onClick={() => setShowForm(true)}
                            aria-label="Ajouter un nouvel ennemi"
                        >
                            <div className="empty-card-content">
                                <span className="empty-card-icon">+</span>
                                <span className="empty-card-text">Ajouter un ennemi</span>
                            </div>
                        </button>

                        {enemies.map(enemy => (
                            <EnemyCard 
                                key={enemy.id} 
                                enemy={enemy} 
                                onDelete={handleDeleteEnemy}
                                onEdit={handleEditEnemy}
                                onShare={handleShareEnemy}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal for form */}
            {showForm && (
                <div className="bestiaire-modal-overlay" onClick={handleCancelForm}>
                    <div className="bestiaire-modal-content" onClick={(e) => e.stopPropagation()}>
                        <BestiaireForm 
                            onAddEnemy={editingEnemy ? handleUpdateEnemy : handleAddEnemy} 
                            onCancel={handleCancelForm}
                            initialData={editingEnemy}
                        />
                    </div>
                </div>
            )}

            {/* Confirmation modal for sharing */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onConfirm={confirmShareEnemy}
                onCancel={cancelShareModal}
                title="Partager dans la bibliothèque"
                message={`Voulez-vous partager "${confirmModal.enemy?.name}" dans la bibliothèque partagée ?`}
                confirmText="Partager"
                cancelText="Annuler"
            />

            {/* Confirmation modal for deletion */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onConfirm={confirmDeleteEnemy}
                onCancel={cancelDeleteModal}
                title="Supprimer l'ennemi"
                message="Êtes-vous sûr de vouloir supprimer cet ennemi ?"
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
        </main>
    );
};

export default Bestiaire;
