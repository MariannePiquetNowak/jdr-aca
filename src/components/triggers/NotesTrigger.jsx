const NotesTrigger = ({openModal}) => {
    
    return (
        <div className="inventory-btn">
           <button type="button" onClick={openModal('modal')}>Inventaire</button>
        </div>
    )
}

export default NotesTrigger;
