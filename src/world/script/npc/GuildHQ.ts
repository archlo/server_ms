import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { GameConstants } from '../../GameConstants';
import { GuildManager } from '../../guild/GuildManager';
import { Guild } from '../../guild/Guild';
import { GuildMember } from '../../guild/GuildMember';
import { GuildDB } from '../../../server/channel/db/GuildDB';
import { GuildPacket } from '../../guild/GuildPacket';
import { AllianceManager } from '../../alliance/AllianceManager';
import { Alliance } from '../../alliance/Alliance';
import { AlliancePacket } from '../../alliance/AlliancePacket';

export function* guild_proc(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Heracle (2010007) - Orbis : Guild Headquarters <Hall of Fame> (200000301)

  if (ctx.user.hasGuild()) {
    yield ctx.sayOk('You are already in a guild. Please leave your current guild before creating a new one.');
    return;
  }

  const createGuild: boolean = yield ctx.askYesNo(
    `Hello! I am Heracle, the great god of the guild. If you have #b${GameConstants.CREATE_GUILD_COST.toLocaleString()} mesos#k, I can create a fine guild for you. Would you like to create a guild?`
  );

  if (!createGuild) {
    yield ctx.sayOk('I see. Please come back to me if you ever decide to create a guild.');
    return;
  }

  const money = ctx.user.getInventoryManager().money;
  if (money < GameConstants.CREATE_GUILD_COST) {
    yield ctx.sayOk(
      `You do not have enough mesos. You need #b${GameConstants.CREATE_GUILD_COST.toLocaleString()} mesos#k to create a guild. Please come back with the required amount.`
    );
    return;
  }

  const guildName: string = yield ctx.askText(
    'Now, please enter the name of your guild. It must be between 4 and 13 characters long.',
    '',
    4,
    13,
  );

  if (!guildName || guildName.length < 4 || guildName.length > 13) {
    yield ctx.sayOk('The guild name must be between 4 and 13 characters. Please try again.');
    return;
  }

  if (!GameConstants.isValidCharacterName(guildName)) {
    yield ctx.sayOk('The guild name may only contain alphanumeric characters. Please try again.');
    return;
  }

  if (GuildManager.instance.getGuildByName(guildName)) {
    yield ctx.sayOk('That guild name is already taken. Please choose a different name.');
    return;
  }

  const confirm: boolean = yield ctx.askYesNo(
    `Are you sure you want to create the guild "#b${guildName}#k"? This will cost you #b${GameConstants.CREATE_GUILD_COST.toLocaleString()} mesos#k.`
  );

  if (!confirm) {
    yield ctx.sayOk('I see. Please come back if you change your mind.');
    return;
  }

  const guildId = GuildManager.instance.nextGuildId();
  const guild = new Guild(guildId, guildName, ctx.user.getCharacterId());

  const member = new GuildMember(
    ctx.user.getCharacterId(),
    ctx.user.getCharacterName(),
    ctx.user.getJob(),
    ctx.user.getLevel(),
    1,
    true,
  );
  guild.addMember(member);
  GuildManager.instance.addGuild(guild);

  ctx.user.getCharacterData().guildId = guildId;
  ctx.addMoney(-GameConstants.CREATE_GUILD_COST);

  GuildDB.newGuild(guild).catch(() => {});

  ctx.user.write(GuildPacket.guildCreated(guild));
  ctx.user.write(GuildPacket.loadGuildDone(guild));

  yield ctx.sayOk(`Congratulations! The guild "#b${guildName}#k" has been created.`);
}

export function* guild_mark(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Lea : Guild Emblem Creator (2010008) - Orbis : Guild Headquarters <Hall of Fame> (200000301)

  if (!ctx.user.hasGuild()) {
    yield ctx.sayOk('You are not in a guild. Please join a guild first before changing its emblem.');
    return;
  }

  const guild = GuildManager.instance.getGuild(ctx.user.getGuildId());
  if (!guild) {
    yield ctx.sayOk('Your guild could not be found. Please try again later.');
    return;
  }

  const member = guild.getMember(ctx.user.getCharacterId());
  if (!member || member.grade > 2) {
    yield ctx.sayOk('Only the guild master and junior masters can change the guild emblem.');
    return;
  }

  const changeEmblem: boolean = yield ctx.askYesNo(
    'Welcome to the Guild Emblem Creator. Would you like to change your guild emblem? It costs #b500,000 mesos#k to create a new emblem.'
  );

  if (!changeEmblem) {
    yield ctx.sayOk('I see. Please come back if you ever want to change your guild emblem.');
    return;
  }

  const money = ctx.user.getInventoryManager().money;
  if (money < GameConstants.CREATE_EMBLEM_COST) {
    yield ctx.sayOk('You do not have enough mesos. Please come back with 500,000 mesos.');
    return;
  }

  ctx.addMoney(-GameConstants.CREATE_EMBLEM_COST);

  // The client handles the emblem editing UI; the server just sends the guild info
  ctx.user.write(GuildPacket.loadGuildDone(guild));

  yield ctx.sayOk(
    'You can now change your guild emblem. Once you are done, the emblem will be displayed for all guild members.'
  );
}

