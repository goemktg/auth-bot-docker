import {
  Client,
  GatewayIntentBits,
  Events,
  AuditLogEvent,
  MessageCreateOptions,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  GuildMember,
} from "discord.js";
import {
  getAuditTargetNickname,
  loadEnvironmentVariables,
  reflectNewbieRoleChange,
  sendAnnouncementMsgs,
  setDefaultLogLevel,
} from "./library/functions";
import { SeatRoleApplier } from "./SeatRoleApplier";
import { CommandsHandler } from "./library/handlers/Commands";
import log from "loglevel";

loadEnvironmentVariables();
setDefaultLogLevel();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMembers,
  ],
});
const commandsHandler = new CommandsHandler();

void client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, (c) => {
  log.info(`Ready! Logged in as ${c.user.tag}`);

  void (async () => {
    client.commands = await commandsHandler.getCommandsFromDir();
  })();
  client.seatRoleApplier = new SeatRoleApplier();

  const joinCapSuperGroup = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("NIS 슈퍼/캐피탈")
    .setURL("https://forums.nisuwaz.com/t/topic/333");

  const joinChoboFCGroup = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("초보 FC")
    .setURL("https://forums.nisuwaz.com/t/gopw-fc/464");

  const joinMoonMiningGroup = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("문마이닝 그룹")
    .setURL("https://forums.nisuwaz.com/t/topic/945");

  const JoinCOSUIChat = new ButtonBuilder()
    .setCustomId("joinCOSUIChat")
    .setStyle(ButtonStyle.Primary)
    .setLabel("콘스프 채팅");

  const JoinWormholeChat = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("웜홀 그룹")
    .setURL("https://forums.nisuwaz.com/t/topic/947");

  const message =
    "Nisuwa Cartel에서는 원하는 활동에 따라 다양한 그룹을 운영하고 있습니다. 아래 버튼 중 하나를 클릭해서 SeAT 및 디스코드에서 그에 맞는 그룹에 들어가거나 신청 절차를 알아보실 수 있습니다. \n\n마지막 수정일: 2024/05/24";

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    joinCapSuperGroup,
    joinChoboFCGroup,
    joinMoonMiningGroup,
    JoinCOSUIChat,
    JoinWormholeChat,
  );

  const channelMsg: MessageCreateOptions = {
    content: message,
    components: [row],
  };

  void sendAnnouncementMsgs(client, channelMsg);
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.guild) return;

  commandsHandler.executeCommand(interaction).catch(console.error);
});

client.on(Events.GuildAuditLogEntryCreate, (auditLog, guild) => {
  if (
    auditLog.action != AuditLogEvent.MemberRoleUpdate ||
    auditLog.executorId === "1066230195473883136"
  )
    return;

  void (async () => {
    const nickname = await getAuditTargetNickname(auditLog, guild);
    void reflectNewbieRoleChange(auditLog, nickname, add, remove);
  })();
});

function add(nickname: string) {
  void client.seatRoleApplier.add(nickname, "48");
}

function remove(nickname: string) {
  void client.seatRoleApplier.remove(nickname, "48");
}

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isButton() || interaction.customId != "joinCOSUIChat")
    return;

  if (
    (interaction.member as GuildMember).roles.cache.filter(
      (role) => role.id === "1212067094791721041",
    ).size > 0
  ) {
    void client.seatRoleApplier.remove(
      (interaction.member as GuildMember).nickname!,
      "49",
    );
    void interaction.reply({
      content:
        "콘스프 롤을 제거했습니다. (콘스프 꼽 맴버에게는 적용되지 않습니다)",
      ephemeral: true,
    });
    return;
  }

  void client.seatRoleApplier.add(
    (interaction.member as GuildMember).nickname!,
    "49",
  );
  void interaction.reply({
    content: "콘스프 롤을 추가했습니다.",
    ephemeral: true,
  });
});
