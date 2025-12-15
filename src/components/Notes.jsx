import {closeModal} from "../services/utils";

const Notes = ({onNotesChange, notes}) => {
    return (
    <div className="modal notes hide" id="notes">
      <div className="modal_overlay" onClick={() => closeModal('notes')} />
      <div className="modal_content">
        <div className="btn-container">
          <button type="button" className="close-notes trigger-close" onClick={() => closeModal("notes")}>X</button>
        </div>
        <div className="notes__content">
          <h3>Notes</h3>
          <textarea onChange={onNotesChange} value={notes} name="notes"></textarea>
        </div>
      </div>
    </div>
    )
}

export default Notes
