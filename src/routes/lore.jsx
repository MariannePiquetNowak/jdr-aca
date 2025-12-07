import React, { useState, useEffect } from 'react';
import '../styles/components/_info-page.scss';
import dataJson from '../data.json';

const Lore = () => {
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const API = process.env.REACT_APP_BASE_URL_API;

    useEffect(() => {
        // Charger depuis le fichier local pour le moment
        setContent(dataJson.lore?.content || '');
        setLoading(false);
        
        // TODO: Décommenter quand l'API sera déployée
        /*
        if (!API) {
            setLoading(false);
            return;
        }
        fetch(`${API}/lore`)
            .then(res => res.json())
            .then(data => {
                setContent(data.content || '');
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch lore:', err);
                setLoading(false);
            });
        */
    }, [API]);

    const handleSave = async () => {
        if (API) {
            try {
                await fetch(`${API}/lore`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                });
            } catch (err) {
                console.error('Failed to save lore:', err);
            }
        }
        setIsEditing(false);
    };

    // Fonction pour convertir le Markdown basique en HTML
    const renderMarkdown = (text) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        const elements = [];
        let inList = false;
        let listItems = [];
        let inTable = false;
        let tableRows = [];
        
        const flushList = () => {
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
        
        lines.forEach((line, index) => {
            // Titres avec ancres
            if (line.startsWith('# ')) {
                flushList();
                flushTable();
                elements.push(<h1 key={index} style={{fontSize: '2rem', marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a', fontWeight: 'bold'}}>{line.substring(2)}</h1>);
            }
            else if (line.startsWith('## ')) {
                flushList();
                flushTable();
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
                elements.push(<h3 key={index} style={{fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#34495e', fontWeight: 'bold'}}>{line.substring(4)}</h3>);
            }
            // Ligne horizontale
            else if (line.trim() === '---') {
                flushList();
                flushTable();
                elements.push(<hr key={index} style={{margin: '2rem 0', border: 'none', borderTop: '2px solid #ddd'}} />);
            }
            // Liste numérotée
            else if (line.match(/^\d+\.\s/)) {
                flushTable();
                const match = line.match(/^\d+\.\s(.*)/);
                if (match) {
                    const content = match[1];
                    // Gérer les liens dans les listes
                    const linkMatch = content.match(/\[(.+?)\]\((#.+?)\)/);
                    if (linkMatch) {
                        listItems.push(
                            <li key={index} style={{marginBottom: '0.5rem'}}>
                                <a href={linkMatch[2]} style={{color: '#3498db', textDecoration: 'none'}}>{linkMatch[1]}</a>
                            </li>
                        );
                    } else {
                        listItems.push(<li key={index} style={{marginBottom: '0.5rem'}}>{content}</li>);
                    }
                    inList = true;
                }
            }
            // Liste à puces
            else if (line.startsWith('• ')) {
                flushTable();
                const content = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
                            {cells.map((cell, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    fontWeight: isFirstRow ? 'bold' : 'normal',
                                    background: isFirstRow ? '#f8f9fa' : 'white',
                                    borderRight: i < cells.length - 1 ? '1px solid #ddd' : 'none',
                                    textAlign: 'center'
                                }}>
                                    {cell.trim()}
                                </div>
                            ))}
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
                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                elements.push(<p key={index} style={{marginBottom: '0.75rem', lineHeight: '1.8', fontSize: '1rem'}} dangerouslySetInnerHTML={{__html: boldText}} />);
            }
        });
        
        // Vider les listes/tableaux restants
        flushList();
        flushTable();
        
        return elements;
    };

    return (
        <main className="main info-page">
            <h1>📚 Lore & Histoire</h1>
            <div className="info-content">
                {loading ? (
                    <p>Chargement...</p>
                ) : isEditing ? (
                    <>
                        <textarea
                            className="edit-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="15"
                            placeholder="Entrez le lore et l'histoire..."
                        />
                        <div className="edit-actions">
                            <button onClick={handleSave} className="save-btn">💾 Enregistrer</button>
                            <button onClick={() => setIsEditing(false)} className="cancel-btn">✕ Annuler</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="content-display">
                            {content ? (
                                <div>{renderMarkdown(content)}</div>
                            ) : (
                                <p style={{fontStyle: 'italic', color: '#999'}}>Aucun contenu. Cliquez sur "Modifier" pour ajouter du lore.</p>
                            )}
                        </div>
                        <button onClick={() => setIsEditing(true)} className="edit-btn">✏️ Modifier</button>
                    </>
                )}
            </div>
        </main>
    );
};

export default Lore;
