
var config = {
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
	scale: {
		parent: 'gamefield',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		zoom: 1,
		width: 960,
		height: 540
    }
};

var player;
var honey;
var bees;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText = 'Punkte: ';

var game = new Phaser.Game(config);

function preload () {
    this.load.image('background', 'assets/wald.png');
    this.load.image('ground', 'assets/baumstamm.png');
    this.load.image('honey', 'assets/honey.png');
    this.load.image('bee', 'assets/biene.png');
    this.load.spritesheet('bear', 'assets/bear.png', { frameWidth: 50, frameHeight: 64 });
}

function create () {
    //  A simple background for our game
    this.add.image(480, 270, 'background');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(200, 530, 'ground');
    platforms.create(600, 530, 'ground');
    platforms.create(1000, 530, 'ground');

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(200, 400, 'bear');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setSize(37, 55, true); //bounding box smaller than sprite!

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('bear', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'bear', frame: 4 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('bear', { start: 5, end: 8 }),
        frameRate: 5,
        repeat: -1
    });

    ////////////////////////////////////////////////////////////////////
    //  Input Events
    ////////////////////////////////////////////////////////////////////
    cursors = this.input.keyboard.createCursorKeys();
    // game.input.onDown.add(jump(), this);
    // initGyro();



    //  Some honey to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    honey = this.physics.add.group({
        key: 'honey',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    honey.children.iterate(function (child) {
        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bees = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'Punkte: 0', { fontSize: '54px', fill: '#FFF' });

    //  Collide the player and the honey with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(honey, platforms);
    this.physics.add.collider(bees, platforms);

    //  Checks to see if the player overlaps with any of the honey, if he does call the collectStar function
    this.physics.add.overlap(player, honey, collectHoney, null, this);

    this.physics.add.collider(player, bees, hitBee, null, this);

}

function update () {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
            jump();
    }

}

function collectHoney (player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Punkte: ' + score);

    if (honey.countActive(true) === 0) {
        //  A new batch of honey to collect
        honey.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bee = bees.create(x, 16, 'bee');
        bee.setBounce(1);
        bee.setCollideWorldBounds(true);
        bee.setVelocity(Phaser.Math.Between(-100, 100), 10);
        bee.setSize(4, 4, true);

        bee.allowGravity = false;

    }
}

function hitBee (player, bee) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    saveHighscore();
    gameOver = true;
}

function jump() {
        player.setVelocityY(-330);
}

function initGyro() {
	window.ondeviceorientation = function (event) {
		if (event.gamma) {
			let x = Math.round(event.gamma.toFixed(2)) * 10 * window.devicePixelRatio;
			var alpha = event.alpha;
			var beta = event.beta;
			var gamma = event.gamma;
			if (gamma < 0) {
				player.anims.play('left', true);
			}
			else {
				player.anims.play('right', true);
			}

			this.player.setVelocityX(gamma * 5);
		}
    }.bind(this)
}


function syncDelay(milliseconds) {
        var start = new Date().getTime();
        var end=0;
        while( (end-start) < milliseconds) {
                end = new Date().getTime();
        }
}


function saveHighscore() {
	var name = prompt('Dein Name: (max.15 Zeichen)', 'Bär');
	if (name == "") {
		name = "Bär";
	}
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
                        location.href = "https://wandserver.de/bear/score.php?show";
		} else {
                        location.href = "https://wandserver.de/bear/score.php?show";
                }
	};
	xhttp.open('POST', 'https://wandserver.de/bear/score.php', true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	xhttp.send('name=' + name.substr(0,15) + '&score=' + score);
        syncDelay(4000);
}
