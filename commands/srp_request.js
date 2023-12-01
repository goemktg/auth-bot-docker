const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('srp_request')
		.setDescription('SRP 요청')
		.addStringOption(option =>
			option.setName('input')
			.setDescription('srp 요청할 zkillboard 링크입니다')),
	async execute(interaction, srprateForshipids) {
		const target = interaction.options.getString('input');
		
		try {
			await interaction.reply({ content: 'SRP 가격을 계산하고 있습니다...' })
				.then(async () => {
					const killmailId = target.match(/\d+/g).toString();
					const killboardUrl = "https://zkillboard.com/api/killID/"+killmailId+"/";
	
					const killboardResponse = await fetch(killboardUrl, { method: "GET", headers: { 'User-Agent': 'Maintainer: Goem Funaila(IG) samktg52@gmail.com' }, });
					const killmailData = await JSON.parse(await killboardResponse.text());
	
					//console.log(killmailData);
	
					const killmailHash = killmailData[0].zkb.hash;
					const esiUrl = "https://esi.evetech.net/latest/killmails/"+killmailId+"/"+killmailHash+"/";
	
					const esiResponse = await fetch(esiUrl, { method: "GET", headers: { 'User-Agent': 'Maintainer: Goem Funaila(IG) samktg52@gmail.com' }, });
					const esiData = await JSON.parse(await esiResponse.text());
	
					
					//console.log(esiData);
					if (!isValidTimeForSRP(esiData.killmail_time))
						throw new Error('로스 발생 후 3일이 지난 킬메일입니다.');
	
					const marketdata = createMarketdata(esiData.victim.items, esiData.victim.ship_type_id);
					const eveprisalUrl = "https://evepraisal.com/appraisal/structured.json?persist=no";
	
					const evepraisalResponse = await fetch(eveprisalUrl, { method: "POST", headers: { 'User-Agent': 'Maintainer: Goem Funaila(IG) samktg52@gmail.com' }, body: JSON.stringify(marketdata) });
					const evepraisalData = await JSON.parse(await evepraisalResponse.text());
	
					//console.log(evepraisalData);
	
					const srpData = srprateForshipids.filter(array => array.shipIds.includes(esiData.victim.ship_type_id));
					var srpPercent = 0;
					var srpMaxprice = 0;
					for (const element of srpData) {
						if (element.srpPercent > srpPercent) {
							srpPercent = element.srpPercent;
							srpMaxprice = element.srpMaxprice;
						}
					}
	
					var calculatedSrpprice = (evepraisalData.appraisal.totals.sell / 100) * srpPercent;
					if (calculatedSrpprice > srpMaxprice * 1000000) {
						calculatedSrpprice = srpMaxprice * 1000000;
					}
	
					interaction.editReply({ content: `${target} \nSRP 액수 : ${calculatedSrpprice.toLocaleString()}` });
				});
		} catch (error) {
			interaction.editReply({ content: '오류가 발생했습니다! :```\n'+error+'```' });
		}

		function createMarketdata(killmailItems, killmailShipTypeId) {
			var marketData = new Object();
			marketData.market_name = "jita";
			marketData.items = new Array();

			for (const element of killmailItems) {
				if (element.flag == 5)
					continue;
				var temp = new Object();
				temp.type_id = element.item_type_id;
				temp.quantity = (element.quantity_destroyed || 0) + (element.quantity_dropped || 0);
				marketData.items.push(temp);
			}
			var temp = new Object();
			temp.type_id = killmailShipTypeId;
			temp.quantity = 1;
			marketData.items.push(temp);

			return marketData;
		}

		function isValidTimeForSRP(killmailTime) {
			const utcTime = new Date(killmailTime);
			const currentTime = new Date();
			const threeDaysAgoFromCurrentTime = new Date(currentTime - 3 * 24 * 60 * 60 * 1000); // subtract 3 days in milliseconds
		  
			//console.log(utcTime, threeDaysAgoFromCurrentTime);

			if (utcTime > threeDaysAgoFromCurrentTime) {
			  return true;
			} else {
			  return false;
			}
		}
	},
};