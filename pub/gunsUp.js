var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phasermario', { preload: preload, create: create, update: update, render: render });



function preload() {
    game.load.spritesheet('player', 'assets/playerSpriteSheet.png', 64, 64);
    game.load.image('bullet', 'assets/bullet153.png');
    game.load.image('wall', 'assets/wall.png');
}


/*var Player =  (function () {
    function Player(x, y, health, speed, tank, sprite) {
        this.basicPlayer = game.add.sprite(x, y, sprite);
        game.physics.arcade.enable(this.basicUnit);
        this.health = health;
        this.speed = speed;
        this.damage = damage;
        this.tank = tank;
        this.sprite = sprite;
    }
}


*/



let haveSelfPlayer = false;
var selfPlayer = {};
var wall;
var wall1;
var ammoCount = 20;
var lastDirection = 1;
var bulletTime = 0;
var playerStill = false;
var text;

/*swal.setDefaults({
    input: 'text',
    confirmButtonText: 'Next &rarr;',
    showCancelButton: true,
    progressSteps: ['1', '2', '3']
});

var steps = [
    {
        title: 'Question 1',
        text: 'Chaining swal2 modals is easy'
    },
    'Question 2',
    'Question 3'
]

swal.queue(steps).then((result) => {
    swal.resetDefaults()

    if (result.value) {
        swal({
            title: 'All done!',
            html:
            'Your answers: <pre>' +
            JSON.stringify(result.value) +
            '</pre>',
            confirmButtonText: 'Play!'
        })
    }
}) */

/* var test = swal.queue(steps).then((result)); */

//test
//test1
//test for commit
var arrayOfplayers = []; // does this include selfPlayer? Why?


