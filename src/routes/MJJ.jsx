import { useEffect } from 'react';
import MJ from './MJ';

const MJJ = () => {
    useEffect(() => {
        sessionStorage.setItem('mjContext', 'mjj');
    }, []);

    return <MJ title="Table du MJ J — Gestion des personnages" />;
};

export default MJJ;
