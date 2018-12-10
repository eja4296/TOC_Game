// Setup basic express server
const express = require('express');

const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

const votesArray = [0, 0, 0, 0];


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));


// Variables stored on server
let usernames = [];
let numUsers = 0;
let numUsersVoted = 0;
const changeEventTimer = -1;
const eventResolutionTimer = -1;
const numOfEvents = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const usedNums = [];
const usedEvents = [];
let gameStarted = false;
let currentEvent;
let previousEvent;
let swordVotes = [];
let wandVotes = [];
let cupVotes = [];
let coinVotes = [];
let finalVote = "";
let topVote = 0;
let gameOver = false;
let eventConstraint = false;

let fool = {
  health: 40,
  strength: 5,
  charisma: 5,
  intelligence: 5,
  luck: 5,
  gold: 10,
};

const foolBase = {
  health: 40,
  strength: 5,
  charisma: 5,
  intelligence: 5,
  luck: 5,
  gold: 10,
};

const foolMax = {
  health: 40,
  strength: 10,
  charisma: 10,
  intelligence: 10,
  luck: 10,
  gold: 100,
};

let currentMainEvent = 1;
const allEvents = [];
let completedMainEvents = [];
const allMagicianEvents = [];
const allEmpressEvents = [];
const allHighPreistessEvents = [];
const allChariotEvents = [];
const allEmperorEvents = [];
const allHierophantEvents = [];
const allLoversEvents = [];

// The Magician ////////////////////

// 0
const magician_Main = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The adventurer enters a dimly lit and cramped room. The walls are lined with shelves of books, many of which display runes from a long lost ancient language. In the center of the room stands a large black cauldron, which has vapor rising from the top and makes a quiet simmering noise. On the side of the pot opposite to the adventurer is an elven witch dressed in mage’s robes, adding ingredients to the elixir and occasionally stirring it. Though her wrinkles and grey hair betray her age, she stands tall with dignity and you can see the vast amount of knowledge she’s gained over countless years (and perhaps centuries) in her eyes.',
  tldrDescription: 'The adventurer encounters a witch crafting a potion in a room populated with books. What should he do?',
  options: ['Attack', 'Investigate', 'Inquire', 'Taste'],
  optionsFlavor: ['This witch is clearly powerful and possibly even a threat, better attack her before she attacks us with whatever she’s making.', 'We may be able to learn something useful from the books around the room, they may be worth taking a look at.', 'The witch may know something about this place we’re in, we should ask her some questions.', 'That draught looks very enticing...should we take a sip?'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [1, 2, 3, 4],

};

allMagicianEvents.push(magician_Main);

// 1
const magician_sword = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The adventurer rushes up to the witch and in his haste knocks the cauldron of liquid and spills it on her! Enraged, she draws her staff and combat spellbook and prepares to fight.',
  tldrDescription: 'The adventurer decides to attack the witch. How should he engage her in combat?',
  options: ['Slash', 'Cast a Spell'],
  optionsFlavor: ['The witch will be no match for my raw strength. I will cut her down where she stands.', 'The witch is old and her mind is frayed. I will use magic to incapacitate her.'],
  voteOption: ['Sword', 'Wand'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [11, 12],
};

allMagicianEvents.push(magician_sword);

// 2
const magician_wand = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The witch calls out to the adventurer, “Weary traveller I do not mind if you look through my library but be warned that some of those tomes contain dangerous knowledge. Proceed at your own risk.” The adventurer returns his attention to the shelf and spots three books. The covers of the first book are made of pure metal and looks dangerously difficult to open. The second book floats once pulled from the shelf and whispers promises of divine secrets. The last book is rather plain and well worn, likely meaning that it has been read a good deal. Better only read one, there’s not much time to waste.',
  tldrDescription: 'The adventurer decides to invetigate the room. There is an Iron book, Floating book, and Worn book. Should the adventurer open one, or leave?',
  options: ['Iron', 'Floating', 'Worn', 'Leave'],
  optionsFlavor: ['Open the iron book.', 'Open the floating book.', 'Open the worn book.', 'These books could be dangerous like the witch said, better leave them where we found them.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [5, 6, 7, 8],

};

allMagicianEvents.push(magician_wand);

// 3
const magician_cup = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The witch begins, “There are few places in the world that seep evil energy as this place does - I only stay here for the immense amount of mana and magical resources it provides.” She pauses. “I sense that you are here to end this wretched place. I know little but I’m willing to impart on you what I can, though just knowing this information could prove dangerous. Are you sure you wish to know regardless?”',
  tldrDescription: 'The adventurer decides to inquire the witch. The witch offers to enlighten the adventurer with her knowledge. Should he accept?',
  options: ['Say Yes', 'Say No'],
  optionsFlavor: ["We should accept. The witch's knowledge could prove to be invaluable", 'It would be best to decline. Knowledge can be dangerous.'],
  voteOption: ['Sword', 'Wand'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [9, 10],
};

allMagicianEvents.push(magician_cup);

// 4
const magician_coin = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The witch notices the adventurer eyeing the cerulean mixture she has been so carefully crafting. “Care for a taste?” she asks as she extends a sturdy but boney hand towards him, clasping a vial of her work.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The adventurer decides to taste the mixture. He feels rejuvenated, possibly more alive than he has in a while.', 'The adventurer decides to taste the mixture. He almost immediately feels sick - clearly the potion hadn’t been finished quite yet.'],
  dice: 4,
  threshold: [15, 0],
  statNeeded: 'Luck',
  outcomes: 2,
  effectStats: [
    ['Luck', 'Strength', 'Health'],
    ['Luck', 'Strength', 'Health']
  ],  
  effectPower: [
    [1, 1, 30],
    [-1, -1, -5],
  ],
};

allMagicianEvents.push(magician_coin);

// 5
const magician_wand_sword = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to open the iron book.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The adventurer forces the book open and feels his muscles surge with power as he reads its contents.', 'The adventurer tugs the book from its place but can’t muster the power to keep it in his hands. It ungracefully tumbles from the rack and lands on the adventurer’s feet.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Strength",
  outcomes: 2,
  effectStats: [
    ['Strength', 'Intelligence'],

    ['Health', 'Strength']
  ],  
  effectPower: [
    [2, 1],
 
    [-3, -1],
  ],
};
allMagicianEvents.push(magician_wand_sword);

// 6
const magician_wand_wand = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to open the floating book.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The magic book slams open and attempts to assault the adventurer with dark magic, but he uses his own power to bend the book to his will, letting him access its harbored secrets without resistance.', 'The adventurer extends a hand to the floating book and the room fills with a high pitched scream coming from the book itself, replacing the almost ambient whispers that it conjured previously. It dissolves into ash, but not before thoroughly leaving the adventurer’s head rattled and ears ringing.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 3,
  effectStats: [
    ['Intelligence'],
    ['Health', 'Intelligence']
  ],  
  effectPower: [
    [2],
    [-3, -1],
  ],


};
allMagicianEvents.push(magician_wand_wand);

// 7
const magician_wand_cup = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to open the worn book.',
  tldrDescription: '',
  options: [''],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['“It’s just my recipe book!” she replies. “I hardly use it anymore - I have all of my concoctions in my head nowadays. I’d be happy to let you use it.” She extends the book over her cauldron, which sufficiently heats it to reveal writing that was previously invisible. “Can’t just let anyone have these secrets, can I?”. She points to the simplest formula, a healing elixir, and provides the adventurer the ingredients and flask to make one.', 'The witch doesn’t respond, too absorbed in her work. After some initial pestering, the adventurer gives up and places the pages back with the other books.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Charisma', 'Intelligence', "Health"],
    []
  ],  
  effectPower: [
    [1, 1, 5],
    [],
  ],
};
allMagicianEvents.push(magician_wand_cup);

// 8
const magician_wand_leave = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer refrains from opening any books. Nothing gained, nothing lost.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['It was probably a good idea to leave those books alone.'],
  dice: 0,
  threshold: [],
  statNeeded: "",
  outcomes: 0,
  effectStats: [

  ],  
  effectPower: [

  ],
};
allMagicianEvents.push(magician_wand_leave);

// 9
const magician_cup_yes = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer inquires the witch.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The witch lowers her voice to barely audible from where the adventurer is standing, and tells him of her experiences over the many years of the dungeon. Of the power of swords, cups, wands, and coins having influence on all of the happenings in the realm, and of constantly shifting rooms with constantly shifting happenings and unknown futures in each of them.', 'She begins to speak, but a purple mist rises from the floor and the temperature in the room drops drastically. The tainted air finds its way into her nose and fills her lungs. The witch twitches and writhes in unnatural ways until she succumbs to suffocation. As if to hint at what’s coming, the remaining haze attacks the adventurer.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Charisma', 'Intelligence'],
    ['Charisma', 'Health']
  ],  
  effectPower: [
    [2, 2],
    [-1, -5],
  ],
};
allMagicianEvents.push(magician_cup_yes);

// 10
const magician_cup_no = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer ignores the witch.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['“I see,” the witch says somewhat disheartened. “Perhaps then you are not the adventurer that I was expecting to liberate this place.”'],
  dice: 0,
  threshold: [],
  statNeeded: "",
  outcomes: 0,
  effectStats: [

  ],  
  effectPower: [

  ],
};

allMagicianEvents.push(magician_cup_no);

// 11
const magician_sword_sword = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer hacks the witch with his sword.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['As the witch crumples in defeat, her staff clangs to the ground with a loud thump. No point in wasting a perfectly good weapon - the adventurer picks it up and claims it for himself.', 'The witch, though old, moves quicker than the adventurer. As the adventurer swings his sword at the witch, she counters with her staff and deals blow to his gut, knockiing the wind out of him. The witch refrains from dealing further damage, as she knows he is no match for her.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Strength",
  outcomes: 2,
  effectStats: [
    ['Strength', 'Luck'],
    ['Health', 'Strength']
  ],  
  effectPower: [
    [2, 2],
    [-5, -1],
  ],
  constraint: true,
  constraintResult: [1, 0]
};

