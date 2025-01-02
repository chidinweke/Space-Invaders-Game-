const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const gameOverScreen = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');

    const playerWidth = 30;
    const playerHeight = 20;
    let playerX = canvas.width / 2 - playerWidth / 2;
    const playerY = canvas.height - playerHeight - 10;
    const playerSpeed = 5;

    const bulletWidth = 3;
    const bulletHeight = 10;
    const bulletSpeed = 7;
    const bullets = [];

    let invaderWidth = 25;
    let invaderHeight = 20;
    let invaderRows = 4;
    let invaderCols = 10;
    const invaderSpacingX = 10;
    const invaderSpacingY = 20;
    let invaderSpeedX = 1;
    let invaderSpeedY = 10;
    let invaderDirection = 1;
    let invaders = [];
    const invaderBullets = [];
    const invaderBulletWidth = 3;
    const invaderBulletHeight = 10;
    const invaderBulletSpeed = 5;
    let invaderShootTimer = 0;
    const invaderShootInterval = 120;

    let score = 0;
    let level = 1;
    let gameRunning = false;

    function createInvaders() {
      invaders = [];
      for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
          invaders.push({
            x: col * (invaderWidth + invaderSpacingX) + 50,
            y: row * (invaderHeight + invaderSpacingY) + 30,
            alive: true,
          });
        }
      }
    }

    function drawPlayer() {
      ctx.fillStyle = 'green';
      ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
    }

    function drawBullets() {
      ctx.fillStyle = 'white';
      bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
      });
    }

    function drawInvaders() {
      ctx.fillStyle = 'red';
      invaders.forEach(invader => {
        if (invader.alive) {
          ctx.fillRect(invader.x, invader.y, invaderWidth, invaderHeight);
        }
      });
    }

    function drawInvaderBullets() {
      ctx.fillStyle = 'yellow';
      invaderBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, invaderBulletWidth, invaderBulletHeight);
      });
    }

    function updatePlayer() {
      if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
      }
      if (keys['ArrowRight'] && playerX < canvas.width - playerWidth) {
        playerX += playerSpeed;
      }
    }

    function updateBullets() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
        }
      }
    }

    function updateInvaders() {
      let moveDown = false;
      for (const invader of invaders) {
        if (invader.alive) {
          invader.x += invaderSpeedX * invaderDirection;
          if (invader.x > canvas.width - invaderWidth || invader.x < 0) {
            moveDown = true;
          }
        }
      }

      if (moveDown) {
        invaderDirection *= -1;
        for (const invader of invaders) {
          if (invader.alive) {
            invader.y += invaderSpeedY;
          }
        }
      }
    }

    function updateInvaderBullets() {
      for (let i = invaderBullets.length - 1; i >= 0; i--) {
        invaderBullets[i].y += invaderBulletSpeed;
        if (invaderBullets[i].y > canvas.height) {
          invaderBullets.splice(i, 1);
        }
      }
    }

    function invaderShoot() {
      if (invaderShootTimer >= invaderShootInterval) {
        const aliveInvaders = invaders.filter(invader => invader.alive);
        if (aliveInvaders.length > 0) {
          const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
          invaderBullets.push({
            x: randomInvader.x + invaderWidth / 2 - invaderBulletWidth / 2,
            y: randomInvader.y + invaderHeight,
          });
        }
        invaderShootTimer = 0;
      }
      invaderShootTimer++;
    }

    function checkCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (const invader of invaders) {
          if (invader.alive &&
            bullet.x < invader.x + invaderWidth &&
            bullet.x + bulletWidth > invader.x &&
            bullet.y < invader.y + invaderHeight &&
            bullet.y + bulletHeight > invader.y) {
            invader.alive = false;
            bullets.splice(i, 1);
            score += 10;
            scoreDisplay.textContent = score;
            break;
          }
        }
      }

      for (let i = invaderBullets.length - 1; i >= 0; i--) {
        const bullet = invaderBullets[i];
        if (bullet.x < playerX + playerWidth &&
          bullet.x + invaderBulletWidth > playerX &&
          bullet.y < playerY + playerHeight &&
          bullet.y + invaderBulletHeight > playerY) {
          gameOver();
          break;
        }
      }

      for (const invader of invaders) {
        if (invader.alive &&
          invader.y + invaderHeight > playerY) {
          gameOver();
          break;
        }
      }

      if (invaders.every(invader => !invader.alive)) {
        level++;
        levelDisplay.textContent = level;
        invaderSpeedX += 0.2;
        invaderRows = Math.min(invaderRows + 1, 6);
        invaderCols = Math.min(invaderCols + 1, 12)
        createInvaders();
      }
    }

    function gameOver() {
      gameRunning = false;
      gameOverScreen.style.display = 'flex';
    }

    function resetGame() {
      gameRunning = true;
      gameOverScreen.style.display = 'none';
      score = 0;
      level = 1;
      scoreDisplay.textContent = score;
      levelDisplay.textContent = level;
      playerX = canvas.width / 2 - playerWidth / 2;
      invaderSpeedX = 1;
      invaderRows = 4;
      invaderCols = 10;
      bullets.length = 0;
      invaderBullets.length = 0;
      createInvaders();
      gameLoop();
    }

    function startGame() {
      startScreen.style.display = 'none';
      gameRunning = true;
      createInvaders();
      gameLoop();
    }

    function gameLoop() {
      if (!gameRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updatePlayer();
      updateBullets();
      updateInvaders();
      updateInvaderBullets();
      invaderShoot();
      checkCollisions();
      drawPlayer();
      drawBullets();
      drawInvaders();
      drawInvaderBullets();
      requestAnimationFrame(gameLoop);
    }

    const keys = {};
    document.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'Space') {
        bullets.push({
          x: playerX + playerWidth / 2 - bulletWidth / 2,
          y: playerY - bulletHeight,
        });
      }
    });

    document.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    restartButton.addEventListener('click', resetGame);
    startButton.addEventListener('click', startGame);
