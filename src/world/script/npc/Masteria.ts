import { ScriptContext } from '../ScriptContext';
import { ScriptMessage } from '../ScriptMessage';
import { EventType } from '../../../server/event/EventType';
import { EventState } from '../../../server/event/EventState';

const SUBWAY_TICKET_TO_NLC = 4031711;
const SUBWAY_TICKET_TO_KERNING_CITY = 4031713;

export function* NLC_ticketing(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Bell : NLC Subway Staff (9201057)
  if (ctx.getFieldId() === 103000100) {
    // Victoria Road : Subway Ticketing Booth
    if ((yield ctx.askMenu('Hello. Would you like to buy a ticket for the subway?', new Map([[0, 'New Leaf City of Masteria']]))) !== 0) {
      return;
    }
    if (!(yield ctx.askYesNo(`The ride to New Leaf City of Masteria takes off every 10 minutes, beginning on the hour, and it'll cost you #b5000 mesos#k. Are you sure you want to purchase a #b#t${SUBWAY_TICKET_TO_NLC}##k?`))) {
      return;
    }
    if (ctx.canAddItem(SUBWAY_TICKET_TO_NLC, 1) && ctx.addMoney(-5000)) {
      ctx.addItem(SUBWAY_TICKET_TO_NLC, 1);
    } else {
      yield ctx.sayOk("Are you sure you have #b5000 mesos#k? If so, then I urge you to check your etc. inventory, and see if it's full or not.");
    }
  } else if (ctx.getFieldId() === 600010001) {
    // New Leaf City : NLC Subway Station
    if ((yield ctx.askMenu('Hello. Would you like to buy a ticket for the subway?', new Map([[0, 'Kerning City of Victoria Island']]))) !== 0) {
      return;
    }
    if (!(yield ctx.askYesNo(`The ride to Kerning City of Victoria Island takes off every 10 minutes, beginning on the hour, and it'll cost you #b5000 mesos#k. Are you sure you want to purchase a #b#t${SUBWAY_TICKET_TO_KERNING_CITY}##k?`))) {
      return;
    }
    if (ctx.canAddItem(SUBWAY_TICKET_TO_KERNING_CITY, 1) && ctx.addMoney(-5000)) {
      ctx.addItem(SUBWAY_TICKET_TO_KERNING_CITY, 1);
    } else {
      yield ctx.sayOk("Are you sure you have #b5000 mesos#k? If so, then I urge you to check your etc. inventory, and see if it's full or not.");
    }
  } else if (ctx.getFieldId() === 600010002) {
    // New Leaf City : Waiting Room(From NLC to KC)
    if (!(yield ctx.askYesNo('Do you want to go back to New Leaf City subway station now?'))) {
      return;
    }
    ctx.warp(103000100, 'st00'); // Victoria Road : Subway Ticketing Booth
  } else if (ctx.getFieldId() === 600010004) {
    // Kerning City Town Street : Waiting Room(From KC to NLC)
    if (!(yield ctx.askYesNo('Do you want to go back to Kerning City subway station now?'))) {
      return;
    }
    ctx.warp(600010001, 'st00'); // New Leaf City : NLC Subway Station
  }
}

export function* NLC_Move(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // NLC Ticket Gate (9201068) - New Leaf City : NLC Subway Station (600010001)
  if (!ctx.hasItem(SUBWAY_TICKET_TO_KERNING_CITY)) {
    yield ctx.sayOk('Here\'s the ticket reader. You are not allowed in without the ticket.');
    return;
  }
  const eventState = ctx.getEventState(EventType.CM_SUBWAY);
  if (eventState === EventState.SUBWAY_BOARDING) {
    if (!(yield ctx.askYesNo("It looks like there's plenty of room for this ride. Please have your ticket ready so I can let you in. The ride will be long, but you'll get to your destination just fine. What do you think? Do you want to get on this ride?"))) {
      return;
    }
    if (ctx.removeItem(SUBWAY_TICKET_TO_KERNING_CITY, 1)) {
      ctx.warp(600010002, 'st00'); // Subway.WAITING_ROOM_FROM_NLC_TO_KC - New Leaf City : Waiting Room(From NLC to KC)
    }
  } else if (eventState === EventState.SUBWAY_WAITING) {
    yield ctx.sayNext("This subway is getting ready for takeoff. I'm sorry, but you'll have to get on the next ride. The ride schedule is available through the usher at the ticketing booth.");
  } else {
    yield ctx.sayNext('We will begin boarding 5 minutes before the takeoff. Please be patient and wait for a few minutes. Be aware that the subway will take off right on time, and we stop receiving tickets 1 minute before that, so please make sure to be here on time.');
  }
}

