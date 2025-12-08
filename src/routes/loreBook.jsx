import React, { useState, useEffect } from 'react';
import BookReader from '../components/BookReader';
import dataJson from '../data.json';

const LoreBook = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        setContent(dataJson.lore?.content || '');
    }, []);

    return (
        <div style={{width: '100%', height: '100%'}}>
            <BookReader content={content} />
        </div>
    );
};

export default LoreBook;
