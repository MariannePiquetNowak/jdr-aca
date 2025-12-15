import React, { useState, useEffect } from 'react';
import BookReader from '../components/BookReader';
import dataJson from '../data.json';

const LoreBook = () => {
    const [content, setContent] = useState('');
    const [allowBook, setAllowBook] = useState(true);

    useEffect(() => {
        setContent(dataJson.lore?.content || '');
    }, []);

    useEffect(() => {
        const handleOrientation = () => {
            try {
                const isPortrait = window.innerHeight > window.innerWidth;
                setAllowBook(!isPortrait);
            } catch (e) {}
        };
        handleOrientation();
        window.addEventListener('resize', handleOrientation);
        window.addEventListener('orientationchange', handleOrientation);
        return () => {
            window.removeEventListener('resize', handleOrientation);
            window.removeEventListener('orientationchange', handleOrientation);
        };
    }, []);

    if (!allowBook) {
        return (
            <div style={{padding: '1rem'}}>
                <p>Mode livre désactivé en affichage vertical. Passez en vue normale pour lire ce contenu.</p>
            </div>
        );
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <BookReader content={content} />
        </div>
    );
};

export default LoreBook;
