let gameboard = [];
let amountOfLayers = 0;

function printGameboard() {
    var printString = "";
    for (let node of gameboard) {
        if (node.place == 1) {
            let buffLength = 6 - node.layer;
            printString += ".";
            for (let i = 0; i < buffLength; i++) printString += " ";
        }

        printString += " "
        if (node.containsPin) {
            printString += "*";
         } else {
            printString += "O";
         }

        if (node.layer == node.place) printString += "\n";
    }

    console.log(printString);
}

class Node {
    /*
    the game looks like this where '*' are pins and 'O' are empty:
    LAYER:
    1          *
    2         * *
    3        * O *
    4       O * * *
    5      * * * * O

    (the * and O s are placed randomly)
    to find where a node is it will contain a layer and place variable, the layer is the layer it is on and the place is the number of places left of it +1
    so for example the first pin on layer 5 would be labeled as l5p1
    */

    constructor(layer, place) {
        this.containsPin = true;
        this.layer = layer;
        this.place = place;
        this.location = "l" + this.layer + "p" + this.place;
    }
    removePin() {
        this.containsPin = false;
    }
    placePin() {
        this.containsPin = true;
    }
}

function getNodeByLocation(layer, place) {
    for (index in gameboard) {
        let node = gameboard[index];
        if (node.layer == layer && node.place == place) return node;
    }
    return null;
}

function addNeighbours(layer, place) {
    let neighbors = [];
    for (let i = -1; i <= 1; i++) {
        if (i == -1) {
            neighbors.push({layer:layer-1, place:place-1});
            neighbors.push({layer:layer-1, place:place});
        } else if (i == 0) {
            neighbors.push({layer:layer, place:place-1});
            neighbors.push({layer:layer, place:place+1});
        } else {
            neighbors.push({layer:layer+1, place:place});
            neighbors.push({layer:layer+1, place:place+1});
        }
    }
    return neighbors.filter((value) => 
        { return value.layer >= 1 && value.layer <= amountOfLayers && value.place >= 1 && value.place <= value.layer});
}

function findNeighbouringPins(layer, place) {
    let neighbouringPins = addNeighbours(layer, place);
    return neighbouringPins.filter((neighbor) => {
            let node = getNodeByLocation(neighbor.layer, neighbor.place);
            return node.containsPin;
        });
}

function findPossiblePinMoves(pin) {
    let possibleMoves = [];

    let neighbors = findNeighbouringPins(pin.layer, pin.place);
    neighbors.forEach((value, index, array) => {
        let layerOffset = value.layer - pin.layer;
        let placeOffset = value.place - pin.place;
        let to_pin = getNodeByLocation(value.layer + layerOffset, value.place + placeOffset);
        if (to_pin && !to_pin.containsPin) {
            let eaten_pin = getNodeByLocation(value.layer, value.place);
            possibleMoves.push({from:pin, to:to_pin, eaten:eaten_pin});
        }
    });

    return possibleMoves;
}

// finds all possible moves from an empty node
function findPossibleMoves(layer, place) {
    let possibleMoves = [];
    let neighbouringPins = findNeighbouringPins(layer, place);

    // check for each neighbor if it has a neighbor that can jump him into the empty position
    neighbouringPins.forEach((value, index, array) => {
        let layerOffset = value.layer - layer;
        let placeOffset = value.place - place;
        let from_node = getNodeByLocation(value.layer + layerOffset, value.place + placeOffset);
        if (from_node && from_node.containsPin) {
            let to_node = getNodeByLocation(layer, place);
            let eaten_node = getNodeByLocation(value.layer, value.place);
            possibleMoves.push({from: from_node, to: to_node, eaten: eaten_node});
        }
    });

    return possibleMoves;
}

function findEmptyNodes() {
    let emptyNodes = [];
    for (let node of gameboard)
        if (!node.containsPin)
            emptyNodes.push(node);

    return emptyNodes;
}

function solve(depth) {
    if (depth > 50) {console.log(depth); return null;}

    // let emptyNodes = findEmptyNodes();
    // // only 1 pin left
    // if (emptyNodes.length == gameboard.length - 1) {console.log(depth); return [];}

    // if (depth == 0) printGameboard();

    // for (let emptyNode of emptyNodes) {
    //     if (depth == 0) console.log("trying empty node: " + emptyNode.location);
    //     let possibleMoves = findPossibleMoves(emptyNode.layer, emptyNode.place);
    //     for (let move of possibleMoves) {
    //         // make move
    //         move.from.removePin();
    //         move.to.placePin();
    //         move.eaten.removePin();

    //         // check recursively
    //         let result = solve(depth+1);
            
    //         // reset board
    //         move.from.placePin();
    //         move.to.removePin();
    //         move.eaten.placePin();

    //         if (result != null) {
    //             printGameboard();
    //             console.log(depth);
    //             result.unshift(move);
    //             return result;
    //         }
    //     }
    // }

    let noOfEmptyPins = 0;
    for (let pin of gameboard) {
        if (!pin.containsPin) {
            noOfEmptyPins += 1;
        } else {
            let possibleMoves = findPossiblePinMoves(pin);
            for (let move of possibleMoves) {
                // make move
                move.from.removePin();
                move.to.placePin();
                move.eaten.removePin();

                // check recursively
                let result = solve(depth+1);
                
                // reset board
                move.from.placePin();
                move.to.removePin();
                move.eaten.placePin();

                if (result != null) {
                    result.unshift(move);
                    return result;
                }
            }
        }
    }

    if (noOfEmptyPins == gameboard.length -1) return [];

    return null;
}

// let solutions = [];

// function startSolving() {
//     for (let node of gameboard) {
//         node.removePin();
//         //printGameboard();
//         let result = solve(0);
//         if (result) {
//             let solution = {removedPin: node, steps: result};
//             solutions.push(solution);
//         }
//         node.placePin();
//     }
// }

function createGame(aol) {
    amountOfLayers = aol;
    // construct game:
    for (let layer = 1; layer <= amountOfLayers; layer++) {
        for (let place = 1; place <= layer; place++) {
            let node = new Node(layer, place);
            gameboard.push(node);
        }
    }
}


// function main() {
//     createGame(5);
//     console.log(gameboard);

//     startSolving();
//     if (solutions.length != 0) {
//         console.log(solutions);
//     }

//     localStorage['solutions'] = JSON.stringify(solutions);
// }

//createGame(5);
//console.log(gameboard);

// var cachedResult = localStorage['solutions'];
// if (cachedResult) {
//     solutions = JSON.parse(cachedResult);
// } else {
//     main();
// }