allMagicianEvents.push(magician_sword_sword);

// 12
const magician_sword_wand = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer casts a spell on the witch.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['As the witch crumples in defeat, her staff clangs to the ground with a loud thump. No point in wasting a perfectly good weapon - the adventurer picks it up and claims it for himself.', 'The witch, though old, moves quicker than the adventurer. As the adventurer casts his spell at the witch, she effortlessly counters with a spell of her own knocking the adveturer off his feet. The witch refrains from dealing further damage, as she knows he is no match for her.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Luck'],
    ['Health', 'Intelligence']
  ],  
  effectPower: [
    [2, 2],
    [-5, -1],
  ],
  constraint: true,
  constraintResult: [1, 0]
};

allMagicianEvents.push(magician_sword_wand);

// 13
const magician_Main_Alt = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The walls are lined with shelves of books, many of which display runes from a long lost ancient language. In the center of the room stands a large black cauldron, which has vapor rising from the top and makes a quiet simmering noise.',
  tldrDescription: 'The witch is dead so the adventurer is free to explore. What should he do?',
  options: ['Attack', 'Investigate', 'Inquire', 'Taste'],
  optionsFlavor: ['This witch is clearly powerful and possibly even a threat, better attack her before she attacks us with whatever she’s making.', 'We may be able to learn something useful from the books around the room, they may be worth taking a look at.', 'The witch may know something about this place we’re in, we should ask her some questions.', 'That draught looks very enticing...should we take a sip?'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 0, 1, 0],
  completedOptionsStart: [1, 0, 1, 0],
  connections: [1, 14, 3, 16],
};

allMagicianEvents.push(magician_Main_Alt);

// 14
const magician_wand_Alt = {
  title: 'The Magician',
  name: 'magician',
  type: 'voting',
  flavorTextDescription: 'The adventurer returns his attention to the shelf and spots three books. The covers of the first book are made of pure metal and looks dangerously difficult to open. The second book floats once pulled from the shelf and whispers promises of divine secrets. The last book is rather plain and well worn, likely meaning that it has been read a good deal. Better only read one, there’s not much time to waste.',
  tldrDescription: 'The adventurer decides to invetigate the room. There is an Iron book, Floating book, and Worn book. Should the adventurer open one, or leave?',
  options: ['Iron', 'Floating', 'Worn', 'Leave'],
  optionsFlavor: ['Open the iron book.', 'Open the floating book.', 'Open the worn book.', 'These books could be dangerous like the witch said, better leave them where we found them.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [5, 6, 15, 8],
};

allMagicianEvents.push(magician_wand_Alt);

// 15
const magician_wand_cup_Alt = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to open worn book.',
  tldrDescription: '',
  options: [''],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['It looks like the witch\'s recipe book. The adventurer grabs a the ingredients and makes a health potion.', 'It looks like the witch\'s recipe book, but the adventurer cannot understand her writing. Maybe if the witch were here she could explain it to him...'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Charisma', 'Intelligence', "Health"],
    []
  ],  
  effectPower: [
    [1, 1, 5],
    [],
  ],
};
allMagicianEvents.push(magician_wand_cup_Alt);

// 16
const magician_Coin_Alt = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'The adventurer eyes the cerulean mixture the witch had been so carefully crafting and decides to take a sip.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The adventurer decides to taste the mixture. He feels rejuvenated, possibly more alive than he has in a while.', 'The adventurer decides to taste the mixture. He almost immediately feels sick - clearly the potion hadn’t been finished quite yet.'],
  dice: 4,
  threshold: [15, 0],
  statNeeded: 'Luck',
  outcomes: 2,
  effectStats: [
    ['Luck', 'Strength', 'Health'],
    ['Luck', 'Strength', 'Health']
  ],  
  effectPower: [
    [1, 1, 30],
    [-1, -1, -5],
  ],
};

allMagicianEvents.push(magician_Coin_Alt);

// The High Priestess ////////////////

// 0
const highPriestess_Main = {
  title: 'The High Preistess',
  name: 'highPriestess',
  type: 'voting',
  flavorTextDescription: 'Immediately upon entering this room, the adventurer is struck with the sight of a beautiful stone statue of a weeping angel as well as the soothing sound of rushing water. The entire floor is wet as the angel cries pure tears onto the marble floor, and the ripples it causes feel good against the adventurer’s feet. The water gleams onto the similarly pearl-colored walls thanks to an unknown light source. The deeper pool of water surrounding the statue is home to a group of calm fish. The only interruption to the flow of water on the ground is by a small altar made of the same material as the fountain, facing it. It’s surprising that such a heavenly space could possibly exist such a demonic place, making it seem almost unsettling. However the soothing nature of the aura in the room expels that thought from the adventurer’s mind and leaves him in a place of zen.',
  tldrDescription: 'The adventurer emerges in a room with a fountain that spouts water onto the floor, and an altar next to it. Surrounding the statue is a pool containing some fish. What should he do?',
  options: ['Fish', 'Investigate', 'Pray', 'Wish'],
  optionsFlavor: ['Who knows when we’ll be able to eat in here, and it’s eat or be eaten - time to go fishing!', 'Where did all of this water coming from? There might be something here causing it that could help in the future.', 'There is still a long and difficult journey ahead, a moment of silence and prayer at the altar is warranted.', 'Toss a coin in the fountain. Might turn out to be lucky!'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [1, 2, 3, 4],
};

allHighPreistessEvents.push(highPriestess_Main);

// 1
const highPreistess_sword = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to go fishing in the fountain.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['The adventurer manages to snag a large fish, and use a bit of fire magic he picked up before entering this hellhole to roast it.', 'The fish proves to be too slippery. The adventurer wasn’t that hungry anyways.', 'The adventurer trips over his own feet and plunges head first into the pool, also knocking his head on the way down. He could not have failed more spectacularly. The eyes of the fish followed him as he pulled himself out, almost teasing him at his failure to make a meal out of one from their ranks.'],
  dice: 3,
  threshold: [8, 4, 0],
  statNeeded: "Strength",
  outcomes: 3,
  effectStats: [
    ['Health', 'Strength'],
    [],
    ['Health','Strength']
  ],  
  effectPower: [
    [10, 1],
    [],
    [-3, -1],
  ],
};

allHighPreistessEvents.push(highPreistess_sword);

// 2
const highPriestess_wand = {
  title: 'The High Preistess',
  name: 'highPriestess',
  type: 'voting',
  flavorTextDescription: 'Tucked away between the wings of the statue, where the small of her back would be if she was indeed a real angel, was a teardrop shaped crystal. Taking it would likely stop the flow of water in the room but it’s loose enough to do so. Take it?',
  tldrDescription: 'There is a crystal on the statue. Should the adventurer take it?',
  options: ['Yes', 'No'],
  optionsFlavor: ['Take the crystal. It could prove to be valuable.', 'Leave the crystal. We would not want to disturb such a divine place.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [5, 6],
};

allHighPreistessEvents.push(highPriestess_wand);

// 3
const highPreistess_cup = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to pray at the altar.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['Divine powers flows from the water and into the adventurer, coursing through his body starting with his feet and slowly making its way upward.', 'Nothing happens, but if nothing else the adventurer feels slightly better. The water rushes a little harder on the ground and also seems to be pleased.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Health', 'Charisma'],

    ['Health']
  ],  
  effectPower: [
    [10, 1],
  
    [5],
  ],
};

allHighPreistessEvents.push(highPreistess_cup);

// 4
const highPreistess_coin = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to toss a coin in the fountain.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['The coin makes a splash, and the adventurer feels...empowered.', 'The coin makes a splash. Nothing happens.'],
  dice: 4,
  threshold: [15, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Luck', 'charisma', "Gold"],

    ['Luck', "Gold"]
  ],  
  effectPower: [
    [1, 2, -1],

    [-1, -1],
  ],
};

allHighPreistessEvents.push(highPreistess_coin);

// 5
const highPreistess_wand_yes = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to try and take the crystal.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['The adventurer removes the stone, and quickly places it in a spare flask which immediately fills with water. The fountain runs dry, and the fish find themselves unable to breathe and flopping on the bottom of the very deep pool floor.', 'The stone is stuck, imbued with holy energy. Maybe it was not meant to be removed.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Strength",
  outcomes: 2,
  effectStats: [
    ['Intelligence', "Gold"],
    ['Strength', "Charisma"]
  ],  
  effectPower: [
    [1, 10],
  
    [-1, -1],
  ],
  constraint: true,
  constraintResult: [1, 0]
};

allHighPreistessEvents.push(highPreistess_wand_yes);

// 6
const highPreistess_wand_no = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides not to take the crystal.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['The adventurer leaves the crystal in its rightful place. Better not to disturb the natural flow of the room.'],
  dice: 10,
  threshold: [0],
  statNeeded: "Intelligence",
  outcomes: 1,
  effectStats: [
    ['Intelligence']
  ],  
  effectPower: [
    [2]
  ],
};

allHighPreistessEvents.push(highPreistess_wand_no);