export function* NLC_Taxi(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // NLC Taxi (9201056) - New Leaf City : NLC Town Center (600000000) / Phantom Forest : Haunted House (682000000)
  if (ctx.getFieldId() === 600000000) {
    // New Leaf City : NLC Town Center
    if (yield ctx.askYesNo("Hey, there. Want to take a trip deeper into the Masterian wilderness? A lot of this continent is still quite unknown and untamed... so there's still not much in the way of roads. Good thing we've got this baby... we can go offroading, and in style too! Right now, I can drive you to the #bPhantom Forest#k. The old #bPrendergast Mansion#k is located there. Some people say the place is haunted! What do you say... want to head over there?")) {
      yield ctx.sayNext("Alright! Buckle your seat belt, and let's head to the Mansion!\r\nIt's going to get bumpy!");
      ctx.warp(682000000, 'st00'); // Phantom Forest : Haunted House
    } else {
      yield ctx.sayOk("Really? I don't blame you... Sounds like a pretty scary place to me too! If you change your mind, I'll be right here.");
    }
  } else if (ctx.getFieldId() === 682000000) {
    // Phantom Forest : Haunted House
    if (yield ctx.askYesNo('Hey, there. Hope you had fun here! Ready to head back to #bNew Leaf City#k?')) {
      yield ctx.sayNext("Back to civilization it is! Hop in and get comfortable back there... We'll have you back to the city in a jiffy!");
      ctx.warp(600000000); // New Leaf City : NLC Town Center
    } else {
      yield ctx.sayOk("Oh, you want to stay and look around some more? That's understandable. If you wish to go back to #bNew Leaf City#k, you know who to talk to!");
    }
  }
}

