const Stuff = ({stuff, onAmmoChange}) => {
	return (
		<div className="section section_object">
			{
				stuff?.map((st, index) => {
					let title = "Nom de l'artefact";
					return (
						<div className="card object" key={index}>
							<div>
								<h3>{st.name.length === 0 ? title : st.name}</h3>
								<img src={st.image} width="82" height="82" />
								<div>
									<h4>Description</h4>
									<p>{st.description}</p>
								</div>
								<div>
									<h4>Effets</h4>
									<p dangerouslySetInnerHTML={{ __html: st.effect}}></p>
								</div>
							</div>
							{/* Nombre d'utilisations */}
							{
								st.ammo ? 
									<div className="input_rb_ckb ammo">            
										{ st.ammo && Object.values(st.ammo).length > 0 ? <label>Utilisations</label> : null }                                
										<div>
										{
											Object.entries(st.ammo)?.map(([key, value]) => {
												{
													if(Object.values(st.ammo).length > 0) {
														return <input key={key} data-index={index} data-key={key} type="checkbox" onChange={onAmmoChange} checked={value} readOnly />
													} else {
														return null;
													}
												}
													
											})
										}
										</div>
									</div>
								: null
							}
						</div>
					)
				})
			}
		</div>
	)
}

export default Stuff;
