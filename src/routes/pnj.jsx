import React, { useState, useEffect } from 'react';
import PNJCard from '../components/PNJCard';
import PNJForm from '../components/PNJForm';
import '../styles/components/_pnj.scss';

const PNJ = () => {
    const [pnjs, setPnjs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPNJ, setEditingPNJ] = useState(null);
    const [loading, setLoading] = useState(true);
    const API = process.env.REACT_APP_BASE_URL_API;
    
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
                const response = await fetch(`${API}${apiPath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pnj),
                });
                await response.json();
                // Mise à jour optimiste de l'état local
                setPnjs(prev => [...prev, pnj]);
            } catch (err) {
                console.error('Erreur lors de l\'ajout du PNJ:', err);
                // Fallback vers l'état local si l'API échoue
                setPnjs(prev => [...prev, pnj]);
            }
        } else {
            setPnjs(prev => [...prev, pnj]);
        }
        setShowForm(false);
        setEditingPNJ(null);
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
            } catch (err) {
                console.error('Erreur lors de la modification du PNJ:', err);
                setPnjs(prev => prev.map(p => p.id === updatedPNJ.id ? updatedPNJ : p));
            }
        } else {
            setPnjs(prev => prev.map(p => p.id === updatedPNJ.id ? updatedPNJ : p));
        }
        setShowForm(false);
        setEditingPNJ(null);
    };

    const handleDeletePNJ = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce PNJ ?')) return;
        
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${id}`, {
                    method: 'DELETE',
                });
                setPnjs(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression du PNJ:', error);
                // Supprimer quand même de l'UI même si l'API échoue
                setPnjs(prev => prev.filter(p => p.id !== id));
            }
        } else {
            setPnjs(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleEditPNJ = (pnj) => {
        setEditingPNJ(pnj);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPNJ(null);
    };

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
                <h1>👥 Personnages Non-Joueurs</h1>
                
                <div className="pnjs-grid">
                    <div 
                        className="pnj-card empty-card" 
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
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PNJ;
