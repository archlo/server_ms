import { NpcScriptRegistry } from '../NpcScriptRegistry';
import * as StyleFace from './StyleFace';
import * as StyleHair from './StyleHair';
import * as Consume from './Consume';
import * as ContiMove from './ContiMove';
import * as Edelstein from './Edelstein';
import * as ElNathMts from './ElNathMts';
import * as GoldenTemple from './GoldenTemple';
import * as Masteria from './Masteria';
import * as MinarForest from './MinarForest';
import * as MuLungGarden from './MuLungGarden';
import * as VictoriaIsland from './VictoriaIsland';
import * as WorldTour from './WorldTour';
import * as MiniDungeon from './MiniDungeon';
import * as Wedding from './Wedding';
import * as FreeMarket from './FreeMarket';
import * as GuildHQ from './GuildHQ';
import * as UnityPortal from './UnityPortal';
import * as HenesysPQ from './HenesysPQ';
import * as KerningPQ from './KerningPQ';
import * as LudiPQ from './LudiPQ';
import * as EscapePQ from './EscapePQ';
import * as LordPiratePQ from './LordPiratePQ';
import * as ExplorerTutorial from './ExplorerTutorial';
import * as ExplorerQuest from './ExplorerQuest';
import * as AranTutorial from './AranTutorial';
import * as AranQuest from './AranQuest';
import * as CygnusTutorial from './CygnusTutorial';
import * as CygnusQuest from './CygnusQuest';
import * as EvanTutorial from './EvanTutorial';
import * as EvanQuest from './EvanQuest';
import * as ResistanceTutorial from './ResistanceTutorial';
import * as ResistanceQuest from './ResistanceQuest';
import * as MushroomCastle from './MushroomCastle';
import * as NeoCity from './NeoCity';
import * as TitleQuest from './TitleQuest';
import * as NihalDesert from './NihalDesert';
import * as TownNPCS from './TownNPCS';
import * as quest from './quest';
import * as npcdialogs from './npcdialogs';
const scripts: Record<string, any> = {
  ...StyleFace,
  ...StyleHair,
  ...Consume,
  ...ContiMove,
  ...Edelstein,
  ...ElNathMts,
  ...GoldenTemple,
  ...Masteria,
  ...MinarForest,
  ...MuLungGarden,
  ...VictoriaIsland,
  ...WorldTour,
  ...MiniDungeon,
  ...Wedding,
  ...FreeMarket,
  ...GuildHQ,
  ...UnityPortal,
  ...HenesysPQ,
  ...KerningPQ,
  ...LudiPQ,
  ...EscapePQ,
  ...LordPiratePQ,
  ...ExplorerTutorial,
  ...ExplorerQuest,
  ...AranTutorial,
  ...AranQuest,
  ...CygnusTutorial,
  ...CygnusQuest,
  ...EvanTutorial,
  ...EvanQuest,
  ...ResistanceTutorial,
  ...ResistanceQuest,
  ...MushroomCastle,
  ...NeoCity,
  ...TitleQuest,
  ...NihalDesert,
  ...TownNPCS,
  ...quest,
  ...npcdialogs,
};

for (const [name, script] of Object.entries(scripts)) {
  NpcScriptRegistry.register(name, script);
}

// `3jobExit` is a valid NPC script name in v95 data but not a valid TS
// identifier, so it is exported from npcdialogs as `_3jobExit`.
NpcScriptRegistry.register('3jobExit', (npcdialogs as any)._3jobExit);
