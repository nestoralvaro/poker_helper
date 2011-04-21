/************************************
    Main Javascript file
    Coded by Nestor Alvaro
************************************/

// Object to store table status
var table = {
        opponents: 5, // By default: 6 players (me and 5 oponents)
        myPos: 0, // If I'm "0" I'm the dealer (Dealer position by default)
        numberOfBB: 24, // The amount of money in relation to the Big blinds (24 BB by default)
        betsBefore: 0 // Number of bets before I have to talk (0 = I can limp)
    };

// Object to store the cards
var cards;

var msg = {
    "en" : {"fold" : "Fold", "dontCall" : "Fold. I don't call", "go" : "Go!", "dunno" : "I don't go.", "percentajeWin" : " Chances to improve my hand: ", "percentajeOponentWin" : " Chances <span class='specialText'>for the oponent</span> to have a good hand: ", "tightPlayer" : "A tight player would say: ", "loosePlayer" : "A loose player would say: ", "StraightFlush" : "Straight flush", "FourOfAKind" : "Four of a kind", "FullHouse" : " Full house", "Flush" : "Flush", "Straight" : "Straight", "ThreeOfAKind" : "Three of a kind", "TwoPair" : "Two pair", "OnePair" : "One pair", "HighCard" : "High card", "currHandGood" : "You've a good hand as you have:", "updateOps":"Update Options!", "calculate":"Calculate!", "goFlop":"Go to Flop!", "goTurn":"Go to Turn!", "goRiver":"Go to River!", "goStart":"Start a new hand!", "myPos":"Your current position (0 = dealer)", "noOps":"Number of oponents", "numberBB":"Number of Big blinds you have", "hideOptions": "Hide options", "showOptions":"Click to show the options menu", "looseModeOff":"Loose mode Off (tight mode):", "looseModeOn":"Loose mode ON:", "choosePocketCards":"Choose your pocket cards", "chooseFlopCards":"Choose flop cards", "chooseTurnCards":"Choose turn card", "chooseRiverCards":"Choose river card", "low":"LOW", "iDeviceScroll":"Use two fingers to scroll within the cards area.", "smallDeviceScroll":"Slide to see all cards." },

    "es" : {"fold" : "No voy", "dontCall" : "No veo la apuesta", "go" : "Voy!", "dunno" : "Creo que no voy.", "percentajeWin" : " Posibilidades de mejorar mi mano: ", "percentajeOponentWin" : " Posibilidades de que <span class='specialText'>el oponente(s)</span> tenga una buena mano: ","tightPlayer" : "Un jugador tight diria: ", "loosePlayer" : "Un jugador loose diria: ","StraightFlush" : "Escalera de Color", "FourOfAKind" : "Poker", "FullHouse" : "Full", "Flush" : "Color", "Straight" : "Escalera", "ThreeOfAKind" : "Trio", "TwoPair" : " Dobles parejas", "OnePair" : "Pareja", "HighCard" : "Carta alta", "currHandGood" : "Tienes una buena mano ya que tienes:", "updateOps":"Actualizar las opciones!", "calculate":"Calcular!", "goFlop":"Ir al Flop!", "goTurn":"Ir al Turn!", "goRiver":"Ir al River!", "goStart":"Comenzar una nueva mano!", "myPos":"Tu posicion actual (0 = dealer)", "noOps":"Numero de oponentes", "numberBB":"Numero de Ciegas que tienes", "hideOptions":"Ocultar las opciones", "showOptions":"Haz click para mostrar las opciones", "looseModeOff":"Jugar a lo seguro (solo buenas manos):", "looseModeOn":"Jugar casi cualquier mano:", "choosePocketCards":"Elige las cartas de tu mano", "chooseFlopCards":"Escoge las cartas del flop ", "chooseTurnCards":"Escoge la carta del turn", "chooseRiverCards":"Escoge la carta del river", "low":"BAJO", "iDeviceScroll":"Usa dos dedos para hacer scroll sobre las cartas.", "smallDeviceScroll":"Desliza para ver todas las cartas." }
};

// First goes the suit
// hearts = H; clubs = C; spades = S; diamonds = D
// Then the card number
// 2, 3, 4, 5, 6, 7, 8, 9, T, J, Q, K, A

var phase;
var lang = 'en'; // en: English / es: Spanish (English by default)
var animationState = 500; // 0 to remove animation
var looseMode = false; // By default the user is set on "tight" mode

// Try to detect Spanish language
if (window && window.navigator && window.navigator.language && (window.navigator.language.indexOf('es') != -1)) {
    lang = 'es';
    setLanguage(lang);
}

// This functions is invoked the first time and everytime a new hand starts
function newHand() {
    // Reset the Object
    cards = {
        pocket: [],
        flop: [],
        turn: [],
        river: []
    };

    // Reset the phase
    phase = 'preflop';

    // Update table status
    table.betsBefore = 0; // (TODO use it: Not used yet)

    // UN-Binds the click event on all cards
    jQuery(".card").unbind('click');
    // Remove the class to avoid binding
    jQuery("#pocket0").removeClass("card");
    jQuery("#pocket1").removeClass("card");
    jQuery("#flop0").removeClass("card");
    jQuery("#flop1").removeClass("card");
    jQuery("#flop2").removeClass("card");
    jQuery("#turn0").removeClass("card");
    jQuery("#river0").removeClass("card");
    // First removed shadowed cards (if any)
    jQuery(".card").removeClass("shadowed");
    // Binds the click event to all cards
    jQuery(".card").bind('click', 
        function() {
            storeCard(jQuery(this));
            // Highlight/UN-Highlight the cards
            jQuery(this).toggleClass("shadowed");
        }
    );
    // Add ".card" afterwards to not have binding associated
    jQuery("#pocket0").addClass("card");
    jQuery("#pocket1").addClass("card");
    showMsgLog(msg[lang]["choosePocketCards"]);

    var initialMsg = msg[lang]["choosePocketCards"];
    /*
    // The sliding issue is now fixed (jQuery UI Slider)
    if ((/iphone|ipod|ipad/gi).test(navigator.platform)) {
        initialMsg += "<br/> <span class='hintText'>" + msg[lang]["iDeviceScroll"] + "</span>";
    }
    */
    showMsgLog(initialMsg);
}