export function* About_NLC(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Icebyrd Slimm : NLC Mayor (9201050) - New Leaf City : NLC Town Center (600000000)
  const answer: number = yield ctx.askMenu('What up! Name\'s Icebyrd Slimm, mayor of New Leaf City! Happy to see you accepted my invite. So, what can I do for you?', new Map([
    [0, 'What is this place?'],
    [1, 'Who is Professor Foxwit?'],
    [2, "What's a Foxwit Door?"],
    [3, 'Where are the MesoGears?'],
    [4, 'What is the Krakian Jungle?'],
    [5, "What's a Gear Portal?"],
    [6, 'What do the street signs mean?'],
    [7, "What's the deal with Jack Masque?"],
    [8, "Lita Lawless looks like a tough cookie, what's her story?"],
    [9, 'When will new boroughs open up in the city?'],
    [10, 'I want to take the quiz!'],
  ]));
  switch (answer) {
    case 0:
      yield ctx.sayNext("I've always dreamed of building a city. Not just any city, but one where everyone was welcome. I used to live in Kerning City, so I decided to see if I could create a city. As I went along in finding the means to do so, I encountered many people, some of whom I've come to regard as friends. Like Professor Foxwit-he's our resident genius; saved him from a group of man-eating plants. Jack Masque is an old hunting buddy from Amoria-almost too smooth of a talker for his own good. Lita and I are old friends from Kerning City-she's saved me a few times with that weapon of hers; so I figured she was a perfect choice for Town Sheriff. It took a bit of persuasion, but she came to believe her destiny lies here. About our resident explorer, Barricade came searching for something; he agreed to bring whatever he found to the museum. I'd heard stories about him and his brother when I was still in Kerning City. And Elpam...well, let's just say he's not from around here. At all. We've spoken before, and he seems to mean well, so I've allowed him to stay. I just realized that I've rambled quite a bit! What else would you like to know?");
      break;
    case 1:
      yield ctx.sayNext("A pretty spry guy for being 97. He' s a time-traveler I ran into outside the city one day. Old guy had a bit of trouble with some jungle creatures-like they tried to eat him. In return for me saving him, he agreed to build a time museum. I get the feeling that he's come here for another reason, as he's mentioned more than a few times that New Leaf City has an interesting role to play in the future. Maybe you can find out a bit more... ");
      break;
    case 2:
      yield ctx.sayNext("Heh, I asked the same thing when I saw the Professor building them. They're warp points. Pressing Up will warp you to another location. I recommend getting the hang of them, they're our transport system.");
      break;
    case 3:
      yield ctx.sayNext("The MesoGears are beneath Bigger Ben. It's a monster-infested section of Bigger Ben that Barricade discovered. It seems to reside in a separate section of the tower-quite strange if you ask me. I hear he needs a bit of help exploring it, you should see him. Be careful though, the Wolf Spiders in there are no joke.");
      break;
    case 4:
      yield ctx.sayNext("Ah...well. The Krakian Jungle is located on the outskirts of New Leaf City. Many new and powerful creatures roam those areas, so you'd better be prepared to fight if you head out there. It's at the left end of town. Rumors abound that the Jungle leads to a lost city, but we haven't found anything yet.");
      break;
    case 5:
      yield ctx.sayNext("Well, when John found himself in the MesoGears portion of Bigger Ben, he stood on one and went to another location. However, he could only head back and forth-they don't cycle through like the Foxwit Door. Ancient tech for you.");
      break;
    case 6:
      yield ctx.sayNext("Well, you'll see them just about everywhere. They're areas under construction. The Red lights mean it's not finished, but the Green lights mean it's open. Check back often, we're always building!");
      break;
    case 7:
      yield ctx.sayNext("Ah, Jack. You know those guys that are too cool for school? The ones who always seem to get away with everything? AND get the girl? Well, that's Jack, but without the girl. He thinks he blew his chance, and began wearing that mask to hide his true identity. My lips are sealed about who he is, but he's from Amoria. He might tell you a bit more if you ask him.");
      break;
    case 8:
      yield ctx.sayNext("I've known Lita for a while, thought we've just recently rekindled our friendship. I didn't see her for a quite a bit, but I understand why. She trained for a very, very long time as a Thief. Matter of fact, that's how we first met? I was besieged a group of wayward Mushrooms, and she jumped in to help. When it was time to a pick a sheriff, it was a no-brainer. She's made a promise to help others in their training and protect the city, so if you're interested in a bit of civic duty, speak with her. ");
      break;
    case 9:
      yield ctx.sayNext("Soon, my friend. Even though you can't see them, the city developers are hard at work. When they're ready, we'll open them. I know you're looking forward to it and so am I!");
      break;
    case 10:
      if (ctx.getLevel() < 15) {
        yield ctx.sayNext('Sorry but this quiz is only available for level 15 and above. Please come back to me when you are ready to take this quiz.');
        return;
      }
      if (ctx.hasQuestCompleted(4900)) {
        yield ctx.sayNext("You've already solved my questions. Enjoy your trip in NLC!!");
        return;
      }
      yield ctx.sayNext("No problem. I'll give you something nice if you answer them correctly!");
      ctx.forceStartQuest(4900); // Welcome to New Leaf City Quiz 1
      break;
  }
}

export function* Sunstone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Sunstone Grave (9201071) - MesoGears : Fire Chamber (600020400)
  yield ctx.sayOk('Tempt Fate. Discover the path.');
}

export function* Moonstone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Moonstone Grave (9201072) - MesoGears : Ice Chamber (600020500)
  yield ctx.sayOk('30, 101, Hidden.');
}

export function* Tombstone(ctx: ScriptContext): Generator<ScriptMessage, void, any> {
  // Tombstone (9201073) - MesoGears : Enigma Chamber (600020600)
  yield ctx.sayOk('Here lies Christopher Crimsonheart, the immortal warrior.');
}
