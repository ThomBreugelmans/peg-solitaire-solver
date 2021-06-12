let generateGameButton = document.getElementById("generateGameButton");
let gameSizeInput = document.getElementById("gameSizeInput");
let showNextMove = document.getElementById("nextmove");
let nextMoveButton = document.getElementById("nextmovebutton");
let giveSolutionButton = document.getElementById("givesolution");

nextMoveButton.disabled = true;
giveSolutionButton.disabled = true;

generateGameButton.onclick = function() {
    generateGameButton.disabled = true;
    gameSizeInput.disabled = true;

    let gamesize = gameSizeInput.value;

    let gameContainer = document.querySelector(".gameboard");

    // generate game
    createGame(gamesize);
    for (let layer = 1; layer <= gamesize; layer++) {
        let row = document.createElement("div");
        row.classList.add("pinrow");
        row.id = "row" + layer;
        for (let place = 1; place <= layer; place++) {
            let pin = document.createElement("div");
            pin.classList.add("pin");
            pin.id = "l" + layer + "p" + place;
            let pinSize = Math.round(300 / gamesize);
            pin.style.height = pinSize + "px";
            pin.style.width = pinSize + "px";
            let margin = Math.round(150 / gamesize - 1);
            pin.style.margin = margin + "px";
            pin.style.marginTop = Math.round(200 / gamesize) + "px";
            pin.style.marginBottom = "0px";
            row.appendChild(pin);
        }
        gameContainer.appendChild(row);
    }

    
    
    let allPins = document.getElementsByClassName('pin');
    
    let removeFirstPin = true;
    let selectedPin = undefined;
    let moves = [];
    
    function removePin(el, pin) {
        pin.removePin();
        el.style.backgroundColor = "saddleBrown";
    }
    function placePin(el, pin) {
        pin.placePin();
        el.style.backgroundColor = "whitesmoke";
    }

    let solution = undefined;
    let nextStep = undefined;
    let currentPos = 1;

    function advanceSolutionMove() {
        if (currentPos == solution.length) {
            showNextMove.innerHTML = "Congratulations!";
            nextMoveButton.disabled = true;
            giveSolutionButton.disabled = true;
            giveSolutionButton.onclick = function() {};
        } else {
            nextStep = solution[currentPos];
            currentPos += 1;
            showNextMove.innerHTML = "Next move pin from location " + nextStep.from.location + " to " + nextStep.to.location;
        }
    }
    
    function onPinClick(el) {
        
        
        for (let p of allPins) p.style.boxShadow = "none";
        
        let pin = undefined;
        for (let node of gameboard) if (node.location === el.id) pin = node;
        
        let pinIsPossibleMove = false;
        let correspondingMove = undefined;
        for (let move of moves) if (move.to == pin) { pinIsPossibleMove = true; correspondingMove = move; }
        
        if (removeFirstPin) {
            removeFirstPin = false;
            removePin(el, pin);
            
            giveSolutionButton.onclick = function() {findSolutionOnClick();};
            giveSolutionButton.disabled = false;
        } else if (selectedPin != pin && pinIsPossibleMove) {
            placePin(el, pin);
            removePin(document.getElementById(correspondingMove.from.location), correspondingMove.from);
            removePin(document.getElementById(correspondingMove.eaten.location), correspondingMove.eaten);
            
            if (nextStep && selectedPin == nextStep.from && pin == nextStep.to) {
                advanceSolutionMove();
            } else {
                showNextMove.innerHTML = "";
                nextMoveButton.disabled = true;
                nextMoveButton.onclick = function() {};
            }

            selectedPin = undefined;
            moves = [];
        } else if (selectedPin != pin && pin.containsPin) {
            selectedPin = pin;

            moves = findPossiblePinMoves(pin);
            el.style.boxShadow = "0px 0px 10px 10px green";
            for (let move of moves) document.getElementById(move.to.location).style.boxShadow = "0px 0px 10px 10px yellow";
        } else {
            selectedPin = undefined;
            moves = [];
        }
    }
    
    for (let pin of allPins) {
        pin.onclick = function() {onPinClick(pin);};
    }
    
    
    function displayNextMove() {
        placePin(document.getElementById(nextStep.to.location), nextStep.to);
        removePin(document.getElementById(nextStep.from.location), nextStep.from);
        removePin(document.getElementById(nextStep.eaten.location), nextStep.eaten);
       
        advanceSolutionMove();
    }
    
    async function findSolutionOnClick() {    
        let result = solve(0);
        currentPos = 1;
        if (result) {
            solution = result;
            nextMoveButton.disabled = false;
            nextMoveButton.onclick = function() {displayNextMove();};
            nextStep = solution[0];
            showNextMove.innerHTML = "Next move pin from location " + nextStep.from.location + " to " + nextStep.to.location;
        } else {
            nextMoveButton.disabled = true;
            showNextMove.innerHTML = "could not find solution for this layout :'(";
            showNextMove.disabled = true;
        }
        console.log(result);
    }
    
};