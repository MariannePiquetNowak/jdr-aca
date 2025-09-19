import {openModal} from "../../services/utils";

const NotesTrigger = () => {
    return (
        <div className="notes__btn trigger-open">
           <button type="button" onClick={() => openModal('notes')}>Notes</button>
        </div>
    )
}

export default NotesTrigger;
