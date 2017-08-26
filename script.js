/*
    This is a script I used to simulate a battle between two small groups, each made up of archers and footmen.
*/


/*
    Process:

    1. Decide on how many archers and footmen each player has, and adjust the base stats for these units
    2. Each created unit gets added to the "allTheUnits" array once per point of speed. Faster units are more likely to attack, so they get added more times. 
       Ex: Archers have a speed of 8; add 8 times.
    2. Each created unit also gets added once to either a p1 or a p2 array. These arrays keep track of which units are still alive.
    3. Draw a unit from the allTheUnits array. Units with more speed are more common, and more likely to get picked. This is our attacking unit.
    3. Determine the picked unit's owner (unit.player) and randomly pick a unit from the opposing player's array (either p1[] or p2[]). This is our defending unit.
    4. Calculate the damage damage:
        - damage = attacker.str - defender.armor
        - however, if an archer attacks a footman, we ignore the armor (by adding it back to damage)
    5. Reduce the defender's HP by damage dealt
    6. Check if defender is dead (HP <=0)
        - if dead, remove from the allTheUnits array so the unit doesn't get picked, and the corresponding player array.
    7. Repeat until either the p1 or p2 array length is 0 (it has no more units)
    8. If one of the players has lost (has no more units), increment the win counter for the other player. Repeat a designated number of times (set by the runs variable.)
*/

var unitContainer = [];             // this array will store unit object for the game setup

var allTheUnits = [];               // This array tracks units by speed - units with higher speed will be added (and picked) more often
var p1 = [];                        // these arrays keeps track of p1 and p2 units that are alive (hp >= 0)
var p2 = [];

var p1wins = 0;                     // these variables track win rates for Players 1 and 2 - this is especially useful for multiple runs
var p2wins = 0; 

var runs = 100;                     // this is how many times we want to simulate the battle
var completion;                     // this will help us track what % of the battles are completed (helpful for many runs)


/* SETUP AND UNIT DATA - edit this for playtesting */

function Unit(id, type, player, strength, armor, speed, hp){             // Unit constructor
    this.id = id;
    this.type = type;
    this.player = player;
    this.strength = strength;
    this.armor = armor;
    this.speed = speed;
    this.hp = hp
}

var archerStats = {                                   // base stats for the Archer unit. Edit these for playtesting!
    strength: 5,                                      // strength - armor is how much damage a unit deals when it attacks
    armor: 1,                                         // armor lowers damage. archers ignore footman armor on attack, but also suffer poor armor themselves
    speed: 4,                                         // speed determines how often a unit goes - units with higher speed are more frequently added to the allTheUnits array and more likely to get picked 
    hp: 10  
}

var footmanStats = {                                  // base stats for the Footman unit. Edit these for playtesting!
    strength: 5,
    armor: 3, 
    speed: 3,
    hp: 10
}

var playerUnitCount = [                               // this array lets us decide how many footmen or archers each player has. Adjust the count #s for playtesting!
    {
        player: 1,
        type: "footman",
        count: 0      
    },
    {
        player: 1,
        type: "archer",
        count: 1
    },
    {
        player: 2,
        type: "footman",
        count: 1
    },
    {
        player: 2,
        type: "archer",
        count: 0
    }
]
       

/* BATTLE FUNCTIONS */

/* this function cycles through the count in the playerUnitCount array we set up above and calls the Unit constructor to create the units that'll be battling */        

function createUnits(callback){                                                     // we want to make sure we don't do anything until all the units are created

    getBaseStats();                                                                 // get the updated base stats from the view

    for(var i = 0; i < playerUnitCount.length; i++){                                // cycle through the playerUnitCount array
        if(playerUnitCount[i].count > 0){                                           // each object in playerUnitCount has a unit count. 
            for(var j = 0; j < playerUnitCount[i].count; j++){                      // If count > 0, we want to create this many units. So, we cycle from 0 up to the count value.

                var unit;                                                           // placeholder for the unit we'll be creating.

                if(playerUnitCount[i].type == "footman" || playerUnitCount[i].type == "archer"){            // let's make sure our unit is either an archer of a footman
                    if (playerUnitCount[i].type == "footman"){
                        unit = footmanStats;                                                                // our placeholder unit either grabs the archer or the footman stats
                    } else if (playerUnitCount[i].type == "archer") {
                        unit = archerStats;
                    }

                    // call the constructor and create the unit. ID is set by unitContainer.length - the array  is empty, 
                    // so the ID value start at 0, and increments by one each time a unit is added 

                    var newUnit = new Unit(unitContainer.length, playerUnitCount[i].type, playerUnitCount[i].player, unit.strength, unit.armor, unit.speed, unit.hp);
                    
                    // add the nrewly created unit to the unitContainer array
                    unitContainer.push(newUnit); 

                } else {
                    console.log("This unit type is invalid: " + playerUnitCount[i]);
                }
            }
        }
    }

    callback(); // once all the units are created, proceed

}



