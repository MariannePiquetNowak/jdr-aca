import React, { useState, useEffect } from 'react';
import ObjetCard from '../components/ObjetCard';
import ObjetForm from '../components/ObjetForm';
import '../styles/sections/_objets.scss';

const Objets = () => {
    const [objets, setObjets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingObjet, setEditingObjet] = useState(null);
    const [loading, setLoading] = useState(true);
    const API = process.env.REACT_APP_BASE_URL_API;

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
            } catch (err) {
                console.error('Erreur lors de la modification de l\'objet:', err);
                setObjets(prev => prev.map(o => o.id === updatedObjet.id ? updatedObjet : o));
            }
        } else {
            setObjets(prev => prev.map(o => o.id === updatedObjet.id ? updatedObjet : o));
        }
        setShowForm(false);
        setEditingObjet(null);
    };

    const handleDeleteObjet = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) return;
        
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${id}`, {
                    method: 'DELETE',
                });
                setObjets(prev => prev.filter(o => o.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'objet:', error);
                // Supprimer quand même de l'UI même si l'API échoue
                setObjets(prev => prev.filter(o => o.id !== id));
            }
        } else {
            setObjets(prev => prev.filter(o => o.id !== id));
        }
    };

    const handleEditObjet = (objet) => {
        setEditingObjet(objet);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingObjet(null);
    };

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
                <h1>🎁 Objets</h1>
                
                <div className="objets-grid">
                    <div 
                        className="objet-card empty-card" 
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
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Objets;
