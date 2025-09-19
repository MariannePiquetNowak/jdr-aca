import React, { useState } from 'react';

const Home = () => {
	const [characterName, setCharacterName] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		const formattedName = characterName.trim().toLowerCase();
		if (formattedName) {
			window.location.href = `/${formattedName}`;
		}
	};	

  return (
    <main role="main">
		<div className="home">
			<div className="home__content">
				<div className="home__content_left">
					<img src={`${process.env.REACT_APP_BASE_URL}/images/a_comme_association.jpg`} alt="Logo A comme Association" />
				</div>
				<div className="home__content_right">
					<h2>Bienvenue sur le JDR <span>A comme Assocation</span></h2>
					<p>Un jeu de rôle en ligne, inspiré deu roman de Pierre Botero, où vous incarnez un personnage fictif dans une association de magicien.</p>
					<p>Votre but : résoudre les missions confiées par l'Association.</p>
					<p>Guidé par le Maitre du Jeu, vous devrez résoudre certains mystères à l'aide de votre équipe.</p>
					<div className="choose_character">
						<p>Entre le nom de ton personnage :</p>
						<form onSubmit={handleSubmit} className="home__form">
							<input 
								type="text" 
								placeholder="Nom du personnage" 
								value={characterName} 
								onChange={(e) => setCharacterName(e.target.value)} 
							/>
							<button type="submit">
								<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg" fill="#000" width="16px" height="16px">
										<g transform="translate(0.000000,1230.000000) scale(0.100000,-0.100000)">
											<path d="M94.5,12289c-0.4,0-1.9-0.1-3.2-0.3c-21.2-1.7-41.8-11-57-25.8c-5.7-5.5-10.2-11-14.2-17.3c-8-12.7-12.7-26.5-14.3-42.2
												c-0.3-3.1-0.3-12.9,0-16.1c1.2-13.2,4.9-25.5,10.8-36.5c9-16.6,22.5-30,39.2-38.8c16.5-8.6,35.8-12.1,54.6-9.9
												c15.5,1.8,31,7.7,43.5,16.7c1,0.7,1.9,1.3,1.9,1.3c0.1,0,11.5-10.5,25.4-23.4c13.9-12.9,25.7-23.8,26.3-24.2c1.3-1,4.2-2.5,6-3
												c2.1-0.6,6.4-0.6,8.4,0c10.7,3,15.8,15,10.4,24.6c-1.4,2.5,1.4-0.1-34.3,32.8l-19.3,17.9l1.5,2.5c3,5,6.1,11.8,8,17.5
												c7.2,21.3,6.6,44.5-1.8,65.5c-6.9,17.5-19.2,32.6-34.9,43c-13,8.6-27.2,13.7-43,15.3C106.1,12288.9,96.5,12289.1,94.5,12289z
												M105.5,12255.3c11.8-1.3,22.3-5.6,31.7-13.1c2.5-2,7.3-6.8,9.3-9.3c10.6-13.3,15.1-29.9,12.6-46.7c-3.3-22.2-19.5-41.3-40.9-48.4
												c-7-2.3-12.7-3.1-20.4-2.9c-4.8,0.1-7.3,0.4-11.3,1.3c-17,3.8-31.5,14.6-40,29.8c-6.7,11.9-9.1,26-6.7,39.6
												c2.9,16.3,12.5,30.9,26.4,40.1c8.2,5.4,17.1,8.6,26.8,9.6C96.2,12255.6,102.5,12255.6,105.5,12255.3z"/>
										</g>
								</svg>
							</button>
						</form>
					</div>
				</div>

			</div>
		</div>
    </main>
  )
}

export default Home;