// 7
const highPriestess_Main_Alt = {
  title: 'The High Preistess',
  name: 'highPriestess',
  type: 'voting',
  flavorTextDescription: 'The adventurer is in a room with a beautiful stone statue of a once weeping angel. The entire floor is damp from the angels tears. The fish that swam peacfully in the surrounding water are now flopping and gasping for life. There is a small altar made of the same material as the fountain, facing it. It’s surprising that such a heavenly space could possibly exist such a demonic place, making it seem almost unsettling. However the soothing nature of the aura in the room expels that thought from the adventurer’s mind and leaves him in a place of zen.',
  tldrDescription: 'The adventurer sits in the room with the fountain that is no longer spouting water. There is an altar next to it. Several fish are flopping around the basin of the empty founatin. What should he do?',
  options: ['Fish', 'Investigate', 'Pray', 'Wish'],
  optionsFlavor: ['Who knows when we’ll be able to eat in here, and it’s eat or be eaten - time to go fishing!', 'Where did all of this water coming from? There might be something here causing it that could help in the future.', 'There is still a long and difficult journey ahead, a moment of silence and prayer at the altar is warranted.', 'Toss a coin in the fountain. Might turn out to be lucky!'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 1, 0, 0],
  completedOptionsStart: [0, 1, 0, 0],

  connections: [8, 2, 9, 10],
};

allHighPreistessEvents.push(highPriestess_Main_Alt);

// 8
const highPreistess_sword_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to catch a fish.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['The adventurer manages to snag a large fish, and use a bit of fire magic he picked up before entering this hellhole to roast it.', 'The fish proves to be too slippery. The adventurer wasn’t that hungry anyways.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Strength",
  outcomes: 2,
  effectStats: [
    ['Health', 'Strength'],
    []
  ],  
  effectPower: [
    [10, 1],
    []
  ],
};

allHighPreistessEvents.push(highPreistess_sword_alt);

// 9
const highPreistess_cup_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to pray at the altar.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ['Nothing happens, but if nothing else the adventurer feels slightly better.'],
  dice: 3,
  threshold: [0],
  statNeeded: "Charisma",
  outcomes: 1,
  effectStats: [
    ['Health']
  ],  
  effectPower: [
    [5],
  ],
};

allHighPreistessEvents.push(highPreistess_cup_alt);

// 10
const highPreistess_coin_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decide to toss a coin in the fountain.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 7],
  text: ["The adventurer tosses several coins into the fountain, but nothing happens. Maybe we shoudln't have taken the crystal?"],
  dice: 4,
  threshold: [0],
  statNeeded: "Luck",
  outcomes: 1,
  effectStats: [
    ['Luck', "Gold"],
  ],  
  effectPower: [
    [-1, -5],
  ],
};

allHighPreistessEvents.push(highPreistess_coin_alt);


// The Empress ///////////////////////////////

// 0
const empress_Main = {
  title: 'The Empress',
  name: 'empress',
  type: 'voting',
  flavorTextDescription: 'The adventurer is greeted by a sea of green after entering this room - grass twice as tall as the average person. He presses forward until a muffled and out of place sound catches his ear. Having no clear path to the exit, he decides to investigate the noise. It leads him to an open clearing with normal, average-sized grass. Across the field stands a willow tree with twisted and contorted branches, forking in various directions. At its base sits the source of the noise, a young woman wrapped in peasant’s clothing. Her knees are bent to her chest and she rests her face on them, obscured by her lengthy amber hair. The adventurer realizes upon seeing her that the suppressed noises he heard before were actually sobs. The maiden doesn’t acknowledge the adventurer’s presence, but stops crying after she hears the rustling of footsteps.',
  tldrDescription: 'The adventurer stumbles upon a young woman crying beneath a willow tree. What should he do?',
  options: ['Attack', 'Investigate', 'Befriend', 'Leave'],
  optionsFlavor: ['Something is off putting about this woman. What is she even doing in a place like this to begin with? We’re not feeling lucky, this is almost certainly a trap. Better get the jump on her.', 'Better not to rush in too quickly, it can’t hurt to take a quick look around.', 'She looks like she could use a friend.', 'No reason to stay, need to find that exit somewhere in this grass.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [1, 2, 3, 4],
};

allEmpressEvents.push(empress_Main);

// 1
const empress_sword = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to attack the maiden.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10],
  text: ['The woman gets up quickly at the sound of the adventurer’s weapon being unsheathed and reveals crooked, gnashing teeth. Clearly this creature is not a human woman but instead a siren. Before she can unleash her scream, the adventurer rushes forward and attacks.', 'There’s no reaction from the woman as the adventurer’s weapon leaves its holster, and she makes no move to defend herself as it comes swinging down, silencing her sobs permanently. Her body slumps and red blood - human blood - spills from it. A loud, deep bellow booms from somewhere in the clearing and is powerful enough to make the surrounding grass bend back in reaction to its might. The tree that was once the sanctuary of the adventurer’s victim begins to take a new, humanoid form. He barely registers that this new arrival is a druid (and is none too happy about his friend being executed) before it lunges for him with a bark covered hand.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Luck', 'Intelligence'],
    ['Health', 'Intelligence']
  ],  
  effectPower: [
    [2, 1],
    [-10, -1],
  ],
};

allEmpressEvents.push(empress_sword);

// 2
const empress_wand = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer investigates the maiden.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [4, 5],
  text: ['The adventurer squints his eyes and assesses the maiden. He concludes that she’s just a regular person.','The adventurer squints his eyes and assesses the maiden. He concludes that she’s not human, but infact a siren!.'],
  dice: 4,
  threshold: [2, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    [],
    []
  ],  
  effectPower: [
    [],
    [],
  ],
};

allEmpressEvents.push(empress_wand);

// 3
const empress_cup = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to befriend the woman.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [10, 10],
  text: ['The adventurer approaches the woman and begins to ask what is wrong, but is abruptly cut short by an incredible shriek. The adventurer collapses to his knees and clasps his ears, realizing too late that this woman is in fact a siren. When she finally finishes her cry, he brings himself to his feet again. He removes his hands from his ears and finds they are stained red with blood.', 'The adventurer approaches the woman and asks her what’s wrong. She begins to rant about her life in the walls, and how she is stuck alone in this room with only a tree to keep her company. Her tears flow like a stream down her face, and make her blue eyes glisten as she picks her head up to look at the adventurer. After some time, she concludes her story, and conjures a small vial. She allows a single tear to drop inside of it, and closes the top with a cork. “As a thank you...for your time,” she says handing it to the adventurer.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charimsa",
  outcomes: 2,
  effectStats: [
    ['Health', 'Charisma'],
    ['Charisma', 'Strength']
  ],  
  effectPower: [
    [-10, -1],
    [2, 1],
  ],
  constraint: true,
  constraintResult: [1, 0, 0]
};

allEmpressEvents.push(empress_cup);