// Updates my position
function updateMyPos(){
    var currPos = table.myPos + 1;
    if (currPos > table.opponents)
        currPos = 0;
    table.myPos = currPos;
}

// Allows only typing numbers
function isNumberKey(a){
    var b = a.keyCode ? a.keyCode : a.which;
    return (b>=48&&b<=57) || b==8
}

// Sets the number op oponents
function setOpponents(){
    var noOps = jQuery("#inputNumberOps").val();
    if (noOps > 0) {
        table.opponents = noOps;
    }
}

// Sets my current position in the table
function setMyPos(){
    var myPos = jQuery("#inputMyPos").val();
    // Only if my position is within the number of total players
    if (myPos < table.opponents && myPos > 0) {
        table.myPos = myPos;
    }
}

// Sets the number of BB that I have (TODO use it: Not used yet)
function setNumberOfBB(){
    var numberOfBB = jQuery("#inputNumberBB").val();
    if (numberOfBB > 0) {
        table.numberOfBB = numberOfBB;
    }
}

// Sets loose mode
function setLooseMode(){
    looseMode = jQuery('input:radio[name=looseMode]:checked').val();
}

// Changes the language
function setLanguage(language){
    lang = language;
    jQuery("#divMyPos").html(msg[lang]["myPos"]);
    jQuery("#divNoOps").html(msg[lang]["noOps"]);
    jQuery("#divNumberBB").html(msg[lang]["numberBB"]);
    jQuery(".buttonCalculate").val(msg[lang]["calculate"]);
    jQuery("#buttonGoFlop").val(msg[lang]["goFlop"]);
    jQuery("#buttonGoTurn").val(msg[lang]["goTurn"]);
    jQuery("#buttonGoRiver").val(msg[lang]["goRiver"]);
    jQuery("#buttonGoStart").val(msg[lang]["goStart"]);
    jQuery("#updateOptions").val(msg[lang]["updateOps"]);
    jQuery("#buttonGoStart").val(msg[lang]["goStart"]);
    jQuery("#radioLooseModeOff").html(msg[lang]["looseModeOff"]);
    jQuery("#radioLooseModeOn").html(msg[lang]["looseModeOn"]);
    if (jQuery("#optionsForm").css('display') === 'none') {
        jQuery("#optionsTitle").html(msg[lang]["showOptions"]);
    } else {
        jQuery("#optionsTitle").html(msg[lang]["hideOptions"]);
    }
    jQuery("#smallDevicesText").html(msg[lang]["smallDeviceScroll"]);
}

// Updates all options
function updateOptions(){
    setOpponents();
    setMyPos();
    setNumberOfBB();
    setLooseMode();
    toggleOptions();
}

// Toggles option menu
function toggleOptions(){
    if (jQuery("#optionsForm").css('display') === 'none') {
        jQuery("#optionsForm").show(animationState);
        jQuery("#optionsTitle").html(msg[lang]["hideOptions"]);
    } else {
        jQuery("#optionsForm").hide(animationState);
        jQuery("#optionsTitle").html(msg[lang]["showOptions"]);
    }
}

// Chooses a new pocket card
function choseNewPocketCard(chosenCard){
    // The first card is stored
    if (cards.pocket.length === 0) {
        cards.pocket[0] = chosenCard.attr("id");
    } else {
        // The 2nd card was stored?
        if (cards.pocket[1] && cards.pocket[1] !== '') {
            // Remove shadow from the first card (if any) -> Only 2 shadows at the time
            if (cards.pocket[0] && cards.pocket[0] !== '') {
                jQuery("#" + cards.pocket[0]).removeClass('shadowed');
            }
            // 2nd is now the 1st 
            cards.pocket[0] = cards.pocket[1];
        }
        // the new card is stored
        cards.pocket[1] = chosenCard.attr("id");
    }

    // Hide data and phase change button
    jQuery("#percentajesPreFlop").hide(animationState);
    jQuery("#goFlop").hide(animationState);
}

// Chooses a new flop card
function choseNewFlopCard(chosenCard){
    // The first card is stored
    if (cards.flop.length === 0) {
        cards.flop[0] = chosenCard.attr("id");
    } else if (cards.flop.length === 1) {
        cards.flop[1] = chosenCard.attr("id");
    } else {
        // The 3rd card was stored?
        if (cards.flop[2] && cards.flop[2] !== '') {
            // Remove shadow from the first card (if any) -> Only 2 shadows at the time
            if (cards.flop[0] && cards.flop[0] !== '') {
                jQuery("#" + cards.flop[0]).removeClass('shadowed');
            }
            // 2nd is now the 1st 
            cards.flop[0] = cards.flop[1];
            // 3rd is now the 2nd 
            cards.flop[1] = cards.flop[2];
        }
        // the new card is stored
        cards.flop[2] = chosenCard.attr("id");
    }
    // Hide data and phase change button
    jQuery("#percentajesFlop").hide(animationState);
    jQuery("#goTurn").hide(animationState);
}

// Chooses a new turn card
function choseNewTurnCard(chosenCard){
    // The first card is stored
    if (cards.turn.length === 0) {
        cards.turn[0] = chosenCard.attr("id");
    } else if (cards.turn.length === 1) {
        // Remove shadow from the first card (if any) -> Only 2 shadows at the time
        if (cards.turn[0] && cards.turn[0] !== '') {
            jQuery("#" + cards.turn[0]).removeClass('shadowed');
        }
        cards.turn[0] = chosenCard.attr("id");
    }
    // Hide data and phase change button
    jQuery("#percentajesTurn").hide(animationState);
    jQuery("#goRiver").hide(animationState);
}

// Chooses a new river card
function choseNewRiverCard(chosenCard){
    // The first card is stored
    if (cards.river.length === 0) {
        cards.river[0] = chosenCard.attr("id");
    } else if (cards.river.length === 1) {
        // Remove shadow from the first card (if any) -> Only 2 shadows at the time
        if (cards.river[0] && cards.river[0] !== '') {
            jQuery("#" + cards.river[0]).removeClass('shadowed');
        }
        cards.river[0] = chosenCard.attr("id");
    }
    // Hide data and phase change button
    jQuery("#percentajesRiver").hide(animationState);
//    jQuery("#goStart").hide(animationState);
}

