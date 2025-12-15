import React, { useState, useEffect } from 'react';
import '../styles/components/_book-reader.scss';

const BookReader = ({ content, robust = false, onOpenItem = null }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [showSommaire, setShowSommaire] = useState(false);
    const [panelVisible, setPanelVisible] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(false);

    // Fermer automatiquement le sommaire quand on revient sur la page 0 (pages 1-2)
    useEffect(() => {
        let timeoutId;
        let rafId1, rafId2;
        
        if (currentPage === 0) {
            setShowSommaire(false);
            setButtonVisible(false);
            // Attendre la fin de l'animation avant de cacher le panneau
            timeoutId = setTimeout(() => setPanelVisible(false), 300);
        } else {
            // Afficher le panneau immédiatement
            setPanelVisible(true);
            setButtonVisible(false);
            // Petit délai pour que le navigateur render la position initiale avant l'animation
            rafId1 = requestAnimationFrame(() => {
                rafId2 = requestAnimationFrame(() => {
                    setButtonVisible(true);
                });
            });
        }
        
        // Cleanup : annuler les animations en cours si on change de page rapidement
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (rafId1) cancelAnimationFrame(rafId1);
            if (rafId2) cancelAnimationFrame(rafId2);
        };
    }, [currentPage]);

    // Fonction pour trouver la page contenant une ancre spécifique
    const findPageWithAnchor = (anchorId) => {
        console.log('Searching for anchor:', anchorId);
        for (let i = 0; i < pages.length; i++) {
            const pageContent = pages[i];
            console.log('Checking page', i, 'content length:', pageContent.length);
            // Chercher l'ancre dans le contenu de la page
            if (pageContent.includes(`<a name="${anchorId}"></a>`) || pageContent.includes(`id="${anchorId}"`)) {
                console.log('Found anchor on page', i);
                return i;
            }
            // Chercher aussi par le texte du titre (pour les ###)
            const lines = pageContent.split('\n');
            for (const line of lines) {
                if (line.startsWith('### ')) {
                    const subtitle = line.substring(4).replace(/\s*:$/, '');
                    const generatedId = subtitle.toLowerCase()
                        .replace(/[àáâãäå]/g, 'a')
                        .replace(/[èéêë]/g, 'e')
                        .replace(/[ìíîï]/g, 'i')
                        .replace(/[òóôõö]/g, 'o')
                        .replace(/[ùúûü]/g, 'u')
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    if (generatedId === anchorId) {
                        console.log('Found subtitle anchor on page', i);
                        return i;
                    }
                }
            }
        }
        console.log('Anchor not found');
        return -1;
    };

    // Gestionnaire de clics pour les liens dans le contenu
    useEffect(() => {
        const handleLinkClick = (e) => {
            const target = e.target;
            if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
                console.log('Link clicked:', target.getAttribute('href'));
                e.preventDefault();
                const targetId = target.getAttribute('href').substring(1);
                console.log('Target ID:', targetId);
                const pageIndex = findPageWithAnchor(targetId);
                console.log('Page index found:', pageIndex);
                if (pageIndex >= 0) {
                    const pageToShow = Math.floor(pageIndex / 2) * 2;
                    console.log('Setting page to:', pageToShow);
                    setCurrentPage(pageToShow);
                    if (pageToShow === 0) {
                        setShowSommaire(false);
                    }
                }
            }
        };

        // Attendre que le DOM soit rendu
        const timer = setTimeout(() => {
            const bookContainer = document.querySelector('.book-container');
            if (bookContainer) {
                console.log('Attaching event listener to book-container');
                bookContainer.addEventListener('click', handleLinkClick);
            } else {
                console.log('Book container not found');
            }
        }, 1000); // Augmenter le délai

        return () => {
            clearTimeout(timer);
            const bookContainer = document.querySelector('.book-container');
            if (bookContainer) {
                console.log('Removing event listener');
                bookContainer.removeEventListener('click', handleLinkClick);
            }
        };
    }, [currentPage]); // Dépend de currentPage pour que findPageWithAnchor soit à jour

    // Générer un sommaire enrichi avec les sous-titres
    const generateEnhancedContent = (text) => {
        if (!text) return text;
        
        const lines = text.split('\n');
        const enhancedLines = [];
        let inSommaire = false;
        let sommaireIndex = -1;
        let afterSeparator = -1;
        
        // Première passe : trouver le sommaire et collecter les titres
        const titles = [];
        lines.forEach((line, index) => {
            if (line.trim() === '## Sommaire') {
                inSommaire = true;
                sommaireIndex = index;
            } else if (inSommaire && line.trim() === '---') {
                afterSeparator = index;
                inSommaire = false;
            } else if (!inSommaire && afterSeparator > 0) {
                // Collecter les titres après le séparateur
                if (line.startsWith('## ')) {
                    const title = line.substring(3);
                    const anchorMatch = title.match(/<a name="(.*?)"><\/a>(.*)/);
                    if (anchorMatch) {
                        titles.push({ level: 2, anchor: anchorMatch[1], text: anchorMatch[2], subtitles: [] });
                    }
                } else if (line.startsWith('### ') && titles.length > 0) {
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
                    const lastTitle = titles[titles.length - 1];
                    if (lastTitle.subtitles.length === 0 || lastTitle.subtitles[lastTitle.subtitles.length - 1].subSubtitles === undefined) {
                        lastTitle.subtitles.push({ anchor: anchorId, text: subtitle, subSubtitles: [] });
                    } else {
                        lastTitle.subtitles[lastTitle.subtitles.length - 1].subSubtitles.push({ anchor: anchorId, text: subtitle });
                    }
                } else if (line.startsWith('#### ') && titles.length > 0 && titles[titles.length - 1].subtitles.length > 0) {
                    const subSubTitle = line.substring(5).replace(/<a name=".*?"><\/a>/, '').replace(/\s*:$/, '');
                    const anchorMatch = line.match(/<a name="(.*?)"><\/a>/);
                    const anchorId = anchorMatch ? anchorMatch[1] : subSubTitle.toLowerCase()
                        .replace(/[àáâãäå]/g, 'a')
                        .replace(/[èéêë]/g, 'e')
                        .replace(/[ìíîï]/g, 'i')
                        .replace(/[òóôõö]/g, 'o')
                        .replace(/[ùúûü]/g, 'u')
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    const lastSubtitle = titles[titles.length - 1].subtitles[titles[titles.length - 1].subtitles.length - 1];
                    if (lastSubtitle && lastSubtitle.subSubtitles) {
                        lastSubtitle.subSubtitles.push({ anchor: anchorId, text: subSubTitle });
                    }
                }
            }
        });
        
        // Fonction pour convertir en chiffres romains
        const toRoman = (num) => {
            const romanNumerals = [
                { value: 10, numeral: 'X' },
                { value: 9, numeral: 'IX' },
                { value: 5, numeral: 'V' },
                { value: 4, numeral: 'IV' },
                { value: 1, numeral: 'I' }
            ];
            let result = '';
            for (const { value, numeral } of romanNumerals) {
                while (num >= value) {
                    result += numeral;
                    num -= value;
                }
            }
            return result;
        };
        
        // Deuxième passe : reconstruire avec le sommaire enrichi
        lines.forEach((line, index) => {
            if (index === sommaireIndex) {
                enhancedLines.push(line);
                // Ajouter les titres principaux avec chiffres romains majuscules continus
                titles.forEach((title, i) => {
                    enhancedLines.push(`${toRoman(i + 1)}. <a href="#${title.anchor}">${title.text}</a>`);
                    // Ajouter les sous-titres avec chiffres romains minuscules (recommence à i pour chaque section)
                    title.subtitles.forEach((sub, j) => {
                        enhancedLines.push(`   ${toRoman(j + 1).toLowerCase()}. <a href="#${sub.anchor}">${sub.text}</a>`);
                        // Ajouter les sous-sous-titres avec lettres minuscules
                        if (sub.subSubtitles && sub.subSubtitles.length > 0) {
                            sub.subSubtitles.forEach((subsub, k) => {
                                enhancedLines.push(`      ${String.fromCharCode(97 + k)}. <a href="#${subsub.anchor}">${subsub.text}</a>`);
                            });
                        }
                    });
                });
            } else if (index > sommaireIndex && index < afterSeparator) {
                // Ignorer l'ancien contenu du sommaire
                return;
            } else {
                enhancedLines.push(line);
            }
        });
        
        return enhancedLines.join('\n');
    };

    const enhancedContent = generateEnhancedContent(content);

    // Diviser le contenu en pages de manière intelligente
    const splitContentIntoPages = (text) => {
        if (!text) return [];

        const lines = text.split('\n');
        const pages = [];
        const maxHeight = 600;

        const estimateLineHeight = (line) => {
            if (line.startsWith('# ')) return 70;
            if (line.startsWith('## ')) return 55;
            if (line.startsWith('### ')) return 40;
            if (line.trim() === '---') return 35;
            if (line.trim() === '') return 12;
            if (line.startsWith('• ') || line.match(/^\d+\.\s/)) return 22;
            if (line.includes('|') && line.trim().startsWith('|')) return 38;
            return 25;
        };

        const isMajorTitle = (line) => {
            return line && line.startsWith('## ') && !line.startsWith('### ');
        };

        // Si un sommaire est présent au début (## Sommaire ... ---),
        // on force tout ce bloc (depuis le début) sur la première page
        // (titre + sommaire) pour reproduire le comportement de Règles/Lore.
        const sepIndex = lines.findIndex((l, idx) => l.trim() === '---' && idx > 0 && lines.slice(0, idx).some(x => x.trim() === '## Sommaire'));
        if (sepIndex >= 0) {
            const firstBlock = lines.splice(0, sepIndex + 1);
            pages.push(firstBlock.join('\n'));
        }

        // Simple pagination robuste : accumuler lignes jusqu'à maxHeight,
        // forcer les titres majeurs sur une page dédiée pour respecter la mise en page.
        let currentLines = [];
        let currentHeight = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const h = estimateLineHeight(line);

            if (isMajorTitle(line)) {
                // si on a du contenu en attente, on le ferme
                if (currentLines.length > 0) {
                    pages.push(currentLines.join('\n'));
                    currentLines = [];
                    currentHeight = 0;
                }
                // Assurer que la page du titre tombera sur un numéro impair
                // (indices de pages 0-based pairs -> numéros impairs: index+1)
                if (pages.length % 2 === 1) {
                    // insérer une page vide de remplissage pour aligner
                    pages.push('');
                }
                // mettre le titre sur sa propre page (gauche)
                pages.push(line);
                continue;
            }

            if (currentHeight + h > maxHeight && currentLines.length > 0) {
                pages.push(currentLines.join('\n'));
                currentLines = [line];
                currentHeight = h;
            } else {
                currentLines.push(line);
                currentHeight += h;
            }
        }

        if (currentLines.length > 0) pages.push(currentLines.join('\n'));

        return pages;
    };

    // Version legacy du découpage (comportement historique utilisé par Lore / Règles)
    const splitContentIntoPagesLegacy = (text) => {
        if (!text) return [];
        const lines = text.split('\n');
        const pages = [];
        const maxHeight = 600;

        const estimateLineHeight = (line) => {
            if (line.startsWith('# ')) return 70;
            if (line.startsWith('## ')) return 55;
            if (line.startsWith('### ')) return 40;
            if (line.trim() === '---') return 35;
            if (line.trim() === '') return 12;
            if (line.startsWith('• ') || line.match(/^\d+\.\s/)) return 22;
            if (line.includes('|') && line.trim().startsWith('|')) return 38;
            return 25;
        };

        const isMajorTitle = (line) => {
            return line.startsWith('## ') && !line.startsWith('### ');
        };

        const isSommaire = (line) => {
            return line.trim() === '## Sommaire';
        };

        const isPartOfTable = (index) => {
            const line = lines[index];
            return line && line.includes('|') && line.trim().startsWith('|');
        };

        const getTableEndIndex = (startIndex) => {
            for (let i = startIndex; i < lines.length; i++) {
                if (!isPartOfTable(i)) {
                    return i - 1;
                }
            }
            return lines.length - 1;
        };

        let i = 0;
        let contentLines = [];
        let contentHeight = 0;
        let firstPageDone = false;

        while (i < lines.length) {
            const line = lines[i];
            const lineHeight = estimateLineHeight(line);

            // Si on trouve le sommaire, on inclut tout jusqu'à la ligne ---
            if (isSommaire(line) && !firstPageDone) {
                contentLines.push(line);
                contentHeight += lineHeight;
                i++;

                // Continuer jusqu'à la ligne ---
                while (i < lines.length && lines[i].trim() !== '---') {
                    contentLines.push(lines[i]);
                    contentHeight += estimateLineHeight(lines[i]);
                    i++;
                }

                // Ajouter la ligne --- aussi
                if (i < lines.length && lines[i].trim() === '---') {
                    contentLines.push(lines[i]);
                    contentHeight += estimateLineHeight(lines[i]);
                    i++;
                }

                // Créer la première page avec titre + sommaire
                if (contentLines.length > 0) {
                    pages.push(contentLines.join('\n'));
                    contentLines = [];
                    contentHeight = 0;
                    firstPageDone = true;
                }
                continue;
            }

            // Après la première page, gérer les titres majeurs sur page impaire (gauche)
            if (firstPageDone && isMajorTitle(line)) {
                // Si on a du contenu en attente, le sauvegarder
                if (contentLines.length > 0) {
                    pages.push(contentLines.join('\n'));
                    contentLines = [];
                    contentHeight = 0;
                }

                // Page impaire (gauche) : juste le titre
                pages.push(line);
                i++;

                // Page paire (droite) : le contenu qui suit jusqu'au prochain titre majeur
                contentLines = [];
                contentHeight = 0;

                while (i < lines.length && !isMajorTitle(lines[i])) {
                    const currentLine = lines[i];
                    const currentHeight = estimateLineHeight(currentLine);

                    // Vérifier si c'est le début d'un tableau
                    if (isPartOfTable(i)) {
                        const tableEndIndex = getTableEndIndex(i);
                        let tableHeight = 0;
                        for (let j = i; j <= tableEndIndex; j++) {
                            tableHeight += estimateLineHeight(lines[j]);
                        }

                        // Si le tableau ne rentre pas dans la page actuelle
                        if (contentHeight + tableHeight > maxHeight && contentLines.length > 0) {
                            // Finir la page actuelle
                            pages.push(contentLines.join('\n'));
                            contentLines = [];
                            contentHeight = 0;
                        }

                        // Ajouter le tableau
                        for (let j = i; j <= tableEndIndex; j++) {
                            contentLines.push(lines[j]);
                            contentHeight += estimateLineHeight(lines[j]);
                        }
                        i = tableEndIndex + 1;
                    }
                    // Si on dépasse la hauteur max, créer une nouvelle page
                    else if (contentHeight + currentHeight > maxHeight) {
                        if (contentLines.length > 0) {
                            pages.push(contentLines.join('\n'));
                            contentLines = [];
                            contentHeight = 0;
                        }
                        contentLines.push(currentLine);
                        contentHeight = currentHeight;
                        i++;
                    }
                    // Ligne normale
                    else {
                        contentLines.push(currentLine);
                        contentHeight += currentHeight;
                        i++;
                    }
                }

                // Sauvegarder le contenu de la section
                if (contentLines.length > 0) {
                    pages.push(contentLines.join('\n'));
                    contentLines = [];
                    contentHeight = 0;
                }
            }
            // Contenu sans titre majeur (ne devrait pas arriver après firstPageDone)
            else {
                contentLines.push(line);
                contentHeight += lineHeight;
                i++;
            }
        }

        // Ajouter la dernière page si nécessaire
        if (contentLines.length > 0) {
            pages.push(contentLines.join('\n'));
        }

        return pages;
    };

    // Choisir la méthode de découpage : legacy (par défaut) ou robuste (optionnelle)
    const pages = robust ? splitContentIntoPages(enhancedContent) : splitContentIntoPagesLegacy(enhancedContent);
    const totalPages = pages.length;

    // Diagnostic: loguer quelques informations pour aider le debug
    try {
        // Nombre de pages et longueur (lignes) de chaque page
        const pageLines = pages.map(p => (typeof p === 'string' ? p.split('\n').length : 0));
        // afficher uniquement en dev
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('BookReader: totalPages=', totalPages, 'pageLines=', pageLines);
            // log first page content truncated
            // eslint-disable-next-line no-console
            console.debug('BookReader: first page preview:\n', pages[0] ? pages[0].slice(0, 800) : '<empty>');
        }
    } catch (e) {
        // ignore
    }



    const renderMarkdown = (text, isSingleTitle = false) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        const elements = [];
        let inList = false;
        let listItems = [];
        let inTable = false;
        let tableRows = [];
        let inHtmlBlock = false;
        let htmlBlock = [];
        
        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} style={{margin: 0, paddingLeft: '0.75rem'}}>
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
                    <table key={`table-${elements.length}`} style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1rem'}}>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </table>
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
            
            if (line.startsWith('# ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                elements.push(<h1 key={index}>{line.substring(2)}</h1>);
            }
            else if (line.startsWith('## ')) {
                flushList();
                flushTable();
                flushHtmlBlock();
                const title = line.substring(3);
                const anchorMatch = title.match(/<a name="(.*?)"><\/a>(.*)/);
                const className = isSingleTitle ? 'centered-title' : '';
                if (anchorMatch) {
                    elements.push(<h2 key={index} id={anchorMatch[1]} className={className}>{anchorMatch[2]}</h2>);
                } else {
                    elements.push(<h2 key={index} className={className}>{title}</h2>);
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
                elements.push(<h3 key={index} id={anchorId}>{subtitle}</h3>);
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
                elements.push(<h4 key={index} id={id} style={{fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 'bold'}}>{subSubTitle}</h4>);
            }
            else if (line.trim() === '---') {
                flushList();
                flushTable();
                flushHtmlBlock();
                elements.push(<hr key={index} />);
            }
            else if (line.match(/^\s*(?:[IVX]+|[ivx]+)\.\s/)) {
                // Liste avec chiffres romains (majuscules ou minuscules)
                const match = line.match(/^\s*([IVX]+|[ivx]+)\.\s(.*)/);
                if (match) {
                    const romanNumeral = match[1];
                    const content = match[2];
                    const linkMatch = content.match(/\[(.+?)\]\((#.+?)\)/);
                    const htmlLinkMatch = content.match(/<a href="#([^"]+)">([^<]+)<\/a>/);
                    const isSubItem = romanNumeral === romanNumeral.toLowerCase();
                    
                    if (linkMatch) {
                        const handleClick = (e) => {
                            e.preventDefault();
                            const targetId = linkMatch[2].substring(1); // Enlever le #
                            
                            // Trouver la page contenant l'ancre
                            const pageIndex = findPageWithAnchor(targetId);
                            if (pageIndex >= 0) {
                                // Naviguer vers cette page (arrondir au nombre pair pour afficher les deux pages)
                                const pageToShow = Math.floor(pageIndex / 2) * 2;
                                setCurrentPage(pageToShow);
                                
                                // Fermer le sommaire si on va sur la page 0
                                if (pageToShow === 0) {
                                    setShowSommaire(false);
                                }
                            }
                        };
                        
                        listItems.push(
                            <li key={index} style={isSubItem ? {marginLeft: '0.75rem', listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.85rem'} : {listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.95rem'}}>
                                <span style={{minWidth: '1.5rem', fontWeight: '600', flexShrink: 0}}>{romanNumeral}.</span>
                                <a href={linkMatch[2]} onClick={handleClick} style={{color: '#667eea', textDecoration: 'none', cursor: 'pointer', flex: 1}}>
                                    {linkMatch[1]}
                                </a>
                            </li>
                        );
                    } else if (htmlLinkMatch) {
                        const handleClick = (e) => {
                            e.preventDefault();
                            const targetId = htmlLinkMatch[1];
                            
                            // Trouver la page contenant l'ancre
                            const pageIndex = findPageWithAnchor(targetId);
                            if (pageIndex >= 0) {
                                // Naviguer vers cette page (arrondir au nombre pair pour afficher les deux pages)
                                const pageToShow = Math.floor(pageIndex / 2) * 2;
                                setCurrentPage(pageToShow);
                                
                                // Fermer le sommaire si on va sur la page 0
                                if (pageToShow === 0) {
                                    setShowSommaire(false);
                                }
                            }
                        };
                        
                        listItems.push(
                            <li key={index} style={isSubItem ? {marginLeft: '0.75rem', listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.85rem'} : {listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.95rem'}}>
                                <span style={{minWidth: '1.5rem', fontWeight: '600', flexShrink: 0}}>{romanNumeral}.</span>
                                <a href={`#${htmlLinkMatch[1]}`} onClick={handleClick} style={{color: '#667eea', textDecoration: 'none', cursor: 'pointer', flex: 1}}>
                                    {htmlLinkMatch[2]}
                                </a>
                            </li>
                        );
                    } else {
                        listItems.push(
                            <li key={index} style={isSubItem ? {marginLeft: '0.75rem', listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.85rem'} : {listStyleType: 'none', display: 'flex', fontFamily: 'Garamond, "Times New Roman", serif', marginBottom: '0.25rem', fontSize: '0.95rem'}}>
                                <span style={{minWidth: '1.5rem', fontWeight: '600', flexShrink: 0}}>{romanNumeral}.</span>
                                <span style={{flex: 1}}>{content}</span>
                            </li>
                        );
                    }
                    inList = true;
                }
            }
            else if (line.match(/^\d+\.\s/)) {
                // Liste numérotée standard (pour compatibilité)
                const match = line.match(/^\d+\.\s(.*)/);
                if (match) {
                    const content = match[1];
                    const linkMatch = content.match(/\[(.+?)\]\((#.+?)\)/);
                    const htmlLinkMatch = content.match(/<a href="#([^"]+)">([^<]+)<\/a>/);
                    if (linkMatch) {
                        const handleClick = (e) => {
                            e.preventDefault();
                            const targetId = linkMatch[2].substring(1);
                            
                            const pageIndex = findPageWithAnchor(targetId);
                            if (pageIndex >= 0) {
                                const pageToShow = Math.floor(pageIndex / 2) * 2;
                                setCurrentPage(pageToShow);
                                
                                // Fermer le sommaire si on va sur la page 0
                                if (pageToShow === 0) {
                                    setShowSommaire(false);
                                }
                            }
                        };
                        listItems.push(
                            <li key={index}>
                                <a href={linkMatch[2]} onClick={handleClick} style={{color: '#667eea', textDecoration: 'none', cursor: 'pointer'}}>
                                    {linkMatch[1]}
                                </a>
                            </li>
                        );
                    } else if (htmlLinkMatch) {
                        const handleClick = (e) => {
                            e.preventDefault();
                            const targetId = htmlLinkMatch[1];
                            
                            const pageIndex = findPageWithAnchor(targetId);
                            if (pageIndex >= 0) {
                                const pageToShow = Math.floor(pageIndex / 2) * 2;
                                setCurrentPage(pageToShow);
                                
                                // Fermer le sommaire si on va sur la page 0
                                if (pageToShow === 0) {
                                    setShowSommaire(false);
                                }
                            }
                        };
                        listItems.push(
                            <li key={index}>
                                <a href={`#${htmlLinkMatch[1]}`} onClick={handleClick} style={{color: '#667eea', textDecoration: 'none', cursor: 'pointer'}}>
                                    {htmlLinkMatch[2]}
                                </a>
                            </li>
                        );
                    } else {
                        listItems.push(<li key={index}>{content}</li>);
                    }
                    inList = true;
                }
            }
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
                    <li key={index} dangerouslySetInnerHTML={{__html: content}} />
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
                        <tr key={`row-${index}`} style={{borderBottom: '1px solid #ddd'}}>
                            {cells.map((cell, i) => {
                                let cellContent = cell.trim();
                                // Traiter le markdown dans les cellules
                                cellContent = cellContent.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                                cellContent = cellContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                cellContent = cellContent.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                                
                                return (
                                    <td key={i} style={{
                                        padding: '0.5rem',
                                        fontWeight: isFirstRow ? 'bold' : 'normal',
                                        background: isFirstRow ? '#f8f9fa' : 'transparent',
                                        borderRight: i < cells.length - 1 ? '1px solid #ddd' : 'none',
                                        textAlign: 'center',
                                        fontSize: '0.9rem'
                                    }} dangerouslySetInnerHTML={{__html: cellContent}}>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                    inTable = true;
                }
            }
            else if (line.trim() === '') {
                if (inList) flushList();
                if (inTable) flushTable();
                if (inHtmlBlock) flushHtmlBlock();
            }
            else {
                if (inList) flushList();
                if (inTable) flushTable();
                if (line.trim().startsWith('<div')) {
                    inHtmlBlock = true;
                    htmlBlock = [line];
                    if (line.trim().endsWith('</div>')) {
                        flushHtmlBlock();
                    }
                } else {
                    let formattedText = line;
                // Traiter le gras et italique ensemble (***texte***)
                formattedText = formattedText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                // Traiter le gras (**texte**)
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Traiter l'italique (*texte*)
                formattedText = formattedText.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
                // Traiter les liens markdown [texte](#anchor)
                formattedText = formattedText.replace(/\[([^\]]+)\]\((#[^)]+)\)/g, '<a href="$2">$1</a>');

                // Si la ligne contient déjà un bloc HTML (ex: <div> contenant les PNJ/Monstres),
                // détecter les attributs `data-pnj-id` / `data-monster-id` pour rendre des conteneurs
                // cliquables qui appellent le callback `onOpenItem` si fourni.
                const trimmed = formattedText.trim();
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
                                <img src={imgSrc} alt="" style={{width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: onOpenItem ? 'pointer' : 'default'}} onClick={() => onOpenItem && onOpenItem('pnj', id)} />
                                <div style={{flex: 1}} dangerouslySetInnerHTML={{__html: rest}} />
                            </div>
                        );
                    } else {
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
                                <img src={imgSrc} alt="" style={{width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: onOpenItem ? 'pointer' : 'default'}} onClick={() => onOpenItem && onOpenItem('monster', id)} />
                                <div style={{flex: 1}} dangerouslySetInnerHTML={{__html: rest}} />
                            </div>
                        );
                    } else {
                        elements.push(<div key={index} dangerouslySetInnerHTML={{__html: inner}} />);
                    }
                } else {
                    const startsWithBlock = trimmed.startsWith('<div') || trimmed.startsWith('<img') || trimmed.startsWith('<figure') || trimmed.startsWith('<table') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol>') || trimmed.startsWith('<h');
                    if (startsWithBlock || /<div\s|<img\s|<figure\s|<table\s|<ul\s|<ol\s/i.test(formattedText)) {
                        elements.push(<div key={index} dangerouslySetInnerHTML={{__html: formattedText}} />);
                    } else {
                        elements.push(<p key={index} dangerouslySetInnerHTML={{__html: formattedText}} />);
                    }
                }
            }
            }
        });
        
        flushList();
        flushTable();
        flushHtmlBlock();
        return elements;
    };

    const nextPage = () => {
        if (currentPage < totalPages - 2) {
            setCurrentPage(currentPage + 2);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            const newPage = currentPage - 2;
            setCurrentPage(newPage);
            
            // Fermer le sommaire si on va sur la page 0
            if (newPage === 0) {
                setShowSommaire(false);
            }
        }
    };

    // Vérifier si une page contient uniquement un titre majeur (##)
    const isSingleTitlePage = (pageContent) => {
        if (!pageContent) return false;
        const trimmed = pageContent.trim();
        return trimmed.startsWith('## ') && !trimmed.includes('\n');
    };

    if (totalPages === 0) {
        return <p>Aucun contenu à afficher.</p>;
    }

    const leftPageIsSingleTitle = isSingleTitlePage(pages[currentPage]);
    const rightPageIsSingleTitle = isSingleTitlePage(pages[currentPage + 1]);

    // Extraire le sommaire de la première page
    const getSommaireContent = () => {
        const lines = enhancedContent.split('\n');
        const sommaireLines = [];
        let inSommaire = false;
        
        for (const line of lines) {
            if (line.trim() === '## Sommaire') {
                inSommaire = true;
            } else if (inSommaire && line.trim() === '---') {
                break;
            } else if (inSommaire) {
                sommaireLines.push(line);
            }
        }
        
        return sommaireLines.join('\n');
    };

    return (
        <div className="book-container" style={{position: 'relative'}}>
            {/* DEBUG BADGE: affichage compact du statut pages/current */}
            <div style={{position: 'absolute', left: 8, top: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 8px', borderRadius: 6, zIndex: 30, fontSize: '0.85rem'}}>
                {`pages: ${totalPages} • cur: ${currentPage + 1}`}
            </div>
            {/* Panneau sommaire coulissant - se rétracte sur pages 1 et 2 */}
            {panelVisible && (
                <div 
                    style={{
                        position: 'absolute',
                        right: showSommaire ? 'calc(100% - 10px)' : '76%',
                        top: '10px',
                        width: 'auto',
                        minWidth: '280px',
                        maxWidth: '450px',
                        height: 'auto',
                        maxHeight: '750px',
                        backgroundColor: 'white',
                        boxShadow: '4px 0 8px rgba(0,0,0,0.1)',
                        transition: 'right 0.3s ease-in-out',
                        zIndex: 200,
                        overflow: 'visible',
                        borderTopLeftRadius: '0',
                        borderTopRightRadius: '4px',
                        borderBottomRightRadius: '4px',
                        borderBottomLeftRadius: '4px',
                        boxSizing: 'border-box',
                        pointerEvents: 'auto'
                    }}
                >
                        {/* Bouton sommaire collé au bord gauche */}
                        <button 
                            onClick={() => setShowSommaire(!showSommaire)}
                            className="sommaire-toggle-btn"
                            style={{
                                position: 'absolute',
                                right: buttonVisible ? '100%' : '-100px',
                                top: '0',
                                padding: '0.5rem',
                                fontSize: '1.3rem',
                                minWidth: '40px',
                                zIndex: 100,
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'right 0.3s ease-in-out',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '0',
                                borderBottomRightRadius: '0',
                                borderBottomLeftRadius: '4px',
                                background: 'white',
                                color: '#667eea'
                            }}
                            title="Sommaire"
                        >
                            📑
                        </button>
                        
                        <div style={{padding: '1rem 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexShrink: 0, paddingLeft: '3.5rem', paddingRight: '0.5rem'}}>
                                <h2 style={{margin: 0, fontSize: '1.3rem', color: '#2c3e50'}}>Sommaire</h2>
                            </div>
                            <div style={{fontSize: '0.85rem', paddingLeft: '0.1rem', paddingRight: '0.5rem'}}>
                                <div dangerouslySetInnerHTML={{__html: getSommaireContent()}} />
                            </div>
                        </div>
                </div>
            )}
            
            <div className="book">
                <div className="book-page left-page">
                    <div className="page-content">
                        {currentPage < totalPages && renderMarkdown(pages[currentPage], leftPageIsSingleTitle)}
                    </div>
                    <div className="page-number">{currentPage + 1}</div>
                </div>
                
                <div className="book-spine"></div>
                
                <div className="book-page right-page">
                    <div className="page-content">
                        {currentPage + 1 < totalPages && renderMarkdown(pages[currentPage + 1], rightPageIsSingleTitle)}
                    </div>
                    <div className="page-number">{currentPage + 2}</div>
                </div>
            </div>
            
            <div className="book-controls">
                <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="nav-btn prev-btn"
                >
                    ◄
                </button>
                <button 
                    onClick={nextPage} 
                    disabled={currentPage >= totalPages - 2}
                    className="nav-btn next-btn"
                >
                    ►
                </button>
            </div>
        </div>
    );
};

export default BookReader;
