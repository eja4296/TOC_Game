$(() => {
  const FADE_TIME = 150; // ms
  const TYPING_TIMER_LENGTH = 400; // ms
  const COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7',
  ];

  // Initialize variables
  const $window = $(window);
  const $usernameInput = $('.usernameInput'); // Input for username
  const $messages = $('.messages'); // Messages area
  const $inputMessage = $('.inputMessage'); // Input message input box

  const $loginPage = $('.login.page'); // The login page
  const $chatPage = $('.chat.page'); // The chatroom page
  const $mainPage = $('.main.page')
  const $gameOverPage = $('.gameOver.page')

  // Prompt for setting a username
  let username;
  let usernames = [];
  let connected = false;
  let typing = false;
  let lastTypingTime;
  let $currentInput = $usernameInput.focus();

  const socket = io();

  // Vote variables
  const votes = [];
  const vA = 0;
  const vB = 0;
  const vC = 0;
  const vD = 0;
  let timer;
  let topVote;
  const votingComplete = false;
  
  /*
  const $voteA = $('#voteA');
  const $voteB = $('#voteB');
  const $voteC = $('#voteC');
  const $voteD = $('#voteD');

  */

  // Get buttons for voting
  const buttonA = document.querySelector('#button0');
  const buttonB = document.querySelector('#button1');
  const buttonC = document.querySelector('#button2');
  const buttonD = document.querySelector('#button3');
  
  const submitButton = document.querySelector('#submitVotesButton');
  const resetButton = document.querySelector('#resetVotesButton');
  
  const statDropdownButton = document.querySelector('#statDropdownButton');
  const eventDropdownButton = document.querySelector('#eventDropdownButton');
  const voteDropdownButton = document.querySelector('#voteDropdownButton');
  const logDropdownButton = document.querySelector('#logDropdownButton');
  
  const startButton = document.querySelector('#startButton');

  const startGameButton = document.querySelector('#startGame');
  const mainMenuButton = document.querySelector('#mainMenu');

  //  const startButton = document.querySelector('#startButton');

  let totalPlayers = 0;
  let totalPlayersVoted = 0;
  
  // Player variables
  let playerVote;
  let playerPreviousVote = "";
  const playerVoteIndex = -1;
  let playerVoteWeight = 1;
  let playerVoted = false;

  // Event variables
  let currentEvent;
  const allEvents = [];

  const voteLetters = ['A', 'B', 'C', 'D'];

  const voteChoices = [0, 0, 0, 0];


  // Call init when window loads
  const init = () => {


    // Set the current event (probably want to do this on the server)
    // currentEvent = empress;

    // Load the current event (probably want to do this on the server)
    // loadEvent(currentEvent);
  };

  // Load event function
  // Loads all information about the current event

  

  // Add Participant Message function
  // Provide information about the number of players in the game
  const addParticipantsMessage = (data) => {
    let message = '';
    if (data.numUsers === 1) {
      message += "You're the only player";
    } else {
      message += `There are ${data.numUsers} players`;
    }
    log(message);
  };

  // Sets username function
  const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $mainPage.show();
      $loginPage.off('click');
      //$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  };
  
  const playGame = () => {
    $mainPage.fadeOut();
    $chatPage.fadeIn();
    $mainPage.off('click');
    $currentInput = $inputMessage.focus();
    //startGame();
  }
  
  startGameButton.addEventListener('click', playGame);
  
  const gameOver = () => {
    $chatPage.fadeOut();
    $gameOverPage.fadeIn();
    $chatPage.off('click');
  }
  
  const mainMenu = () => {
    $gameOverPage.fadeOut();
    $mainPage.fadeIn();
    $gameOverPage.off('click');
    
  }
  
  mainMenuButton.addEventListener('click', mainMenu);

  // Sends message function
  const sendMessage = () => {
    let message = $inputMessage.val();

    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username,
        message,
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  };

  // Log a message
  const log = (message, options) => {
    const $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  };

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    // Don't fade the message in if there is an 'X was typing'
    const $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    const $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    const $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    const typingClass = data.typing ? 'typing' : '';
    const $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  };

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  };


  // Removes the visual chat typing message
  const removeChatTyping = (data) => {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  };

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    const $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  // Prevents input from having injected markup
  const cleanInput = input => $('<div/>').text(input).html();

  // Updates the typing event
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        const typingTimer = (new Date()).getTime();
        const timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  };

  // Gets the 'X is typing' messages of a user
  const getTypingMessages = data => $('.typing.message').filter(function (i) {
    return $(this).data('username') === data.username;
  });

  // Gets the color of a username through our hash function
  const getUsernameColor = (username) => {
    // Compute hash code
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  };

  
  const userVote = (e) => {

    
    
    playerVote = e.target.value;
    
    //document.querySelector("#event").style.display = "none";

    if(playerVote != playerPreviousVote){
      socket.emit('playerVote', playerVote, playerVoteWeight, playerPreviousVote, playerVoted, username);
      buttonA.style.border = "1px solid white";
      buttonB.style.border = "1px solid white";
      buttonC.style.border = "1px solid white";
      buttonD.style.border = "1px solid white";
      e.target.style.border = "3px solid white";
      document.querySelector("#userVoteChoice").innerHTML = e.target.value;
    }
    
    playerPreviousVote = playerVote;
    playerVoted = true;
    
    
  }
  
  buttonA.addEventListener('click', userVote);
  buttonB.addEventListener('click', userVote);
  buttonC.addEventListener('click', userVote);
  buttonD.addEventListener('click', userVote);

  const submitVotes = () =>{
    //if(totalPlayersVoted > 0){
      socket.emit('submitVotes');
    //}
  }
  
  submitButton.addEventListener('click', submitVotes);
  
  const resetVotes = () =>{
    socket.emit('resetVotes');
  }
  
  resetButton.addEventListener('click', resetVotes);
  
  const statDropdown = () => {
    
    //statDropdownActive = !statDropdownActive;
    if(document.querySelector("#secondStats").style.display == "block"){
      document.querySelector("#secondStats").style.display = "none";
      statDropdownButton.style.borderTop = "1px solid white";
      statDropdownButton.style.borderBottom = "1px solid white";
      statDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Down.png')";
      
    }
    else{
      document.querySelector("#secondStats").style.display = "block";
      statDropdownButton.style.borderTop = "3px solid white";
      statDropdownButton.style.borderBottom = "3px solid white";
       statDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Up.png')";
      
    }
  }
  
  statDropdownButton.addEventListener('click', statDropdown);
  
  const eventDropdown = () => {
    if(document.querySelector("#secondEvent").style.display == "block"){
      document.querySelector("#secondEvent").style.display = "none";
      eventDropdownButton.style.borderTop = "1px solid white";
      eventDropdownButton.style.borderBottom = "1px solid white";
       eventDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Down.png')";
      

    }
    else{
      document.querySelector("#secondEvent").style.display = "block";
      eventDropdownButton.style.borderTop = "3px solid white";
      eventDropdownButton.style.borderBottom = "3px solid white";
      eventDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Up.png')";
    }
  }
  
  eventDropdownButton.addEventListener('click', eventDropdown);
  
  const voteDropdown = () => {
    if(document.querySelector("#secondVote").style.display == "block"){
      document.querySelector("#secondVote").style.display = "none";
      voteDropdownButton.style.borderTop = "1px solid white";
      voteDropdownButton.style.borderBottom = "1px solid white";
       voteDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Down.png')";

    }
    else{
      document.querySelector("#secondVote").style.display = "block";
      voteDropdownButton.style.borderTop = "3px solid white";
      voteDropdownButton.style.borderBottom = "3px solid white";
      voteDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Up.png')";
    }
  }
  
  voteDropdownButton.addEventListener('click', voteDropdown);
  
  const logDropdown = () => {
    if(document.querySelector("#secondGameLog").style.display == "block"){
      document.querySelector("#secondGameLog").style.display = "none";
      logDropdownButton.style.borderTop = "1px solid white";
      logDropdownButton.style.borderBottom = "1px solid white";
       logDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Down.png')";

    }
    else{
      document.querySelector("#secondGameLog").style.display = "block";
      logDropdownButton.style.borderTop = "3px solid white";
      logDropdownButton.style.borderBottom = "3px solid white";
      logDropdownButton.style.backgroundImage = "url('media/dropdownIcon_Up.png')";
    }
  }
  
  logDropdownButton.addEventListener('click', logDropdown);
  
  const startGame = () => {
    socket.emit('start game');
    document.querySelector('#secondGameLog').innerHTML = "";
    startButton.style.display = "none";
  }
  
  startButton.addEventListener('click', startGame);
  
  // Keyboard events
  $window.keydown((event) => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', () => {
    updateTyping();
  });

  // Focus input when clicking anywhere on login page
  $loginPage.click(() => {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus();
  });


  // Socket events
  // These events are tiggered by the server

  // Whenever the server emits 'login', log the login message
  socket.on('login', (data) => {
    if (username != 'TOC_Admin') {
      document.querySelector('#totalVotes').style.display = 'none';
      document.querySelector('#submitResetVotes').style.display = 'none';
      document.querySelector('#allVotes').style.display = 'none';
      document.querySelector('#players').style.display = 'none';
    }
    
    usernames = data.usernames;
    
    let parent = document.querySelector("#players");


    for(var i = 0; i < usernames.length; i++){
      let newUser = document.createElement("div");
      //parent.removeChild("#players" + data.usernames[i]);
      newUser.setAttribute("id", "players" + data.usernames[i]);


      parent.appendChild(newUser);

      newUser.innerHTML = data.usernames[i] + ": "
    }
    
    

    
    totalPlayersVoted = data.numUsersVoted;
    totalPlayers = data.numUsers;
    document.querySelector("#numOfUsersVoted").innerHTML = totalPlayersVoted + "/" + totalPlayers; 

    connected = true;
    // Display the welcome message
    const message = 'Three of Coins - Chat';
    log(message, {
      prepend: true,
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', (data) => {
    addChatMessage(data);
    // getVotes(data);
  });


  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', (data) => {
    log(`${data.username} joined`);
    
    let parent = document.querySelector("#players");

    let newUser = document.createElement("div");
    //parent.removeChild("#players" + data.usernames[i]);
    newUser.setAttribute("id", "players" + data.username);

    parent.appendChild(newUser);
    
    document.querySelector("#players" + data.username).innerHTML = data.username + ": "
      
    
    totalPlayersVoted = data.numUsersVoted;
    totalPlayers = data.numUsers;
    document.querySelector("#numOfUsersVoted").innerHTML = totalPlayersVoted + "/" + totalPlayers; 

    addParticipantsMessage(data);
  });

  socket.on('updatePlayerVotes', (data) => {
    totalPlayersVoted = data.numUsersVoted;
    totalPlayers = data.numUsers;
    usernames = data.usernames;
    document.querySelector("#numOfUsersVoted").innerHTML = totalPlayersVoted + "/" + totalPlayers; 
    
    usernames = data.usernames;

    document.querySelector("#players" + data.username).innerHTML = data.username + ": " + data.vote + " (" + data.weight + ")<br>";
    
    document.querySelector("#allVotes").innerHTML = "Votes for Sword: " + data.swordVotes.length;
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Wand: " + data.wandVotes.length;
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Cup: " + data.cupVotes.length;
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Coin: " + data.coinVotes.length;
    //document.querySelector("#players" + data.username).innerHTML = usernames + ": " + data.vote + " (" + data.weight + ")<br>";
  });
  
  socket.on('updateFinalVote', (data) => {
    document.querySelector("#finalVoteChoice").innerHTML = data.finalVote;

    
  });
  
  socket.on('resetVotes', (data) => {
    
    if(data.finalVote != playerVote && playerVoteWeight < 5){
      playerVoteWeight += 1;
    }
    if(data.finalVote == playerVote){
      playerVoteWeight = 1;
    }

    document.querySelector("#weight").innerHTML = playerVoteWeight;
    
    buttonA.style.border = "1px solid white";
    buttonB.style.border = "1px solid white";
    buttonC.style.border = "1px solid white";
    buttonD.style.border = "1px solid white";
    
    for(var i = 0; i < usernames.length; i++){

      document.querySelector("#players" + data.usernames[i]).innerHTML = data.usernames[i] + ": ";
    }
    
    document.querySelector("#allVotes").innerHTML = "Votes for Sword: 0";
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Wand: 0";
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Cup: 0";
    document.querySelector("#allVotes").innerHTML += "<br>Votes for Coin: 0";
    
    playerVoted = false;
    playerPreviousVote = "_";
    
    //document.querySelector("#userVoteChoice").innerHTML = "";
    totalPlayersVoted = 0;
    document.querySelector("#numOfUsersVoted").innerHTML = totalPlayersVoted + "/" + totalPlayers; 
    
  });
  
  
    const loadEvent = (eventCard, topVote, rng, fool, foolMax, finalVote) => {
      
        //document.querySelector("#userVoteChoice").innerHTML = "";
        document.querySelector('#health').innerHTML = fool.health;
        document.querySelector('#health').style.color = "hsl(" + (fool.health / foolMax.health) * 120 + ", 80%, 35%)";
        document.querySelector('#strength').innerHTML = fool.strength;
        document.querySelector('#strength').style.color = "hsl(" + (fool.strength / foolMax.strength) * 120 + ", 80%, 35%)";
        document.querySelector('#intelligence').innerHTML = fool.intelligence;
        document.querySelector('#intelligence').style.color = "hsl(" + (fool.intelligence / foolMax.intelligence) * 120 + ", 80%, 35%)";
        document.querySelector('#charisma').innerHTML = fool.charisma;
        document.querySelector('#charisma').style.color = "hsl(" + (fool.charisma / foolMax.charisma) * 120 + ", 80%, 35%)";
        document.querySelector('#luck').innerHTML = fool.luck;
        document.querySelector('#luck').style.color = "hsl(" + (fool.luck / foolMax.luck) * 120 + ", 80%, 35%)";
        document.querySelector('#gold').innerHTML = fool.gold;
        document.querySelector('#gold').style.color = "hsl(" + (fool.gold / foolMax.gold) * 120 + ", 80%, 35%)";
      
      //document.querySelector("#userVoteChoice").innerHTML = "";
        document.querySelector('#health2').innerHTML = fool.health;
        document.querySelector('#health2').style.color = "hsl(" + (fool.health / foolMax.health) * 120 + ", 80%, 35%)";
        document.querySelector('#strength2').innerHTML = fool.strength;
        document.querySelector('#strength2').style.color = "hsl(" + (fool.strength / foolMax.strength) * 120 + ", 80%, 35%)";
        document.querySelector('#intelligence2').innerHTML = fool.intelligence;
        document.querySelector('#intelligence2').style.color = "hsl(" + (fool.intelligence / foolMax.intelligence) * 120 + ", 80%, 35%)";
        document.querySelector('#charisma2').innerHTML = fool.charisma;
        document.querySelector('#charisma2').style.color = "hsl(" + (fool.charisma / foolMax.charisma) * 120 + ", 80%, 35%)";
        document.querySelector('#luck2').innerHTML = fool.luck;
        document.querySelector('#luck2').style.color = "hsl(" + (fool.luck / foolMax.luck) * 120 + ", 80%, 35%)";
        document.querySelector('#gold2').innerHTML = fool.gold;
        document.querySelector('#gold2').style.color = "hsl(" + (fool.gold / foolMax.gold) * 120 + ", 80%, 35%)";

      if(eventCard.type == "voting"){
        document.querySelector('#eventTitle').innerHTML = eventCard.title;
       
        document.querySelector('#secondEventPicture').src = `media/${eventCard.name}.png`;
        
        if(finalVote){
          document.querySelector('#eventDescriptionTLDR').innerHTML = "Fate has decided the adventurer will use his: " + finalVote + "<br>";
          document.querySelector('#eventDescriptionTLDR').innerHTML += eventCard.tldrDescription;
          document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + "Fate has decided the adventurer will use his: " + finalVote + "</div>";
        }
        else{
          document.querySelector('#eventDescriptionTLDR').innerHTML = eventCard.tldrDescription;
        }
        
        
        document.querySelector('#eventDescription').innerHTML = eventCard.flavorTextDescription;
        document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.tldrDescription + "</div><br><br>";
        
        for (let i = 0; i < 4; i++) {
        
          if (eventCard.completedOptions[i] == 0 && eventCard.options[i]) {
            document.querySelector(`#button${i}`).style.display = 'block';
            document.querySelector(`#button${i}`).innerHTML = eventCard.voteOption[i];
            document.querySelector(`#option${i}`).innerHTML = eventCard.options[i];
            document.querySelector(`#secondOption${i}`).innerHTML = eventCard.optionsFlavor[i];
            document.querySelector(`#secondOptionTLDR${i}`).innerHTML = "(" + eventCard.options[i]+ ") ";
          } else {
            document.querySelector(`#option${i}`).innerHTML = '';
            document.querySelector(`#button${i}`).style.display = 'none';
            document.querySelector(`#secondOption${i}`).innerHTML = "";
            document.querySelector(`#secondOptionTLDR${i}`).innerHTML = "";
          }
        }
      }
      else if(eventCard.type == "resolution"){
        
        
        if(finalVote){
          document.querySelector('#eventDescriptionTLDR').innerHTML = "Fate has decided the adventurer will use his: " + finalVote + "<br>";
          document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + "Fate has decided the adventurer will use his: " + finalVote + "</div>";
        }
        if(!finalVote){
          document.querySelector('#eventDescriptionTLDR').innerHTML = eventCard.flavorTextDescription;
        }
        else{
          document.querySelector('#eventDescriptionTLDR').innerHTML += eventCard.flavorTextDescription;
        }
        
        document.querySelector('#eventDescription').innerHTML = eventCard.text[rng];
        
        document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.text[rng] + "</div>";

        for (let i = 0; i < 4; i++) {
        
          document.querySelector(`#option${i}`).innerHTML = '';
            document.querySelector(`#button${i}`).style.display = 'none';
            document.querySelector(`#secondOption${i}`).innerHTML = "";
            document.querySelector(`#secondOptionTLDR${i}`).innerHTML = "";
          
        }

        if(!eventCard.effectStats[rng]){
          

          document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>Nothing happened...</div><br><br>";
          
          //document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.flavorTextDescription + " </div>";

          document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.flavorTextDescription + " </div>";
          document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>Nothing happened...</div>";

          document.querySelector("#eventDescriptionTLDR").innerHTML += " Nothing happened...";
        }
        else{
         
          for(var i = 0; i < eventCard.effectStats[rng].length; i++){
            if(eventCard.effectPower[rng][i] > 0){
               document.querySelector("#eventDescriptionTLDR").innerHTML += " <br>" + eventCard.effectStats[rng][i] + ": +" + eventCard.effectPower[rng][i] + "";
            
                document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.effectStats[rng][i] + ": +" + eventCard.effectPower[rng][i] + "</div> ";
            }
            else{
               document.querySelector("#eventDescriptionTLDR").innerHTML += " <br>" + eventCard.effectStats[rng][i] + ": " + eventCard.effectPower[rng][i] + "";
            
                document.querySelector('#secondGameLog').innerHTML += "<div class='logElement'>" + eventCard.effectStats[rng][i] + ": " + eventCard.effectPower[rng][i] + "</div> ";
            }
           
          }
          document.querySelector('#secondGameLog').innerHTML += "<br><br>";
          
        }
      }
     
  };
  
  socket.on('load event', (data) => {
    currentEvent = data.currentEvent;
    loadEvent(data.currentEvent, data.topVote, data.rng, data.fool, data.foolMax, data.finalVote);

  });
  
  const updateTimer = (newTime) => {
    document.querySelector("#voteTimerNum").innerHTML = newTime;
  } 
  
  socket.on('vote timer', (data) => {
    updateTimer(data.voteTimer);
    if(data.voteTimer <= 5){
      document.querySelector("#voteTimerNum").style.color = "red";
    }
    else{
      document.querySelector("#voteTimerNum").style.color = "white";
    }
  });
  
  socket.on('game over', (data) => {
    if(data.fool.health > 0){
      document.querySelector("#gameOver").innerHTML = "Congratulations! The adventurer has mastered fate.";
    }
    else{
      document.querySelector("#gameOver").innerHTML = "Game Over. The adventurer died, thus, fate was not on his side.";
    }
    startButton.style.display = "block";
    gameOver();
  });
  
  /*
  // First the client adds a vote to the server
  // The server holds all of the votes
  // The server must update the client on all player's votes
  socket.on('voting', (data) => {
    vA = data.votes[0];
    vB = data.votes[1];
    vC = data.votes[2];
    vD = data.votes[3];

    $voteA.text(`Votes for A: ${vA}`);
    $voteB.text(`Votes for B: ${vB}`);
    $voteC.text(`Votes for C: ${vC}`);
    $voteD.text(`Votes for D: ${vD}`);

    if (playerVote) {
      document.querySelector('#currentVote').innerHTML = `<h3>Vote: ${playerVote}</h3>`;
    }
  });

  socket.on('load resolution'), (data) => {
    currentEvent = data.currentEvent;
    loadResolution(data.currentEvent, data.resIndex);
    document.querySelector('#health').innerHTML = `Health: ${data.fool.health}`;
    document.querySelector('#strength').innerHTML = `Strength: ${data.fool.strength}`;
    document.querySelector('#intelligence').innerHTML = `Intelligence: ${data.fool.intelligence}`;
    document.querySelector('#charisma').innerHTML = `Charisma: ${data.fool.charisma}`;
    document.querySelector('#luck').innerHTML = `Luck: ${data.fool.luck}`;
    document.querySelector('#gold').innerHTML = `Gold: ${data.fool.gold}`;
  };

  socket.on('load event', (data) => {
    currentEvent = data.currentEvent;
    loadEvent(data.currentEvent);
    document.querySelector('#optionList').style.display = 'block';
    document.querySelector('#voteCompleted').innerHTML = '';
    playerVoted = false;

    document.querySelector('#health').innerHTML = `Health: ${data.fool.health}`;
    document.querySelector('#strength').innerHTML = `Strength: ${data.fool.strength}`;
    document.querySelector('#intelligence').innerHTML = `Intelligence: ${data.fool.intelligence}`;
    document.querySelector('#charisma').innerHTML = `Charisma: ${data.fool.charisma}`;
    document.querySelector('#luck').innerHTML = `Luck: ${data.fool.luck}`;
    document.querySelector('#gold').innerHTML = `Gold: ${data.fool.gold}`;
  });

  // Reset voting
  socket.on('resetVoting', (data) => {
    vA = data.votes[0];
    vB = data.votes[1];
    vC = data.votes[2];
    vD = data.votes[3];

    $voteA.text(`Votes for A: ${vA}`);
    $voteB.text(`Votes for B: ${vB}`);
    $voteC.text(`Votes for C: ${vC}`);
    $voteD.text(`Votes for D: ${vD}`);
  });

  // Server tells the client it is in the voting phase
  socket.on('voting phase', (data) => {
    document.querySelector('#voteTimer').innerHTML = `Timer: ${data.time}`;
    document.querySelector('#voteIntermission').innerHTML = '';
    document.querySelector('#options').innerHTML = 'What will you do?';
  });

  // Server tells the client that voting is complete
  socket.on('voting complete', (data) => {
    votingComplete = true;
    if (data.topVote == playerVoteIndex) {
      playerVoteWeight = 1;
    } else {
      playerVoteWeight += 1;
    }
    playerVoteIndex = -1;
    document.querySelector('#options').innerHTML = 'What will you do?';
    document.querySelector('#voteWeight').innerHTML = `<h3>Weight: ${playerVoteWeight}</h3>`;
    topVote = data.topVote;
    if (currentEvent.options[topVote]) {
      document.querySelector('#voteCompleted').innerHTML = `Fate has decided you will: ${currentEvent.options[topVote]}`;
    }

    document.querySelector('#optionList').style.display = 'none';
    document.querySelector('#currentVote').innerHTML = '<h3> Vote:</h3>';

    document.querySelector('#health').innerHTML = `Health: ${data.fool.health}`;
    document.querySelector('#strength').innerHTML = `Strength: ${data.fool.strength}`;
    document.querySelector('#intelligence').innerHTML = `Intelligence: ${data.fool.intelligence}`;
    document.querySelector('#charisma').innerHTML = `Charisma: ${data.fool.charisma}`;
    document.querySelector('#luck').innerHTML = `Luck: ${data.fool.luck}`;
    document.querySelector('#gold').innerHTML = `Gold: ${data.fool.gold}`;
  });

  socket.on('end game', (data) => {
    document.querySelector('#eventImage').style.visibility = 'hidden';
    document.querySelector('#eventTitle').innerHTML = 'Game Over';
    document.querySelector('#voteArea').style.visibility = 'hidden';
    document.querySelector('#textOverlay').style.visibility = 'hidden';

    document.querySelector('#optionList').style.visibility = 'hidden';
    document.querySelector('#startButton').style.visibility = 'hidden';
    document.querySelector('#voteCompleted').style.visibility = 'hidden';

    let mostVotes = 0;
    let mostVotedFor = 0;
    for (let i = 0; i < voteChoices.length; i++) {
      if (mostVotes < voteChoices[i]) {
        mostVotes = voteChoices[i];
        mostVotedFor = i;
      }
    }

    const foolHealth = data.fool.health;

    if (foolHealth > 0) {
      document.querySelector('#description').innerHTML = 'Congratulations! You survived.';
    } else {
      document.querySelector('#description').innerHTML = 'You died.';
    }

    switch (mostVotedFor) {
      case 0:
        document.querySelector('#options').innerHTML = 'You preferred the Sword (Strength). You hack first and ask quesitons later.';
        break;
      case 1:
        document.querySelector('#options').innerHTML = 'You preferred the Wand (Intelligence). Your knowledge gives you power.';
        break;
      case 2:
        document.querySelector('#options').innerHTML = 'You preferred the Cup (Charisma). You talk your way through any situation.';
        break;
      case 3:
        document.querySelector('#options').innerHTML = "You preferred the Coin (Luck). Fate doesn't dare mess with you.";
        break;
      default:
        break;
    }
  });

  socket.on('voting resolution', (data) => {
    // votingComplete = true;

    document.querySelector('#voteWeight').innerHTML = `<h3>Weight: ${playerVoteWeight}</h3>`;
    topVote = data.topVote;
    resIndex = data.resIndex;
    // if(currentEvent.options[topVote]){
    document.querySelector('#description').innerHTML = `${currentEvent.flavorTextDescription}<br><br>${currentEvent.resolution.text[resIndex]}`;
    document.querySelector('#textOverlay').innerHTML = `${currentEvent.flavorTextDescription}<br><br>${currentEvent.resolution.text[resIndex]}`;
    // }

    if (currentEvent.resolution.effectStats[resIndex]) {
      document.querySelector('#voteCompleted').innerHTML = `Stat change: ${currentEvent.resolution.effectStats[resIndex]} (${currentEvent.resolution.effectPower[resIndex]})`;
    }

    document.querySelector('#options').innerHTML = '';

    document.querySelector('#optionList').style.display = 'none';
    document.querySelector('#currentVote').innerHTML = '<h3> Vote:</h3>';

    document.querySelector('#health').innerHTML = `Health: ${data.fool.health}`;
    document.querySelector('#strength').innerHTML = `Strength: ${data.fool.strength}`;
    document.querySelector('#intelligence').innerHTML = `Intelligence: ${data.fool.intelligence}`;
    document.querySelector('#charisma').innerHTML = `Charisma: ${data.fool.charisma}`;
    document.querySelector('#luck').innerHTML = `Luck: ${data.fool.luck}`;
    document.querySelector('#gold').innerHTML = `Gold: ${data.fool.gold}`;
  });


  // Server tells the client it is the event intermission
  socket.on('event intermission', (data) => {
    document.querySelector('#voteIntermission').innerHTML = `Timer: ${data.timer}`;
    document.querySelector('#voteTimer').innerHTML = '';
    playerVoted = true;
  });

  socket.on('event resolution', (data) => {
    document.querySelector('#voteIntermission').innerHTML = `Timer: ${data.timer}`;
    document.querySelector('#voteTimer').innerHTML = '';
    playerVoted = true;
  });

  // Server tells the client to load a new event, and which one to load
  socket.on('new event', (data) => {
    currentEvent = allEvents[data.eventIndex];
    loadEvent(currentEvent);
    document.querySelector('#voteCompleted').innerHTML = '';
    playerVoted = false;
  });
  */

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', (data) => {
    log(`${data.username} left`);
    addParticipantsMessage(data);
    removeChatTyping(data);
    totalPlayersVoted = data.numUsersVoted;
    totalPlayers = data.numUsers;
    usernames = data.usernames;
    document.querySelector("#players" + data.username).remove();
    document.querySelector("#numOfUsersVoted").innerHTML = totalPlayersVoted + "/" + totalPlayers; 
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', (data) => {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', (data) => {
    removeChatTyping(data);
  });

  socket.on('disconnect', () => {
    log('you have been disconnected');
  });

  socket.on('reconnect', () => {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed');
  });

  // Call init when the window loads
  window.onload = init;
});
