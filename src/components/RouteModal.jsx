import React from "react";

const RouteModal = ({ isOpen, onClose, title, children }) => {
    return (
        <div className={`modal ${isOpen ? 'open' : 'hide'}`} role="dialog" aria-modal={isOpen}>
            <div className="modal_content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>{title}</h3>
                    <button className="trigger-close" onClick={onClose} aria-label="Fermer">×</button>
                </div>

                <div style={{maxHeight: '60vh', overflow: 'auto'}}>
                    {children}
                </div>

                <div className="btn-container">
                    <button className="trigger-close" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default RouteModal;