// De select a previous selected card
function deselectPocketCard(chosenCard){
    // Remove it from the pocket cards
    if (cards.pocket[0] === chosenCard.attr("id")) {
        cards.pocket[0] = cards.pocket[1];
        cards.pocket.splice(0,1);
    } else if (cards.pocket[1] === chosenCard.attr("id")) {
        cards.pocket.splice(1,1);
    }
}


// De select a previous selected card
function deselectFlopCard(chosenCard){
    // Remove it from the flop cards
    if (cards.flop[0] === chosenCard.attr("id")) {
        cards.flop[0] = cards.flop[1];
        cards.flop.splice(0,1);
    } else if (cards.flop[1] === chosenCard.attr("id")) {
        cards.flop[1] = cards.flop[2];
        cards.flop.splice(1,1);
    } else if (cards.flop[2] === chosenCard.attr("id")) {
        cards.flop.splice(2,1);
    }
}

// De select a previous selected card
function deselectTurnCard(chosenCard){
    // Remove it from the flop cards
    if (cards.turn[0] === chosenCard.attr("id")) {
        cards.turn.splice(0,1);
    }
}

// De select a previous selected card
function deselectRiverCard(chosenCard){
    // Remove it from the flop cards
    if (cards.river[0] === chosenCard.attr("id")) {
        cards.river.splice(0,1);
    }
}

// Set the card image field
function setCardImage(id, selectedCard){
        jQuery("#" + id).css('background-image',jQuery('#' + selectedCard).css('background-image'));
        jQuery("#" + id).css('backgroundPosition',jQuery('#' + selectedCard).css('backgroundPosition'));
}

// Clears the card image field
function resetCardImage(id){
        jQuery("#" + id).css('background','');
        jQuery("#" + id).css('background-image','');
        jQuery("#" + id).css('background-position-x','');
        jQuery("#" + id).css('background-position-y','');
}

// Shows or hides the chosen pocket cards
function showPocketCards(){
    if (cards.pocket[1] && cards.pocket[1] !== '') {
        setCardImage("pocket1", cards.pocket[1]);
    } else {
        resetCardImage('pocket1');
    }
    if (cards.pocket[0] && cards.pocket[0] !== '') {
        setCardImage("pocket0", cards.pocket[0]);
    } else {
        resetCardImage('pocket0');
    }
}

// Shows or hides the chosen flop cards
function showFlopCards(){
    if (cards.flop[2] && cards.flop[2] !== '') {
        setCardImage("flop2", cards.flop[2]);
    } else {
        resetCardImage('flop2');
    }
    if (cards.flop[1] && cards.flop[1] !== '') {
        setCardImage("flop1", cards.flop[1]);
    } else {
        resetCardImage('flop1');
    }
    if (cards.flop[0] && cards.flop[0] !== '') {
        setCardImage("flop0", cards.flop[0]);
    } else {
        resetCardImage('flop0');
    }
}

// Shows or hides the chosen turn card
function showTurnCard(){
    if (cards.turn[0] && cards.turn[0] !== '') {
        setCardImage("turn0", cards.turn[0]);
    } else {
        resetCardImage('turn0');
    }
}

// Shows or hides the chosen river card
function showRiverCard(){
    if (cards.river[0] && cards.river[0] !== '') {
        setCardImage("river0", cards.river[0]);
    } else {
        resetCardImage('river0');
    }
}

// Gets the value of the card
function getCardVal(card) {
    return card.substring(1,2);
}

// Gets the number of the card
function getCardNumber(card) {
    var pos = getCardVal(card);
    if (pos === 'A')
        pos = 14;
    else if (pos === 'K')
        pos = 13;
    else if (pos === 'Q')
        pos = 12;
    else if (pos === 'J')
        pos = 11;
    else if (pos === 'T')
        pos = 10;
    return pos;
}

// Gets the suit of the card
function getCardSuit(card) {
    var result = card.substring(0,1);
    return result;
}

// True if both numbers are the same
function isPair(card1, card2) {
    var result = false;
    if(getCardNumber(card1) === getCardNumber(card2))
        result = true;
    return result;
}

// True if both cards are suited (same suit)
function isSuited(card1, card2) {
    var result = false;
    if(getCardSuit(card1) === getCardSuit(card2))
        result = true;
    return result;
}

// Gets the smaller card among two
function getSmaller(card1, card2) {
    var result;
    if (getCardNumber(card1) > getCardNumber(card2))
        result = getCardNumber(card1);
    else
        result = getCardNumber(card2);
    return result;
}

// Returns the gaps between 2 cards ( 0 gaps = it's a pair)
function getGaps(card1, card2) {
    var result = Math.abs(getCardNumber(card1) - getCardNumber(card2));
    return result;
}