// 4
const empress_Main_Maiden = {
  title: 'The Empress',
  name: 'empress',
  type: 'voting',
  flavorTextDescription: 'The adventurer knows the woman is just a maiden.',
  tldrDescription: 'The adventurer looks at the woman. What should he do?',
  options: ['Attack', 'Investigate', 'Befriend', 'Leave'],
  optionsFlavor: ['Attack her!', 'Investigate her.', 'Befriend her.', 'Leave the room.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 1, 0, 0],
  completedOptionsStart: [0, 1, 0, 0],
  connections: [6, 2, 7, 10],
};

allEmpressEvents.push(empress_Main_Maiden);

// 5
const empress_Main_Siren = {
  title: 'The Empress',
  name: 'empress',
  type: 'voting',
  flavorTextDescription: 'The adventurer knows the woman is a srien!',
  tldrDescription: 'The adventurer looks at the siren. What should he do?',
  options: ['Attack', 'Investigate', 'Befriend', 'Leave'],
  optionsFlavor: ['Attack her!', 'Investigate her.', 'Befriend her.', 'Leave the room.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 1, 0, 0],
  completedOptionsStart: [0, 1, 0, 0],
  connections: [8, 2, 9, 10],
};

allEmpressEvents.push(empress_Main_Siren);

// 6
const empress_Maiden_Sword = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to attack the maiden.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [10, 10, 10, 10],
  text: ['There’s no reaction from the woman as the adventurer’s weapon leaves its holster, and she makes no move to defend herself as it comes swinging down, silencing her sobs permanently. Her body slumps and red blood - human blood - spills from it. A loud, deep bellow booms from somewhere in the clearing and is powerful enough to make the surrounding grass bend back in reaction to its might. The tree that was once the sanctuary of the adventurer’s victim begins to take a new, humanoid form. He barely registers that this new arrival is a druid (and is none too happy about his friend being executed) before it lunges for him with a bark covered hand and makes contact. However, the adventurer bests the druid, and with no fight left in him, the druid reverts to a plant form, but not that of the weeping willow he assumed before. Instead, where his humanoid figure once stood is a tall stalk, and stunning violet flowers with protruding yellow centers adorn its top. The adventurer picks one delicately, storing it away with his other items.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Strength",
  outcomes: 1,
  effectStats: [
    ['Health', 'Intelligence', 'Charisma']
  ],  
  effectPower: [
    [-10, -1, 2],
  ],
};

allEmpressEvents.push(empress_Maiden_Sword);

// 7
const empress_Maiden_Cup = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to befriend the maiden.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [10, 10, 10, 10],
  text: ['The adventurer approaches the woman and asks her what’s wrong. She begins to rant about her life in the walls, and how she is stuck alone in this room with only a tree to keep her company. Her tears flow like a stream down her face, and make her blue eyes glisten as she picks her head up to look at the adventurer. After some time, she concludes her story, and conjures a small vial. She allows a single tear to drop inside of it, and closes the top with a cork. “As a thank you...for your time,” she says handing it to the adventurer.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Charisma",
  outcomes: 1,
  effectStats: [
    ['Charisma', 'Health']
  ],  
  effectPower: [
    [2, 15],
  ],
};

allEmpressEvents.push(empress_Maiden_Cup);

// 8
const empress_Siren_Sword = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to attack the siren.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [10, 10, 10, 10],
  text: ['The siren gets up quickly at the sound of the adventurer’s weapon being unsheathed and reveals crooked, gnashing teeth. Before she can unleash her scream, the adventurer rushes forward and attacks. The adventurer severs the head of the siren she immediately turns to ash. From the ashes of the siren, the adventurer pulls a necklace with a musical note hanging from it. The note head is a rich blue, made of sapphire. The adventurer brushes it off and places it around his own neck.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Strength",
  outcomes: 1,
  effectStats: [
    ['Strength', 'Intelligence', 'Charisma']
  ],  
  effectPower: [
    [1, 1, 2],
  ],
};

allEmpressEvents.push(empress_Siren_Sword);

// 9
const empress_Siren_Cup = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to befriend the siren.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [10, 10, 10, 10],
  text: ['The adventurer approaches the woman and begins to ask what is wrong, but is abruptly cut short by an incredible shriek. The adventurer collapses to his knees and clasps his ears, realizing too late that this woman is in fact a siren. When she finally finishes her cry, he brings himself to his feet again. He removes his hands from his ears and finds they are stained red with blood. The adventurer turns to run hoping to escape with his life.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Charisma",
  outcomes: 1,
  effectStats: [
    ['Health', 'Strength', 'Charisma']
  ],  
  effectPower: [
    [-5, -1, -2],
  ],
};

allEmpressEvents.push(empress_Siren_Cup);

// 10
const empress_Leave = {
  title: 'The Empress',
  name: 'empress',
  type: 'voting',
  flavorTextDescription: 'This should auto leave the room',
  tldrDescription: 'This should auto leave the room',
  options: ['Attack', 'Investigate', 'Befriend', 'Leave'],
  optionsFlavor: ['Something is off putting about this woman. What is she even doing in a place like this to begin with? We’re not feeling lucky, this is almost certainly a trap. Better get the jump on her.', 'Better not to rush in too quickly, it can’t hurt to take a quick look around.', 'She looks like she could use a friend.', 'No reason to stay, need to find that exit somewhere in this grass.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 1, 1, 1],
  completedOptionsStart: [1, 1, 1, 1],
  connections: [1, 2, 3, 4],
};

allEmpressEvents.push(empress_Leave);

// The Chariot /////////////////////////

// 0
const chariot_Main = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'voting',
  flavorTextDescription: 'Gold light emanates from the cracks of this door as the adventurer approaches it. He staggers back after opening it, shielding his eyes. Stacks on stacks of gold, priceless goblets, and other treasures scattered across the room gleam in the light of the torches lining the wall. The main centerpiece is an ornate sarcophagus resting on a raised slab of stone. Chiseled into the rock is a message written in an older tongue, but some of the words can still be made out - “Wa..., ...iseas…, conqu…, death, yet gr… may be ...wnfall of man.” Just past this are four silver pedestals, each one with a horse made of precious gems resting upon it. The fates speak out the adventurer, and beckon him to make a choice.',
  tldrDescription: 'In a room full of treasure, four crystalline horses draw the adventurer’s attention the most. Which horse should the adventurer take?',
  options: ['Ruby', 'Obsidian', 'Pearl', 'Diamond'],
  optionsFlavor: ['Take the ruby stallion, exuding power and a thirst for action.', 'Take the obsidian mare, which whispers of the rot it would inflict on your enemies, corrupting both their minds and bodies from the inside out.', 'Take the pearl equine, promising victory in battle and dominance over your adversaries.', 'Take the diamond skeleton horse, whose bones are full of smoke which clouds its true purpose.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [1, 2, 3, 4],
};

allChariotEvents.push(chariot_Main);

// 1
const chariot_Sword = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to take the ruby stallion.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 5, 0, 0],
  text: ['The ruby stallion dissolves into the adventurer’s hands, sending searing pain through his muscles. Once it ebbs, the adventurer can feel newfound strength across his body, enough to take on the entire world.', 'The room shakes violently and the remaining horses crumble to dust. As the adventurer stumbles to the ground, he catches a glimpse of the top of the sarcophagus sliding off and clanging to the ground. He pushes back with his arms and legs until he hits a wall, unable to flee from the figure rising from its grave. There is no running from The Mummy. The adventurer raises his weapon as the mummy rises from its sarcophagus. For something so ancient, the mummy is both fast and strong, and he quickly lands a blow on the adventurer. Fortunately, the adventurer catches himself before falling down and sends his sword through the mummy\'s torso. The mummy\'s body falls to the ground in a pile of dust with its garments laying on top. The adventurer wraps his wound with the mummy\'s cloth. He notices a golden, horse-shaped, medalion lying in the pile. It looks valuable, so he picks it up and leaves the room hoping to keep from disturbing this place anymore.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Strength'],
    ['Health','Strength', 'Gold']
  ],  
  effectPower: [
    [2],
    [-10, -1, 15],
  ],
  constraint: true,
  constraintResult: [0,1],
};

allChariotEvents.push(chariot_Sword);

// 2
const chariot_Wand = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to take the obsidian mare.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 5, 0, 0],
  text: ['The obsidian mare dissolves into the adventurer’s hands, filling the adventurer’s mind with flashes of magic lost to the ages. No being can stand in his way with this knowledge at his disposal.', 'The room shakes violently and the remaining horses crumble to dust. As the adventurer stumbles to the ground, he catches a glimpse of the top of the sarcophagus sliding off and clanging to the ground. He pushes back with his arms and legs until he hits a wall, unable to flee from the figure rising from its grave. There is no running from The Mummy. The adventurer raises his weapon as the mummy rises from its sarcophagus. For something so ancient, the mummy is both fast and strong, and he quickly lands a blow on the adventurer. Fortunately, the adventurer catches himself before falling down and sends his sword through the mummy\'s torso. The mummy\'s body falls to the ground in a pile of dust with its garments laying on top. The adventurer wraps his wound with the mummy\'s cloth. He notices a golden, horse-shaped, medalion lying in the pile. It looks valuable, so he picks it up and leaves the room hoping to keep from disturbing this place anymore.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Intelligence'],
    ['Health','Intelligence', 'Gold']
  ],  
  effectPower: [
    [2],
    [-10, -1, 15],
  ],
  constraint: true,
  constraintResult: [0,1],
};

allChariotEvents.push(chariot_Wand);

// 3
const chariot_Cup = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to take the pearl esquine.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 5, 0, 0],
  text: ['The pearl equine dissolves into the adventurer’s hand, filling the adventurer’s body with new vigor and energy. It feels like he could crush any enemy that stands in his way with sheer willpower alone.', 'The room shakes violently and the remaining horses crumble to dust. As the adventurer stumbles to the ground, he catches a glimpse of the top of the sarcophagus sliding off and clanging to the ground. He pushes back with his arms and legs until he hits a wall, unable to flee from the figure rising from its grave. There is no running from The Mummy. The adventurer raises his weapon as the mummy rises from its sarcophagus. For something so ancient, the mummy is both fast and strong, and he quickly lands a blow on the adventurer. Fortunately, the adventurer catches himself before falling down and sends his sword through the mummy\'s torso. The mummy\'s body falls to the ground in a pile of dust with its garments laying on top. The adventurer wraps his wound with the mummy\'s cloth. He notices a golden, horse-shaped, medalion lying in the pile. It looks valuable, so he picks it up and leaves the room hoping to keep from disturbing this place anymore.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Charisma'],
    ['Health','Charisma', 'Gold']
  ],  
  effectPower: [
    [2],
    [-10, -1, 15],
  ],
  constraint: true,
  constraintResult: [0,1],
};

allChariotEvents.push(chariot_Cup);

// 4
const chariot_Coin = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to take the diamond skeleton horse.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 5, 0, 0],
  text: ['The diamond skeleton horse dissolves into the adventurer’s hand, leaving behind nothing but smoke. The adventurer realizes he is aware of no other feeling than emptiness, his emotions fading away like the mist in his hands, leaving only a void.', 'The room shakes violently and the remaining horses crumble to dust. As the adventurer stumbles to the ground, he catches a glimpse of the top of the sarcophagus sliding off and clanging to the ground. He pushes back with his arms and legs until he hits a wall, unable to flee from the figure rising from its grave. There is no running from The Mummy. The adventurer raises his weapon as the mummy rises from its sarcophagus. For something so ancient, the mummy is both fast and strong, and he quickly lands a blow on the adventurer. Fortunately, the adventurer catches himself before falling down and sends his sword through the mummy\'s torso. The mummy\'s body falls to the ground in a pile of dust with its garments laying on top. The adventurer wraps his wound with the mummy\'s cloth. He notices a golden, horse-shaped, medalion lying in the pile. It looks valuable, so he picks it up and leaves the room hoping to keep from disturbing this place anymore.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Luck'],
    ['Health','Luck', 'Gold']
  ],  
  effectPower: [
    [2],
    [-10, -1, 15],
  ],
  constraint: true,
  constraintResult: [0,1],
};

allChariotEvents.push(chariot_Coin);


