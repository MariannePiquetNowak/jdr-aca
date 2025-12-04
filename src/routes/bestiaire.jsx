import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/components/_bestiaire.scss';
import BestiaireForm from '../components/BestiaireForm';
import EnemyCard from '../components/EnemyCard';

const Bestiaire = () => {
    const [enemies, setEnemies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEnemy, setEditingEnemy] = useState(null);
    const [loading, setLoading] = useState(true);
    const API = process.env.REACT_APP_BASE_URL_API;
    const location = useLocation();
    
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
        if (API) {
            try {
                await fetch(`${API}${apiPath}/${enemyId}`, {
                    method: 'DELETE',
                });
                setEnemies(prev => prev.filter(e => e.id !== enemyId));
            } catch (err) {
                console.error('Failed to delete enemy:', err);
                // Still remove from UI even if API fails
                setEnemies(prev => prev.filter(e => e.id !== enemyId));
            }
        } else {
            setEnemies(prev => prev.filter(e => e.id !== enemyId));
        }
    };

    const handleEditEnemy = (enemy) => {
        setEditingEnemy(enemy);
        setShowForm(true);
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
            } catch (err) {
                console.error('Failed to update enemy:', err);
                setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));
            }
        } else {
            setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));
        }
        setShowForm(false);
        setEditingEnemy(null);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingEnemy(null);
    };

    return (
        <main className="main bestiaire-page">
            <section className="bestiaire-section">
                <h1>📚 Bestiaire</h1>

                {loading ? (
                    <p style={{textAlign: 'center', color: '#666', marginTop: '2rem'}}>Chargement...</p>
                ) : (
                    <div className="enemies-grid">
                        {/* Empty card to add new enemy */}
                        <button 
                            className="enemy-card empty-card" 
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
        </main>
    );
};

export default Bestiaire;
