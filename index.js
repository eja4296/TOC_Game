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

const allMagicianEvents2 = {
  events: [],
  constraint: [
    {
      name: "isAlive",
      isTrue: true,
    }
  ],
}

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

const magician_wand_sword = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You attempt to open the book with your Sword.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
  text: ['The adventurer forces the book open and feels his muscles surge with power as he reads its contents.', 'The adventurer tries his damndest to open the book but it takes all of his might to just hold it. He uses his last ounce of strength to reshelve it, and decides to move on.', 'The adventurer tugs the book from its place but can’t muster the power to keep it in his hands. It ungracefully tumbles from the rack and lands on the adventurer’s feet.'],
  dice: 4,
  threshold: [8, 4, 0],
  statNeeded: "Strength",
  outcomes: 3,
  effectStats: [
    ['Strength', 'Intelligence'],
    [],
    ['Health', 'Strength']
  ],  
  effectPower: [
    [2, 1],
    [],
    [-3, -1],
  ],


};
allMagicianEvents.push(magician_wand_sword);
const magician_wand_wand = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You attempt to open the book with your Wand.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],

  text: ['The magic book slams open and attempts to assault the adventurer with dark magic, but he uses his own power to bend the book to his will, letting him access its harbored secrets without resistance.', 'The adventurer clasps the levitating book in his hands, but the book refuses to open, and the whispers emanating from it have gone silent. It seems the adventurer is not quite worthy of its secrets just yet.', 'The adventurer extends a hand to the floating book and the room fills with a high pitched scream coming from the book itself, replacing the almost ambient whispers that it conjured previously. It dissolves into ash, but not before thoroughly leaving the adventurer’s head rattled and ears ringing.'],
  dice: 4,
  threshold: [8, 4, 0],
  statNeeded: "Intelligence",
  outcomes: 3,
  effectStats: [
    ['Intelligence'],
    [],
    ['Health', 'Intelligence']
  ],  
  effectPower: [
    [2],
    [],
    [-3, -1],
  ],


};
allMagicianEvents.push(magician_wand_wand);
const magician_wand_cup = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You attempt to open the book with your Cup.',
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
const magician_wand_leave = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'Nothing gained, nothing lost.',
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

const magician_cup_yes = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You inquire the witch.',
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

const magician_cup_no = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You ignore the witch.',
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

const magician_sword_sword = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You hack the witch with your sword.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],

  text: ['As the witch crumples in defeat, she drops her staff to the ground. No point in wasting a perfectly good weapon - the adventurer picks it up and claims it for himself, while the witch lies in pain.', 'The witch, though old, moves quicker than the adventurer. As the adventurer swings his sword at the witch, she counters with her staff and deals blow to his gut, knockiing the wind out of him. The witch refrains from dealing further damage, as she knows he is no match for her.'],
  dice: 4,
  threshold: [2, 0],
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

const magician_sword_wand = {
  title: 'The Magician',
  name: 'magician',
  type: 'resolution',
  flavorTextDescription: 'You cast a spell on the witch.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [0, 13],
 
  text: ['As the witch crumples in defeat, she drops her staff to the ground. No point in wasting a perfectly good weapon - the adventurer picks it up and claims it for himself, while the witch lies in pain.', 'The witch, though old, moves quicker than the adventurer. As the adventurer casts his spell at the witch, she effortlessly counters with a spell of her own knocking the adveturer off his feet. The witch refrains from dealing further damage, as she knows he is no match for her.'],
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

  connections: [1, 2, 3, 4],

};

allMagicianEvents.push(magician_Main_Alt);

allEvents.push(allMagicianEvents);

// HIGH PREISTESS EVENTS

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

const highPreistess_sword = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to go fishing in the fountain.',
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

const highPriestess_wand = {
  title: 'The High Preistess',
  name: 'highPriestess',
  type: 'voting',
  flavorTextDescription: 'Tucked away between the wings of the statue, where the small of her back would be if she was indeed a real angel, was a teardrop shaped crystal. Taking it would likely stop the flow of water in the room but it’s loose enough to do so. Take it?',
  tldrDescription: 'There is a crystal on the statue. Should we take it?',
  options: ['Yes', 'No'],
  optionsFlavor: ['Take the crystal. It could prove to be valuable.', 'Leave the crystal. We would not want to disturb such a divine place.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 1, 1],
  completedOptionsStart: [0, 0, 1, 1],

  connections: [5, 6],
};

allHighPreistessEvents.push(highPriestess_wand);

const highPreistess_cup = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to pray at the altar.',
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

const highPreistess_coin = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to toss a coin in the fountain.',
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



const highPreistess_wand_yes = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to try and take the crystal.',
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

const highPreistess_wand_no = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide not to try and take the crystal.',
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

const highPreistess_sword_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to go fishing.',
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

const highPreistess_cup_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to pray at the altar.',
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

const highPreistess_coin_alt = {
  title: 'The High Priestess',
  name: 'highPriestess',
  type: 'resolution',
  flavorTextDescription: 'You decide to toss a coin in the fountain.',
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

allEvents.push(allHighPreistessEvents);



// EMPRESS EVENTS

const empress_Main = {
  title: 'The Empress',
  name: 'empress',
  type: 'voting',
  flavorTextDescription: 'The adventurer is greeted by a sea of green after entering this room - grass twice as tall as the average person. He presses forward until a muffled and out of place sound catches his ear. Having no clear path to the exit, he decides to investigate the noise. It leads him to an open clearing with normal, average-sized grass. Across the field stands a willow tree with twisted and contorted branches, forking in various directions. At its base sits the source of the noise, a young woman wrapped in peasant’s clothing. Her knees are bent to her chest and she rests her face on them, obscured by her lengthy amber hair. The adventurer realizes upon seeing her that the suppressed noises he heard before were actually sobs. The maiden doesn’t acknowledge the adventurer’s presence, but stops crying after she hears the rustling of footsteps.',
  tldrDescription: 'The adventurer stumbles upon a young woman crying beneath a willow tree. What should he do?',
  options: ['Attack', 'Investigate', 'Befriend', 'Leave'],
  optionsFlavor: ['Something is off putting about this woman. What is she even doing in a place like this to begin with? We’re not feeling lucky, this is almost certainly a trap. Better get the jump on her.', 'Better not to rush in too quickly, it can’t hurt to take a quick look around.', 'She looks like she could use a friend.', 'No reason to stay, need to find that exit somewhere in this grass.'],
  voteOption: ['Sword', 'Wand', 'Cup', 'Coin'],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],

  connections: [1, 2, 3, 4],
  
};

allEmpressEvents.push(empress_Main);


const empress_sword = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'You attack the woman.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 0],
  completedOptionsStart: [0, 0, 0, 0],
  connections: [5, 6],
  text: ['The woman gets up quickly at the sound of the adventurer’s weapon being unsheathed and reveals crooked, gnashing teeth. Clearly this creature is not a human woman but instead a siren. Before she can unleash her scream, the adventurer rushes forward and attacks.', 'There’s no reaction from the woman as the adventurer’s weapon leaves its holster, and she makes no move to defend herself as it comes swinging down, silencing her sobs permanently. Her body slumps and red blood - human blood - spills from it. A loud, deep bellow booms from somewhere in the clearing and is powerful enough to make the surrounding grass bend back in reaction to its might. The tree that was once the sanctuary of the adventurer’s victim begins to take a new, humanoid form. He barely registers that this new arrival is a druid (and is none too happy about his friend being executed) before it lunges for him with a bark covered hand.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Strength'],
    ['Intelligence', 'Strength']
  ],  
  effectPower: [
    [2, 2],
    [-1, -1],
  ],
};

