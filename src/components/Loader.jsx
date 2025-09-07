const Loader = () => {
	// Source : https://codepen.io/JeremyNikolic/pen/MKYwGL
  return (
  	<div className="container_dice centering-block">
		<div className="loader_text">
			<p>Chargement des données</p>
		</div>
		<div className="dice_content">
			<div className="loader centered">
				<div className="square square_one"></div>
				<div className="square square_two"></div>
				<div className="square square_three"></div>
				<div className="square square_four"></div>
				<div className="square square_five"></div>
				<div className="square square_six"></div>
				<div className="square square_seven"></div>
				<div className="square square_eight"></div>
				<div className="square square_nine"></div>
			</div>
		</div>
	</div>
  )
}

export default Loader;
