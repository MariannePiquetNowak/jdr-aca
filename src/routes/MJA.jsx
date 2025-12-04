import { useEffect } from 'react';
import MJ from './MJ';

const MJA = () => {
    useEffect(() => {
        sessionStorage.setItem('mjContext', 'mja');
    }, []);

    return <MJ title="Table du MJ A — Gestion des personnages" />;
};

export default MJA;
