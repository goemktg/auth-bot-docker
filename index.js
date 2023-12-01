const { Client, Events, GatewayIntentBits } = require('discord.js');

// 
const t1Frigates = { srpPercent: 150, srpMaxprice: 40, shipIds: [ 597, 29248, 591, 2161, 589, 590, 582, 583, 584, 602, 603, 605, 592, 593, 594, 607, 608, 609, 585, 586, 587, 598, 599, 3766 ]};
const navyFrigates = { srpPercent: 100, srpMaxprice: 50, shipIds: [ 17703, 37453, 72907, 72904, 17619, 37455, 17841, 72913, 37456, 37454, 17812, 72903 ]};
const t2Frigates = { srpPercent: 100, srpMaxprice: 70, shipIds: [ 11184, 11186, 11393, 11365, 11188, 12038, 11190, 37457, 11176, 11178, 11379, 11381, 11192, 12032, 11194, 37458, 11200, 11202, 12042, 12044, 11172, 11377, 11174, 37459, 11196, 11198, 11400, 11371, 11182, 12034, 11387, 37460 ]};

const t1Destroyers = { srpPercent: 100, srpMaxprice: 40, shipIds: [ 32874, 16236, 32876, 16238, 32872, 16240, 32878, 16242 ]};
const navyDestroyers = { srpPercent: 100, srpMaxprice: 60, shipIds: [ 73789, 73795, 73796, 73794 ]};
const t2t3factionDestroyers = { srpPercent: 50, srpMaxprice: 70, shipIds: [ 22452, 37481, 34317, 22464, 37482, 34828, 22460, 37483, 35683, 22456, 37480, 34562, 49710, 52254 ]};

const t1Cruisers = { srpPercent: 100, srpMaxprice: 50, shipIds: [ 625, 2006, 624, 628, 621, 623, 620, 632, 627, 626, 633, 634, 629, 631, 622, 630 ] };
const navyCruisers = { srpPercent: 70, srpMaxprice: 70, shipIds: [ 29337, 17709, 29340, 17634, 29344, 17843, 29336, 17713 ]};
const t2t3factionCruisers = { srpPercent: 50, srpMaxprice: 150, shipIds: [ 17715, 17718, 17922, 17720, 17722, 33470, 33818, 47270, 49712, 54732, 20125, 11965, 12003, 12019, 12017, 11987, 29986, 11959, 11957, 12011, 11993, 11995, 11985, 29984, 11971, 11969, 12005, 12023, 12021, 11989, 29988, 11961, 11963, 12015, 11999, 12013, 11978, 29990, 52252 ] };

const t1Battlecruisers = { srpPercent: 70, srpMaxprice: 70, shipIds: [ 16231, 24702, 4310, 16233, 24696, 4302, 16227, 24698, 4306, 16229, 24700, 4308 ]};
const navyBattlecruisers = { srpPercent: 50, srpMaxprice: 100, shipIds: [ 33155, 72872, 33153, 72812, 72869, 33151, 33157, 72811 ]};
const t2factionBattlecruisers = { srpPercent: 40, srpMaxprice: 150, shipIds: [ 49711, 22448, 22474, 22470, 22446, 22466, 22442, 22468, 22444 ]};

const t1Battleships = { srpPercent: 50, srpMaxprice: 100, shipIds: [ 24692, 642, 643, 24688, 638, 640, 24690, 641, 645, 24694, 639, 644 ]};
const navyBattleship = { srpPercent: 30, srpMaxprice: 150, shipIds: [ 32311, 17732, 32307, 17728, 32309, 17636, 32305, 17726 ]}
const t2factionBattleships = { srpPercent: 20, srpMaxprice: 200, shipIds: [ 28659, 22428, 28710, 22436, 28661, 22430, 28665, 22440, 17918, 17736, 17920, 17738, 17740, 33472, 33820, 47271, 54733 ] };

const srprateForshipids = Array.of(t1Frigates, navyFrigates, t2Frigates, t1Destroyers, navyDestroyers, t2t3factionDestroyers, t1Cruisers, navyCruisers, t2t3factionCruisers, t1Battlecruisers, navyBattlecruisers, t2factionBattlecruisers, t1Battleships, navyBattleship, t2factionBattleships);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// deploy commands and registers to bot
(async () => {
	const getCommendsAndDeploy = require('./deploy-commands.js');
	const commends = await getCommendsAndDeploy();
	//console.log('recived commends:', commends);
	client.commands = commends;
})();

// get whitelist from env and make it to array
const whitelistedGuilds = JSON.parse(process.env.GUILD_WHITELIST).list;

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	console.log(`Whitelisted guilds: ${ whitelistedGuilds.join(', ')}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	//console.log();

	if (!command || !whitelistedGuilds.includes(interaction.guildId)) return;

	try {
		if (command.data.name == 'srp_request')
			await command.execute(interaction, srprateForshipids);
		else
			await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: '오류: '+error.message});
	}
});