// Calculates the chance of victory PreFlop
function calculatePreFlop(){
    // (TODO use it: Not used yet)
    if (table.myPos === 2) {// UTG
        // The hands that are 1-gapper shouldn't be played except "AT", "KJ" y "QT"
        // Don't call with suited conectors if they have gaps
        // Just call with 89 or greater
    }

    var msgPreFlop = "";
    // Las que son 1-gapper no se juegan excepto "AT", "KJ" y "QT"
    if (((getGaps(cards.pocket[0], cards.pocket[1]) === 2) && (getSmaller(cards.pocket[0], cards.pocket[1]) < 10)) || (getGaps(cards.pocket[0], cards.pocket[1]) > 2)) {
        msgPreFlop = msg[lang]["fold"];
    // No hacer call con suited conectors si tienen gaps
    } else if ( isSuited(cards.pocket[0], cards.pocket[1]) && (getGaps(cards.pocket[0], cards.pocket[1]) === 1) && table.betsBefore > 0 ) {
        msgPreFlop = msg[lang]["dontCall"];
    // Solo ir con 89 o superior
    } else if (getSmaller(cards.pocket[0], cards.pocket[1]) > 7) {
        msgPreFlop = msg[lang]["go"];
    } else {
        msgPreFlop = msg[lang]["dunno"];
    }

    // Percentajes have Higher card and then smaller card. Sort cards.
    var orderedCards = getCardVal(cards.pocket[0]) + getCardVal(cards.pocket[1]);
    if (getCardNumber(cards.pocket[1]) > getCardNumber(cards.pocket[0]))
        orderedCards = getCardVal(cards.pocket[1]) + getCardVal(cards.pocket[0]);
    var percentaje = percentajes[orderedCards][table.opponents];
    // In case of suited cards add 3%
    if (isSuited(cards.pocket[0], cards.pocket[1]))
        percentaje = percentaje + 3;
    if (looseMode == "true") {
        jQuery("#percentajesPreFlop").html(msg[lang]["loosePlayer"] + "<b>" + msgPreFlop + "</b><br/>(Preflop) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    } else {
        jQuery("#percentajesPreFlop").html(msg[lang]["tightPlayer"] + "<b>" + msgPreFlop + "</b><br/>(Preflop) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    }
    jQuery("#percentajesPreFlop").show(animationState);
    jQuery("#goFlop").show(animationState);
}

// Calculates the chance of victory after the FLOP
function calculateFlop() {
    var allCards = getAllCards();
    var currOuts = getCurrentOuts(allCards, true);
    // After seeing flop cards =>  Flop = 1 - [ ((47 - Outs) / 47) * ((46 - Outs) / 46) ] 
    var flopOuts = 1 - ( ((47 - currOuts) / 47) * ((46 - currOuts) / 46) );
    // Get the chance of victory
    var percentaje = Math.floor((flopOuts * 100) / 1);
    var doPlay = false;
    // Hands that are fine to continue:
    if ( (getCurrentHand(allCards) !== 'HighCard') 
        || (isOpenEndedStraightDraw(allCards) || isFlushDraw(allCards) || (looseMode && isInsideStraightDraw(allCards))) ) {
        doPlay = true;
    }
    var msgFlop = msg[lang]["fold"];
    if (doPlay)
        msgFlop = msg[lang]["go"];
    if (looseMode == "true") {
        jQuery("#percentajesFlop").html(msg[lang]["loosePlayer"] + "<b>" + msgFlop + "</b><br/>(Flop) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    } else {
        jQuery("#percentajesFlop").html(msg[lang]["tightPlayer"] + "<b>" + msgFlop + "</b><br/>(Flop) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    }
    jQuery("#percentajesFlop").show(animationState);
    jQuery("#goTurn").show(animationState);
}

// Calculates the chance of victory after the TURN
function calculateTurn() {
    var allCards = getAllCards();
    var currOuts = getCurrentOuts(allCards, true);
    // After seeing turn cards =>  Turn = 1 - [ ((46 - Outs) / 46) ] 
    var turnOuts = 1 - ( ((46 - currOuts) / 46) );
    // Get the chance of victory
    var percentaje = Math.floor((turnOuts * 100) / 1);
    var doPlay = false;
    // Hands that are fine to continue:
    if ( (getCurrentHand(allCards) !== 'HighCard') 
        || (isOpenEndedStraightDraw(allCards) || isFlushDraw(allCards) || (looseMode && isInsideStraightDraw(allCards))) ) {
        doPlay = true;
    }
    var msgTurn = msg[lang]["fold"];
    if (doPlay)
        msgTurn = msg[lang]["go"];
    if (looseMode == "true") {
        jQuery("#percentajesTurn").html(msg[lang]["loosePlayer"] + "<b>" + msgTurn + "</b><br/>(Turn) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    } else {
        jQuery("#percentajesTurn").html(msg[lang]["tightPlayer"] + "<b>" + msgTurn + "</b><br/>(Turn) " + msg[lang]["percentajeWin"] + "<b>" + percentaje + "%</b>");
    }
    jQuery("#percentajesTurn").show(animationState);
    jQuery("#goRiver").show(animationState);
}

// Calculates the chance of victory after the RIVER
function calculateRiver() {
    var allCommonCards = getAllCommonCards();
    var currOuts = getCurrentOuts(allCommonCards, false);
    // Set loose mode to get more chances for opponents
    var tempLoose = looseMode;
    looseMode = true;

    // TODO check this: Could be much more accurate (some cards that are a single out are counted twice)
    // After seeing flop cards =>  Flop = 1 - [ ((47 - Outs) / 47) * ((46 - Outs) / 46) ] 
    var OponentOuts = 1 - ( ((47 - currOuts) / 47) * ((46 - currOuts) / 46) );
    // Get the chance of victory
    var percentaje = Math.floor((OponentOuts * 100) / 1);
    var doPlay = false;
    var allCards = getAllCards();
    var myOuts = getCurrentOuts(allCards, true);
    if ( (getCurrentHand(allCards) === 'StraightFlush') 
            || (getCurrentHand(allCards) === 'FourOfAKind')
            || (getCurrentHand(allCards) === 'FullHouse')
            || (getCurrentHand(allCards) === 'Flush')
            || (getCurrentHand(allCards) === 'Straight')
            || ( (getCurrentHand(allCards) !== 'HighCard') 
                    && !(isOpenEndedStraightDraw(allCommonCards) 
                        || isFlushDraw(allCommonCards) 
                        || isInsideStraightDraw(allCommonCards)
                        )
                    ) 
                ) {
        doPlay = true;
    }

    var msgRiver = msg[lang]["fold"];
    if (doPlay)
        msgRiver = msg[lang]["go"];
    var percentajeText = percentaje;
    if (percentaje < 15)
        percentajeText = msg[lang]["low"];
    else
        percentajeText +="%";
    // Reset loose mode
    looseMode = tempLoose;

    if (looseMode == "true") {
        jQuery("#percentajesRiver").html(msg[lang]["loosePlayer"] + "<b>" + msgRiver + "</b><br/>(River) " + msg[lang]["percentajeOponentWin"] + "<b>" + percentajeText + "</b>");
    } else {        
        jQuery("#percentajesRiver").html(msg[lang]["tightPlayer"] + "<b>" + msgRiver + "</b><br/>(River) " + msg[lang]["percentajeOponentWin"] + "<b>" + percentajeText + "</b>");
    }
    jQuery("#percentajesRiver").show(animationState);
//    jQuery("#goStart").show(animationState);
}

// Calculates the outs for the best possible hand (counting community cards). 
// We only want outs for ThreeOfAKind, StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind.
// The rest of the hands are weak and don't count
function getCurrentOuts(allCards, msgOn) {
    var currHand = getCurrentHand(allCards);
    if (msgOn && currHand !== 'OnePair' && currHand !== 'HighCard' ) {
        showMsgLog(msg[lang]["currHandGood"] + " <span class='specialText'>" + msg[lang][currHand] + "</span>");
    }
    // Always look for flush or straights (open ended or inner)
    var canBecomeOpenEndedStraight = isOpenEndedStraightDraw(allCards);
    var canBecomeInsideStraight = isInsideStraightDraw(allCards);
    var canBecomeFlush = isFlushDraw(allCards);

    var outs = 0;
    // Only if there's no straight yet
    if ((currHand !== 'Straight')) {
        // If there's a open straight draw the outs are 8
        if (canBecomeOpenEndedStraight) {
            outs = outs + 8;
        // If there's a inside straight draw the outs are 4. Exclussion to avoid duplicating the outs (eg: X, T, 9, 8, X, 6)
        } else if (canBecomeInsideStraight) {
            outs = outs + 4;
        }
    }
    // A flush draw having 4 cards of the same suit has nine outs. Only if there's no flush nor straight flush yet
    if ((currHand !== 'StraightFlush') && (currHand !== 'Flush') && canBecomeFlush) {
        outs = outs + 9;
    }
    // Try to improve the current hand
    if (currHand !== 'HighCard') {
        var extraOuts = 0;
        switch(currHand) {
            case "StraightFlush":
                // Improves to Higher straight
                if (canImproveToHigherStraight(allCards)) {
                    extraOuts = 1;
                }
            break;
            case "FourOfAKind":
                // Can't improve
            break;
            case "FullHouse":
                // Improves to "four of a kind"
                extraOuts = 1;
            break;
            case "Flush":
                // Improves to Higher flush
                extraOuts = canImproveToHigherFlush(allCards);
            break;
            case "Straight":
                // Can increase to higher straight(4 available cards)
                if (canImproveToHigherStraight(allCards)) {
                    extraOuts = 4;
                }
            break;
            case "ThreeOfAKind":
                // Improves to full / 4 of a kind
                extraOuts = ((allCards.length - 3) * 3) + 1;
            break;
            case "TwoPair":
                // Improves to ful house
                extraOuts = 4;
            break;
            case "OnePair":
                // Improves to two pair or three of a kind. Outs: (allCards.length - 2 ) * 3 (2 pair) | 2 (trio)
                extraOuts = ((allCards.length - 2) * 3) + 2;
            break;
        }
        outs = outs + extraOuts;
    }

    return outs;
}


// Can improve to a higher flush?
function canImproveToHigherFlush(allCards) {
    var len = allCards.length;
    var totalSuited = 0;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isSuited(allCards[i], allCards[j])) ) {
                totalSuited ++;
            }
        }
        if (totalSuited >= 4) {
            // Get the suit of the card
            var chosenSuit = getCardSuit(allCards[i]);
            var biggerCard = allCards[i];
            // Check the bigger among all suited cards
            for (var j=0; j< len; j++) {
                if ( (i != j) && (isSuited(biggerCard, allCards[j])) ) {
                    if (getCardNumber(biggerCard) < getCardNumber(allCards[i]))
                        biggerCard = sortedcards[i];
                }
            }
            // How many positions can be improved??
            var chancesToImprove = 14 - getCardNumber(biggerCard);
            return chancesToImprove;
        } else {
            totalSuited = 0;
        }
    }
    return 0;
}


// Checks whether the highest card is the Ace or not (so the hand can be improved)
function canImproveToHigherStraight(allCards) {
    var biggerCard;
    var len = allCards.length;
    // First sort the array
    var sortedcards = allCards.slice();
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            // The first is the smallest
            if ( (i != j) && (getCardNumber(sortedcards[j]) < getCardNumber(sortedcards[i])) ) {
                biggerCard = sortedcards[i];
                sortedcards[i] = sortedcards[j];
                sortedcards[j] = biggerCard;
            }
        }
    }
    // Remove all the cards that are pair (same number)
    var sortedStripped = [];
    sortedStripped[sortedStripped.length] = sortedcards[0];
    for (var i=1; i< len; i++) {
        if (!isPair(sortedcards[i - 1], sortedcards[i])) {
            sortedStripped[sortedStripped.length] = sortedcards[i];
        }
    }
    // Now let's see if there are 5 or more cards that are correlative. Use 2 loops
    var newLen = sortedStripped.length;
    var totalConsecutive = 0;
    for (var i=0; i< newLen; i++) {
        if ( ((sortedStripped[i+1]) && (getGaps(sortedStripped[i], sortedStripped[i+1]) === 1))
            && ((sortedStripped[i+2]) && (getGaps(sortedStripped[i+1], sortedStripped[i+2]) === 1))
            && ((sortedStripped[i+3]) && (getGaps(sortedStripped[i+2], sortedStripped[i+3]) === 1))
            && ((sortedStripped[i+4]) && (getGaps(sortedStripped[i+3], sortedStripped[i+4]) === 1)) ) {
            if (getCardVal(sortedStripped[i]) !== 'A') {
                return true;
            }
        }
    }
}

// Is the hand holding a open ended straight draw?
function isOpenEndedStraightDraw(allCards) {
    var biggerCard;
    var len = allCards.length;
    // First sort the array
    var sortedcards = allCards.slice();
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            // The first is the smallest
            if ( (i != j) && (getCardNumber(sortedcards[j]) < getCardNumber(sortedcards[i])) ) {
                biggerCard = sortedcards[i];
                sortedcards[i] = sortedcards[j];
                sortedcards[j] = biggerCard;
            }
        }
    }
    // Remove all the cards that are pair (same number)
    var sortedStripped = [];
    sortedStripped[sortedStripped.length] = sortedcards[0];
    for (var i=1; i< len; i++) {
        if (!isPair(sortedcards[i - 1], sortedcards[i])) {
            sortedStripped[sortedStripped.length] = sortedcards[i];
        }
    }
    // Now let's see if there are 3 or more cards that are correlative. Use 2 loops
    var newLen = sortedStripped.length;
    var totalConsecutive = 0;
    for (var i=0; i< newLen; i++) {
        if ( ((sortedStripped[i+1]) && (getGaps(sortedStripped[i], sortedStripped[i+1]) === 1))
            && ((sortedStripped[i+2]) && (getGaps(sortedStripped[i+1], sortedStripped[i+2]) === 1))
            && ((sortedStripped[i+3]) && (getGaps(sortedStripped[i+2], sortedStripped[i+3]) === 1))) {
            return true;
        }
    }
}

