import {openModal} from "../../services/utils";

const InventoryTrigger = () => {
    return (
        <div className="inventory-btn trigger-open">
           <button type="button" onClick={() => openModal("inventory")} >Inventaire</button>
        </div>
    )
}

export default InventoryTrigger;
