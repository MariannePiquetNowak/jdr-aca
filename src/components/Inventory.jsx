import Trolling from "./Trolling";
import {closeModal} from "../services/utils";

const Inventory = ({inventory, inventoryChange}) => {

    return (
        <div className="modal inventory hide" id="inventory">
            <div className="modal_content">
                <div className="btn-container">
                    <button type="button" className="close-inventory trigger-close" onClick={() => closeModal("inventory")}>X</button>
                </div>
                <h3>Inventaire</h3>
                    {
                        inventory && Object.entries(inventory)?.map(([key, value], index) => {
                            return (
                                <div key={key}>
                                    <label>Objet n° {key} :</label>
                                    <input type="text" placeholder="Entrez un objet" key={key} data-index={index} data-key={key} value={value}  onChange={inventoryChange} />
                                </div>
                            ) 
                        })
                    }


                {/* <Trolling /> */}
            </div>
        </div>
    )
}

export default Inventory;