// Is the hand holding a inside straight draw?
function isInsideStraightDraw(allCards) {
    var biggerCard;
    var len = allCards.length;
    // First sort the array
    var sortedcards = allCards.slice();
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            // The first is the smallest
            if ( (i != j) && (getCardNumber(sortedcards[j]) < getCardNumber(sortedcards[i])) ) {
                biggerCard = sortedcards[i];
                sortedcards[i] = sortedcards[j];
                sortedcards[j] = biggerCard;
            }
        }
    }
    // Remove all the cards that are pair (same number)
    var sortedStripped = [];
    sortedStripped[sortedStripped.length] = sortedcards[0];
    for (var i=1; i< len; i++) {
        if (!isPair(sortedcards[i - 1], sortedcards[i])) {
            sortedStripped[sortedStripped.length] = sortedcards[i];
        }
    }
    // Now let's see if there are 4 or more cards that are almost correlative where 2 correlatives have 2 gaps (and the rest are consecutive). Use 2 loops
    var newLen = sortedStripped.length;
    var totalConsecutive = 0;
    for (var i=0; i< newLen; i++) {
        if ( ((sortedStripped[i+1]) && (getGaps(sortedStripped[i], sortedStripped[i+1]) < 3))
            && ((sortedStripped[i+2]) && (getGaps(sortedStripped[i+1], sortedStripped[i+2]) < 3))
            && ((sortedStripped[i+3]) && (getGaps(sortedStripped[i+2], sortedStripped[i+3]) < 3))) {
            // In case the total gap count is just 5 (A-B-_-C-D) there's a inside straight draw
            var gapSum = getGaps(sortedStripped[i], sortedStripped[i+1]) 
                + getGaps(sortedStripped[i+1], sortedStripped[i+2])
                + getGaps(sortedStripped[i+2], sortedStripped[i+3]);
            if (gapSum === 4) {
                return true;
            }
        }
    }
}

