import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/_info-page.scss';
import { remoteImage } from '../services/utils';

const players = [
    { key: 'armand', label: 'Armand', portrait: '/images/armand/Portrait_Armand.png' },
    { key: 'bernard', label: 'Bernard', portrait: '/images/bernard/Portrait_Bernard.png' },
    { key: 'etienne', label: 'Etienne', portrait: '/images/etienne/Portrait_Etienne.png' },
    { key: 'stephane', label: 'Stephane', portrait: '/images/stephane/Portrait_Stephane.png' },
    { key: 'theodore', label: 'Théodore', slug: 'theodore', portrait: '/images/theodore/Portrait_Theodore.png' },
    { key: 'valentine', label: 'Valentine', portrait: '/images/valentine/Portrait_Valentine.png' },
    { key: 'vera', label: 'Vera', portrait: '/images/vera/Vera_portrait.jpg' }
];

const Joueurs = () => {
    const navigate = useNavigate();

    const openPlayer = (player) => {
        navigate(`/${player.slug || player.key}`);
    };

    return (
        <main className="main info-page">
            <h1>🎭 Joueurs</h1>
            <div className="player-grid-page">
                    {players.map((player) => (
                        <button
                            key={player.key}
                            className="player-item"
                            title={player.label}
                            aria-label={`Ouvrir la fiche ${player.label}`}
                            onClick={() => openPlayer(player)}
                        >
                            {player.portrait ? (
                                <>
                                    <img
                                        src={remoteImage(player.portrait)}
                                        alt={`Portrait de ${player.label}`}
                                    />
                                    <div className="player-overlay" aria-hidden>
                                        <span className="player-overlay__name">{player.label}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="player-placeholder" aria-hidden>?</div>
                            )}
                        </button>
                    ))}
            </div>
        </main>
    );
};

export default Joueurs;
