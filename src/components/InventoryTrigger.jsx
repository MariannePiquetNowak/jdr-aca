const InventoryTrigger = ({openModal}) => {
    
    return (
        <div className="inventory__btn">
           <button type="button" onClick={openModal('inventory')}>Inventaire</button>
        </div>
    )
}

export default InventoryTrigger;