// Is the hand holding a Flush DRAW?
function isFlushDraw(allCards) {
    var len = allCards.length;
    var totalSuited = 0;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isSuited(allCards[i], allCards[j])) ) {
                totalSuited ++;
            }
        }
        if (totalSuited >= 3) {
            return true;
        } else {
            // In case loose mode is "ON" 3 cards of the same suit are also fine and can be counted as "suited" draw
            if ((looseMode) && (totalSuited >= 2)) {
                return true;
            }
            totalSuited = 0;
        }
    }
}


// Calculates the outs for the flop
function getCurrentHand(allCards) {
    if (isStraightFlush(allCards))
        return "StraightFlush";
    else if (isFourOfAKind(allCards))
        return "FourOfAKind";
    else if (isFullHouse(allCards))
        return "FullHouse";
    else if (isFlush(allCards))
        return "Flush";
    else if (isStraight(allCards))
        return "Straight";
    else if (isThreeOfAKind(allCards))
        return "ThreeOfAKind";
    else if (isTwoPair(allCards))
        return "TwoPair";
    else if (isOnePair(allCards))
        return "OnePair";
    else return "HighCard";
}

// Puts all the cards in the array
function getAllCards() {
    var allCards = [];
    allCards[0] = cards.pocket[0];
    allCards[1] = cards.pocket[1];
    allCards[2] = cards.flop[0];
    allCards[3] = cards.flop[1];
    allCards[4] = cards.flop[2];
    if (cards.turn[0] && cards.turn[0] !== '') {
        allCards[5] = cards.turn[0];
        if (cards.river[0] && cards.river[0] !== '') {
            allCards[6] = cards.river[0];
        }
    }
    return allCards;
}

// Puts all the COMMON cards in the array
function getAllCommonCards() {
    var allCommonCards = [];
    allCommonCards[0] = cards.flop[0];
    allCommonCards[1] = cards.flop[1];
    allCommonCards[2] = cards.flop[2];
    if (cards.turn[0] && cards.turn[0] !== '') {
        allCommonCards[3] = cards.turn[0];
        if (cards.river[0] && cards.river[0] !== '') {
            allCommonCards[4] = cards.river[0];
        }
    }
    return allCommonCards;
}


// Is the hand holding a Straight Flush?
// It's important to notice that it has to look for the FLUSH
// And THEN use the cards FROM THE FLUSH (not all cards) to check if these cards are straight
function isStraightFlush(allCards) {
    // TODO: It's not that easy
    // return (isStraight(allCards) && isFlush(allCards)); // This is WRONG!!
    var len = allCards.length;
    var totalSuited = 0;
    for (var i=0; i< len; i++) {
        var suitedCards = []; // Array to store the suited cards
        suitedCards[suitedCards.length] = allCards[i];
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isSuited(allCards[i], allCards[j])) ) {
                totalSuited ++;
                suitedCards[suitedCards.length] = allCards[j];
            }
        }
        if (totalSuited >= 4) {
            if (isStraight(suitedCards)) {
                return true;
            }
        } else {
            totalSuited = 0;
        }
    }
}

// Is the hand holding four of a kind?
function isFourOfAKind(allCards) {
    var len = allCards.length;
    var card0, card1, card2;
    // First look for the position of 3 of a kind
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            for (var k=0; k< len; k++) {
                if ( (i != j) && (i != k) && (j != k) && (isPair(allCards[i], allCards[j])) && (isPair(allCards[i], allCards[k])) ) {
                    card0 = i;
                    card1 = j;
                    card2 = k;
                }
            }
        }
    }
    // Store the card value (any one of the 3 found, all are the same)
    var card3Times = allCards[card0];
    // Then Remove the previously found three cards and look for a pair among the remaining ones (comparing the card and the remainder)
    if (card0 || card1 || card2) {
        var tempCards = allCards.slice();
        tempCards.splice(card0,1);
        tempCards.splice(card1,1);
        tempCards.splice(card2,1);
        var newLen = tempCards.length;
        // Finally perform one more search looking for a pair between the remaining cards and the card that appears 3 times
        for (var i=0; i < newLen; i++) {
            if (isPair(card3Times, tempCards[i])) {
                return true;
            }
        }
    }
}

