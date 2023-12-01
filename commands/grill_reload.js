const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grill_reload')
		.setDescription('원하는 채널의 불판을 갑니다!')
		.addChannelOption(option =>
			option
				.setName('target')
				.setDescription('불판을 갈 채널')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
				.addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('yes')
					.setLabel('예')
					.setStyle("Success")
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('no')
					.setLabel('아니요')
					.setStyle("Danger")
			);

		const targetChannel = interaction.options.getChannel('target');
		const targetChannelName = `<#${targetChannel.id}> 채널`
		var responseString = targetChannelName;
		
		await interaction.reply({ content: `정말 ${targetChannelName}을 아카이브하고 복사본을 만들까요?`, components: [row]})
		.then(async () => {
			const filter = i => (( i.customId === 'yes' || i.customId === 'no' ) && i.user.id === interaction.user.id);

			const collected = await interaction.channel.awaitMessageComponent({ filter, time: 30000});
	
			await collected.update({ content: responseString + ' 불판 교체를 시작합니다...', components: []});

			if (collected.customId === 'yes') {

				const targetCategories = interaction.guild.channels.cache.filter(c => c.type === 4 &&  c.name === '아카이브');

				switch (targetCategories.size) {
					case 1:
						
						let today = new Date();

						var year = today.getFullYear();
						var month = ('0' + (today.getMonth() + 1)).slice(-2);
						var day = ('0' + today.getDate()).slice(-2);
						
						//console.log(target_categories.entries().next().value[1].id);
						
						targetChannel.clone()
						.then(async () => {
							await targetChannel.setParent(targetCategories.entries().next().value[1].id);
						})
						.then(async () => {
							await targetChannel.setName(targetChannel.name + '_' + year + '-' + month  + '-' + day);
						})
						.then(async () => {
							await targetChannel.lockPermissions();
						});

						break;
					case 0:
						throw Error('`아카이브` 라는 이름의 카테고리가 없습니다.');
					default:
						throw Error('`아카이브` 라는 이름의 카테고리가 한 개가 아닙니다.');

				}

				responseString += '의 불판을 성공적으로 갈았습니다!';
			}
			else {
				responseString += ' 불판 교체를 취소했습니다.';
			}

			interaction.followUp({ content: responseString });
		});
	},
};