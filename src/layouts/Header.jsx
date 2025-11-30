import React, { useState, Suspense } from "react";
import RouteModal from "../components/RouteModal";

const routes = [
    'home',
    'armand',
    'bernard',
    'etienne',
    'stephane',
    'theodore',
    'valentine',
    'vera',
    'MJ'
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeName, setActiveName] = useState(null);
    const [ActiveComponent, setActiveComponent] = useState(null);

    const openModal = (name) => {
        // lazy-load the route component
        const LazyComp = React.lazy(() => import(`../routes/${name}.jsx`));
        setActiveComponent(() => LazyComp);
        setActiveName(name);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setActiveName(null);
        setActiveComponent(null);
    };

    return (
        <header className="site-header">
            <nav style={{display: 'flex', gap: '0.5rem', padding: '1rem'}}>
                {routes.map((r) => (
                    <button key={r} onClick={() => openModal(r)} style={{padding: '.5rem 1rem', cursor: 'pointer'}}>
                        {r}
                    </button>
                ))}
            </nav>

            <RouteModal isOpen={isOpen} onClose={closeModal} title={activeName}>
                {ActiveComponent ? (
                    <Suspense fallback={<div>Chargement...</div>}>
                        <ActiveComponent />
                    </Suspense>
                ) : null}
            </RouteModal>
        </header>
    );
};

export default Header;