function assignUnits(){                                         // call the function to create units, passing it this callback...    

    allTheUnits = [];
    p1 = [];
    p2 = [];

    for(var i = 0; i < unitContainer.length; i++){                          // for each unit added to unitContainer

        for(var j = 0; j < unitContainer[i].speed; j++){                    // push this unit into the allTheUnits array as many times as its speed is
            allTheUnits.push(unitContainer[i])
        }

        if(unitContainer[i].player == 1){                                   // if this unit belongs to Player 1, add it to p1[] once
            p1.push(unitContainer[i]);
        }

        if(unitContainer[i].player == 2){                                   // if this unit belongs to Player 2, add it to p2[] once
            p2.push(unitContainer[i]);
        }

    };

    unitContainer = [];

}

function battle(allTheUnits, p1, p2){                                                       // this function runs one step the battle by picking an attacking unit, a defending unit, and deadling damage

    if(p1.length > 0 && p2.length > 0){                                                     // only run if both players still have a unit left

        var attacker = allTheUnits[Math.floor(Math.random()*allTheUnits.length)];           // pick an attacking unit at random from the allTheUnits array
        var defender;                                                                       // placeholder variables
        var damage;

        if (attacker.player == 1){
            defender = p2[Math.floor(Math.random()*p2.length)];                             // pick a defending unit from the opposing team
        } else if (attacker.player == 2){
            defender = p1[Math.floor(Math.random()*p1.length)];
        }

/*        console.log("Attacker player: " + attacker.player + ", type " + attacker.type + ", id: " + attacker.id);
        console.log("Defender: player" + defender.player + ", type " + defender.type + ", id: " + defender.id);
        console.log("Attacker HP: " + attacker.hp);
        console.log("Defender HP: " + defender.hp);
*/
        damage = attacker.strength - defender.armor;                                 // calculate damage

        if(attacker.type == "archer"){                                          // if the attacker is an archer, we ignore armor by adding it back to the damage
            damage += defender.armor;
        } 

        defender.hp -= damage;                                                  // deal the damage  to the defender
/*
        console.log("Defender new HP: " + defender.hp);
        console.log("---");*/


        if(defender.hp <= 0){                                                   // check if the defender is dead; if so, remove from arrays

/*            console.log("A UNIT IS DEAD: " + defender.player);*/

            allTheUnits = allTheUnits.filter(function(unit){                    // remove the unit from the allTheUnits array by filtering
                return unit.id != defender.id;
            })
            
            if(defender.player == 1){                                           // remove the unit either from p1 or p2 array
                p1 = p1.filter(function(unit){
                    return unit.id != defender.id;
                })
            } else if(defender.player == 2){
                p2 = p2.filter(function(unit){
                    return unit.id != defender.id;
                })


            }
        }

        if(p1.length > 0 && p2.length > 0){                                    // if both the p1 and p2 array still have units, run the function again until no units are left on one side
            
            battle(allTheUnits, p1, p2);
        } else {
            if(p1.length <= 0){                                                 // if one of the players runs out of units (loses the battle), increment the win counter for the other player
                p2wins++;
            } else if(p2.length <= 0){
                p1wins++;
            }

            var completion = ((p1wins + p2wins)/runs)*100;                      // calculate what percentage of battles has been complete

            if (completion%5 == 0) {                                            // print every 5% (this is helpful when running a lot of battles)
                console.log("Percent complete: " + completion);
            }

        }

    } 
}



/* VIEW SETUP */



/* RUN THE SIMULATION*/
document.getElementById("run").addEventListener("click", function(){
    runSimulation();
});


function runSimulation(){

    runs = parseInt(document.getElementById("runs").innerHTML)




    for(var i = 0; i < runs; i++){

        allTheUnits = [];
        p1 = [];
        p2 = [];

        createUnits(assignUnits);
        
        if(p1.length > 0 && p2.length > 0){               // if both players have units, run the battle the preset number of times
            battle(allTheUnits, p1, p2);
        } else {
            console.log("One of the players has no units");
        }
    }

    /* we need to empty out the unit array so that we work with the correct units next time */
    unitContainer = [];


    updateStats(p1wins, p2wins);
    completion = p1wins = p2wins = 0;

}



var counts = document.getElementsByClassName("count");

for(var i = 0; i < counts.length; i++){
    counts[i].addEventListener("click", function(){
        setRuns(parseInt(this.dataset.count));
    });
}


var increments = document.getElementsByClassName("increment");

for(var i = 0; i < increments.length; i++){
    increments[i].addEventListener("click", function(){
        changeStat(this, "increment");
    });
}

var decrements = document.getElementsByClassName("decrement");

for(var i = 0; i < decrements.length; i++){
    decrements[i].addEventListener("click", function(){
        changeStat(this, "decrement");
    });
}