// 5
const chariot_Leave = {
  title: 'The Chariot',
  name: 'chariot',
  type: 'voting',
  flavorTextDescription: 'auto leave room',
  tldrDescription: 'auto leave room',
  options: ['Ruby', 'Obsidian', 'Pearl', 'Diamond'],
  optionsFlavor: ['Take the ruby stallion, exuding power and a thirst for action.', 'Take the obsidian mare, which whispers of the rot it would inflict on your enemies, corrupting both their minds and bodies from the inside out.', 'Take the pearl equine, promising victory in battle and dominance over your adversaries.', 'Take the diamond skeleton horse, whose bones are full of smoke which clouds its true purpose.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 1, 1, 1],
  completedOptionsStart: [1, 1, 1, 1],
  connections: [1, 2, 3, 4],
};

allChariotEvents.push(chariot_Leave);

// The Emperor ////////////////////////////

// 0
const emperor_Main = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'voting',
  flavorTextDescription: 'The echo of the door creaking reverberates in the seemingly empty room as it swings open into nothingness. The adventurer pauses for only a moment before taking a step into the darkness. If the room has a floor, he fails to find it and tumbles down a long rocky slope instead. By the time he reaches its end with a solid thud, he is thoroughly disoriented. It takes the adventurer a second to realize that while the impact was hard, his fall had thankfully been broken by something. After rising to his feet he conjures a small flame to survey his surroundings. Initially all he sees are the stone walls of a cave, with hanging stalactites occasionally releasing drops of water from their sharp points. He looks to the ground to see what saved him from a harsher landing. His relief fades instantly as a crowd of horrified faces come into view, staring either directly at him or at his now crushed target - a dwarven king, dressed in royal purple garbs and a crown adorned with gems likely mined from these same caves. Dwarven knights surround the scene and point their spears at the adventurer, ready to apprehend him for his crime.',
  tldrDescription: 'The adventurer accidentally assassinated a dwarven king in front of his people and is being threatened by his loyal knights. What should he do?',
  options: ['Attack', 'Investigate', 'Talk', 'Run'],
  optionsFlavor: ['You can take these knights easily. Let’s show them what for!', '', 'There’s obviously been a misunderstanding, we just need to talk this out.', 'You’ve got much longer legs than these guys and can definitely find your way out before they catch up.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 1, 0, 0],
  completedOptionsStart: [0, 1, 0, 0],
  connections: [1, 10, 2, 3],
};

allEmperorEvents.push(emperor_Main);

// 1
const emperor_Sword = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to fight.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10, 10, 10],
  text: ['The knights lie on the ground at the adventurer’s feet, defeated. He bends over and pries a spear from one of the dwarves and takes it for himself. The warrior can only give a mild grunt in protest as his weapon is stolen from his grip.'],
  dice: 3,
  threshold: [0],
  statNeeded: "Strength",
  outcomes: 1,
  effectStats: [
    ['Strength', 'Charisma'],
  ],  
  effectPower: [
    [2, 1],
  ],
};

allEmperorEvents.push(emperor_Sword);

// 2
const emperor_Cup = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer decides to talk his way out.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [4, 1, 10, 10],
  text: ['The adventurer slowly lowers himself to the ground on one knee, head down. The crowd of dwarves stares in awe as his apology to the people of the land he has intruded on echoes through the tunnel. The knights look at each other in confusion, bewilderment showing on their faces. One steps forward from their ranks. His sizeable beard shakes up and down as he speaks, “Assassins do not apologize for their transgressions. Clearly this man is no trained killer. We shall let him walk.” The knights lower their weapons, and create a gap in their circle for the adventurer to pass through. The soldier who spoke hands him a torch from the wall, telling him to follow its flame to find the way out.', 'The adventurer opens his mouth to speak but he swiftly finds the tip of a spear unsettlingly close to his jugular. They leave him no other choice but to do combat - he needs to press forward and he can’t allow these knights to stand in his way.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Charisma'],
    ['Health', 'Charisma'],
  ],  
  effectPower: [
    [2, 1],
    [-5, -1],
  ],
};

allEmperorEvents.push(emperor_Cup);

// 3
const emperor_Coin = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer attempts to run.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [5, 1, 10, 10],
  text: ['The adventurer chooses a direction and bolts into the darkness, leaving the shouting squadron of dwarves behind him. He follows his gut, making random right and left turns, but he can’t seem to shake the roar of footsteps closing in on his position. He needs to lose the soldiers fast. Finally the adventurer began to see light, but it comes from two diverging tunnels. The left route is shorter but blocked by a large spider-web. A little bit of fire could burn the web down but getting caught in it would spell disaster. The right route is less direct, since the exit is at the top of rock wall. It’s full of holes so the adventurer could likely climb it and leave the knights stuck at the bottom with their heavy armor.', 'The adventurer sees an opening in the group surrounding him and makes a break for it. He makes it a fair distance before he can no longer see, making navigating difficult. He is forced to slow down to find his way, but even that can’t save him from the terrain. He gets a familiar feeling as he extends a foot and fails to find the ground, tumbling into a hole with no way out. His only option now is to wait for his pursuers to rescue him, and then ambush them while they attempt to capture him again.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Luck'],
    ['Health', 'Luck'],
  ],  
  effectPower: [
    [1, 2],
    [-5, -1],
  ],
};

allEmperorEvents.push(emperor_Coin);

// 4
const emperor_Cup_Vote = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'voting',
  flavorTextDescription: 'The light leads the adventurer deeper into the cavern’s depths. Slowly but surely it grows weaker, until it becomes dangerously close to puttering out. The adventurer considers running to reach the end before the light goes out, but the air current he would create from doing that may blow out the torch like a candle. The alternative would be to attempt to stoke the fire to have it rise again, but that too could do more harm than good. A decision needs to be made fast or escaping this place will become much more difficult.',
  tldrDescription: 'The adventurer is running out of time and light. What should he do?',
  options: ['Attack', 'Stoke', 'Talk', 'Run'],
  optionsFlavor: ['', 'Stoking the flame will best increase our chances.', '', 'Make a run for it, we’re out of time!'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 0, 1, 0],
  completedOptionsStart: [1, 0, 1, 0],
  connections: [10, 8, 10, 9],
};

allEmperorEvents.push(emperor_Cup_Vote);

// 5
const emperor_Coin_Vote = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'voting',
  flavorTextDescription: '...',
  tldrDescription: 'The adventurer is at a crossroads. What should he do?',
  options: ['Right', 'Left', 'Talk', 'Run'],
  optionsFlavor: ['Go Right', 'Go Left', '', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [6, 7, 10, 10],
};

allEmperorEvents.push(emperor_Coin_Vote);

// 6
const emperor_Coin_Vote_Sword = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer takes the right path.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10, 10, 10],
  text: ['The adventurer wastes no time and darts for the rock wall. He grabs hold of whatever crevices he can as he scales the surface. The pursuing battalion doesn’t reach the wall until he’s already halfway to the top, beyond the range that they can fling their spears. The knights grumble and leave in defeat as the adventurer raises himself over the ledge. He sprawls out of the ground and catches his breath for only a moment, and then walks out into the light.', 'The adventurer makes it to the wall, musters what strength he has left, and begins climbing. Already panting and sweating from running down endless corridors, he finds gripping the stone more difficult than anticipated. “Not bad,” he tells himself as he continues to go higher. As if on cue, both his hand and foot fail to find a hold causing him to slip and fall to the ground below. Pain searing through his body, he forces himself to get up just seconds before the dwarves are on top of him.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Strength",
  outcomes: 2,
  effectStats: [
    ['Strength', 'Luck'],
    ['Health', 'Strength'],
  ],  
  effectPower: [
    [1, 1],
    [-10, -1],
  ],
};

allEmperorEvents.push(emperor_Coin_Vote_Sword);

// 7
const emperor_Coin_Vote_Wand = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer takes the left path.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10, 10, 10],
  text: ['A blaze ignites in the adventurer’s hand and he hurls it at the web. It burns as though it was made of paper and he leaps through the hole, dashing for the exit. He throws himself through the opening and into the light. The sound of the charging dwarves still steadily nears, though, so he hastily uses some basic earth magic to raise the ground and seal the exit to cover his escape. ', 'The adventurer makes for the the web at full speed, extending a hand to launch fire magic at it. But nothing happens and the web is coming ever closer. Too late to stop, he wills flames to appear from his palm again but what magic he has inside him fails to respond. The web catches the adventurer and ensnares him, tired and defeated. The pursuing dwarves catch up with him, and some even chuckle as they poke and stab him with their spears. However, they unwittingly loosen the hold the web has on the adventurer, releasing him and allowing him to grab for his weapon.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Luck'],
    ['Health', 'Intelligence'],
  ],  
  effectPower: [
    [1, 1],
    [-10, -1],
  ],
};

allEmperorEvents.push(emperor_Coin_Vote_Wand);

// 8
const emperor_Cup_Vote_Stoke = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer stokes the fire.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10, 10, 10],
  text: ['The adventurer softly blows on the flame, hoping to give it the extra oxygen it needs to last until his escape. It bends away from his breath and for a moment he becomes worried that he snuffed it out instead. Luckily, the flame becomes larger instead, if only a small amount. The adventurer continues calmly down the tunnels, hugging the wall for safety while he follows the tip of the fire. Just as it finally peeters out, the adventurer becomes blinded by the glow of light coming from the outside world.', 'The adventurer gives a big puff to the fire in an embarrassingly bad attempt to feed the fire, and promptly extinguishes it. Lost and alone, the adventure sticks out a hand to the wall. “Treat it like a big maze,” he tells himself in the darkness. “If you stick to a wall, eventually you’ll reach the exit.” And reach the exit his does, after what feels like several days, surviving only on what little rations he has on him.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Luck'],
    ['Health', 'Intelligence'],
  ],  
  effectPower: [
    [1, 1],
    [-10, -1],
  ],
};

allEmperorEvents.push(emperor_Cup_Vote_Stoke);

// 9
const emperor_Cup_Vote_Run = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to make a run for it.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [10, 10, 10, 10],
  text: ['The adventurer picks up the pace to a speed that’s not quite a dash but faster than a jog, all the while eyeing the flame to ensure it stays ablaze. He makes a right turn, a left, and then another left. The light from the fire disappears, but the adventurer grins as it is replaced by a new light coming from outside the cave.', 'The adventurer decides that time is of the essence, and breaks into a sprint. He almost immediately regrets it, however, as his haste causes the flame to go out. Lost and alone, the adventure sticks out a hand to the wall. “Treat it like a big maze,” he tells himself in the darkness. “If you stick to a wall, eventually you’ll reach the exit.” And reach the exit his does, after what feels like several days, surviving only on what little rations he has on him.'],
  dice: 3,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Luck'],
    ['Health'],
  ],  
  effectPower: [
    [1],
    [-5],
  ],
};

