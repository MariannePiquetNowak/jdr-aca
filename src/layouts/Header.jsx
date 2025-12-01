import React, { useState, Suspense, useEffect, useRef } from "react";
import RouteModal from "../components/RouteModal";
import { remoteImage } from "../services/utils";

const categories = [
    { key: 'regles', label: 'Règles', items: [] },
    { key: 'joueurs', label: 'Joueurs', items: [
        { key: 'armand', label: 'Armand', portrait: '/images/armand/Portrait_Armand.png' },
        { key: 'bernard', label: 'Bernard', portrait: '/images/bernard/Portrait_Bernard.png' },
        { key: 'etienne', label: 'Etienne', portrait: '/images/etienne/Portrait_Etienne.png' },
        { key: 'stephane', label: 'Stephane', portrait: '/images/stephane/Portrait_Stephane.png' },
        { key: 'theodore', label: 'Théodore', slug: 'theodore', portrait: '/images/theodore/Portrait_Theodore.png' },
        { key: 'valentine', label: 'Valentine', portrait: '/images/valentine/Portrait_Valentine.png' },
        { key: 'vera', label: 'Vera', portrait: '/images/vera/Vera_portrait.jpg' }
        ]
    },
    { key: 'bestiaire', label: 'Bestiaire', items: [] },
    { key: 'pnj', label: 'PNJ', items: [] },
    { key: 'lore', label: 'Lore', items: [] }
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeName, setActiveName] = useState(null);
    const [ActiveComponent, setActiveComponent] = useState(null);
    const [categoryItems, setCategoryItems] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);

    // open a route component directly (player pages)
    const openModal = (name, displayLabel) => {
        // lazy-load the route component
        const LazyComp = React.lazy(() => import(`../routes/${name}.jsx`));
        // if we were viewing a category list, clear it so the route component can render
        setCategoryItems(null);
        setActiveComponent(() => LazyComp);
        setActiveName(displayLabel || name);
        setIsOpen(true);
        // if we're on mobile and the nav is open, close it after choosing an item
        setIsNavOpen(false);
    };

    // open a category — either show its list of items inside the modal
    const openCategory = (category) => {
        if (!category) return;
        if (category.items && category.items.length > 0) {
            // show a list of entries inside modal
            setActiveName(category.label);
            setActiveComponent(null);
            setCategoryItems(category.items);
            setIsOpen(true);
        } else {
            // no items — show a simple placeholder message
            const Placeholder = () => <div style={{padding: '1rem'}}>Pas encore de contenu pour « {category.label} ».</div>;
            setActiveName(category.label);
            setActiveComponent(() => Placeholder);
            setIsOpen(true);
            setCategoryItems([]);
        }
        // close mobile nav if open
        setIsNavOpen(false);
    };

    const closeModal = () => {
        setIsOpen(false);
        setActiveName(null);
        setActiveComponent(null);
        setCategoryItems(null);
    };

    // refs for click outside
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

            <RouteModal isOpen={isOpen} onClose={closeModal} title={activeName} contentClassName={activeName === 'Joueurs' ? 'player-modal' : ''}>
                {/* If categoryItems is set, show a list of items (e.g. Joueurs) */}
                {categoryItems && categoryItems.length > 0 ? (
                    // If this category is the players one, show portraits in a grid.
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