allEmpressEvents.push(empress_sword);


const empress_wand = {
  title: 'The Empress',
  name: 'empress',
  type: 'resolution',
  flavorTextDescription: 'You investigate the woman.',
  tldrDescription: '',
  options: [],
  completedOptions: [0, 0, 0, 1],
  completedOptionsStart: [0, 0, 0, 1],
  connections: [0],
  text: ['The woman gets up quickly at the sound of the adventurer’s weapon being unsheathed and reveals crooked, gnashing teeth. Clearly this creature is not a human woman but instead a siren. Before she can unleash her scream, the adventurer rushes forward and attacks.', 'There’s no reaction from the woman as the adventurer’s weapon leaves its holster, and she makes no move to defend herself as it comes swinging down, silencing her sobs permanently. Her body slumps and red blood - human blood - spills from it. A loud, deep bellow booms from somewhere in the clearing and is powerful enough to make the surrounding grass bend back in reaction to its might. The tree that was once the sanctuary of the adventurer’s victim begins to take a new, humanoid form. He barely registers that this new arrival is a druid (and is none too happy about his friend being executed) before it lunges for him with a bark covered hand.'],
  dice: 4,
  threshold: [7, 0],
  statNeeded: "Luck",
  outcomes: 2,
  effectStats: [
    ['Intelligence', 'Strength'],
    ['Intelligence', 'Strength']
  ],  
  effectPower: [
    [2, 2],
    [-1, -1],
  ],


};

allEmpressEvents.push(empress_wand);

allEvents.push(allEmpressEvents);


const timeToVote = 5;
const timeToWait = 5;

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
                  if(fool.health + currentEvent.effectPower[rng][i] < foolMax.health){
                      fool.health += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.health + currentEvent.effectPower[rng][i] <= 0){
                    fool.health = 0;
                  }
                  else{
                    fool.health = foolMax.health;
                  }
                  break;
                case "Strength":

                  if(fool.strength + currentEvent.effectPower[rng][i] < foolMax.strength){
                      fool.strength += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.strength + currentEvent.effectPower[rng][i] <= 1){
                    fool.strength = 1;
                  }
                  else{
                    fool.strength = foolMax.strength;
                  } 
                  break;
                case "Intelligence":

                  if(fool.intelligence + currentEvent.effectPower[rng][i] < foolMax.intelligence){
                      fool.intelligence += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.intelligence + currentEvent.effectPower[rng][i] <= 1){
                    fool.intelligence = 1;
                  }
                  else{
                    fool.intelligence = foolMax.intelligence;
                  }
                  break;
                case "Charisma":

                  if(fool.charisma + currentEvent.effectPower[rng][i] < foolMax.charisma){
                      fool.charisma += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.charisma + currentEvent.effectPower[rng][i] <= 1){
                    fool.charisma = 1;
                  }
                  else{
                    fool.charisma = foolMax.charisma;
                  }
                  break;
                case "Luck":

                  if(fool.luck + currentEvent.effectPower[rng][i] < foolMax.luck){
                      fool.luck += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.luck + currentEvent.effectPower[rng][i] <= 1){
                    fool.luck = 1;
                  }
                  else{
                    fool.luck = foolMax.luck;
                  }
                  break;
                case "Gold":

                  if(fool.gold + currentEvent.effectPower[rng] [i]< foolMax.gold){
                      fool.gold += currentEvent.effectPower[rng][i];
                  }
                  else if(fool.gold + currentEvent.effectPower[rng][i] <= 0){
                    fool.gold = 0;
                  }
                  else{
                    fool.gold = foolMax.gold;
                  }
                  break;
                default:
                  break;
              }   
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
              }
              
            }
            
          }
          else{
            gameOver = true;
            gameStarted = false;
            voteTimer = timeToVote;
            io.emit('game over', {

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
