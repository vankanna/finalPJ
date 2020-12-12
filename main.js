// Global Variables
var config = {
    sprite_x: 32,
    sprite_y: 32,
}
var racers = [];
var winners = [];
var track_length;
var raceOver = true;

var funds = 100;
var bet = [];
var bet_multiplier = 2;
var box = false;


$(document).ready(function () {
    setup();

    track_length = $("#track").width();

    $("#reset").click(function () {
        resetGame();
    })

    $("#box-bet").click(function () {
        if(bet.length > 1) {
            box = box ? false : true;
            updateUI();
        }
    });

    $("#clear-bet").click(function () {
        bet = [];
        box = false;
        updateUI();
    })

    $("#place-bet").click(function () {
        if (bet.length !== 0) {
            funds -= calculateBetCost();
            updateUI();
            raceOver = false;
            gameLoop();
        }
    })
})

// Racer creation code

function getRandomAttribute(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;

}

function generateRacers(numberOfRacers) {
    var offset = 0;
    for (var i = 0; i < numberOfRacers; i++) {
        
        racers.push(createRacer(i,offset));
        offset += config.sprite_y;
    }
}

function createRacer(id, position_y) {
    var racer = {
        id: id,
        speed: getSpeed(),
        enduranceMeter: 0,
        pos_x: 0,
        pos_y: position_y
    };

    racer.endurance = getEndurance(racer.speed);
    racer.behavior = getBehavior(racer.speed, racer.endurance);
    racer.animal_type = getAnimalType();
    racer.speedModifier = 0;
    racer.finsihed = false;
    racer.odds = getOdds(racer.speed, racer.endurance);
    return racer;
}

function getSpeed() {
    return getRandomAttribute(4,10);
}

// Endurance needs to be balanced based on the speed
function getEndurance(speed) {

    if (speed <= 5) {
        return getRandomAttribute(4, 10)
    } else if (speed <= 7) {   
        return getRandomAttribute(2, 7);
    } else if (speed <=9) {
        return getRandomAttribute(1, 2)
    } else {
        return getRandomAttribute(1, 1)

    }
}

function getOdds(speed, endurance) {
    return (parseFloat(endurance / speed * 2)).toFixed(2);
}

function getRecoverRate(endurance) {
    return getRandomAttribute(endurance / 2, endurance * 2)
}

function getBehavior(speed, endurance) {
    return `speed: ${speed} - endurance: ${endurance}`;
}

function getAnimalType() {
    return 'test animal'
}


// character movement code

function calculateNewPosition (racer) {

    if (racer.pos_x >= track_length - config.sprite_x) {
        racer.pos_x = track_length - config.sprite_x;
        if(!racer.finished) {
            racer.finished = true;
            winners.push(parseInt(racer.id) + 1);
            if(winners.length <= bet.length) {
                $("#winners").text(winners.join(" "))
            }
        }
    } else {

        if ( racer.pos_x < track_length / 4) {
        
    // } else if (racer.pos_x > track_length / 2 && racer.pos_x > (track_length / 4) * 3) {
        } else if (racer.pos_x < track_length / 5) {

            if (racer.speed > 8) {
                racer.speedModifier -= .25;
            } else if ( racer.speed > 6) {
                racer.speedModifier -= .000;
            } else {
                racer.speedModifier += .02;
            }
            // 4's need some extra help
            if (racer.speed === 4 && getRandomAttribute(0, racer.endurance)) {
                racer.speedModifier += .5
            }
        } else if (racer.pos_x < (track_length / 4) * 4) {

            if (racer.speed >= 8) {
                racer.speedModifier -= .4;
            } else if ( racer.speed >= 6) {
                racer.speedModifier -= .005;
            } else {
                racer.speedModifier += .03;
            }

            if (racer.speed < 5 && getRandomAttribute(0, racer.endurance)) {
                racer.endurance += 10;
                racer.speedModifier += 3.5;
            }
        }

        if ((racer.speed + racer.speedModifier) < 0 ) {
            racer.speedModifier = racer.speedModifier / 1.5
        }

        if ( (racer.speed + racer.speedModifier) > 10 ) {
            racer.speedModifier = racer.speedModifier / 2
        }

        var scaler = 0;
        if (racer.speed >= 8 && getRandomAttribute(0, racer.endurance) === 0) {
            scaler = racer.speedModifier;
        }

        if (racer.speed < 8 && getRandomAttribute(0, racer.endurance) !== 0) {
            scaler = racer.speedModifier;
        }
        
        racer.pos_x  = Math.round( racer.pos_x + getRandomAttribute( 4, racer.speed + scaler) );
    }
}

