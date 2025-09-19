import {openModal} from "../../services/utils";

const InventoryTrigger = () => {
    return (
        <div className="inventory-btn">
           <button type="button" onClick={() => openModal("modal")} >Inventaire</button>
        </div>
    )
}

export default InventoryTrigger;
