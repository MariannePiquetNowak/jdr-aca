const InventoryTrigger = ({toggleClass}) => {
    
    return (
        <div className="inventory-btn">
           <button type="button" onClick={toggleClass}>Inventaire</button>
        </div>
    )
}

export default InventoryTrigger;
