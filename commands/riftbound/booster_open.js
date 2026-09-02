const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const generate_booster = require('../../riftbound_utils/generate_booster');

module.exports = {
	cooldown: 20,
	data: new SlashCommandBuilder()
		.setName('riftopen')
		.setDescription('Simule l\'ouverture d\'un booster ! (Booster origines par défaut)')
		.addStringOption((option) =>
			option
				.setName('set').setDescription('Le Set à ouvrir')
				.setDescription('Le Set à ouvrir')
				.addChoices(
					{ name: "Origines", value: "ogn" },
					{ name: "Déchainement", value: "unl" },
					{ name: "Armes Spirituelles", value: "sfd" }
				)
		),
	async execute(interaction) {
		const chosenSet = interaction.options.getString('set') ?? "ogn";

		console.log("Oppening booster from set " + chosenSet);

		const url = 'https://mon-site.com'; // même URL fictive pour grouper les embeds


		const hitImages = [];

		const myPack = generate_booster(chosenSet);

		hitImages.push(myPack.foil.image);
		hitImages.push(myPack.rareOrBetter[0].image)
		hitImages.push(myPack.rareOrBetter[1].image)

		let normalCards = myPack.commons.concat(myPack.uncommons);

		let description = myPack.hasAltRune ? "Vous avez aussi hit une rune alternative !" : null;

		const embedNormals = normalCards.map(card =>
			new EmbedBuilder()
				.setURL(url) // même lien pour tous = regroupement en galerie
				.setImage(card.image)
				.setColor(0x0099FF)
				.setTitle('Ouverture de booster ! [SET : ' + chosenSet + '] - Commons')
				.setDescription(description)
		);

		// const embedHits = [];
		const embedHits = hitImages.map(img =>
			new EmbedBuilder()
				.setURL(url)
				.setImage(img)
				.setTitle('Ouverture de booster ! [SET : ' + chosenSet + '] - Hits')
		);

		await interaction.channel.send({ embeds : embedNormals });
		await interaction.channel.send({ embeds : embedHits });
	},
};