allEmperorEvents.push(emperor_Cup_Vote_Run);

// 10
const emperor_Leave = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'resolution',
  flavorTextDescription: 'The adventurer leaves.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [11, 11, 11, 11],
  text: ['You finally escape and leave this place for good.'],
  dice: 3,
  threshold: [0],
  statNeeded: "Luck",
  outcomes: 1,
  effectStats: [
    [],
    [],
  ],  
  effectPower: [
    [],
    [],
  ],
};

allEmperorEvents.push(emperor_Leave);

// 11
const emperor_Main_Leave = {
  title: 'The Emperor',
  name: 'emperor',
  type: 'voting',
  flavorTextDescription: 'This should auto leave',
  tldrDescription: 'This should auto leave',
  options: ['Right', 'Left', 'Talk', 'Run'],
  optionsFlavor: ['Go Right', 'Go Left', '', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 1, 1, 1],
  completedOptionsStart: [1, 1, 1, 1],
  connections: [10, 10, 10, 10],

};

allEmperorEvents.push(emperor_Main_Leave);

// The Hierophant ////////////////////////

// 0
const hierophant_Main = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'voting',
  flavorTextDescription: 'The adventurer pushes hard against two large doors that whine in resistance, but ultimately swing open into what appears to be a run down church. Pews are knocked over, and torn tapestries litter the floor or hang by a thread on the walls. Once colorful stained glass windows have gaping holes revealing a swirling blackness outside. Towards the front of the room sits a towering organ, the only item in pristine condition in the room. On a worn out piano bench sits a man in tattered religious clothes. His hands move over the keys as if to play them but they’re too high. Instead his fingers hauntingly twitch through the air. The doors slam behind the adventurer, startling him and alerting the dark priest to his presence. He rises and turns to look at the adventurer. If the puppet-like way he moved wasn’t sinister enough, the shadow covering his face is. It covers only half of his features, however, shrouding the right side with shade and replacing his blue eye with a large, red, demonic one.',
  tldrDescription: 'The adventurer comes across an abandoned and run-down cult gathering lead by a corrupt religious head. What should he do?',
  options: ['Attack', 'Play', 'Talk', 'Discover'],
  optionsFlavor: ['', 'The organ stands out amongst the eerie backdrop, as though yearning to be played.', 'Is the priest consumed by the darkness, or it he still partly human? Can we save him?', 'What secrets do the shadows hide?'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [1, 0, 0, 0],
  completedOptionsStart: [1, 0, 0, 0],
  connections: [1, 1, 2, 3],
};

allHierophantEvents.push(hierophant_Main);

// 1
const hierophant_Wand = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'voting',
  flavorTextDescription: 'The adventurer takes a seat on the rather creaky bench and stares at the keys in front of him. Time has taken its toll on them, leaving scratches and brown stains on what were likely once shiny white keys. He wonders what kind of music he should make with them.',
  tldrDescription: 'The adventurer decides to play the organ. What kind of music should he play?',
  options: ['Classical', 'Whimsical', 'Save', 'Discover'],
  optionsFlavor: ['Play something courtly and classical.', 'Play something whimsical and improvised.', '', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [4, 5, 2, 3],
};

allHierophantEvents.push(hierophant_Wand);

// 2
const hierophant_Cup = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'voting',
  flavorTextDescription: 'The priest parts his lips as if to speak but all that emanates from his mouth is a gurgle followed by a hellish shriek. He looks as though he is pain, though he may be lost to the demon altogether. What should we do?',
  tldrDescription: 'The adventurer decides to talk to the priest. Should he try to save him, or kill him?',
  options: ['Kill', 'Whimsical', 'Save', 'Discover'],
  optionsFlavor: ['Show him mercy and kill him.', '', 'Try to save him.', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 1, 0, 1],
  completedOptionsStart: [0, 1, 0, 1],
  connections: [6, 0, 7, 0],
};

allHierophantEvents.push(hierophant_Cup);

// 3
const hierophant_Coin = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'voting',
  flavorTextDescription: 'The adventurer moves to the window to peer outside. To his alarm, a pale hand with abnormally long fingernails extends from the darkness. It holds an offering bowl.',
  tldrDescription: 'The adventurer decides to discover the secrets of the shadows and finds an offering bowl. Should he place gold in it?',
  options: ['Yes', 'No', 'Save', 'Discover'],
  optionsFlavor: ['Put gold in the bowl.', 'Hold on to our gold, we can use it for better things later.', '', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],
  connections: [9, 10, 2, 3],
};

allHierophantEvents.push(hierophant_Coin);

// 4
const hierophant_Wand_Sword = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to play something...classical.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['The adventurer begins playing at a tempo that is not too fast but not too slow either. The notes ring out from the pipes and echo through the chamber. It’s a sweet sound, one that doesn’t belong in the dark ruins of a once divine place. For a moment it almost seems as though light returns to the room, revealing a place where people once came to give thanks for the lives they lived. The voices of patrons past can be heard chanting along to the song. The adventurer clings to this harmony, and commits it to memory as his piece concludes as soothing as it began.', 'The adventurer tries to recall a piece he learned during childhood, but he can only remember remnants. His fingers fumble on the keys and he eventually gives up in a huff of frustration, realizing that he quit playing all those years ago because he had no ear for music. What was the point of playing without an audience, anyways?'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Charisma'],
    ['Intelligence'],
  ],  
  effectPower: [
    [1, 2],
    [-1],
  ],
};

allHierophantEvents.push(hierophant_Wand_Sword);

// 5
const hierophant_Wand_Wand = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to play something...whimsical.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['The adventurer takes a deep breath as he takes a seat. He pauses for only a moment before his fingers begin to fly across the ivory and create brand new music. The adventurer follows his instincts to formulate a melody as he goes. The tempo is quick and full of life and vigor. He finishes with a flourish, bouncing his fingers off of the final notes and leaving them suspended in the air. The adventurer can hear a rustle in the rubble nearby, from which springs the pages of a musical score drawn to the adventurers music. Reading it reveals a song used both for praise and for protection in battle.', 'The adventurer tries to make a sound on the organ but nothing comes out, as if the organ is denying him. He presses more violently on the keys but they do not respond to him. “Looks like it was a piece of junk after all,” the adventurer says to himself, rising from the bench and beginning to walk away. Suddenly a piece of stone falls from the ceiling above onto the organ, sounding all its notes in one final taunt to the adventurer before it crumbles.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Intelligence",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Strength'],
    ['Intelligence'],
  ],  
  effectPower: [
    [1, 2],
    [-1],
  ],
};

allHierophantEvents.push(hierophant_Wand_Wand);

// 6
const hierophant_Cup_Sword = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to kill the priest.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['The priest falls, and with him the demon. The shadow dissipates from his now lifeless body and seeps into the cracks of the floor beneath him. Left behind is a blood colored orb, which the adventurer collects. He moves to leave, but hesitates. He returns to the body and lowers the eyelids, wishing the man well in the afterlife as he does so.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Strength",
  outcomes: 1,
  effectStats: [
    ['Strength', 'Charisma'],
  ],  
  effectPower: [
    [2, 1],
  ],
};

allHierophantEvents.push(hierophant_Cup_Sword);

// 7
const hierophant_Cup_Cup = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer tries to save the priest.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 8, 0, 0],
  text: ['The adventurer begins to chant, using an ancient spell to will the demon to return from where it came from. The priest writhes and a terrible, indescribable sound leaves his mouth. The shadow slowly peels itself from his face as if it was stuck there by adhesive. It drops to the ground, producing limbs from its shapeless body with which is scurries into a dark corner and disappears. The priest watches in a combination of horror and relief as the being that was once a part of him vanishes. “Thank you stranger, I have little to offer you as thanks but perhaps my holy skills may be of some use to you.”', 'The adventurer brings his hands together and begins to pray in hopes of banishing the shade. It reels before using the priest to pounce at the adventurer, delivering a powerful blow to his chest and knocking him over. His head comes crashing down on a piece of rubble. The possessed preacher raises his arms for another critical blow but the adventurer barely rolls away. He notices a slight wobble as he stands as well as a warm sensation on the back of his head. The priest, now crawling on the ground on all fours in a way reminiscent of a spider, prepares for another strike.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Charisma', 'Health'],
    ['Charisma', 'Health'],
  ],  
  effectPower: [
    [1, 10],
    [-1, -10],
  ],
  constraint: true,
  constraintResult: [0, 1],
};

allHierophantEvents.push(hierophant_Cup_Cup);

// 8
const hierophant_Cup_Cup_Kill = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer must fight the priest.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['The priest unceremoniously crumples to the ground, but quickly disappears as if he were made of smoke. The only indication that there was ever a person there are the clerical garments he left behind. They’re conveniently adventurer sized.', 'The priest unceremoniously crumples to the ground, but quickly disappears as if he were made of smoke. The only indication that there was ever a person there are the clerical garments he left behind. They’re conveniently adventurer sized.'],
  dice: 4,
  threshold: [2, 0],
  statNeeded: "Charisma",
  outcomes: 2,
  effectStats: [
    ['Luck'],
    ['Luck'],
  ],  
  effectPower: [
    [1],
    [1],
  ],
};

allHierophantEvents.push(hierophant_Cup_Cup_Kill);

