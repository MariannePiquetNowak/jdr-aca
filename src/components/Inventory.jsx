import Trolling from "./Trolling";

const Inventory = ({inventory, toggleClass, inventoryChange}) => {

    return (
        <div className="inventaire hide" id="modal">
            <div className="modal_content">
                <div className="btn-container">
                    <button type="button" className="close-inventory" onClick={toggleClass}>X</button>
                </div>
                <h3>Inventaire</h3>
                    {
                        inventory && Object.entries(inventory)?.map(([key, value], index) => {
                            return (
                                <div key={key}>
                                    <label>Objet n° {key} :</label>
                                    <input type="text" key={key} data-index={index} data-key={key} value={value}  onChange={inventoryChange} />
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