function isRaceOver(racers) {
    raceOver = true;
    for ( var i = 0; i < racers.length; i++ ) {
        if (racers[i].pos_x !== track_length - config.sprite_x) {
            raceOver = false;
        }
    }
}

function placeRacer (id, racer) {
    $("#"+id).css({top: racer.pos_y, left: racer.pos_x})
    $("#"+id).text(`${racer.id + 1}`);
}

function placeRacers(racers) {
    var track = $("#track");
    track.empty()
    for ( var i = 0; i < racers.length; i++ ) {
        track.append(
            `<div class="racer" id="${i}"></div>`
        )
        placeRacer(i, racers[i])
    }
}

function moveRacers(racers) {
    for (var i = 0; i < racers.length; i++ ) {
        calculateNewPosition(racers[i]);
        placeRacer(i, racers[i]);
    }
}

function gameLoop(count) {
        isRaceOver(racers)
        if (!raceOver) {
            moveRacers(racers);
            setTimeout( function() { 
                gameLoop();
            }, 50);
        } else {
            calculateWinnings();
        }
    
}

function resetGame() {
            $("#racer-specs").empty();
            winners = [];
            $("#winners").text("")

            racers = [];
            setup();
}

// Display stuff

function createSpeedBar(speed) {
    var color = "#999"

    return `
        <span class="bar" style="width: ${speed}0%; background-color: ${color};"></span>
    `
}

function createEnduranceBar(endurance) {
    var color = "#999"

    return `
        <span class="bar" style="width: ${endurance}0%; background-color: ${color};"></span>
    `
}

function generateCard(racer) {
    return `
    <div class="card" id="card_${racer.id}">
        <div class="animal">
            ${racer.id + 1}
        </div>
        <div class="speed">
            <span>Speed</span>
            ${createSpeedBar(racer.speed)}
        </div>
        <div class="endurance">
            <span>Endurance</span>
            ${createEnduranceBar(racer.endurance)}
        </div>
        <div class="odds">
        <span>Payout: <span>
            ${racer.odds}
        </div>
    </div
    `
}

function generateCards (racers) {
    for (var i = 0; i < racers.length; i++) {
        $("#racer-specs").append(generateCard(racers[i]));
    }
}

function calculateBetCost () {
    var boxPrice = 2;

    if(box) {
        for (var i = 0; i < bet.length; i++) {
            boxPrice *= 2;
        }
        return boxPrice;
    }
    return bet.length * 2;
}

function calculateWinnings() {
    var winArr = winners.slice(0,bet.length)
    if (box) {
        if (bet.sort().join("") === winArr.sort().join("")) {
            funds = (parseFloat(funds) + calculatePayout()).toFixed(2); //should be odds divide by 2 because of box
        }
    } else {
        // need ods
        if (bet.join("") === winArr.join("")) {
            funds = (parseFloat(funds) + calculatePayout()).toFixed(2);
        }
    }
    bet = [];
    box = false;
    updateUI();
}

function calculatePayout() {
    var payout = 1.00;
    for (var i = 0; i < bet.length; i++) {
        //
        var winner = parseInt(winners[i]) - 1;
        payout *= (parseFloat(racers[winner].odds) * 2);
        // give user 2 bucks per "bet" after odds
        
        payout += 2;
    }

    return payout;
}

function updateUI() {
    $("#funds p").text('$' + funds);
    $("#bet p").text(bet.join("/"));
    $("#bet-cost p").text("$" + calculateBetCost());
}


function setup() {
    raceOver = true;
    updateUI();
    generateRacers(8);
    placeRacers(racers);
    generateCards(racers);
    $(".card").click(function () {
        var id = $(this).attr("id");
        var parsedId = parseInt(id[id.length - 1]) + 1;
        if (!bet.includes(parsedId)) {
            bet.push(parsedId);
            updateUI();
        }

    })
}

