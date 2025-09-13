const Notes = ({onNotesChange, notes}) => {
  return (
    <div className="card notes">
        <label>Notes</label>
        <textarea onChange={onNotesChange} value={notes} name="notes" id="notes"></textarea>
    </div>
  )
}

export default Notes
