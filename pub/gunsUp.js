var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phasermario', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.spritesheet('player', 'assets/playerSpriteSheet.png', 64, 64);
    game.load.image('bullet', 'assets/bullet153.png');
    game.load.image('wall', 'assets/wall.png');
}

var player;
var wall;
var ammoCount = 20;
var lastDirection = 1;
var bulletTime = 0;
var playerStill = false;
var text;

//test for commit

var socket;
function create() {
    game.stage.backgroundColor = 'rgb(128, 128, 128)';
    player = game.add.sprite(0, 0, 'player');
    player.scale.setTo(0.75, 0.75);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.animations.add('left', [10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    player.animations.add('right', [27, 28, 29, 30, 31, 32], 10, true);
    player.animations.add('forward', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    player.animations.add('backward', [19, 20, 21, 22, 23, 24, 25,26], 10, true);
    player.animations.add('still0', [9], 10, true);
    player.animations.add('still1', [27], 10, true);
    player.animations.add('still2', [0], 10, true);
    player.animations.add('still3', [18], 10, true);


    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(ammoCount, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    game.input.onDown.add(fireBullet);

    wall = game.add.sprite(50, 0, 'wall');
    game.physics.enable(wall, Phaser.Physics.ARCADE);
    wall.enableBody = true;
    wall.body.immovable = true;
    wall.scale.setTo(0.5, 1.3);

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
       when 1 side emits an event, the other side's corresponding "on" handles
       the event along with any passed data
     */
    socket.emit('newplayer', 'emily');
    socket.on('disconnect', function(){});

    socket.on('newplayer', (data) => {
        console.log(data);
    });
    socket.on('allplayers', (arrayOfPlayers) => {
        console.log(arrayOfPlayers);
    });
}

function doOverlap() {
    game.physics.arcade.collide(player, wall, function(player, wall) {
        console.log('hello')
    });

    game.physics.arcade.collide(bullets, wall, function(player, wall) {
        console.log('hello')
    });
}


function update() {

    game.input.onDown.addOnce(updateText);

    if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        player.animations.play("left", 10);
        player.body.velocity.x = -200;
        player.body.velocity.y = 0;
        lastDirection = 0;
        playerStill = false;
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
        player.animations.play("right", 10);
        player.body.velocity.x = 200;
        player.body.velocity.y = 0;
        lastDirection = 1;
        playerStill = false;
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.UP) || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
        player.animations.play("forward", 10);
        player.body.velocity.y = -200;
        player.body.velocity.x = 0;
        lastDirection = 2;
        playerStill = false;
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN) || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
        player.animations.play("backward", 10);
        player.body.velocity.y = 200;
        player.body.velocity.x = 0;
        lastDirection = 3;
        playerStill = false;
    } else {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        if(lastDirection === 0) {
            player.animations.play("still0");
        } else if(lastDirection === 1) {
            player.animations.play("still1");
        } else if(lastDirection === 2) {
            player.animations.play("still2");
        } else {
            player.animations.play("still3");
        }
        playerStill = true;
    }


    if(playerStill === true && game.input.mousePointer.x < player.x && game.input.mousePointer.y != player.y) {
        player.animations.play("still0");
    } else if(playerStill === true && game.input.mousePointer.x > player.x) {
        player.animations.play("still1");
    } else if(playerStill === true && game.input.mousePointer.y < player.y) {
        player.animations.play("still2");
    } else if(playerStill === true && game.input.mousePointer.y > player.y) {
        player.animations.play("still3");
    }



    doOverlap();


}


function fireBullet(){

    ammoCount--;
    if(ammoCount > 0) {
        if (game.time.now > bulletTime) {
            bullet = bullets.getFirstExists(false);

            if (bullet) {
                bullet.reset(player.body.x + 23, player.body.y + 23);
                bullet.lifespan = 9000;
                //bullet.rotation = player.rotation;
                //game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
                bulletTime = game.time.now + 200;
                game.physics.arcade.moveToPointer(bullet, 600);
            }
        }
    }

}

function updateText() {
    if(ammoCount > -1) {
            text.setText("Ammo: " + ammoCount);
    }
}

function render() {

}