// 9
const hierophant_Coin_Sword = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer puts gold in the bowl.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['The hand retracts into the darkness, but soon reappears with a single finger reaching out towards the adventurer. It strains for his forehead but makes contact, and the adventurer feels a pulse of energy shoot throughout his entire body. The hand disappears, though not without an inconspicuous but somewhat friendly wave first.', 'The hand shuffles the bowl around a little bit as if checking to see how much it weighs. It withdraws into the same patch of shadow it emerged from. The adventurer stands at the window waiting for some kind of reward, but there are no signs of anything happening in the void beyond. Looks like the fiend stole his money!'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Health', 'Strength', 'Gold'],
    ['Luck', 'Gold'],
  ],  
  effectPower: [
    [5, 1, -5],
    [-1, -5],
  ],
};

allHierophantEvents.push(hierophant_Coin_Sword);

// 10
const hierophant_Coin_Wand = {
  title: 'The Hierophant',
  name: 'hierophant',
  type: 'resolution',
  flavorTextDescription: 'The adventurer does not put any gold in the bowl.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 0, 0, 0],
  text: ['As the adventurer begins to walk away holding onto his gold, the nails curl inward and a faint scream can be heard as the hand returns to the darkness. Hopefully that did not upset anyone.'],
  dice: 4,
  threshold: [0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    [],
  ],  
  effectPower: [
    [],
  ],
};

allHierophantEvents.push(hierophant_Coin_Wand);

// The Lovers ////////////////////////

// 0
const lovers_Main = {
  title: 'The Lovers',
  name: 'lovers',
  type: 'voting',
  flavorTextDescription: 'The smell of this room reached the adventurer’s nose before he even entered it. Compared to other rooms of the dungeon, this one is somewhat smaller. He can already see the other side, a pool of water tinted blue-green like the ocean. However, the space between the adventurer and the pool is littered with mirrors of all shapes and sizes. Some are cracked and even missing pieces with rusty frames, while others are in pristine condition, as if they belonged in a palace. Alone the mirrors aren’t terrifying, at least not until the adventurer catches sight of their prey. Every other mirror has a person standing in front of it, expressions blank. Those that don’t have a live person in front of them have the corpses of one, flesh rotting and falling off the bone as if melting from staring into the depths of the glass for too long. The adventurer reaches the other side of the room by keeping his head down to avoid a similar fate. The exit is easy to find, visible just beneath the surface of the water. All he’d have to do was swim and - he freezes mid-thought. A familiar face stares back at him and they lock eyes. Too late he realizes that he’s been doomed by his own reflection, stuck in place like those he had seen peering into the mirrors.',
  tldrDescription: 'The adventurer is stuck staring at his own reflection thanks to this room’s magic and has to find a way to escape its hold over him. What should he do?',
  options: ['Move', 'Concentrate', 'Talk', 'Discover'],
  optionsFlavor: ['We just need to force our arms to move and our legs to step forward!', 'This trap is just a mind game. If we concentrate hard enough, we can escape it.', 'Maybe there really is a version of us on the other side of the reflection. If that’s the case, we should be able to talk to it.', ''],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [1, 2, 3, 4],
};

allLoversEvents.push(lovers_Main);


// Push all main events to all Events list

allEvents.push(allMagicianEvents);
allEvents.push(allHighPreistessEvents);
allEvents.push(allEmpressEvents);
allEvents.push(allChariotEvents);
allEvents.push(allEmperorEvents);
allEvents.push(allHierophantEvents);

const timeToVote = 8;
const timeToWait = 8;

let voteTimer = timeToVote;

setInterval(() => {
  if(gameStarted && gameOver == false){
    
    io.sockets.emit('vote timer', {
        voteTimer: voteTimer,
      });
    
    if(voteTimer <= 0){
      // Calculate votes
      let allVotes = [];

      for(var i = 0; i < swordVotes.length; i++){
        allVotes.push(swordVotes[i]);
      }
      for(var i = 0; i < wandVotes.length; i++){
        allVotes.push(wandVotes[i]);
      }
      for(var i = 0; i < cupVotes.length; i++){
        allVotes.push(cupVotes[i]);
      }
      for(var i = 0; i < coinVotes.length; i++){
        allVotes.push(coinVotes[i]);
      }
      
      


      let randomNum = Math.floor(Math.random() * allVotes.length);
      

      if(allVotes[randomNum]){
        finalVote = allVotes[randomNum]
      }
      else if(!allVotes[randomNum] && currentEvent.type == "voting"){
        
        let available = false;
        while(!available){
          randomNum = Math.floor(Math.random() * 4);
          if(currentEvent.completedOptions[randomNum] == 0){
            available = true;
          }
        }
        
        switch (randomNum){
          case 0:
            finalVote = "Sword";
            break;
          case 1:
            finalVote = "Wand";
            break;
          case 2:
            finalVote = "Cup";
            break;
          case 3:
            finalVote = "Coin";
            break;
          default:
            break;
        }
        
      }
      

      let finalVoteNum = 0;
      
      switch (finalVote){
        case "Sword":
          break;
        case "Wand":
          finalVoteNum = 1;
          break;
        case "Cup":
          finalVoteNum = 2;
          break;
        case "Coin":
          finalVoteNum = 3;
          break;
        default:
          break;
      }
      //console.log(allVotes[randomNum]);

      
      currentEvent.completedOptions[finalVoteNum] = 1;


      previousEvent = currentEvent;
      
      
      if(currentEvent.connections[0] == 0 && eventConstraint == false && currentEvent.constraint == false){
        
        currentEvent = allEvents[currentMainEvent][currentEvent.connections[0]];
      }
      else if(eventConstraint == true && currentEvent.connections[0] == 0){
        currentEvent = allEvents[currentMainEvent][currentEvent.connections[1]];
      }
      else if(currentEvent.constraint == true){
        eventConstraint = true;
      }
      else{
        
        currentEvent = allEvents[currentMainEvent][currentEvent.connections[finalVoteNum]];
      }
      
      let completionCheck = true;
      for(var i = 0; i < currentEvent.completedOptions.length; i++){
        if(currentEvent.completedOptions[i] == 0){
          completionCheck = false;
        }
      }


      if(completionCheck == false){
        
        let rng = 0;
        if(currentEvent.type == "resolution"){
          let die = currentEvent.dice;
          let stat;

          switch (currentEvent.statNeeded){
            case "Health":
              stat = fool.health;
              break;
            case "Strength":
              stat = fool.strength;
              break;
            case "Intelligence":
              stat = fool.intelligence;
              break;
            case "Charisma":
              stat = fool.charisma;
              break;
            case "Luck":
              stat = fool.luck;
              break;
            case "Gold":
              stat = fool.gold;
              break;
            default:
              break;
          }

          let roll = Math.floor(Math.random() * die) + stat;
          let looping = true;
          let result = 0;
          for(let i = 0; i < currentEvent.threshold.length; i++){
            if(looping && roll > currentEvent.threshold[i]){
              looping = false;
              result = i;
            }
          }

          rng = result;

          if(currentEvent.effectStats[rng]){
            for(let i = 0; i < currentEvent.effectStats[rng].length; i++){
              switch(currentEvent.effectStats[rng][i]){
                case "Health":
                  if(fool.health + currentEvent.effectPower[rng][i] > foolMax.health){
                      fool.health = foolMax.health;
                  }
                  else if(fool.health + currentEvent.effectPower[rng][i] <= 0){
                    fool.health = 0;
                    
                  }
                  else{
                    fool.health += currentEvent.effectPower[rng][i];
                    
                  }
                  break;
                case "Strength":

                  if(fool.strength + currentEvent.effectPower[rng][i] > foolMax.strength){
                      fool.strength = foolMax.strength;
                  }
                  else if(fool.strength + currentEvent.effectPower[rng][i] <= 1){
                    fool.strength = 1;
                  }
                  else{
                    
                    fool.strength += currentEvent.effectPower[rng][i];
                  } 
                  break;
                case "Intelligence":

                  if(fool.intelligence + currentEvent.effectPower[rng][i] > foolMax.intelligence){
                      fool.intelligence = foolMax.intelligence;
                  }
                  else if(fool.intelligence + currentEvent.effectPower[rng][i] <= 1){
                    fool.intelligence = 1;
                  }
                  else{
                    
                    fool.intelligence += currentEvent.effectPower[rng][i];
                  }
                  break;
                case "Charisma":

                  if(fool.charisma + currentEvent.effectPower[rng][i] > foolMax.charisma){
                      fool.charisma = foolMax.charisma;
                  }
                  else if(fool.charisma + currentEvent.effectPower[rng][i] <= 1){
                    fool.charisma = 1;
                  }
                  else{
                    
                    fool.charisma += currentEvent.effectPower[rng][i];
                  }
                  break;
                case "Luck":

                  if(fool.luck + currentEvent.effectPower[rng][i] > foolMax.luck){
                      fool.luck = foolMax.luck;
                  }
                  else if(fool.luck + currentEvent.effectPower[rng][i] <= 1){
                    fool.luck = 1;
                  }
                  else{
                    
                    fool.luck += currentEvent.effectPower[rng][i];
                  }
                  break;
                case "Gold":

                  if(fool.gold + currentEvent.effectPower[rng] [i]> foolMax.gold){
                      fool.gold = foolMax.gold;
                  }
                  else if(fool.gold + currentEvent.effectPower[rng][i] <= 0){
                    fool.gold = 0;
                  }
                  else{
                    
                    fool.gold += currentEvent.effectPower[rng][i];
                  }
                  break;
                default:
                  break;
              }   
            }
            
            console.dir(fool.health);
             if(fool.health <= 0){
              gameOver = true;
              gameStarted = false;
              voteTimer = timeToVote;
              io.emit('game over', {
                fool,
              }); 
          }
          
          }
          
         
          

          if(eventConstraint && currentEvent.constraint == true){

            if(currentEvent.constraintResult[rng] == 1){
              currentEvent = allEvents[currentMainEvent][currentEvent.connections[1]];
              
              for(var i = 0; i < currentEvent.completedOptions.length; i++){
                
                if(allEvents[currentMainEvent][0].completedOptions[i] == 1){
                  currentEvent.completedOptions[i] = 1;
                }
                console.dir(currentEvent.completedOptions[i]);
              } 
            }
            else {
              eventConstraint = false;
              currentEvent = allEvents[currentMainEvent][currentEvent.connections[0]];
            }
            

          }
          
          completionCheck = true;
          for(var i = 0; i < currentEvent.completedOptions.length; i++){
            if(currentEvent.completedOptions[i] == 0){
              completionCheck = false;
            }
          }

        }
        
        if(completionCheck == false){
          io.sockets.emit('load event', {
            currentEvent,
            finalVoteNum,
            rng,
            fool,
            foolMax,
            finalVote,
          });

          swordVotes = [];
          wandVotes = [];
          cupVotes = [];
          coinVotes = [];
          numUsersVoted = 0;


          if(previousEvent.type == "voting"){
            io.emit('resetVotes', {
              finalVote: finalVote,
              usernames,
            });
          }

          finalVote = "";

          if(currentEvent.type == "voting"){
            voteTimer = timeToVote;
          }
          else{
            voteTimer = timeToWait;
          }
        }
        else{
          completedMainEvents[currentMainEvent] = 1;
          
          completionCheck = true;
          for(let i = 0; i < completedMainEvents.length; i++){
            if(completedMainEvents[i] == 0){
              completionCheck = false;
            }
          }
          
          if(completionCheck == false){
            
            let completed = false;
            while(completed == false){
              let random = Math.floor(Math.random() * allEvents.length);
            
              if(completedMainEvents[random] == 0){
                currentMainEvent = random;
                currentEvent = allEvents[random][0];
                completed = true;
                eventConstraint = false;
              }
              
            }
            
            io.sockets.emit('load event', {
              currentEvent,
              finalVoteNum,
              rng,
              fool,
              foolMax,
              finalVote,
            });

            swordVotes = [];
            wandVotes = [];
            cupVotes = [];
            coinVotes = [];
            numUsersVoted = 0;


            if(previousEvent.type == "voting"){
              io.emit('resetVotes', {
                finalVote: finalVote,
                usernames,
              });
            }

            finalVote = "";

            if(currentEvent.type == "voting"){
              voteTimer = timeToVote;
            }
            else{
              voteTimer = timeToWait;
            }
            
          }
          else{
            gameOver = true;
            gameStarted = false;
            voteTimer = timeToVote;
            io.emit('game over', {
              fool,
            }); 
          }
          
          
        }
        
        
        
      }
      else{
        completedMainEvents[currentMainEvent] = 1;
          
          completionCheck = true;
          for(let i = 0; i < completedMainEvents.length; i++){
            if(completedMainEvents[i] == 0){
              completionCheck = false;
            }
          }
          
          if(completionCheck == false){
            
            let completed = false;
            while(completed == false){
              let random = Math.floor(Math.random() * allEvents.length);
            
              if(completedMainEvents[random] == 0){
                currentMainEvent = random;
                currentEvent = allEvents[random][0];
                completed = true;
                eventConstraint = false;
                
              io.sockets.emit('load event', {
                currentEvent,
                finalVoteNum,
           
                fool,
                foolMax,
                finalVote,
              });

              swordVotes = [];
              wandVotes = [];
              cupVotes = [];
              coinVotes = [];
              numUsersVoted = 0;


              if(previousEvent.type == "voting"){
                io.emit('resetVotes', {
                  finalVote: finalVote,
                  usernames,
                });
              }

              finalVote = "";

              if(currentEvent.type == "voting"){
                voteTimer = timeToVote;
              }
              else{
                voteTimer = timeToWait;
              }
              }
              
            }
            
          }
          else{
            gameOver = true;
            gameStarted = false;
            voteTimer = timeToVote;
            io.emit('game over', {
              fool,
            }); 
          }
      }
      
    }
    
    voteTimer -= 1;
  }
}, 1000);