export function* guild_union(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Lenario : Manager of Guild Union (2010009) - Orbis : Guild Headquarters <Hall of Fame> (200000301)

  if (!ctx.user.hasGuild()) {
    yield ctx.sayOk('You are not in a guild. Please join a guild first before dealing with unions.');
    return;
  }

  const guild = GuildManager.instance.getGuild(ctx.user.getGuildId());
  if (!guild) {
    yield ctx.sayOk('Your guild could not be found. Please try again later.');
    return;
  }

  if (guild.leader !== ctx.user.getCharacterId()) {
    yield ctx.sayOk('Only the guild master can manage the guild union.');
    return;
  }

  const options = new Map<number, string>();
  options.set(0, 'Create a new alliance');
  if (guild.allianceId !== 0) {
    options.set(1, 'Manage my alliance');
  }

  const choice: number = yield ctx.askMenu('Welcome to the Guild Union Manager. What would you like to do?', options);

  if (choice === 0) {
    if (guild.allianceId !== 0) {
      yield ctx.sayOk('Your guild is already part of an alliance. Please leave it first.');
      return;
    }

    if (guild.members.size < 5) {
      yield ctx.sayOk('Your guild needs at least 5 members to create an alliance.');
      return;
    }

    const allyName: string = yield ctx.askText(
      'Please enter the name of your alliance. It must be between 4 and 13 characters long.',
      '',
      4,
      13,
    );

    if (!allyName || allyName.length < 4 || allyName.length > 13) {
      yield ctx.sayOk('The alliance name must be between 4 and 13 characters. Please try again.');
      return;
    }

    if (AllianceManager.instance.getAllianceByName(allyName)) {
      yield ctx.sayOk('That alliance name is already taken. Please choose a different name.');
      return;
    }

    const money = ctx.user.getInventoryManager().money;
    if (money < GameConstants.CREATE_UNION_COST) {
      yield ctx.sayOk('You do not have enough mesos. Creating an alliance costs 5,000,000 mesos.');
      return;
    }

    const allianceId = AllianceManager.instance.nextAllianceId();
    const alliance = new Alliance(allianceId, allyName);
    alliance.addGuild(guild.guildId);
    guild.allianceId = allianceId;
    AllianceManager.instance.addAlliance(alliance);
    ctx.addMoney(-GameConstants.CREATE_UNION_COST);

    ctx.user.write(AlliancePacket.allianceCreated(alliance));
    yield ctx.sayOk(`The alliance "#b${allyName}#k" has been created successfully!`);
  } else if (choice === 1) {
    const alliance = AllianceManager.instance.getAlliance(guild.allianceId);
    if (!alliance) {
      yield ctx.sayOk('Your alliance could not be found.');
      return;
    }

    const mgmtOptions = new Map<number, string>();
    mgmtOptions.set(0, 'Leave the alliance');
    mgmtOptions.set(1, 'Disband the alliance');

    const mgmtChoice: number = yield ctx.askMenu(
      `Alliance: #b${alliance.name}#k\nMembers: ${alliance.guildIds.length} guild(s)\nWhat would you like to do?`,
      mgmtOptions,
    );

    if (mgmtChoice === 0) {
      const confirm: boolean = yield ctx.askYesNo('Are you sure you want to leave the alliance?');
      if (confirm) {
        alliance.removeGuild(guild.guildId);
        guild.allianceId = 0;
        yield ctx.sayOk('Your guild has left the alliance.');
      }
    } else if (mgmtChoice === 1) {
      const confirm: boolean = yield ctx.askYesNo(
        'Are you sure you want to disband the entire alliance? This cannot be undone.',
      );
      if (confirm) {
        for (const gid of alliance.guildIds) {
          const g = GuildManager.instance.getGuild(gid);
          if (g) g.allianceId = 0;
        }
        AllianceManager.instance.removeAlliance(alliance.allianceId);
        yield ctx.sayOk('The alliance has been disbanded.');
      }
    }
  }
}