// Is the hand holding a Full House?
function isFullHouse(allCards) {
    var pair0, pair1, pair2;
    var len = allCards.length;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            for (var k=0; k< len; k++) {
                if ( (i != j) && (i != k) && (j != k) && (isPair(allCards[i], allCards[j])) && (isPair(allCards[i], allCards[k])) ) {
                    pair0 =i;
                    pair1 =j;
                    pair2 =k;
                }
            }
        }
    }
    // Remove the previously found three of a kind and look for a pair
    if (pair0 || pair1 || pair2) {
        var tempCards = allCards.slice();
        tempCards.splice(pair0,1);
        tempCards.splice(pair1,1);
        tempCards.splice(pair2,1);
        return isOnePair(tempCards);
    }
}

// Is the hand holding a Flush?
function isFlush(allCards) {
    var len = allCards.length;
    var totalSuited = 0;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isSuited(allCards[i], allCards[j])) ) {
                totalSuited ++;
            }
        }
        if (totalSuited >= 4) {
            return true;
        } else {
            totalSuited = 0;
        }
    }
}

// Is the hand holding a Straight?
function isStraight(allCards) {
    var biggerCard;
    var len = allCards.length;
    // First sort the array
    var sortedcards = allCards.slice();
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            // The first is the smallest
            if ( (i != j) && (getCardNumber(sortedcards[j]) < getCardNumber(sortedcards[i])) ) {
                biggerCard = sortedcards[i];
                sortedcards[i] = sortedcards[j];
                sortedcards[j] = biggerCard;
            }
        }
    }
    // Remove all the cards that are pair (same number)
    var sortedStripped = [];
    sortedStripped[sortedStripped.length] = sortedcards[0];
    for (var i=1; i< len; i++) {
        if (!isPair(sortedcards[i - 1], sortedcards[i])) {
            sortedStripped[sortedStripped.length] = sortedcards[i];
        }
    }
    // Now let's see if there are 5 or more cards that are correlative.
    var newLen = sortedStripped.length;
    var totalConsecutive = 0;
    for (var i=0; i< newLen; i++) {
        if ( ((sortedStripped[i+1]) && (getGaps(sortedStripped[i], sortedStripped[i+1]) === 1))
            && ((sortedStripped[i+2]) && (getGaps(sortedStripped[i+1], sortedStripped[i+2]) === 1))
            && ((sortedStripped[i+3]) && (getGaps(sortedStripped[i+2], sortedStripped[i+3]) === 1))
            && ((sortedStripped[i+4]) && (getGaps(sortedStripped[i+3], sortedStripped[i+4]) === 1)) ) {
            return true;
        }
    }
}

// Is the hand holding three of a kind?
function isThreeOfAKind(allCards) {
    var len = allCards.length;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            for (var k=0; k< len; k++) {
                if ( (i != j) && (i != k) && (j != k) && (isPair(allCards[i], allCards[j])) && (isPair(allCards[i], allCards[k])) ) {
                    return true;
                }
            }
        }
    }
}

// Is the hand holding two pairs?
function isTwoPair(allCards) {
    var pair0, pair1;
    var len = allCards.length;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isPair(allCards[i], allCards[j])) ) {
                pair0 = i;
                pair1 = j;
            }
        }
    }
    // Remove the previously found pair and look for a pair
    if (pair0 || pair1) {
        var tempCards = allCards.slice();
        tempCards.splice(pair0,1);
        tempCards.splice(pair1,1);
        return isOnePair(tempCards);
    }
}

// Is the hand holding a pair?
function isOnePair(allCards) {
    var len = allCards.length;
    for (var i=0; i< len; i++) {
        for (var j=0; j< len; j++) {
            if ( (i != j) && (isPair(allCards[i], allCards[j])) ) {
                return true;
            }
        }
    }    
}

// Function to store the pocket cards
function storePocketCards(chosenCard) {
    // The card was shadowed (de-select it)
    if (chosenCard.hasClass('shadowed')) {
        deselectPocketCard(chosenCard);
    // In case the card is not shadowed (not selected)
    } else {
        choseNewPocketCard(chosenCard);
    }

    // Show the cards
    showPocketCards();
    if (cards.pocket.length== 2) {
        jQuery('#calculatePreFlop').show(animationState);
    } else {
        jQuery('#calculatePreFlop').hide(animationState);
        jQuery("#percentajesPreFlop").hide(animationState);
        jQuery('#goFlop').hide(animationState);
    }
}

// Reset the background of a previously chosen card
function resetCardCss(cardPosition) {
        jQuery('#' + cardPosition).css('background-image','');
        jQuery('#' + cardPosition).css('background-position-x','');
        jQuery('#' + cardPosition).css('background-position-y','');
}

// Moves the game to another phase
function goToPhase(step) {
    phase = step;
    // Unbinds the click event to all shadowed cards
    jQuery(".shadowed").unbind('click');
    // Updates my position
    updateMyPos();
    switch(phase) {
        case 'preflop':
            jQuery("#calculateRiver").hide(animationState);
            jQuery("#goStart").hide(animationState);
            jQuery("#percentajesPreFlop").hide(animationState);
            jQuery("#percentajesFlop").hide(animationState);
            jQuery("#percentajesTurn").hide(animationState);
            jQuery("#percentajesRiver").hide(animationState);
            resetCardCss('pocket0');
            resetCardCss('pocket1');
            resetCardCss('flop0');
            resetCardCss('flop1');
            resetCardCss('flop2');
            resetCardCss('turn0');
            resetCardCss('river0');
            newHand();
            break;
        case 'flop':
            showMsgLog(msg[lang]["chooseFlopCards"]);
            jQuery("#goStart").show(animationState);
            jQuery("#calculatePreFlop").hide(animationState);
            jQuery("#goFlop").hide(animationState);
            jQuery("#flop0").addClass("card");
            jQuery("#flop1").addClass("card");
            jQuery("#flop2").addClass("card");
            break;
        case 'turn':
            showMsgLog(msg[lang]["chooseTurnCards"]);
            jQuery("#goStart").show(animationState);
            jQuery("#calculateFlop").hide(animationState);
            jQuery("#goTurn").hide(animationState);
            jQuery("#turn0").addClass("card");
            break;
        case 'river':
            showMsgLog(msg[lang]["chooseRiverCards"]);
            jQuery("#goStart").show(animationState);
            jQuery("#calculateTurn").hide(animationState);
            jQuery("#goRiver").hide(animationState);
            jQuery("#river0").addClass("card");
            break;
        default:
          // This should never happen
            break;
    }

}