// When the server and client are connected this runs
io.on('connection', (socket) => {
  let addedUser = false;


  if (gameStarted) {
    io.sockets.emit('load event', {
      currentEvent,
      topVote,
      rng: 0,
      fool,
      foolMax,
      finalVote,
    });
  }

  socket.on('start game', () => {
    if (gameStarted == false) {
      io.sockets.emit('vote timer', {
        voteTimer: voteTimer,
      });
      /*
      let randomEvent = 0;

      randomEvent = Math.floor(Math.random() * numOfEvents.length);

      currentEvent = allEvents[randomEvent];

      console.dir(currentEvent);

      usedNums.push(randomEvent);

      currentEvent = allEvents[randomEvent];

      io.sockets.emit('load event', {
        currentEvent: currentEvent,
        fool: fool,
      });

      gameStarted = true;
     */
      
      for (let i = 0; i < allEvents.length; i++) {
        
        for(let j = 0; j < allEvents[i].length; j++){
          for(let k = 0; k < 4; k++){
            allEvents[i][j].completedOptions[k] = allEvents[i][j].completedOptionsStart[k];
          } 
        }
      }
      
      
      currentMainEvent = Math.floor(Math.random() * allEvents.length);
      currentEvent = allEvents[currentMainEvent][0];
      
      for(let i = 0; i < allEvents.length; i++){
        completedMainEvents[i] = 0;
        
      }
      
   
      gameOver = false;
      
      fool.health = foolBase.health;
      fool.strength = foolBase.strength;
      fool.intelligence = foolBase.intelligence;
      fool.charisma = foolBase.charisma;
      fool.luck = foolBase.luck;
      fool.gold = foolBase.gold;
      
      eventConstraint = false;

      io.sockets.emit('load event', {
        currentEvent,
        topVote,
        rng: 0,
        fool,
        foolMax,
      });
      
      

      gameStarted = true;
    }
  });

  // Handle Messages
  // When the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // Call new message on client side
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      votes: 1,
    });
  });


  // Call add user on client side
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    
    if(!usernames[username]){
      usernames.push(username);
    }
    addedUser = true;
    socket.emit('login', {
      numUsers,
      numUsersVoted,
      usernames,
      username
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers,
      numUsersVoted,
      usernames,
    });

    io.emit('voting', {
      votes: votesArray,
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username,
    });
  });

  // Call voting on client side
  // Adds user's vote with weight to the vote array
  socket.on('voting', (letter, weight) => {
    votesArray[letter] += weight;


    io.emit('voting', {
      votes: votesArray,
    });
  });
  
  socket.on('playerVote', (vote, weight, previousVote, playerVoted, username) => {
    
    if(playerVoted == false){
      numUsersVoted += 1;
    }
    
    switch(vote){
      case "Sword":
        for(var i = 0; i < weight; i++){
          swordVotes.push("Sword");
        }
        break;
      case "Wand":
        for(var i = 0; i < weight; i++){
          wandVotes.push("Wand");
        }
        break;
      case "Cup":
        for(var i = 0; i < weight; i++){
          cupVotes.push("Cup");
        }
        break;
      case "Coin":
        for(var i = 0; i < weight; i++){
          coinVotes.push("Coin");
        }
        break;
      default:
        break;
    }
    
    switch(previousVote){
      case "Sword":
        for(var i = 0; i < weight; i++){
          swordVotes.pop();
        }
        break;
      case "Wand":
        for(var i = 0; i < weight; i++){
          wandVotes.pop();
        }
        break;
      case "Cup":
        for(var i = 0; i < weight; i++){
          cupVotes.pop();
        }
        break;
      case "Coin":
        for(var i = 0; i < weight; i++){
          coinVotes.pop();
        }
        break;
      default:
        break;
    }

    io.emit('updatePlayerVotes', {
      numUsersVoted: numUsersVoted,
      numUsers: numUsers,
      vote: vote,
      weight: weight,
      usernames: usernames,
      username: username,
      swordVotes,
      wandVotes,
      cupVotes,
      coinVotes,
    });
    
  });
  
  socket.on('submitVotes', (data) => {
    let allVotes = [];
    
    for(var i = 0; i < swordVotes.length; i++){
      allVotes.push(swordVotes[i]);
    }
    for(var i = 0; i < wandVotes.length; i++){
      allVotes.push(wandVotes[i]);
    }
    for(var i = 0; i < cupVotes.length; i++){
      allVotes.push(cupVotes[i]);
    }
    for(var i = 0; i < coinVotes.length; i++){
      allVotes.push(coinVotes[i]);
    }
    
    //console.log(allVotes);
    let randomNum = Math.floor(Math.random() * allVotes.length);
    
    finalVote = allVotes[randomNum]
    //console.log(allVotes[randomNum]);
    
    io.emit('updateFinalVote', {
      finalVote: finalVote,
      allVotes,
    });
  });

  
  socket.on('resetVotes', () => {
    
    swordVotes = [];
    wandVotes = [];
    cupVotes = [];
    coinVotes = [];
    numUsersVoted = 0;
    
    io.emit('resetVotes', {
      finalVote: finalVote,
      usernames,
    });
    
    finalVote = "";
    
  });
  
  // Reset votes on client and server
  /*
  socket.on('resetVotes', () => {
    for (let i = 0; i < votesArray.length; i++) {
      votesArray[i] = 0;
    }

    io.emit('resetVoting', {
      votes: votesArray,
    });
  });
  */

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      
      if(numUsers == numUsersVoted){
        --numUsersVoted;
      }
      --numUsers;
      
      let index = usernames.indexOf(socket.username);
      
      usernames.splice(index, 1);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers,
        numUsersVoted,
        usernames,
      });
    }
  });
});
