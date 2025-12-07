import NotesTrigger from "../components/triggers/NotesTrigger";
import InventoryTrigger from "../components/triggers/InventoryTrigger";

// Le header sera propre aux pages joueurs et remplace l'ancien mode d'accès à l'inventaire et aux notes
const HeaderPlayers = () => {
    return (
        <header className="header">
            <button className="burger__button" aria-expanded="false" title="Ouvrir | fermer le menu"></button>
                <div className="header__content">
                    <div className="header__menu">
                        {/* Menu pour le joueur (inventaire, notes etc) */}
                        <InventoryTrigger />
                        <NotesTrigger />
                    </div>
                    <ul className="header__links">
                        {/* Liens hors joueur (comme les règles du jeu) */}
                    </ul>
                </div>
        </header>
    )
}

export default HeaderPlayers;
