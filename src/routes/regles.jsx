import React, { useState, useEffect } from 'react';
import '../styles/components/_info-page.scss';
import dataJson from '../data.json';
import BookReader from '../components/BookReader';

const Regles = () => {
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('book'); // 'book' ou 'normal'
    const API = process.env.REACT_APP_BASE_URL_API || '/api';

    useEffect(() => {
        // Charger depuis le fichier local pour le moment
        setContent(dataJson.regles?.content || '');
        setLoading(false);
        
        // TODO: Décommenter quand l'API sera déployée
        /*
        if (!API) {
            setLoading(false);
            return;
        }
        fetch(`${API}/regles`)
            .then(res => res.json())
            .then(data => {
                setContent(data.content || '');
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch règles:', err);
                setLoading(false);
            });
        */
    }, [API]);

    const handleSave = async () => {
        if (API) {
            try {
                const res = await fetch(`${API}/regles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error('Failed to save règles:', res.status, text);
                    alert('Erreur lors de la sauvegarde des règles (' + res.status + ')');
                    return;
                }
            } catch (err) {
                console.error('Failed to save règles:', err);
                alert('Erreur lors de la sauvegarde des règles: ' + err.message);
                return;
            }
        }
        setIsEditing(false);
    };

    // Fonction pour générer le sommaire enrichi
    const generateEnhancedContent = (text) => {
        if (!text) return text;
        
        const lines = text.split('\n');
        const enhancedLines = [];
        let inSommaire = false;
        let afterSeparator = false;
        let mainTitleIndex = 0;
        
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
                            enhancedLines.push(`    ${subRomanNumeral}. [${subtitle}](#${anchorId})`);
                        }
                    });
                });
                enhancedLines.push('');
                enhancedLines.push(line);
                inSommaire = false;
                afterSeparator = true;
            } else if (inSommaire && line.match(/^\d+\.\s/)) {
                // Ignorer les anciennes lignes du sommaire
            } else {
                enhancedLines.push(line);
            }
        });
        
        return enhancedLines.join('\n');
    };

    // Fonction pour convertir le Markdown basique en HTML
    const renderMarkdown = (text) => {
        if (!text) return null;
        
        const enhancedText = generateEnhancedContent(text);
        const lines = enhancedText.split('\n');
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
            // Ligne horizontale
            else if (line.trim() === '---') {
                flushList();
                flushTable();
                elements.push(<hr key={index} style={{margin: '2rem 0', border: 'none', borderTop: '2px solid #ddd'}} />);
            }
            // Liste avec chiffres romains ou numéros
            else if (line.match(/^\s*(?:[IVX]+|[ivx]+|\d+)\.\s/)) {
                flushTable();
                const match = line.match(/^\s*([IVX]+|[ivx]+|\d+)\.\s(.*)/);
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
                // Traiter le gras et italique ensemble (***texte***)
                content = content.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                // Traiter le gras (**texte**)
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Traiter l'italique (*texte*)
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
                                // Traiter le markdown dans les cellules
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
                // Traiter le gras et italique ensemble (***texte***)
                formattedText = formattedText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                // Traiter le gras (**texte**)
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Traiter l'italique (*texte*)
                formattedText = formattedText.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                elements.push(<p key={index} style={{marginBottom: '0.75rem', lineHeight: '1.8', fontSize: '1rem'}} dangerouslySetInnerHTML={{__html: formattedText}} />);
            }
        });
        
        // Vider les listes/tableaux restants
        flushList();
        flushTable();
        
        return elements;
    };

    return (
        <main className="main info-page" style={{paddingTop: viewMode === 'book' && !isEditing ? '1rem' : '2rem'}}>
            {isEditing && (
                <h1 style={{marginBottom: '2rem'}}>📜 Règles du jeu</h1>
            )}
            
            {!isEditing && viewMode === 'book' ? (
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'center'}}>
                    <BookReader content={content} />
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0}}>
                        <button 
                            onClick={() => setViewMode('normal')} 
                            className="view-mode-btn"
                            style={{padding: '0.75rem', fontSize: '1.5rem', minWidth: '50px'}}
                            title="Vue normale"
                        >
                            📄
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="view-mode-btn"
                            style={{padding: '0.75rem', fontSize: '1.5rem', minWidth: '50px'}}
                            title="Modifier"
                        >
                            ✏️
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {!isEditing ? (
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0}}>
                                <button 
                                    onClick={() => setViewMode('book')} 
                                    className="view-mode-btn"
                                    style={{padding: '0.75rem', fontSize: '1.5rem', minWidth: '50px'}}
                                    title="Mode livre"
                                >
                                    📖
                                </button>
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="view-mode-btn"
                                    style={{padding: '0.75rem', fontSize: '1.5rem', minWidth: '50px'}}
                                    title="Modifier"
                                >
                                    ✏️
                                </button>
                            </div>
                            <div style={{flex: 1, minWidth: 0}}>
                                <div className="info-content">
                                    {loading ? (
                                        <p>Chargement...</p>
                                    ) : (
                                        <div className="content-display">
                                            {content ? (
                                                <div>{renderMarkdown(content)}</div>
                                            ) : (
                                                <p style={{fontStyle: 'italic', color: '#999'}}>Aucun contenu. Cliquez sur "Modifier" pour ajouter des règles.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="info-content">
                            <textarea
                                className="edit-textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="15"
                                placeholder="Entrez les règles du jeu..."
                            />
                            <div className="edit-actions">
                                <button onClick={handleSave} className="save-btn">💾 Enregistrer</button>
                                <button onClick={() => setIsEditing(false)} className="cancel-btn">✕ Annuler</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default Regles;
