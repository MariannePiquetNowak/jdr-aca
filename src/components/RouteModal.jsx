import React from "react";

const RouteModal = ({ isOpen, onClose, title, children, contentClassName = '' }) => {
    // Don't render anything when closed to avoid overlay or modal blocking the UI
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('RouteModal: overlay clicked');
        }
        if (typeof onClose === 'function') onClose();
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    const closeBtnClass = (contentClassName && contentClassName.indexOf('preview-modal') >= 0) ? 'enemy-delete-btn' : 'trigger-close';

    return (
        <div className={`modal open`} role="dialog" aria-modal={isOpen}>
            {/* overlay separate so it always fills viewport and receives clicks */}
            <div className="modal_overlay" onClick={handleOverlayClick} />
            <div className={`modal_content ${contentClassName}`} onClick={stopPropagation}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>{title}</h3>
                    <button className={closeBtnClass} onClick={onClose} aria-label="Fermer">×</button>
                </div>

                <div className="modal_body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default RouteModal;
