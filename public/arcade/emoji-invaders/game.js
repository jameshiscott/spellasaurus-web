// ═══════════════════════════════════════════════════════════════════════════
// Emoji Invaders — A Space-Invaders-style arcade game for Spellasaurus
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ── Canvas Setup ─────────────────────────────────────────────────────
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var W, H;
  var scale = 1;

  function resize() {
    W = canvas.width = canvas.clientWidth;
    H = canvas.height = canvas.clientHeight;
    scale = Math.min(W, H) / 400;
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Constants ────────────────────────────────────────────────────────
  var PLAYER_SPEED = 5;
  var BULLET_SPEED = 7;
  var ENEMY_BULLET_SPEED = 3;
  var FIRE_COOLDOWN = 250;
  var MISSILE_COOLDOWN = 5000;
  var LASER_COOLDOWN = 4000;
  var LASER_COOLDOWN_AUTO = 2500;
  var LASER_DURATION = 300;

  // Gun heat system
  var GUN_MAX_HEAT = 2000;      // 2 seconds of continuous fire
  var GUN_COOLDOWN_RATE = 1.6;  // cools 1.6x faster than it heats

  var ENEMY_EMOJIS_BY_ROW = ["👾", "👽", "🤖", "👻", "💀"];
  var ENEMY_HP_BY_ROW = [1, 1, 1, 2, 2];
  var ENEMY_POINTS_BY_ROW = [10, 15, 20, 25, 30];

  // Touch button layout
  var BTN_SIZE = 52;  // will be scaled
  var BTN_MARGIN = 12;

  // ── Game State ───────────────────────────────────────────────────────
  var state = "waiting";
  var lives = 3;
  var score = 0;
  var wave = 0;
  var waveDelay = 0;

  // Upgrades
  var upgrades = [];
  var hasGhostShip = false;
  var hasGhostShip2 = false;
  var shieldHits = 0;
  var gunLevel = 1;
  // Missiles: 0 = none, 1 = one corner tap, 2 = both corners tap, 3 = auto both
  var missileLevel = 0;
  var hasLaser = false;
  var hasAutoLaser = false;

  // Player
  var player = { x: 0, y: 0, w: 38, h: 32 };
  var lastFireTime = 0;
  var missileReady = 0;
  var laserReady = 0;
  var laserActive = 0;
  var laserX = 0;
  var missileAutoTimer = 0;

  // Gun heat: 0 = cold, GUN_MAX_HEAT = overheated
  var gunHeat = 0;
  var gunOverheated = false;  // locked out until fully cooled

  // Death explosion
  var deathFlashTimer = 0;
  var invincibleTimer = 0;

  // Arrays
  var bullets = [];
  var enemyBullets = [];
  var enemies = [];
  var particles = [];
  var missiles = [];
  var stars = [];

  // Input
  var keys = {};
  var touchX = null;
  var touchShooting = false;
  var touchMissile = false;
  var touchLaser = false;
  var touchFire = false; // dedicated fire button

  // ── Haptic Feedback ──────────────────────────────────────────────────
  function haptic(duration) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(duration || 100);
      }
    } catch (e) { /* not supported */ }
  }

  // ── Stars Background ─────────────────────────────────────────────────
  function initStars() {
    stars = [];
    for (var i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        s: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      });
    }
  }
  initStars();

  function drawStars(dt) {
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.speed * dt * 0.06;
      if (s.y > 1000) { s.y = 0; s.x = Math.random() * 1000; }
      var sx = (s.x / 1000) * W;
      var sy = (s.y / 1000) * H;
      ctx.globalAlpha = 0.3 + s.s * 0.2;
      ctx.fillRect(sx, sy, s.s * scale, s.s * scale);
    }
    ctx.globalAlpha = 1;
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function drawEmoji(emoji, x, y, size) {
    ctx.font = Math.round(size * scale) + "px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
  }

  // ── Hand-drawn spaceship ───────────────────────────────────────────
  function drawShip(x, y, sz, alpha) {
    var s = sz * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha || 1;

    // Main hull
    ctx.fillStyle = "#4488ff";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.bezierCurveTo(s * 0.15, -s * 0.5, s * 0.5, -s * 0.1, s * 0.55, s * 0.3);
    ctx.lineTo(s * 0.35, s * 0.5);
    ctx.lineTo(-s * 0.35, s * 0.5);
    ctx.lineTo(-s * 0.55, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.1, -s * 0.15, -s * 0.5, 0, -s * 0.6);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#aaddff";
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.2, s * 0.12, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ccefff";
    ctx.beginPath();
    ctx.ellipse(-s * 0.03, -s * 0.25, s * 0.04, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = "#3366cc";
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, s * 0.15);
    ctx.lineTo(-s * 0.7, s * 0.45);
    ctx.lineTo(-s * 0.6, s * 0.55);
    ctx.lineTo(-s * 0.3, s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.15);
    ctx.lineTo(s * 0.7, s * 0.45);
    ctx.lineTo(s * 0.6, s * 0.55);
    ctx.lineTo(s * 0.3, s * 0.4);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = "#ff8844";
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.48);
    ctx.lineTo(0, s * 0.7 + Math.random() * s * 0.1);
    ctx.lineTo(s * 0.15, s * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffcc44";
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, s * 0.48);
    ctx.lineTo(0, s * 0.6 + Math.random() * s * 0.08);
    ctx.lineTo(s * 0.08, s * 0.48);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = "#223366";
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.bezierCurveTo(s * 0.15, -s * 0.5, s * 0.5, -s * 0.1, s * 0.55, s * 0.3);
    ctx.lineTo(s * 0.35, s * 0.5);
    ctx.lineTo(-s * 0.35, s * 0.5);
    ctx.lineTo(-s * 0.55, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.1, -s * 0.15, -s * 0.5, 0, -s * 0.6);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  function rectsOverlap(a, b) {
    return (
      a.x - a.w / 2 < b.x + b.w / 2 &&
      a.x + a.w / 2 > b.x - b.w / 2 &&
      a.y - a.h / 2 < b.y + b.h / 2 &&
      a.y + a.h / 2 > b.y - b.h / 2
    );
  }

  function spawnParticles(x, y, emoji, count) {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 400 + Math.random() * 300,
        emoji: emoji,
        size: 10 + Math.random() * 10,
      });
    }
  }

  // Big death explosion with debris
  function spawnExplosion(x, y) {
    var debris = ["💥", "🔥", "✨", "💫", "⚡"];
    for (var i = 0; i < 15; i++) {
      var angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.3;
      var speed = 2 + Math.random() * 4;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 600 + Math.random() * 500,
        emoji: debris[Math.floor(Math.random() * debris.length)],
        size: 12 + Math.random() * 16,
      });
    }
  }

  function notifyParent(msg) {
    try { window.parent.postMessage(msg, "*"); } catch (e) { /* */ }
  }

  // ── Upgrade Application ──────────────────────────────────────────────
  function applyUpgrades() {
    hasGhostShip = upgrades.indexOf("ghost_ship") >= 0;
    hasGhostShip2 = upgrades.indexOf("ghost_ship_2") >= 0;

    shieldHits = 0;
    if (upgrades.indexOf("shield_3") >= 0) shieldHits = 3;
    else if (upgrades.indexOf("shield_2") >= 0) shieldHits = 2;
    else if (upgrades.indexOf("shield_1") >= 0) shieldHits = 1;

    gunLevel = 1;
    if (upgrades.indexOf("triple_guns") >= 0) gunLevel = 3;
    else if (upgrades.indexOf("dual_guns") >= 0) gunLevel = 2;

    // Missile tiers: auto > dual > single
    missileLevel = 0;
    if (upgrades.indexOf("missiles_auto") >= 0) missileLevel = 3;
    else if (upgrades.indexOf("missiles_dual") >= 0) missileLevel = 2;
    else if (upgrades.indexOf("missiles") >= 0) missileLevel = 1;

    hasLaser = upgrades.indexOf("laser") >= 0;
    hasAutoLaser = upgrades.indexOf("laser_auto") >= 0;

    missileReady = 0;
    laserReady = 0;
    missileAutoTimer = 0;
    gunHeat = 0;
    gunOverheated = false;
  }

  // ── Wave Spawning ────────────────────────────────────────────────────
  function spawnWave() {
    wave++;
    enemies = [];

    var rows = Math.min(3 + Math.floor(wave / 2), 6);
    var cols = Math.min(5 + Math.floor(wave / 3), 10);
    var spacingX = Math.min(50 * scale, (W - 40) / cols);
    var spacingY = 40 * scale;
    var startX = W / 2 - ((cols - 1) * spacingX) / 2;
    var startY = 50 * scale;

    for (var r = 0; r < rows; r++) {
      var rowIdx = r % ENEMY_EMOJIS_BY_ROW.length;
      for (var c = 0; c < cols; c++) {
        var hpBonus = Math.floor(wave / 5);
        enemies.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          w: 34, h: 34,
          emoji: ENEMY_EMOJIS_BY_ROW[rowIdx],
          hp: ENEMY_HP_BY_ROW[rowIdx] + hpBonus,
          points: ENEMY_POINTS_BY_ROW[rowIdx] + wave * 2,
          row: r, col: c,
          canShoot: r === rows - 1 || Math.random() < 0.3,
        });
      }
    }

    enemyDir = 1;
    enemySpeed = 0.3 + wave * 0.08;
    enemyDropTimer = 0;
    enemyShootTimer = 0;
    enemyShootInterval = Math.max(600, 2000 - wave * 100);
  }

  var enemyDir = 1;
  var enemySpeed = 0.3;
  var enemyDropTimer = 0;
  var enemyShootTimer = 0;
  var enemyShootInterval = 2000;

  // ── Game Init ────────────────────────────────────────────────────────
  function startGame() {
    score = 0;
    wave = 0;
    waveDelay = 0;
    bullets = [];
    enemyBullets = [];
    missiles = [];
    particles = [];
    laserActive = 0;
    missileAutoTimer = 0;
    deathFlashTimer = 0;
    invincibleTimer = 0;
    gunHeat = 0;
    gunOverheated = false;

    player.x = W / 2;
    player.y = H - 50 * scale;

    applyUpgrades();
    spawnWave();
    state = "playing";
  }

  // ── Input ────────────────────────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
    if (state === "waiting") startGame();
  });
  document.addEventListener("keyup", function (e) { keys[e.key] = false; });

  // ── Touch Button Hit Detection ───────────────────────────────────────
  function getButtonRects() {
    var bs = BTN_SIZE * scale;
    var bm = BTN_MARGIN * scale;
    var btns = [];
    var rightX = W - bs - bm;
    var bottomY = H - bm;

    // Stack buttons from bottom: fire, then specials above
    var nextY = bottomY - bs;

    // Fire button is always at the very bottom-right
    btns.push({ id: "fire", x: rightX, y: nextY, w: bs, h: bs });
    nextY -= bs + bm;

    // Missile button (only for tap-to-fire levels 1-2)
    if (missileLevel >= 1 && missileLevel < 3) {
      btns.push({ id: "missile", x: rightX, y: nextY, w: bs, h: bs });
      nextY -= bs + bm;
    }
    // Laser button (manual fire only)
    if (hasLaser && !hasAutoLaser) {
      btns.push({ id: "laser", x: rightX, y: nextY, w: bs, h: bs });
      nextY -= bs + bm;
    }
    return btns;
  }

  function hitTestButton(tx, ty) {
    var btns = getButtonRects();
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (tx >= b.x && tx <= b.x + b.w && ty >= b.y && ty <= b.y + b.h) {
        return b.id;
      }
    }
    return null;
  }

  // Track active touch IDs for button holds
  var activeTouches = {};

  // Touch controls
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (state === "waiting") { startGame(); return; }
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var btn = hitTestButton(t.clientX, t.clientY);
      if (btn === "fire") {
        touchFire = true;
        activeTouches[t.identifier] = "fire";
      } else if (btn === "missile") {
        touchMissile = true;
        activeTouches[t.identifier] = "missile";
      } else if (btn === "laser") {
        touchLaser = true;
        activeTouches[t.identifier] = "laser";
      } else {
        touchX = t.clientX;
        activeTouches[t.identifier] = "move";
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (activeTouches[t.identifier] === "move") {
        touchX = t.clientX;
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var role = activeTouches[t.identifier];
      delete activeTouches[t.identifier];
      if (role === "fire") touchFire = false;
      else if (role === "missile") touchMissile = false;
      else if (role === "laser") touchLaser = false;
      else if (role === "move") {
        // Check if any other touch is still moving
        var stillMoving = false;
        for (var id in activeTouches) {
          if (activeTouches[id] === "move") { stillMoving = true; break; }
        }
        if (!stillMoving) touchX = null;
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchcancel", function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var role = activeTouches[t.identifier];
      delete activeTouches[t.identifier];
      if (role === "fire") touchFire = false;
      else if (role === "missile") touchMissile = false;
      else if (role === "laser") touchLaser = false;
      else if (role === "move") {
        var stillMoving2 = false;
        for (var id in activeTouches) {
          if (activeTouches[id] === "move") { stillMoving2 = true; break; }
        }
        if (!stillMoving2) touchX = null;
      }
    }
  }, { passive: false });

  canvas.addEventListener("mousedown", function () {
    if (state === "waiting") startGame();
  });

  // ── Firing ───────────────────────────────────────────────────────────
  function canFire() {
    var now = Date.now();
    if (gunOverheated) return false;
    if (now - lastFireTime < FIRE_COOLDOWN) return false;
    return true;
  }
  function markFired() { lastFireTime = Date.now(); }

  function fireBullets(fromX, fromY) {
    var bw = 6, bh = 12;
    if (gunLevel === 1) {
      bullets.push({ x: fromX, y: fromY - 15 * scale, vx: 0, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
    } else if (gunLevel === 2) {
      bullets.push({ x: fromX - 8 * scale, y: fromY - 15 * scale, vx: 0, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
      bullets.push({ x: fromX + 8 * scale, y: fromY - 15 * scale, vx: 0, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
    } else {
      bullets.push({ x: fromX - 10 * scale, y: fromY - 12 * scale, vx: -0.8 * scale, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
      bullets.push({ x: fromX, y: fromY - 15 * scale, vx: 0, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
      bullets.push({ x: fromX + 10 * scale, y: fromY - 12 * scale, vx: 0.8 * scale, vy: -BULLET_SPEED * scale, w: bw, h: bh, damage: 1 });
    }
  }

  function fireMissiles() {
    var now = Date.now();
    if (now < missileReady) return;
    missileReady = now + MISSILE_COOLDOWN;

    var mSpeed = 4 * scale;
    var diag = mSpeed * 0.707; // cos(45°) = sin(45°) ≈ 0.707

    // Left corner fires at 45° inward+up
    missiles.push({
      x: 20 * scale, y: H - 20 * scale,
      vx: diag, vy: -diag,
      w: 16, h: 16,
      blastRadius: 50 * scale,
    });

    // Right corner only at level 2+
    if (missileLevel >= 2) {
      missiles.push({
        x: W - 20 * scale, y: H - 20 * scale,
        vx: -diag, vy: -diag,
        w: 16, h: 16,
        blastRadius: 50 * scale,
      });
    }
  }

  function fireLaser(fromX) {
    var now = Date.now();
    var cd = hasAutoLaser ? LASER_COOLDOWN_AUTO : LASER_COOLDOWN;
    if (now < laserReady) return;
    laserReady = now + cd;
    laserActive = LASER_DURATION;
    laserX = fromX;

    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      if (Math.abs(e.x - fromX) < 20 * scale) {
        e.hp -= 2;
        if (e.hp <= 0) {
          score += e.points;
          spawnParticles(e.x, e.y, "💥", 3);
          enemies.splice(i, 1);
        }
      }
    }
  }

  // ── Update ───────────────────────────────────────────────────────────
  var lastTime = 0;
  var autoLaserTimer = 0;

  function update(now) {
    var dt = lastTime ? Math.min(now - lastTime, 50) : 16;
    lastTime = now;

    if (state !== "playing") return;

    // Death flash countdown
    if (deathFlashTimer > 0) deathFlashTimer -= dt;
    if (invincibleTimer > 0) invincibleTimer -= dt;

    // ── Player Movement ──────────────────────────────────────────────
    var moveLeft = keys["ArrowLeft"] || keys["a"] || keys["A"];
    var moveRight = keys["ArrowRight"] || keys["d"] || keys["D"];

    if (touchX !== null) {
      var diff = touchX - player.x;
      if (Math.abs(diff) > 5) {
        player.x += Math.sign(diff) * PLAYER_SPEED * scale * (dt / 16);
      }
    } else {
      if (moveLeft) player.x -= PLAYER_SPEED * scale * (dt / 16);
      if (moveRight) player.x += PLAYER_SPEED * scale * (dt / 16);
    }
    player.x = Math.max(20 * scale, Math.min(W - 20 * scale, player.x));
    player.y = H - 50 * scale;

    // ── Firing (keyboard: space/up, touch: fire button) ─────────────
    var shooting = keys[" "] || keys["ArrowUp"] || touchFire;
    if (shooting && canFire()) {
      markFired();
      fireBullets(player.x, player.y);
      if (hasGhostShip || hasGhostShip2) {
        fireBullets(player.x - 40 * scale, player.y + 10 * scale);
      }
      if (hasGhostShip2) {
        fireBullets(player.x + 40 * scale, player.y + 10 * scale);
      }
      // Accumulate heat
      gunHeat = Math.min(GUN_MAX_HEAT, gunHeat + dt);
      if (gunHeat >= GUN_MAX_HEAT) {
        gunOverheated = true;
      }
    } else {
      // Cool down guns (cools GUN_COOLDOWN_RATE times faster than heating)
      gunHeat = Math.max(0, gunHeat - dt * GUN_COOLDOWN_RATE);
      if (gunHeat <= 0) {
        gunOverheated = false;
      }
    }

    // Missile: tap to fire (levels 1-2), auto (level 3)
    if (missileLevel >= 1 && missileLevel <= 2) {
      var useMissile = keys["Shift"] || keys["x"] || keys["X"] || touchMissile;
      if (useMissile) fireMissiles();
    }
    if (missileLevel === 3) {
      missileAutoTimer += dt;
      if (missileAutoTimer >= MISSILE_COOLDOWN) {
        missileAutoTimer = 0;
        fireMissiles();
      }
    }

    // Laser: tap to fire, or auto
    var useLaser = keys["Shift"] || keys["x"] || keys["X"] || touchLaser;
    if (hasLaser && !hasAutoLaser && useLaser) {
      fireLaser(player.x);
    }
    if (hasAutoLaser) {
      autoLaserTimer += dt;
      if (autoLaserTimer >= (LASER_COOLDOWN_AUTO + 500)) {
        autoLaserTimer = 0;
        fireLaser(player.x);
      }
    }

    // ── Update Bullets ───────────────────────────────────────────────
    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx * (dt / 16);
      b.y += b.vy * (dt / 16);
      if (b.y < -20 || b.x < -20 || b.x > W + 20) bullets.splice(i, 1);
    }

    // ── Update Missiles (diagonal movement) ─────────────────────────
    for (var mi = missiles.length - 1; mi >= 0; mi--) {
      var m = missiles[mi];
      m.x += m.vx * (dt / 16);
      m.y += m.vy * (dt / 16);
      if (m.y < -20 || m.x < -20 || m.x > W + 20) { missiles.splice(mi, 1); continue; }

      for (var ei = enemies.length - 1; ei >= 0; ei--) {
        var en = enemies[ei];
        if (rectsOverlap(m, en)) {
          for (var bi = enemies.length - 1; bi >= 0; bi--) {
            var be = enemies[bi];
            var dx = be.x - m.x, dy = be.y - m.y;
            if (Math.sqrt(dx * dx + dy * dy) < m.blastRadius) {
              be.hp -= 3;
              if (be.hp <= 0) {
                score += be.points;
                spawnParticles(be.x, be.y, "💥", 3);
                enemies.splice(bi, 1);
                if (bi <= ei) ei--;
              }
            }
          }
          spawnParticles(m.x, m.y, "🔥", 5);
          missiles.splice(mi, 1);
          break;
        }
      }
    }

    // ── Laser Beam Decay ─────────────────────────────────────────────
    if (laserActive > 0) laserActive -= dt;

    // ── Enemy Movement ───────────────────────────────────────────────
    var needDrop = false;
    for (var j = 0; j < enemies.length; j++) {
      enemies[j].x += enemyDir * enemySpeed * scale * (dt / 16);
      if (enemies[j].x < 20 * scale || enemies[j].x > W - 20 * scale) needDrop = true;
    }
    if (needDrop) {
      enemyDir *= -1;
      for (var k = 0; k < enemies.length; k++) {
        enemies[k].y += 15 * scale;
        if (enemies[k].y > H - 80 * scale) {
          loseLife();
          if (state !== "playing") return;
          for (var p = 0; p < enemies.length; p++) enemies[p].y -= 60 * scale;
        }
      }
    }

    // ── Enemy Shooting ───────────────────────────────────────────────
    enemyShootTimer += dt;
    if (enemyShootTimer >= enemyShootInterval && enemies.length > 0) {
      enemyShootTimer = 0;
      var shooters = enemies.filter(function (e) { return e.canShoot; });
      if (shooters.length === 0) shooters = enemies;
      var shooter = shooters[Math.floor(Math.random() * shooters.length)];
      var espeed = (ENEMY_BULLET_SPEED + wave * 0.15) * scale;
      enemyBullets.push({ x: shooter.x, y: shooter.y + 15 * scale, vy: espeed, w: 8, h: 8 });
    }

    // ── Update Enemy Bullets ─────────────────────────────────────────
    for (var eb = enemyBullets.length - 1; eb >= 0; eb--) {
      enemyBullets[eb].y += enemyBullets[eb].vy * (dt / 16);
      if (enemyBullets[eb].y > H + 20) enemyBullets.splice(eb, 1);
    }

    // ── Bullet ↔ Enemy Collisions ────────────────────────────────────
    for (var bi2 = bullets.length - 1; bi2 >= 0; bi2--) {
      var bul = bullets[bi2];
      for (var ei2 = enemies.length - 1; ei2 >= 0; ei2--) {
        var ene = enemies[ei2];
        if (rectsOverlap(bul, ene)) {
          ene.hp -= bul.damage;
          bullets.splice(bi2, 1);
          if (ene.hp <= 0) {
            score += ene.points;
            spawnParticles(ene.x, ene.y, "💥", 3);
            enemies.splice(ei2, 1);
          } else {
            spawnParticles(ene.x, ene.y, "✨", 1);
          }
          break;
        }
      }
    }

    // ── Enemy Bullet ↔ Player Collisions ─────────────────────────────
    if (invincibleTimer <= 0) {
      var playerHitbox = { x: player.x, y: player.y, w: 56, h: 40 };
      for (var eb2 = enemyBullets.length - 1; eb2 >= 0; eb2--) {
        if (rectsOverlap(enemyBullets[eb2], playerHitbox)) {
          enemyBullets.splice(eb2, 1);
          if (shieldHits > 0) {
            shieldHits--;
            spawnParticles(player.x, player.y, "🛡️", 2);
            haptic(50);
          } else {
            loseLife();
            if (state !== "playing") return;
          }
        }
      }
    }

    // ── Check Wave Complete ──────────────────────────────────────────
    if (enemies.length === 0 && waveDelay <= 0) {
      score += wave * 50;
      waveDelay = 1500;
    }
    if (waveDelay > 0) {
      waveDelay -= dt;
      if (waveDelay <= 0) spawnWave();
    }

    // ── Particles ────────────────────────────────────────────────────
    for (var pi = particles.length - 1; pi >= 0; pi--) {
      var pp = particles[pi];
      pp.x += pp.vx * (dt / 16);
      pp.y += pp.vy * (dt / 16);
      pp.life -= dt;
      if (pp.life <= 0) particles.splice(pi, 1);
    }
  }

  function loseLife() {
    lives--;

    // Big explosion + screen flash + haptic
    spawnExplosion(player.x, player.y);
    deathFlashTimer = 400;
    haptic(200);

    if (lives <= 0) {
      state = "dead";
      notifyParent({ type: "game_over", score: score, lives: 0 });
    } else {
      notifyParent({ type: "life_lost", score: score, lives: lives });
      invincibleTimer = 1500; // 1.5s invincibility
      // Clear nearby bullets
      for (var i = enemyBullets.length - 1; i >= 0; i--) {
        var d = Math.abs(enemyBullets[i].x - player.x) + Math.abs(enemyBullets[i].y - player.y);
        if (d < 80 * scale) enemyBullets.splice(i, 1);
      }
    }
  }

  // ── Draw Helper: Rounded Rect ─────────────────────────────────────
  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ── Draw Helper: Arc Ring (heat/cooldown indicator) ────────────────
  function drawArcRing(cx, cy, radius, pct, color, lineWidth) {
    if (pct <= 0) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.min(pct, 1) * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Draw ─────────────────────────────────────────────────────────────
  function draw() {
    ctx.fillStyle = "#0a0a2e";
    ctx.fillRect(0, 0, W, H);

    // Death flash overlay
    if (deathFlashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(deathFlashTimer / 400, 0.5);
      ctx.fillStyle = "#ff2200";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    drawStars(16);

    if (state === "waiting") { drawWaiting(); return; }
    if (state === "dead") { drawDead(); return; }

    // ── Laser Beam ───────────────────────────────────────────────────
    if (laserActive > 0) {
      var la = laserActive / LASER_DURATION;
      ctx.save();
      ctx.globalAlpha = la * 0.7;
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 6 * scale;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 20 * scale;
      ctx.beginPath();
      ctx.moveTo(laserX, player.y);
      ctx.lineTo(laserX, 0);
      ctx.stroke();
      ctx.restore();
    }

    // ── Enemies ──────────────────────────────────────────────────────
    for (var i = 0; i < enemies.length; i++) {
      drawEmoji(enemies[i].emoji, enemies[i].x, enemies[i].y, 24);
    }

    // ── Bullets ──────────────────────────────────────────────────────
    ctx.fillStyle = "#ffff00";
    for (var j = 0; j < bullets.length; j++) {
      ctx.beginPath();
      ctx.arc(bullets[j].x, bullets[j].y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Enemy Bullets ────────────────────────────────────────────────
    ctx.fillStyle = "#ff4444";
    for (var k = 0; k < enemyBullets.length; k++) {
      ctx.beginPath();
      ctx.arc(enemyBullets[k].x, enemyBullets[k].y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Missiles in flight ───────────────────────────────────────────
    for (var mi = 0; mi < missiles.length; mi++) {
      drawEmoji("🚀", missiles[mi].x, missiles[mi].y, 16);
    }

    // ── Missile Launcher Indicators (corner positions) ──────────────
    if (missileLevel >= 1) {
      var mcd = Math.max(0, missileReady - Date.now());
      var mPct = 1 - mcd / MISSILE_COOLDOWN;
      var lAlpha = mPct >= 1 ? 0.9 : 0.3;

      ctx.save();
      ctx.globalAlpha = lAlpha;
      drawEmoji("🚀", 20 * scale, H - 20 * scale, 14);
      if (missileLevel >= 2) {
        drawEmoji("🚀", W - 20 * scale, H - 20 * scale, 14);
      }

      if (mPct < 1) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = "#ff8844";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(20 * scale, H - 20 * scale, 12 * scale, -Math.PI / 2, -Math.PI / 2 + mPct * Math.PI * 2);
        ctx.stroke();
        if (missileLevel >= 2) {
          ctx.beginPath();
          ctx.arc(W - 20 * scale, H - 20 * scale, 12 * scale, -Math.PI / 2, -Math.PI / 2 + mPct * Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // ── Player ───────────────────────────────────────────────────────
    // Blink during invincibility
    var showPlayer = invincibleTimer <= 0 || Math.floor(invincibleTimer / 100) % 2 === 0;
    if (showPlayer) {
      if (hasGhostShip || hasGhostShip2) {
        drawShip(player.x - 40 * scale, player.y + 10 * scale, 20, 0.35);
        if (hasGhostShip2) {
          drawShip(player.x + 40 * scale, player.y + 10 * scale, 20, 0.35);
        }
      }
      drawShip(player.x, player.y, 24, 1);
    }

    // Shield indicator
    if (shieldHits > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#00ccff";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 20 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      for (var si = 0; si < shieldHits; si++) {
        drawEmoji("🛡️", player.x - 15 * scale + si * 12 * scale, player.y - 22 * scale, 8);
      }
    }

    // ── Particles ────────────────────────────────────────────────────
    for (var pi = 0; pi < particles.length; pi++) {
      var pp = particles[pi];
      ctx.globalAlpha = pp.life / 700;
      drawEmoji(pp.emoji, pp.x, pp.y, pp.size);
    }
    ctx.globalAlpha = 1;

    // ── Touch Buttons ────────────────────────────────────────────────
    drawTouchButtons();

    // ── HUD ──────────────────────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold " + Math.round(14 * scale) + "px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 10, 10);
    ctx.fillText("Wave: " + wave, 10, 28 * scale);

    // Wave complete
    if (waveDelay > 0 && enemies.length === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold " + Math.round(24 * scale) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Wave " + wave + " Complete! +" + (wave * 50) + " pts", W / 2, H / 2);
    }
  }

  function drawTouchButtons() {
    var btns = getButtonRects();
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var ready = false;
      var emoji = "";
      var label = "";
      var heatPct = 0; // for heat ring overlay

      if (b.id === "fire") {
        ready = !gunOverheated;
        emoji = "🔫";
        heatPct = gunHeat / GUN_MAX_HEAT;
        if (gunOverheated) label = "HOT";
      } else if (b.id === "missile") {
        ready = Date.now() >= missileReady;
        emoji = "🚀";
        if (!ready) {
          label = Math.ceil(Math.max(0, missileReady - Date.now()) / 1000) + "s";
        }
      } else if (b.id === "laser") {
        ready = Date.now() >= laserReady;
        emoji = "⚡";
        if (!ready) {
          label = Math.ceil(Math.max(0, laserReady - Date.now()) / 1000) + "s";
        }
      }

      ctx.save();
      ctx.globalAlpha = ready ? 0.8 : 0.4;
      ctx.fillStyle = ready ? "#334466" : "#222233";
      ctx.strokeStyle = ready ? "#88aacc" : "#445566";
      ctx.lineWidth = 2 * scale;

      // Rounded rect background
      var r = 8 * scale;
      drawRoundedRect(b.x, b.y, b.w, b.h, r);
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = 1;

      // Emoji icon
      drawEmoji(emoji, b.x + b.w / 2, b.y + b.h / 2 - (label ? 4 * scale : 0), 20);

      // Cooldown timer text for specials
      if (label) {
        ctx.fillStyle = b.id === "fire" ? "#ff4444" : "#aaaaaa";
        ctx.font = "bold " + Math.round(10 * scale) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 10 * scale);
      }

      // Heat ring for fire button
      if (b.id === "fire" && heatPct > 0) {
        var ringRadius = (b.w / 2) - 3 * scale;
        var ringColor = gunOverheated ? "#ff2200" : (heatPct > 0.7 ? "#ff8800" : "#ffcc00");
        ctx.globalAlpha = 0.9;
        drawArcRing(b.x + b.w / 2, b.y + b.h / 2, ringRadius, heatPct, ringColor, 3 * scale);
      }

      // Cooldown ring for missile button
      if (b.id === "missile") {
        var mcdLeft = Math.max(0, missileReady - Date.now());
        if (mcdLeft > 0) {
          var mCdPct = 1 - mcdLeft / MISSILE_COOLDOWN;
          ctx.globalAlpha = 0.7;
          drawArcRing(b.x + b.w / 2, b.y + b.h / 2, (b.w / 2) - 3 * scale, mCdPct, "#ff8844", 3 * scale);
        }
      }

      // Cooldown ring for laser button
      if (b.id === "laser") {
        var lcd = Math.max(0, laserReady - Date.now());
        var laserCd = hasAutoLaser ? LASER_COOLDOWN_AUTO : LASER_COOLDOWN;
        if (lcd > 0) {
          var lCdPct = 1 - lcd / laserCd;
          ctx.globalAlpha = 0.7;
          drawArcRing(b.x + b.w / 2, b.y + b.h / 2, (b.w / 2) - 3 * scale, lCdPct, "#00ccff", 3 * scale);
        }
      }

      ctx.restore();
    }
  }

  function drawWaiting() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold " + Math.round(28 * scale) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EMOJI INVADERS", W / 2, H * 0.3);

    drawShip(W / 2 - 50 * scale, H * 0.45, 26, 1);
    drawEmoji("👾", W / 2, H * 0.45, 32);
    drawEmoji("👽", W / 2 + 50 * scale, H * 0.45, 32);

    ctx.font = Math.round(16 * scale) + "px sans-serif";
    ctx.fillStyle = "#aaaacc";
    ctx.fillText("Tap to start", W / 2, H * 0.6);
  }

  function drawDead() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold " + Math.round(28 * scale) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", W / 2, H * 0.35);

    ctx.font = "bold " + Math.round(20 * scale) + "px sans-serif";
    ctx.fillStyle = "#ffcc00";
    ctx.fillText("Score: " + score, W / 2, H * 0.45);
    ctx.fillText("Wave: " + wave, W / 2, H * 0.52);

    for (var pi = 0; pi < particles.length; pi++) {
      var pp = particles[pi];
      ctx.globalAlpha = pp.life / 700;
      drawEmoji(pp.emoji, pp.x, pp.y, pp.size);
    }
    ctx.globalAlpha = 1;
  }

  // ── Game Loop ────────────────────────────────────────────────────────
  function loop(now) {
    resize();
    update(now);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ── Message Handling ─────────────────────────────────────────────────
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || !data.type) return;

    if (data.type === "init_game") {
      lives = data.lives || 3;
      upgrades = data.upgrades || [];
      state = "waiting";
    }

    if (data.type === "init_lives") {
      lives = data.lives || 3;
    }
  });

})();