function changeStat(element, direction){

    var parent = element.parentNode.dataset.type

    var change;

    if(direction == "decrement"){
        console.log("decrementing");
        change = -1;
    } else {
        console.log("incrementing");
        change = 1;
    }

    switch(parent) {
        case "archer-strength":
            if((archerStats.strength + change) > 0){
                archerStats.strength += change;
                document.getElementById(parent).innerHTML = archerStats.strength;
            }
            break;
        case "archer-armor":
            if((archerStats.armor + change) > 0){
                archerStats.armor += change;
                document.getElementById(parent).innerHTML = archerStats.armor;
            }
            break;
        case "archer-speed":
            if((archerStats.speed + change) > 0){
                archerStats.speed += change;
                document.getElementById(parent).innerHTML = archerStats.speed;
            }
            break;
        case "archer-hp":
            if((archerStats.hp + change) > 0){
                archerStats.hp += change;
                document.getElementById(parent).innerHTML = archerStats.hp;
            }
            break;
        case "footman-strength":
            if((footmanStats.strength + change) > 0){
                footmanStats.strength += change;
                document.getElementById(parent).innerHTML = footmanStats.strength;
            }
            break;
        case "footman-armor":
            if((footmanStats.armor + change) > 0){
                footmanStats.armor += change;
                document.getElementById(parent).innerHTML = footmanStats.armor;
            }
            break;
        case "footman-speed":
            if((footmanStats.speed + change) > 0){
                footmanStats.speed += change;
                document.getElementById(parent).innerHTML = footmanStats.speed;
            }
            break;
        case "footman-speed":
            if((footmanStats.hp + change) > 0){
                footmanStats.hp += change;
                document.getElementById(parent).innerHTML = footmanStats.hp;
            }
            break;
        case "p1footmen":
            if((playerUnitCount[0].count + change) >= 0){
                playerUnitCount[0].count += change;
                document.getElementById(parent).innerHTML = playerUnitCount[0].count;
            }
            break;
        case "p2footmen":
            if((playerUnitCount[2].count + change) >= 0){
                playerUnitCount[2].count += change;
                console.log(playerUnitCount[2].count);
                document.getElementById(parent).innerHTML = playerUnitCount[2].count;
            }
            break;
        case "p1archers":
            if((playerUnitCount[1].count + change) >= 0){
                playerUnitCount[1].count += change;
                document.getElementById(parent).innerHTML = playerUnitCount[1].count;
            }
            break;
        case "p2archers":
            if((playerUnitCount[3].count + change) >= 0){
                playerUnitCount[3].count += change;
                document.getElementById(parent).innerHTML = playerUnitCount[3].count;
            }
            break;
    }
    




}


function setRuns(count){
    runs = count;
    document.getElementById("runs").innerHTML = count;
}


function getBaseStats(){

    footmanStats.strength = parseInt(document.getElementById("footman-strength").innerHTML);
    footmanStats.armor = parseInt(document.getElementById("footman-armor").innerHTML);
    footmanStats.speed = parseInt(document.getElementById("footman-speed").innerHTML);
    footmanStats.hp = parseInt(document.getElementById("footman-hp").innerHTML);

    archerStats.strength = parseInt(document.getElementById("archer-strength").innerHTML);
    archerStats.armor = parseInt(document.getElementById("archer-armor").innerHTML);
    archerStats.speed = parseInt(document.getElementById("archer-speed").innerHTML);
    archerStats.hp = parseInt(document.getElementById("archer-hp").innerHTML);

}


function updateStats(p1wins, p2wins){

    var p1winRate = Math.round(p1wins/runs*1000)/10;
    var p2winRate = Math.round(p2wins/runs*1000)/10;

    document.getElementById("run-count").innerHTML = (p1wins+p2wins);
    document.getElementById("p1wins").innerHTML = p1winRate;
    document.getElementById("p2wins").innerHTML = p2winRate;

}


document.getElementById("footman-strength").innerHTML = footmanStats.strength;
document.getElementById("footman-armor").innerHTML = footmanStats.armor;
document.getElementById("footman-speed").innerHTML = footmanStats.speed;
document.getElementById("footman-hp").innerHTML = footmanStats.hp;

document.getElementById("archer-strength").innerHTML = archerStats.strength;
document.getElementById("archer-armor").innerHTML = archerStats.armor;
document.getElementById("archer-speed").innerHTML = archerStats.speed;
document.getElementById("archer-hp").innerHTML = archerStats.hp;

document.getElementById("runs").innerHTML = runs;

document.getElementById("p1footmen").innerHTML = playerUnitCount[0].count;
document.getElementById("p1archers").innerHTML = playerUnitCount[1].count;
document.getElementById("p2footmen").innerHTML = playerUnitCount[2].count;
document.getElementById("p2archers").innerHTML = playerUnitCount[3].count;




