const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

console.log("Loading commands ...");
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		console.log("loading command " + filePath)
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			console.log("Setting command " + command.data.name);
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
	)
});

const fetchCards = require('./riftbound_utils/fetch_cards');

fetchCards('ogn');
fetchCards('unl');
fetchCards('sfd');

require('./deploy-commands');

console.log("Starting to login ...")
client.login(token)
	.then((result) => {
		console.log("Connected !")
	})
	.catch((reason) => {
		console.log("Error during login");
		console.log(reason);
	}).finally(() => {
		console.log("Login process is over !");
	})

console.log("End of file");