// Shows a log message indicating the next action to take
function showMsgLog(messageToDisplay) {
    // Clear the message
    jQuery("#msgLog").hide();
    // Fill the message
    jQuery("#msgLog").html(messageToDisplay);
    // Fancy effect
    jQuery("#msgLog").hide(400);
    jQuery("#msgLog").show(animationState);
}

// Function to store the FLOP cards
function storeFlopCards(chosenCard) {
    // The card was shadowed (de-select it)
    if (chosenCard.hasClass('shadowed')) {
        deselectFlopCard(chosenCard);
    // In case the card is not shadowed (not selected)
    } else {
        choseNewFlopCard(chosenCard);
    }

    // Show the cards
    showFlopCards();
    if (cards.flop.length== 3) {
        jQuery('#calculateFlop').show(animationState);
    } else {
        jQuery('#calculateFlop').hide(animationState);
        jQuery('#goTurn').hide(animationState);
    }
}

// Function to store the TURN card
function storeTurnCard(chosenCard) {
    // The card was shadowed (de-select it)
    if (chosenCard.hasClass('shadowed')) {
        deselectTurnCard(chosenCard);
    // In case the card is not shadowed (not selected)
    } else {
        choseNewTurnCard(chosenCard);
    }
    // Show the cards
    showTurnCard();
    if (cards.turn.length== 1) {
        jQuery('#calculateTurn').show(animationState);
    } else {
        jQuery('#calculateTurn').hide(animationState);
        jQuery('#goRiver').hide(animationState);
    }
}

// Function to store the TURN card
function storeRiverCard(chosenCard) {
    // The card was shadowed (de-select it)
    if (chosenCard.hasClass('shadowed')) {
        deselectRiverCard(chosenCard);
    // In case the card is not shadowed (not selected)
    } else {
        choseNewRiverCard(chosenCard);
    }
    // Show the cards
    showRiverCard();
    if (cards.river.length== 1) {
        jQuery('#calculateRiver').show(animationState);
    } else {
        jQuery('#calculateRiver').hide(animationState);
        jQuery('#goStart').hide(animationState);
    }
}


// Function to store the card depending on the phase
function storeCard(chosenCard) {
    switch(phase) {
        case 'preflop':
          storePocketCards(chosenCard);
          break;
        case 'flop':
          storeFlopCards(chosenCard);
          break;
        case 'turn':
          storeTurnCard(chosenCard);
          break;
        case 'river':
          storeRiverCard(chosenCard);
          break;
        default:
          break;
    }
}

// Slides the cards zone to show the propper cards area
function slideCards(pos){
    // Caution I don't need an object but the value
    var posStr = pos + "";
    switch(posStr){
        case "1":
            display("A");
            break;
        case "2":
            display("K");
            break;
        case "3":
            display("Q");
            break;
        case "4":
            display("J");
            break;
        case "5":
            display("T");
            break;
        case "6":
            display("9");
            break;
        case "7":
            display("8");
            break;
        case "8":
            display("7");
            break;
        case "9":
            display("6");
            break;
        case "10":
            display("5");
            break;
        case "11":
            display("4");
            break;
        // This case is not used (the minimum are 3 cards shown)
        case "12":
            display("3");
            break;
    }
}

// Displays a card and the next one. Also hides the card above the chosen one
function display(card){
    // First hide all cards before my current card
    var cardsDescending = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    var i=0;
    for (; card != cardsDescending[i]; i++) {
        hideScrollingCards(cardsDescending[i]);
    }
    // Then show all the cards up starting on the selected one
    for (; i < cardsDescending.length; i++) {
        showScrollingCards(cardsDescending[i]);
    }

}

// Shows all the scrolling cards
function showScrollingCards(card) {
    jQuery("#S"+card).show();
    jQuery("#H"+card).show();
    jQuery("#D"+card).show();
    jQuery("#C"+card).show();
}

// Hides a card and all the previous ones
function hideScrollingCards(card) {
    jQuery("#S"+card).hide();
    jQuery("#H"+card).hide();
    jQuery("#D"+card).hide();
    jQuery("#C"+card).hide();
}

// Start the slider
jQuery(function(){
	// Slider
	jQuery('#slider').slider({
        min: 1,
        max: 11,
        animate: true,
        slide: function(event, ui) { 
            slideCards(ui.value);
        }
	});
});


//////////////////////////////////////////////////////////////////////////////////////
//This is to attach mouse events to tap events (for iDevices and Android devices)
//////////////////////////////////////////////////////////////////////////////////////

// Code from: http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/

function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";

     switch(event.type) {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type="mousemove"; break;        
        case "touchend":   type="mouseup"; break;
        default: return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //           screenX, screenY, clientX, clientY, ctrlKey,
    //           altKey, shiftKey, metaKey, button, relatedTarget);
    
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                              first.screenX, first.screenY,
                              first.clientX, first.clientY, false,
                              false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

// Fixes the slider behaviour attaching touch events to it
function initSlider() {
    // Just in case the element is shown
    if (document.getElementById("roundedSlider")) {
        document.getElementById("roundedSlider").addEventListener("touchstart", touchHandler, true);
        document.getElementById("roundedSlider").addEventListener("touchmove", touchHandler, true);
        document.getElementById("roundedSlider").addEventListener("touchend", touchHandler, true);
        document.getElementById("roundedSlider").addEventListener("touchcancel", touchHandler, true);
        jQuery("#smallDevicesText").html(msg[lang]["smallDeviceScroll"]);
    }
}


/*********************************************************
    This is just to start everything after all the load
*********************************************************/

// Start everything at the end
jQuery(document).ready(function() {
    // Starts a new Hand after everything is ready
    newHand();
    initSlider();
});