var socket;
function create() {
    game.stage.backgroundColor = 'rgb(128, 128, 128)';

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(ammoCount, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    game.input.onDown.add(fireBullet);

    let wallLoop = [];

    for(let i = 0; i < 10; i++) {
        let wall = game.add.sprite(80 * i/2, 0, 'wall');
        game.physics.enable(wall, Phaser.Physics.ARCADE);
        wall.enableBody = true;
        wall.body.immovable = true;
        wall.scale.setTo(0.5, 0.6);
        wallLoop.push(wall)
        console.log(wallLoop[i].x);
        console.log(wallLoop[i].y);
    }

    text = game.add.text(30, 20, "Ammo: " + ammoCount, {
        font: "20px Arial",
        fill: "rgb(83, 86, 78)",
    });

    socket = io('http://localhost:4001');
    socket.on('connect', function(){
        console.log("connected to server")
    });
    /*
       Basics of websockets (or sockets in general)
       1) 2 way pipe between client and server
       when 1 side emits an event, thaaaaaaaaaaae other side's corresponding "on" handles
       the event along with any passed data
     */
    socket.emit('newplayer', prompt("What's Your Name?"));
    socket.on('disconnect', function(){});

    socket.on('newplayer', (data) => {
        console.log(data)
        addOtherPlayer(data);
    });

    socket.on('selfplayer', (data) => {
        console.log(data);
        addSelfPlayer(data);
        haveSelfPlayer = true;
    });

    socket.on('allplayers', (data) => {
        console.log(data)
        let amountPlayers = data.length;
        for(let i = 0; i < amountPlayers; i++) {

            addOtherPlayer(data[i]);
        }
    });

    socket.on('playermove', (data) => {
        console.log(data);
        console.log(data.player.name);
        let playerObj;
        for(let i = 0; i < arrayOfplayers.length; i++) {
            if(arrayOfplayers[i].name === data.player.name) {
                let playerObj = arrayOfplayers[i];
                moveOneUnit(playerObj, data.direction);
            }
        }
    });
}

function doOverlap() {
    game.physics.arcade.collide(selfPlayer.sprite, wall, function(player, wall) {
        console.log('hello')
    });

    game.physics.arcade.collide(selfPlayer.sprite, wall1, function(player, wall1) {
        console.log('hello')
    });

    game.physics.arcade.collide(bullets, wall, function(player, wall) {
        console.log('hello')
        bullet.kill();
    });

    game.physics.arcade.collide(bullets, wall1, function(player, wall1) {
        console.log('hello')
        bullet.kill();
    });
}


function update() {
    if(haveSelfPlayer){
        game.input.onDown.addOnce(updateText);
        handleMovement();
        doOverlap();
    }
}


function fireBullet(){

    ammoCount--;
    if(ammoCount > 0) {
        if (game.time.now > bulletTime) {
            bullet = bullets.getFirstExists(false);

            if (bullet) {
                bullet.reset(selfPlayer.sprite.body.x + 23, selfPlayer.sprite.body.y + 23);
                bullet.lifespan = 9000;
                //bullet.rotation = player.rotation;
                //game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
                bulletTime = game.time.now + 200;
                game.physics.arcade.moveToPointer(bullet, 600);
            }
        }
    }

}

function addPlayerSprite(x,y){
    let playerSprite = game.add.sprite(x, y, 'player');
    playerSprite.scale.setTo(0.75, 0.75);
    game.physics.enable(playerSprite, Phaser.Physics.ARCADE);
    playerSprite.animations.add('left', [10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    playerSprite.animations.add('right', [27, 28, 29, 30, 31, 32], 10, true);
    playerSprite.animations.add('forward', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    playerSprite.animations.add('backward', [19, 20, 21, 22, 23, 24, 25,26], 10, true);
    playerSprite.animations.add('still0', [9], 10, true);
    playerSprite.animations.add('still1', [27], 10, true);
    playerSprite.animations.add('still2', [0], 10, true);
    playerSprite.animations.add('still3', [18], 10, true);

    return playerSprite
}

function addSelfPlayer(player) {
    selfPlayer.sprite = addPlayerSprite(player.x, player.y);;
    selfPlayer.name = player.name;
    arrayOfplayers.push(selfPlayer);
}

function addOtherPlayer(player) {
    let playerSprite = addPlayerSprite(player.x, player.y);
    let otherPlayer = {};
    otherPlayer.sprite = playerSprite;
    otherPlayer.name = player.name;
    arrayOfplayers.push(otherPlayer);
}

function updateText() {
    if(ammoCount > -1) {
        text.setText("Ammo: " + ammoCount);
    }
}

// define the length of a unit of movement(1 second? 0.5 second?)
// 0.05-0.2seconds (delay between client and server)

// client sends command to server
// command travels to server
// server processes
// server sends response back to client
// client processes response

// write a function that moves the player 1 unit worth of distance (40px)
let ONEUNIT = 50;

// given a player at point x and y,
// if direction is right
// then move to x + 1unit, y
function moveOneUnit(player, direction) {

    var finalX;
    var finalY;

    if(direction === 0) {
        finalX = player.sprite.body.x - ONEUNIT;
        finalY = player.sprite.body.y;
        player.sprite.animations.play("left", 10);
    } else if(direction === 1) {
        finalX = player.sprite.body.x + ONEUNIT;
        finalY = player.sprite.body.y;
        player.sprite.animations.play("right", 10);
    } else if(direction === 2) {
        finalY = player.sprite.body.y - ONEUNIT;
        finalX = player.sprite.body.x;
        player.sprite.animations.play("forward", 10);
    } else {
        finalY = player.sprite.body.y + ONEUNIT;
        finalX = player.sprite.body.x;
        player.sprite.animations.play("backward", 10);
    }

    game.physics.arcade.moveToXY(player.sprite, finalX, finalY, ONEUNIT, 500);

    game.time.events.add(500, function () {
        player.sprite.body.velocity.x = 0;
        player.sprite.body.velocity.y = 0;
        player.sprite.body.x = finalX;
        player.sprite.body.y = finalY;
    });
    // caclulate velocity,
    // set the velocity
    // start counting time step
    // set it back to 0 after time step is over
}

let allowed = true;
function allowedToEmit() {
    allowed = true;
}

function sendMoveCommand(direction){
    allowed = false;
    game.time.events.add(Phaser.Timer.SECOND * 0.4, allowedToEmit);
    socket.emit('playermove', direction);
}

function handleMovement() {
    if(allowed) {
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            lastDirection = 0;
            sendMoveCommand(lastDirection);
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            lastDirection = 1;
            sendMoveCommand(lastDirection);
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP) || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            lastDirection = 2;
            sendMoveCommand(lastDirection);
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            lastDirection = 3;
            sendMoveCommand(lastDirection);
        } else {
            if (lastDirection === 0) {
                selfPlayer.sprite.animations.play("still0");
            } else if (lastDirection === 1) {
                selfPlayer.sprite.animations.play("still1");
            } else if (lastDirection === 2) {
                selfPlayer.sprite.animations.play("still2");
            } else {
                selfPlayer.sprite.animations.play("still3");
            }
            playerStill = true;
        }
    }

    if (playerStill === true && game.input.mousePointer.y < selfPlayer.sprite.y) {
        selfPlayer.sprite.animations.play("still2");
    } else if (playerStill === true && game.input.mousePointer.y > selfPlayer.sprite.y) {
        selfPlayer.sprite.animations.play("still3");
    }


    if (playerStill === true && game.input.mousePointer.x < selfPlayer.sprite.x) {
        selfPlayer.sprite.animations.play("still0");
    } else if (playerStill === true && game.input.mousePointer.x > selfPlayer.sprite.x) {
        selfPlayer.sprite.animations.play("still1");
    }
}

function render() {

}