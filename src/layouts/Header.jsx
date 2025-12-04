import React, { useState, Suspense, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RouteModal from "../components/RouteModal";
import { remoteImage } from "../services/utils";

const categories = [
    { key: 'table-joueurs', label: 'Table des joueurs', link: '/MJ' },
    { key: 'regles', label: 'Règles', link: '/regles' },
    { key: 'joueurs', label: 'Joueurs', link: '/joueurs' },
    { key: 'bestiaire', label: 'Bestiaire', link: '/bestiaire' },
    { key: 'objets', label: 'Objets', link: '/objets' },
    { key: 'pnj', label: 'PNJ', link: '/pnj' },
    { key: 'lore', label: 'Lore', link: '/lore' }
];

const Header = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeName, setActiveName] = useState(null);
    const [ActiveComponent, setActiveComponent] = useState(null);
    const [categoryItems, setCategoryItems] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [activeModalClass, setActiveModalClass] = useState('');

    // Ouvrir un composant de route directement (pages joueurs)
    const openModal = (name, displayLabel, modalClass) => {
        // Chargement lazy du composant de route
        const LazyComp = React.lazy(() => import(`../routes/${name}.jsx`));
        // Si on affichait une liste de catégories, la vider pour que le composant de route puisse s'afficher
        setCategoryItems(null);
        setActiveComponent(() => LazyComp);
        setActiveName(displayLabel || name);
        setIsOpen(true);
        // Stocker la classe de modal si fournie
        if (modalClass) {
            // On devra la passer à RouteModal
            setActiveModalClass(modalClass);
        } else {
            setActiveModalClass('');
        }
        // Si on est sur mobile et que la nav est ouverte, la fermer après avoir choisi un élément
        setIsNavOpen(false);
    };

    // Ouvrir une catégorie — soit afficher sa liste d'éléments dans le modal
    const openCategory = (category) => {
        if (!category) return;
        // Si la catégorie a un lien, naviguer vers celui-ci
        if (category.link) {
            navigate(category.link);
            setIsNavOpen(false);
            return;
        }
        // Si la catégorie a une route directe, l'ouvrir
        if (category.route) {
            openModal(category.route, category.label, category.modalClass);
            return;
        }
        if (category.items && category.items.length > 0) {
            // Afficher une liste d'entrées dans le modal
            setActiveName(category.label);
            setActiveComponent(null);
            setCategoryItems(category.items);
            setIsOpen(true);
        } else {
            // Pas d'éléments — afficher un simple message placeholder
            const Placeholder = () => <div style={{padding: '1rem'}}>Pas encore de contenu pour « {category.label} ».</div>;
            setActiveName(category.label);
            setActiveComponent(() => Placeholder);
            setIsOpen(true);
            setCategoryItems([]);
        }
        // Fermer la nav mobile si elle est ouverte
        setIsNavOpen(false);
    };

    const closeModal = () => {
        setIsOpen(false);
        setActiveName(null);
        setActiveComponent(null);
        setCategoryItems(null);
        setActiveModalClass('');
    };

    // Refs pour détecter les clics à l'extérieur
    const headerRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape' && isNavOpen) {
                setIsNavOpen(false);
            }
        }

        function onClickOutside(e) {
            if (!headerRef.current) return;
            if (isNavOpen && !headerRef.current.contains(e.target)) {
                setIsNavOpen(false);
            }
        }

        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onClickOutside);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClickOutside);
        };
    }, [isNavOpen]);

    return (
        <header className="site-header" ref={headerRef}>
            <button
                className="header-hamburger"
                aria-expanded={isNavOpen}
                aria-controls="primary-navigation"
                aria-label="Ouvrir le menu"
                onClick={() => setIsNavOpen((s) => !s)}
            >
                <span className="hamburger-box">
                    <span className={`hamburger-inner ${isNavOpen ? 'is-open' : ''}`}></span>
                </span>
            </button>

            <nav id="primary-navigation" className={`header-nav ${isNavOpen ? 'is-open' : ''}`} aria-label="main navigation">
                {categories.map((c) => (
                    <button
                        key={c.key}
                        onClick={() => openCategory(c)}
                        className="header-nav__btn"
                        aria-haspopup={c.items && c.items.length > 0}
                        aria-expanded={isOpen && activeName === c.label}
                    >
                        {c.label}
                    </button>
                ))}
            </nav>

            <RouteModal isOpen={isOpen} onClose={closeModal} title={activeName} contentClassName={activeModalClass || (activeName === 'Joueurs' ? 'player-modal' : '')}>
                {/* Si categoryItems est défini, afficher une liste d'éléments (ex: Joueurs) */}
                {categoryItems && categoryItems.length > 0 ? (
                    // Si cette catégorie est celle des joueurs, afficher les portraits en grille.
                    activeName === 'Joueurs' ? (
                        <div className="player-grid">
                            {categoryItems.map((it) => (
                                <button
                                    key={it.key}
                                    className="player-item"
                                    title={it.label}
                                    aria-label={`Ouvrir la fiche ${it.label}`}
                                    onClick={() => openModal(it.slug || it.key, it.label)}
                                >
                                        {it.portrait ? (
                                        <>
                                            <img
                                                src={remoteImage(it.portrait)}
                                                alt={`Portrait de ${it.label}`}
                                            />
                                            <div className="player-overlay" aria-hidden>
                                                <span className="player-overlay__name">{it.label}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="player-placeholder" aria-hidden>?</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '.5rem'}}>
                            {categoryItems.map((it) => (
                                <button key={it.key} className="header-nav__btn" onClick={() => openModal(it.slug || it.key, it.label)}>
                                    {it.portrait ? (
                                        <img
                                            src={remoteImage(it.portrait)}
                                            alt={`${it.label} portrait`}
                                            style={{width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: '0.5rem'}}
                                        />
                                    ) : null}
                                    {it.label}
                                </button>
                            ))}
                        </div>
                    )
                ) : (
                    ActiveComponent ? (
                        <Suspense fallback={<div>Chargement...</div>}>
                            <ActiveComponent />
                        </Suspense>
                    ) : null
                )}
            </RouteModal>
        </header>
    );
};

export default Header;
