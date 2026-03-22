/* ═══════════════════════════════════════════════════════════════════
   Fort Alphabet — Tower Defense
   A kid-friendly top-down lane defense game where letters march
   toward your base. Place spelling-themed defenses to stop them.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  // ── Sizing ──────────────────────────────────────────────────────
  var W, H, scale, COLS, ROWS, CELL, topBarH, bottomBarH, gridOffX, gridOffY;
  COLS = 9;
  ROWS = 12;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(W / 400, H / 700);
    topBarH = Math.round(48 * scale);
    bottomBarH = Math.round(90 * scale);
    var gridH = H - topBarH - bottomBarH;
    CELL = Math.floor(Math.min((W - 8) / COLS, gridH / ROWS));
    gridOffX = Math.floor((W - COLS * CELL) / 2);
    gridOffY = topBarH + Math.floor((gridH - ROWS * CELL) / 2);
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Game State ──────────────────────────────────────────────────
  var STATE_MENU = 0, STATE_PLAYING = 1, STATE_WAVE_CLEAR = 2, STATE_LEVEL_CLEAR = 3, STATE_GAME_OVER = 4;
  var gameState = STATE_MENU;
  var arcadeLives = 3;   // meta-game lives (cost coins to buy)
  var baseHP = 20;       // in-game base health per level
  var maxBaseHP = 20;
  var gold = 0;          // in-game defenders to deploy (earned by killing)
  var score = 0;         // overall score for leaderboard
  var totalStars = 0;    // across all levels
  var levelStars = [0, 0, 0, 0, 0]; // stars per level (best)
  var currentLevel = 0;
  var currentWave = 0;
  var totalWavesInLevel = 0;
  var wavesCompleted = 0; // how many waves beaten this run
  var enemies = [];
  var towers = [];
  var projectiles = [];
  var particles = [];
  var grid = [];         // 2D array: 0=empty, 1=path, 2=entry, 3=base, 4=tower
  var path = [];         // ordered cells for enemies to follow
  var waveQueue = [];    // enemies left to spawn this wave
  var spawnTimer = 0;
  var spawnInterval = 0.8;
  var waveDelay = 0;     // countdown between waves
  var selectedTower = -1; // index into TOWER_DEFS
  var ownedUpgrades = {};
  var fastForward = false;
  var levelSelectScroll = 0;
  var BASE_HP_PER_LEVEL = 10;
  var baseShakeTimer = 0; // screen shake when base hit

  // Stars required to unlock each level
  var STARS_TO_UNLOCK = [0, 6, 14, 22, 30];

  // ── PostMessage Protocol ────────────────────────────────────────
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || !d.type) return;
    if (d.type === "init_game") {
      arcadeLives = d.lives || 3;
      if (d.upgrades && Array.isArray(d.upgrades)) {
        ownedUpgrades = {};
        for (var i = 0; i < d.upgrades.length; i++) {
          ownedUpgrades[d.upgrades[i]] = true;
        }
      }
      // Load saved stars from upgrades data
      if (d.levelStars && Array.isArray(d.levelStars)) {
        for (var j = 0; j < 5; j++) {
          levelStars[j] = d.levelStars[j] || 0;
        }
        totalStars = levelStars.reduce(function (s, v) { return s + v; }, 0);
      }
      gameState = STATE_MENU;
    }
  });

  function postMsg(type, data) {
    var msg = { type: type };
    if (data) {
      for (var k in data) msg[k] = data[k];
    }
    window.parent.postMessage(msg, "*");
  }

  // ── Tower Definitions ──────────────────────────────────────────
  var TOWER_DEFS = [
    {
      id: "pencil",    name: "Pencil Turret", emoji: "✏️",  cost: 8,
      range: 2.5, damage: 8, fireRate: 0.8, projSpeed: 6, projColor: "#f59e0b",
      description: "Basic shooter"
    },
    {
      id: "rubber",    name: "Rubber Cannon", emoji: "🔴",  cost: 12,
      range: 2.2, damage: 20, fireRate: 1.8, projSpeed: 4, projColor: "#ef4444",
      knockback: 0.3, description: "High damage, knockback"
    },
    {
      id: "glue",      name: "Glue Trap",     emoji: "💧",  cost: 6,
      range: 0, damage: 0, fireRate: 0, slowFactor: 0.4, slowDuration: 2,
      onPath: true, description: "Slows enemies"
    },
    {
      id: "dictionary", name: "Dictionary Tower", emoji: "📖", cost: 20,
      range: 3.5, damage: 30, fireRate: 2.5, projSpeed: 8, projColor: "#8b5cf6",
      description: "Long range zapper"
    },
    {
      id: "eraser",    name: "Eraser Mine",    emoji: "🧹",  cost: 10,
      range: 0, damage: 60, fireRate: 0, aoeRadius: 1.5,
      onPath: true, oneUse: true, requiresUpgrade: "eraser_mines",
      description: "One-use big boom"
    },
    {
      id: "ink",       name: "Ink Blaster",    emoji: "🖊️",  cost: 15,
      range: 2.5, damage: 12, fireRate: 1.2, projSpeed: 5, projColor: "#1e40af",
      splash: 1.0, requiresUpgrade: "ink_blaster",
      description: "Splash damage"
    },
    {
      id: "ruler",     name: "Ruler Sniper",   emoji: "📏",  cost: 25,
      range: 5, damage: 50, fireRate: 3.5, projSpeed: 12, projColor: "#dc2626",
      requiresUpgrade: "ruler_sniper",
      description: "Huge range & damage"
    },
    {
      id: "bookworm",  name: "Bookworm Burrow", emoji: "🐛", cost: 18,
      range: 2, damage: 5, fireRate: 0.4, projSpeed: 3, projColor: "#16a34a",
      requiresUpgrade: "bookworm_burrow", chainTargets: 3,
      description: "Bouncing worms"
    }
  ];

  function getTowerDef(id) {
    for (var i = 0; i < TOWER_DEFS.length; i++) {
      if (TOWER_DEFS[i].id === id) return TOWER_DEFS[i];
    }
    return null;
  }

  function isTowerAvailable(def) {
    if (!def.requiresUpgrade) return true;
    return !!ownedUpgrades[def.requiresUpgrade];
  }

  // ── Enemy Definitions ──────────────────────────────────────────
  var ENEMY_TYPES = {
    A: { hp: 60,  speed: 1.0, color: "#22c55e", coins: 2, points: 10,  baseDmg: 1, emoji: "A", label: "Basic" },
    B: { hp: 50,  speed: 1.5, color: "#3b82f6", coins: 3, points: 15,  baseDmg: 1, emoji: "B", label: "Swift" },
    C: { hp: 150, speed: 0.7, color: "#f97316", coins: 4, points: 25,  baseDmg: 2, emoji: "C", label: "Chunky" },
    D: { hp: 80,  speed: 1.1, color: "#a855f7", coins: 3, points: 20,  baseDmg: 1, emoji: "D", label: "Dodgy" },
    J: { hp: 80,  speed: 1.2, color: "#eab308", coins: 4, points: 25,  baseDmg: 1, emoji: "J", label: "Jumper", jumps: true },
    N: { hp: 120, speed: 0.9, color: "#6b7280", coins: 5, points: 30,  baseDmg: 2, emoji: "N", label: "Armored", armor: 0.5 },
    O: { hp: 70,  speed: 1.0, color: "#ec4899", coins: 3, points: 20,  baseDmg: 1, emoji: "O", label: "Splitter", splits: true },
    S: { hp: 200, speed: 0.5, color: "#14b8a6", coins: 6, points: 35,  baseDmg: 3, emoji: "S", label: "Sleepy" },
    Z: { hp: 180, speed: 1.8, color: "#dc2626", coins: 8, points: 50,  baseDmg: 3, emoji: "Z", label: "Boss" }
  };

  function createEnemy(type, pathIdx) {
    var def = ENEMY_TYPES[type] || ENEMY_TYPES.A;
    var cell = path[pathIdx || 0];
    return {
      type: type,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      color: def.color,
      coins: def.coins,
      points: def.points || 10,
      baseDmg: def.baseDmg || 1,
      emoji: def.emoji,
      armor: def.armor || 0,
      jumps: !!def.jumps,
      splits: !!def.splits,
      pathIdx: pathIdx || 0,
      x: cell ? (cell[0] + 0.5) * CELL + gridOffX : 0,
      y: cell ? (cell[1] + 0.5) * CELL + gridOffY : 0,
      progress: pathIdx || 0, // float along path
      slowTimer: 0,
      slowFactor: 1,
      dead: false,
      isMini: false // for split Os
    };
  }

  // ── Level Definitions ──────────────────────────────────────────
  var LEVELS = [
    {
      name: "Notebook Nook", emoji: "📓",
      startGold: 60,
      waves: [
        { enemies: "AAAA" },
        { enemies: "AAAAAB" },
        { enemies: "AAABBA" }
      ],
      // Path: S-curve from top to bottom
      pathDef: [
        [4,0],[4,1],[4,2],[5,2],[6,2],[7,2],[7,3],[7,4],[7,5],
        [6,5],[5,5],[4,5],[3,5],[2,5],[1,5],[1,6],[1,7],[1,8],
        [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[7,9],[7,10],[7,11],
        [6,11],[5,11],[4,11]
      ]
    },
    {
      name: "Alphabet Garden", emoji: "🌻",
      startGold: 70,
      waves: [
        { enemies: "AAAAAB" },
        { enemies: "AABBCC" },
        { enemies: "BBCCAA" },
        { enemies: "AABBCCDD" },
        { enemies: "CCCCBB" }
      ],
      pathDef: [
        [1,0],[1,1],[1,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
        [7,4],[7,5],[7,6],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],
        [1,7],[1,8],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],
        [7,10],[7,11],[6,11],[5,11],[4,11]
      ]
    },
    {
      name: "Punctuation Park", emoji: "❗",
      startGold: 80,
      waves: [
        { enemies: "AABBCC" },
        { enemies: "BBCCDD" },
        { enemies: "CCNNAA" },
        { enemies: "JJBBCC" },
        { enemies: "OOCCNN" },
        { enemies: "BBCCDDNN" },
        { enemies: "JJNNCCOO" }
      ],
      pathDef: [
        [0,0],[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],
        [4,3],[4,4],[3,4],[2,4],[1,4],[1,5],[1,6],
        [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
        [8,7],[8,8],[7,8],[6,8],[5,8],[4,8],[3,8],
        [3,9],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[8,11]
      ]
    },
    {
      name: "Dictionary Keep", emoji: "🏰",
      startGold: 90,
      waves: [
        { enemies: "BBCCDD" },
        { enemies: "CCNNNN" },
        { enemies: "JJJJBB" },
        { enemies: "OOOOCCNN" },
        { enemies: "SSBBCCNN" },
        { enemies: "DDNNCCJJ" },
        { enemies: "SSNNOOCC" },
        { enemies: "JJSSNNBB" },
        { enemies: "ZZCCNNOO" }
      ],
      pathDef: [
        [4,0],[4,1],[3,1],[2,1],[1,1],[0,1],[0,2],[0,3],[0,4],
        [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],
        [8,5],[8,6],[8,7],[7,7],[6,7],[5,7],[4,7],[3,7],[2,7],[1,7],[0,7],
        [0,8],[0,9],[0,10],[1,10],[2,10],[3,10],[4,10],[4,11]
      ]
    },
    {
      name: "Mount Trickyletter", emoji: "🏔️",
      startGold: 100,
      waves: [
        { enemies: "CCCCDDDD" },
        { enemies: "NNNNBBBB" },
        { enemies: "JJJJOOOO" },
        { enemies: "SSSSCCCC" },
        { enemies: "NNSSDDCC" },
        { enemies: "OOJJNNBB" },
        { enemies: "ZZBBCCNN" },
        { enemies: "SSZZNNOO" },
        { enemies: "JJSSZZCC" },
        { enemies: "ZZNNSSOO" },
        { enemies: "ZZZZSSNN" },
        { enemies: "ZZZZZZZZ" }
      ],
      pathDef: [
        [4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[1,2],[2,2],[3,2],
        [4,2],[5,2],[6,2],[7,2],[8,2],[8,3],[8,4],[7,4],[6,4],[5,4],
        [4,4],[3,4],[2,4],[1,4],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],
        [4,6],[5,6],[6,6],[7,6],[8,6],[8,7],[8,8],[7,8],[6,8],[5,8],
        [4,8],[3,8],[2,8],[1,8],[0,8],[0,9],[0,10],[1,10],[2,10],
        [3,10],[4,10],[4,11]
      ]
    }
  ];

  // ── Initialize Level ───────────────────────────────────────────
  function initLevel(levelIdx) {
    // Consume 1 arcade life to play
    arcadeLives--;
    postMsg("life_lost", { lives: arcadeLives });

    var level = LEVELS[levelIdx];
    currentLevel = levelIdx;
    currentWave = 0;
    wavesCompleted = 0;
    totalWavesInLevel = level.waves.length;
    gold = level.startGold;
    enemies = [];
    towers = [];
    projectiles = [];
    particles = [];
    waveQueue = [];
    spawnTimer = 0;
    waveDelay = 0;
    selectedTower = -1;
    fastForward = false;

    // Base HP
    maxBaseHP = BASE_HP_PER_LEVEL + getBaseExtraHP();
    baseHP = maxBaseHP;

    // Apply upgrade bonuses to starting gold
    if (ownedUpgrades["extra_gold"]) gold += 20;

    // Build grid
    grid = [];
    for (var r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (var c = 0; c < COLS; c++) {
        grid[r][c] = 0;
      }
    }

    // Set path
    path = level.pathDef;
    for (var i = 0; i < path.length; i++) {
      var pc = path[i];
      if (pc[1] >= 0 && pc[1] < ROWS && pc[0] >= 0 && pc[0] < COLS) {
        grid[pc[1]][pc[0]] = 1; // path
      }
    }
    // Mark entry and base
    var entry = path[0];
    var base = path[path.length - 1];
    if (entry[1] >= 0 && entry[1] < ROWS) grid[entry[1]][entry[0]] = 2;
    if (base[1] >= 0 && base[1] < ROWS) grid[base[1]][base[0]] = 3;

    gameState = STATE_PLAYING;
    startWave();
  }

  // ── Wave System ────────────────────────────────────────────────
  function startWave() {
    if (currentWave >= totalWavesInLevel) {
      finishLevel();
      return;
    }
    var wave = LEVELS[currentLevel].waves[currentWave];
    waveQueue = wave.enemies.split("");
    spawnTimer = 0;
    spawnInterval = Math.max(0.4, 0.8 - currentLevel * 0.05 - currentWave * 0.02);
  }

  function finishLevel() {
    // Calculate stars for this run
    var pct = wavesCompleted / totalWavesInLevel;
    var stars = 0;
    if (pct >= 1.0) stars = 5;
    else if (pct >= 0.75) stars = 2;
    else if (pct >= 0.5) stars = 1;

    // Update best stars for this level
    if (stars > levelStars[currentLevel]) {
      levelStars[currentLevel] = stars;
      totalStars = levelStars.reduce(function (s, v) { return s + v; }, 0);
    }

    gameState = STATE_LEVEL_CLEAR;

    // Notify parent
    postMsg("level_complete", {
      level: currentLevel,
      stars: stars,
      bestStars: levelStars[currentLevel],
      totalStars: totalStars,
      levelStars: levelStars,
      score: score
    });
  }

  function damageBase(amount) {
    baseHP -= amount;
    baseShakeTimer = 0.3;
    // Explosion at base
    var bCell = path[path.length - 1];
    var bx = (bCell[0] + 0.5) * CELL + gridOffX;
    var by = (bCell[1] + 0.5) * CELL + gridOffY;
    for (var bp = 0; bp < 4; bp++) {
      var ba = (Math.PI * 2 / 4) * bp;
      particles.push({ x: bx, y: by, vx: Math.cos(ba) * 50, vy: Math.sin(ba) * 50, text: "💥", life: 0.5, maxLife: 0.5, isEmoji: true });
    }
    if (baseHP <= 0) {
      baseHP = 0;
      // Calculate stars even on failure
      var pct = wavesCompleted / totalWavesInLevel;
      var stars = 0;
      if (pct >= 1.0) stars = 5;
      else if (pct >= 0.75) stars = 2;
      else if (pct >= 0.5) stars = 1;
      if (stars > levelStars[currentLevel]) {
        levelStars[currentLevel] = stars;
        totalStars = levelStars.reduce(function (s, v) { return s + v; }, 0);
      }
      gameState = STATE_GAME_OVER;
      postMsg("game_over", {
        score: score,
        level: currentLevel,
        wave: currentWave,
        levelStars: levelStars,
        totalStars: totalStars
      });
    }
  }

  // ── Upgrade Effects ────────────────────────────────────────────
  function getDamageMultiplier(towerId) {
    if (towerId === "pencil" && ownedUpgrades["better_pencils"]) return 1.5;
    if (towerId === "rubber" && ownedUpgrades["super_rubber"]) return 1.3;
    if (towerId === "dictionary" && ownedUpgrades["mega_dictionary"]) return 1.5;
    return 1;
  }

  function getFireRateMultiplier(towerId) {
    if (towerId === "rubber" && ownedUpgrades["super_rubber"]) return 0.7;
    return 1;
  }

  function getSlowMultiplier() {
    return ownedUpgrades["sticky_glue"] ? 0.6 : 1;
  }

  function getBaseExtraHP() {
    return ownedUpgrades["reinforced_base"] ? 2 : 0;
  }

  // ── Tower Placement ────────────────────────────────────────────
  function canPlaceTower(col, row, def) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
    var cellVal = grid[row][col];
    if (def.onPath) {
      return cellVal === 1; // must be on path
    }
    return cellVal === 0; // must be empty
  }

  function placeTower(col, row, defIdx) {
    var def = TOWER_DEFS[defIdx];
    if (!canPlaceTower(col, row, def)) return false;
    if (gold < def.cost) return false;

    gold -= def.cost;
    var tower = {
      col: col,
      row: row,
      defIdx: defIdx,
      id: def.id,
      fireCooldown: 0,
      maxCooldown: def.fireRate || 1,
      fireFlash: 0, // timer for muzzle flash
      lastTargetX: 0,
      lastTargetY: 0,
      x: (col + 0.5) * CELL + gridOffX,
      y: (row + 0.5) * CELL + gridOffY,
      triggered: false // for mines
    };
    towers.push(tower);
    if (!def.onPath) {
      grid[row][col] = 4;
    }
    return true;
  }

  function sellTower(towerIdx) {
    var tower = towers[towerIdx];
    var def = TOWER_DEFS[tower.defIdx];
    var refund = Math.floor(def.cost * 0.6);
    gold += refund;
    if (!def.onPath) {
      grid[tower.row][tower.col] = 0;
    }
    towers.splice(towerIdx, 1);
  }

  // ── Projectile & Combat ────────────────────────────────────────
  function spawnProjectile(tower, target) {
    var def = TOWER_DEFS[tower.defIdx];
    projectiles.push({
      x: tower.x,
      y: tower.y,
      tx: target.x,
      ty: target.y,
      targetRef: target,
      speed: def.projSpeed * CELL,
      damage: def.damage * getDamageMultiplier(def.id),
      color: def.projColor || "#fff",
      knockback: def.knockback || 0,
      splash: def.splash || 0,
      chainTargets: def.chainTargets || 0,
      chainsLeft: def.chainTargets || 0,
      dead: false
    });
  }

  function damageEnemy(enemy, damage) {
    var actualDamage = damage * (1 - enemy.armor);
    enemy.hp -= actualDamage;
    // Damage number particle
    particles.push({
      x: enemy.x, y: enemy.y - CELL * 0.3,
      text: Math.round(actualDamage) + "",
      color: "#fff",
      life: 0.6, maxLife: 0.6,
      vy: -40
    });
    if (enemy.hp <= 0 && !enemy.dead) {
      killEnemy(enemy);
    }
  }

  function killEnemy(enemy) {
    enemy.dead = true;
    gold += enemy.coins;
    score += enemy.points;

    // +defenders particle
    particles.push({
      x: enemy.x - 10, y: enemy.y - CELL * 0.4,
      text: "+👤" + enemy.coins,
      color: "#a78bfa",
      life: 0.8, maxLife: 0.8, vy: -30
    });
    // +points particle
    particles.push({
      x: enemy.x + 10, y: enemy.y - CELL * 0.6,
      text: "+" + enemy.points + "pts",
      color: "#93c5fd",
      life: 0.8, maxLife: 0.8, vy: -25
    });

    // Explosion particles
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI * 2 / 6) * i;
      particles.push({
        x: enemy.x, y: enemy.y,
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60,
        text: "✨",
        life: 0.5, maxLife: 0.5,
        isEmoji: true
      });
    }

    // Splitter: spawn 2 mini-Os
    if (enemy.splits && !enemy.isMini) {
      for (var s = 0; s < 2; s++) {
        var mini = createEnemy("A", 0);
        mini.progress = enemy.progress + (s === 0 ? -0.3 : 0.3);
        mini.progress = Math.max(0, Math.min(mini.progress, path.length - 1));
        mini.hp = 30;
        mini.maxHp = 30;
        mini.speed = 1.3;
        mini.emoji = "o";
        mini.color = "#f472b6";
        mini.coins = 1;
        mini.isMini = true;
        updateEnemyPosition(mini);
        enemies.push(mini);
      }
    }
  }

  // ── Enemy Movement ─────────────────────────────────────────────
  function updateEnemyPosition(enemy) {
    var idx = Math.floor(enemy.progress);
    var frac = enemy.progress - idx;
    if (idx >= path.length - 1) {
      var last = path[path.length - 1];
      enemy.x = (last[0] + 0.5) * CELL + gridOffX;
      enemy.y = (last[1] + 0.5) * CELL + gridOffY;
      return;
    }
    var a = path[idx];
    var b = path[idx + 1];
    enemy.x = ((a[0] + 0.5) + (b[0] - a[0]) * frac) * CELL + gridOffX;
    enemy.y = ((a[1] + 0.5) + (b[1] - a[1]) * frac) * CELL + gridOffY;
  }

  function dist(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Update Logic ───────────────────────────────────────────────
  var lastTime = 0;

  function update(dt) {
    if (gameState !== STATE_PLAYING) return;
    var speed = fastForward ? 2 : 1;
    dt *= speed;

    // Wave delay between waves
    if (waveDelay > 0) {
      waveDelay -= dt;
      if (waveDelay <= 0) {
        startWave();
      }
      return;
    }

    // Spawn enemies
    if (waveQueue.length > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        var letter = waveQueue.shift();
        enemies.push(createEnemy(letter, 0));
        spawnTimer = spawnInterval;
      }
    }

    // Move enemies
    for (var ei = enemies.length - 1; ei >= 0; ei--) {
      var enemy = enemies[ei];
      if (enemy.dead) {
        enemies.splice(ei, 1);
        continue;
      }

      var spd = enemy.speed * enemy.slowFactor;
      // Jumper: double speed over glue
      if (enemy.jumps) spd = enemy.speed;

      enemy.progress += spd * dt * 1.2;

      // Slow timer
      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        if (enemy.slowTimer <= 0) enemy.slowFactor = 1;
      }

      updateEnemyPosition(enemy);

      // Check if reached base
      if (enemy.progress >= path.length - 1) {
        damageBase(enemy.baseDmg);
        enemies.splice(ei, 1);
        if (gameState === STATE_GAME_OVER) return;
      }
    }

    // Base shake decay
    if (baseShakeTimer > 0) baseShakeTimer -= dt;

    // Tower logic
    for (var ti = 0; ti < towers.length; ti++) {
      var tower = towers[ti];
      var def = TOWER_DEFS[tower.defIdx];
      if (tower.fireFlash > 0) tower.fireFlash -= dt;

      // Glue trap: slow enemies in cell
      if (def.id === "glue") {
        var slowAmt = def.slowFactor * getSlowMultiplier();
        for (var gi = 0; gi < enemies.length; gi++) {
          var ge = enemies[gi];
          if (ge.dead || ge.jumps) continue;
          var dx = ge.x - tower.x, dy = ge.y - tower.y;
          if (Math.abs(dx) < CELL * 0.6 && Math.abs(dy) < CELL * 0.6) {
            ge.slowFactor = slowAmt;
            ge.slowTimer = def.slowDuration;
          }
        }
        continue;
      }

      // Eraser mine: trigger when enemy near
      if (def.id === "eraser" && !tower.triggered) {
        for (var mi = 0; mi < enemies.length; mi++) {
          var me = enemies[mi];
          if (me.dead) continue;
          if (dist(me.x, me.y, tower.x, tower.y) < CELL * 0.8) {
            tower.triggered = true;
            // AoE damage
            var aoeR = def.aoeRadius * CELL;
            for (var ai = 0; ai < enemies.length; ai++) {
              if (!enemies[ai].dead && dist(enemies[ai].x, enemies[ai].y, tower.x, tower.y) < aoeR) {
                damageEnemy(enemies[ai], def.damage * getDamageMultiplier(def.id));
              }
            }
            // Explosion particles
            for (var pi = 0; pi < 8; pi++) {
              var ang = (Math.PI * 2 / 8) * pi;
              particles.push({
                x: tower.x, y: tower.y,
                vx: Math.cos(ang) * 100, vy: Math.sin(ang) * 100,
                text: "💥", life: 0.5, maxLife: 0.5, isEmoji: true
              });
            }
            // Remove mine
            if (!def.onPath) grid[tower.row][tower.col] = 0;
            towers.splice(ti, 1);
            ti--;
            break;
          }
        }
        continue;
      }

      // Shooting towers
      if (def.range > 0 && def.fireRate > 0) {
        tower.fireCooldown -= dt;
        if (tower.fireCooldown <= 0) {
          // Find nearest enemy in range
          var best = null, bestDist = Infinity;
          var rangePx = def.range * CELL;
          for (var si = 0; si < enemies.length; si++) {
            if (enemies[si].dead) continue;
            var d = dist(enemies[si].x, enemies[si].y, tower.x, tower.y);
            if (d < rangePx && d < bestDist) {
              best = enemies[si];
              bestDist = d;
            }
          }
          if (best) {
            spawnProjectile(tower, best);
            tower.fireCooldown = def.fireRate * getFireRateMultiplier(def.id);
            tower.maxCooldown = tower.fireCooldown;
            tower.fireFlash = 0.15;
            tower.lastTargetX = best.x;
            tower.lastTargetY = best.y;
          }
        }
      }
    }

    // Projectiles
    for (var pri = projectiles.length - 1; pri >= 0; pri--) {
      var proj = projectiles[pri];
      if (proj.dead) { projectiles.splice(pri, 1); continue; }

      // Move toward target
      var target = proj.targetRef;
      if (!target || target.dead) {
        // Find new target or die
        if (proj.chainsLeft > 0) {
          var newTarget = findNearestEnemy(proj.x, proj.y, CELL * 3);
          if (newTarget) {
            proj.targetRef = newTarget;
            proj.chainsLeft--;
            target = newTarget;
          } else {
            proj.dead = true; continue;
          }
        } else {
          proj.dead = true; continue;
        }
      }

      var pdx = target.x - proj.x;
      var pdy = target.y - proj.y;
      var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      var moveAmt = proj.speed * CELL * dt;

      if (pdist < moveAmt + 5) {
        // Hit!
        damageEnemy(target, proj.damage);

        // Knockback
        if (proj.knockback > 0 && !target.dead) {
          target.progress = Math.max(0, target.progress - proj.knockback);
          updateEnemyPosition(target);
        }

        // Splash damage
        if (proj.splash > 0) {
          var splashR = proj.splash * CELL;
          for (var spi = 0; spi < enemies.length; spi++) {
            if (enemies[spi] !== target && !enemies[spi].dead) {
              if (dist(enemies[spi].x, enemies[spi].y, target.x, target.y) < splashR) {
                damageEnemy(enemies[spi], proj.damage * 0.5);
              }
            }
          }
        }

        // Chain to next target
        if (proj.chainsLeft > 0 && !target.dead) {
          var chain = findNearestEnemy(target.x, target.y, CELL * 2, target);
          if (chain) {
            proj.targetRef = chain;
            proj.chainsLeft--;
            proj.damage *= 0.7; // reduce each bounce
          } else {
            proj.dead = true;
          }
        } else {
          proj.dead = true;
        }
      } else {
        proj.x += (pdx / pdist) * moveAmt;
        proj.y += (pdy / pdist) * moveAmt;
      }
    }

    // Particles
    for (var pti = particles.length - 1; pti >= 0; pti--) {
      var part = particles[pti];
      part.life -= dt;
      if (part.life <= 0) { particles.splice(pti, 1); continue; }
      if (part.vx) part.x += part.vx * dt;
      if (part.vy) part.y += part.vy * dt;
    }

    // Auto-repair upgrade
    if (ownedUpgrades["auto_repair"] && lives < 3 + getBaseExtraHP()) {
      // Very slow regen — not implementing per-frame, just a note
    }

    // Check wave clear
    if (waveQueue.length === 0 && enemies.length === 0 && gameState === STATE_PLAYING) {
      wavesCompleted++;
      currentWave++;
      if (currentWave >= totalWavesInLevel) {
        finishLevel();
      } else {
        waveDelay = 2.0; // 2 second break between waves
        gameState = STATE_PLAYING; // stay playing during delay
      }
    }
  }

  function findNearestEnemy(x, y, maxDist, exclude) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].dead || enemies[i] === exclude) continue;
      var d = dist(enemies[i].x, enemies[i].y, x, y);
      if (d < maxDist && d < bestD) {
        best = enemies[i];
        bestD = d;
      }
    }
    return best;
  }

  // ── Drawing ────────────────────────────────────────────────────
  var grassColors = ["#86efac", "#4ade80"];
  var grassDark = ["#22c55e", "#16a34a"];
  var pathColor = "#e8c99b";
  var pathBorder = "#c9a97a";
  var pathDot = "#b8956a";

  function draw() {
    ctx.clearRect(0, 0, W, H);

    if (gameState === STATE_MENU) {
      drawMenu();
      return;
    }

    // Background
    ctx.fillStyle = "#1a4a1a";
    ctx.fillRect(0, 0, W, H);

    // Screen shake offset
    var shakeX = 0, shakeY = 0;
    if (baseShakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * 6;
      shakeY = (Math.random() - 0.5) * 6;
    }
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Draw grid
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cx = c * CELL + gridOffX;
        var cy = r * CELL + gridOffY;
        var val = grid[r][c];

        if (val === 1 || val === 2 || val === 3) {
          // Path — sandy tiles with dotted edges
          ctx.fillStyle = pathColor;
          ctx.fillRect(cx, cy, CELL, CELL);
          // Inner shadow for depth
          ctx.fillStyle = pathBorder;
          ctx.fillRect(cx, cy, CELL, 2);
          ctx.fillRect(cx, cy, 2, CELL);
          // Footstep dots
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = pathDot;
            ctx.beginPath();
            ctx.arc(cx + CELL * 0.35, cy + CELL * 0.5, 2, 0, Math.PI * 2);
            ctx.arc(cx + CELL * 0.65, cy + CELL * 0.45, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (val === 4) {
          // Tower cell — slightly darker grass
          ctx.fillStyle = grassDark[(r + c) % 2];
          ctx.fillRect(cx, cy, CELL, CELL);
        } else {
          // Grass — alternating light tiles
          ctx.fillStyle = grassColors[(r + c) % 2];
          ctx.fillRect(cx, cy, CELL, CELL);
          // Tiny grass tufts for texture
          if ((r * 7 + c * 3) % 5 === 0) {
            ctx.fillStyle = "rgba(0,100,0,0.15)";
            ctx.fillRect(cx + CELL * 0.3, cy + CELL * 0.6, 3, 5);
            ctx.fillRect(cx + CELL * 0.6, cy + CELL * 0.3, 3, 5);
          }
        }

        // Entry marker
        if (val === 2) {
          ctx.fillStyle = "rgba(59,130,246,0.25)";
          ctx.fillRect(cx, cy, CELL, CELL);
          drawEmoji("⚔️", cx + CELL / 2, cy + CELL / 2, CELL * 0.5);
        }

        // Base marker — show HP on the house
        if (val === 3) {
          ctx.fillStyle = "rgba(239,68,68,0.3)";
          ctx.fillRect(cx, cy, CELL, CELL);
          drawEmoji("🏠", cx + CELL / 2, cy + CELL / 2 - 4, CELL * 0.5);
          // HP number on house
          ctx.fillStyle = baseHP > maxBaseHP * 0.5 ? "#22c55e" : baseHP > maxBaseHP * 0.25 ? "#eab308" : "#ef4444";
          ctx.font = "bold " + Math.round(CELL * 0.3) + "px Nunito, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(baseHP + "/" + maxBaseHP, cx + CELL / 2, cy + CELL / 2 + CELL * 0.3);
        }
      }
    }

    // Highlight valid placement cells
    if (selectedTower >= 0) {
      var sDef = TOWER_DEFS[selectedTower];
      for (var hr = 0; hr < ROWS; hr++) {
        for (var hc = 0; hc < COLS; hc++) {
          if (canPlaceTower(hc, hr, sDef)) {
            ctx.fillStyle = "rgba(59,130,246,0.2)";
            ctx.fillRect(hc * CELL + gridOffX, hr * CELL + gridOffY, CELL, CELL);
          }
        }
      }
    }

    // Draw on-path towers (glue, mines — under enemies)
    for (var gt = 0; gt < towers.length; gt++) {
      var gTower = towers[gt];
      var gDef = TOWER_DEFS[gTower.defIdx];
      if (gDef.onPath) {
        // Puddle/glow effect
        if (gDef.id === "glue") {
          ctx.fillStyle = "rgba(59,130,246,0.25)";
          ctx.beginPath();
          ctx.ellipse(gTower.x, gTower.y, CELL * 0.4, CELL * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (gDef.id === "eraser") {
          ctx.fillStyle = "rgba(239,68,68,0.2)";
          ctx.beginPath();
          ctx.arc(gTower.x, gTower.y, CELL * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        drawEmoji(gDef.emoji, gTower.x, gTower.y, CELL * 0.5);
      }
    }

    // Draw enemies
    for (var de = 0; de < enemies.length; de++) {
      var en = enemies[de];
      if (en.dead) continue;
      var eSize = en.isMini ? CELL * 0.35 : CELL * 0.45;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(en.x + 2, en.y + 3, eSize * 0.9, eSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Letter circle with gradient feel
      ctx.beginPath();
      ctx.arc(en.x, en.y, eSize, 0, Math.PI * 2);
      ctx.fillStyle = en.color;
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(en.x - eSize * 0.2, en.y - eSize * 0.2, eSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
      // Border
      ctx.beginPath();
      ctx.arc(en.x, en.y, eSize, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Letter text with shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.font = "bold " + Math.round(eSize * 1.2) + "px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(en.emoji, en.x + 1, en.y + 2);
      ctx.fillStyle = "#fff";
      ctx.fillText(en.emoji, en.x, en.y + 1);

      // HP bar
      if (en.hp < en.maxHp) {
        var barW = CELL * 0.7;
        var barH = 4;
        var barX = en.x - barW / 2;
        var barY = en.y - eSize - 6;
        ctx.fillStyle = "#333";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = en.hp / en.maxHp > 0.5 ? "#22c55e" : en.hp / en.maxHp > 0.25 ? "#eab308" : "#ef4444";
        ctx.fillRect(barX, barY, barW * (en.hp / en.maxHp), barH);
      }

      // Slow indicator
      if (en.slowTimer > 0) {
        ctx.fillStyle = "rgba(59,130,246,0.5)";
        ctx.beginPath();
        ctx.arc(en.x, en.y, eSize + 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Armor indicator
      if (en.armor > 0) {
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(en.x, en.y, eSize + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw towers (not on path)
    for (var dt2 = 0; dt2 < towers.length; dt2++) {
      var tw = towers[dt2];
      var twDef = TOWER_DEFS[tw.defIdx];
      if (twDef.onPath) continue;
      var tSize = CELL * 0.45;

      // Firing line flash (draw before tower)
      if (tw.fireFlash > 0 && twDef.projColor) {
        ctx.globalAlpha = tw.fireFlash / 0.15;
        ctx.strokeStyle = twDef.projColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(tw.x, tw.y);
        ctx.lineTo(tw.lastTargetX, tw.lastTargetY);
        ctx.stroke();
        // Muzzle flash glow
        ctx.fillStyle = twDef.projColor;
        ctx.beginPath();
        ctx.arc(tw.x, tw.y, tSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Tower base circle
      ctx.fillStyle = "#fef9c3";
      ctx.beginPath();
      ctx.arc(tw.x, tw.y, tSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cooldown ring (shows recharge progress)
      if (twDef.fireRate > 0 && tw.fireCooldown > 0) {
        var cdPct = tw.fireCooldown / tw.maxCooldown;
        ctx.strokeStyle = "rgba(239,68,68,0.6)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tw.x, tw.y, tSize + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cdPct);
        ctx.stroke();
      } else if (twDef.fireRate > 0) {
        // Ready indicator — green ring
        ctx.strokeStyle = "rgba(34,197,94,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tw.x, tw.y, tSize + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawEmoji(twDef.emoji, tw.x, tw.y, tSize * 0.9);
    }

    // Draw projectiles with trails
    for (var dp = 0; dp < projectiles.length; dp++) {
      var pr = projectiles[dp];
      if (pr.dead) continue;
      // Trail
      ctx.strokeStyle = pr.color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(pr.x - (pr.tx - pr.x) * 0.15, pr.y - (pr.ty - pr.y) * 0.15);
      ctx.lineTo(pr.x, pr.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Projectile head
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw particles
    for (var dpt = 0; dpt < particles.length; dpt++) {
      var pt = particles[dpt];
      var alpha = pt.life / pt.maxLife;
      if (pt.isEmoji) {
        ctx.globalAlpha = alpha;
        drawEmoji(pt.text, pt.x, pt.y, 14 * scale);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = pt.color || "#fff";
        ctx.globalAlpha = alpha;
        ctx.font = "bold " + Math.round(12 * scale) + "px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pt.text, pt.x, pt.y);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore(); // end screen shake

    // ── Top Bar ──────────────────────────────────────────────────
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, W, topBarH);

    var barY = topBarH / 2;
    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(13 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Level name
    var levelInfo = LEVELS[currentLevel];
    ctx.fillText(levelInfo.emoji + " " + levelInfo.name, 8, barY - 8 * scale);

    // Wave info
    ctx.font = Math.round(11 * scale) + "px Nunito, sans-serif";
    ctx.fillStyle = "#a3e635";
    ctx.fillText("Wave " + (currentWave + 1) + "/" + totalWavesInLevel, 8, barY + 10 * scale);

    // Defenders & score
    ctx.textAlign = "center";
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold " + Math.round(13 * scale) + "px Nunito, sans-serif";
    ctx.fillText("👤 " + gold, W / 2, barY - 8 * scale);
    ctx.fillStyle = "#93c5fd";
    ctx.font = Math.round(10 * scale) + "px Nunito, sans-serif";
    ctx.fillText("⚔️ " + score + " pts", W / 2, barY + 9 * scale);

    // Base HP bar
    ctx.textAlign = "right";
    var hpBarW = 60 * scale;
    var hpBarH = 8 * scale;
    var hpBarX = W - 50 - hpBarW;
    var hpBarY = barY - hpBarH / 2 - 4 * scale;
    ctx.fillStyle = "#333";
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    var hpPct = baseHP / maxBaseHP;
    ctx.fillStyle = hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#eab308" : "#ef4444";
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpPct, hpBarH);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);
    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(10 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏠 " + baseHP + "/" + maxBaseHP, hpBarX + hpBarW / 2, hpBarY + hpBarH + 12 * scale);

    // Fast forward button
    ctx.textAlign = "right";
    ctx.fillStyle = fastForward ? "#fbbf24" : "#666";
    ctx.font = "bold " + Math.round(16 * scale) + "px Nunito, sans-serif";
    ctx.fillText("⏩", W - 8, barY);

    // Wave delay indicator
    if (waveDelay > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, topBarH, W, 30 * scale);
      ctx.fillStyle = "#a3e635";
      ctx.font = "bold " + Math.round(14 * scale) + "px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Next wave in " + Math.ceil(waveDelay) + "s", W / 2, topBarH + 15 * scale);
    }

    // ── Bottom Bar (Tower Selection) ─────────────────────────────
    var barTop = H - bottomBarH;
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, barTop, W, bottomBarH);

    var btnSize = Math.round(CELL * 1.1);
    var btnGap = 6;
    var availableTowers = [];
    for (var ati = 0; ati < TOWER_DEFS.length; ati++) {
      if (isTowerAvailable(TOWER_DEFS[ati])) {
        availableTowers.push(ati);
      }
    }

    var totalBtnW = availableTowers.length * (btnSize + btnGap) - btnGap;
    var btnStartX = (W - totalBtnW) / 2;

    for (var bi = 0; bi < availableTowers.length; bi++) {
      var bIdx = availableTowers[bi];
      var bDef = TOWER_DEFS[bIdx];
      var bx = btnStartX + bi * (btnSize + btnGap);
      var by = barTop + 8;

      // Button bg
      var canAfford = gold >= bDef.cost;
      var isSelected = selectedTower === bIdx;
      ctx.fillStyle = isSelected ? "#3b82f6" : canAfford ? "#374151" : "#1f2937";
      ctx.strokeStyle = isSelected ? "#60a5fa" : canAfford ? "#6b7280" : "#374151";
      ctx.lineWidth = 2;
      roundRect(ctx, bx, by, btnSize, btnSize, 8);
      ctx.fill();
      ctx.stroke();

      // Emoji
      drawEmoji(bDef.emoji, bx + btnSize / 2, by + btnSize / 2 - 4, btnSize * 0.35);

      // Cost (defenders)
      ctx.fillStyle = canAfford ? "#a78bfa" : "#6b7280";
      ctx.font = "bold " + Math.round(9 * scale) + "px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("👤" + bDef.cost, bx + btnSize / 2, by + btnSize - 2);

      // Dim if can't afford
      if (!canAfford) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        roundRect(ctx, bx, by, btnSize, btnSize, 8);
        ctx.fill();
      }
    }

    // Sell button (right side)
    var sellBtnX = W - btnSize - 10;
    var sellBtnY = barTop + 8;
    ctx.fillStyle = "#7f1d1d";
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    roundRect(ctx, sellBtnX, sellBtnY, btnSize, btnSize, 8);
    ctx.fill();
    ctx.stroke();
    drawEmoji("🗑️", sellBtnX + btnSize / 2, sellBtnY + btnSize / 2 - 2, btnSize * 0.35);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold " + Math.round(8 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("SELL", sellBtnX + btnSize / 2, sellBtnY + btnSize - 2);

    // Level clear overlay
    if (gameState === STATE_LEVEL_CLEAR) {
      drawLevelClear();
    }

    // Game over overlay
    if (gameState === STATE_GAME_OVER) {
      drawGameOver();
    }
  }

  function drawMenu() {
    // Background
    ctx.fillStyle = "#1a3a1a";
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(26 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏰 Fort Alphabet", W / 2, 50 * scale);

    ctx.font = Math.round(13 * scale) + "px Nunito, sans-serif";
    ctx.fillStyle = "#a3e635";
    ctx.fillText("⭐ " + totalStars + " stars", W / 2, 78 * scale);

    // Arcade lives
    ctx.fillStyle = arcadeLives > 0 ? "#ef4444" : "#6b7280";
    ctx.font = Math.round(12 * scale) + "px Nunito, sans-serif";
    var livesStr = arcadeLives > 0 ? "❤️".repeat(arcadeLives) + " lives" : "No lives! Buy more to play.";
    ctx.fillText(livesStr, W / 2, 96 * scale);

    // Level cards
    var cardW = Math.min(W - 40, 320);
    var cardH = Math.round(70 * scale);
    var cardGap = Math.round(12 * scale);
    var startY = Math.round(116 * scale);

    for (var li = 0; li < LEVELS.length; li++) {
      var level = LEVELS[li];
      var cy = startY + li * (cardH + cardGap);
      var cx = (W - cardW) / 2;
      var unlocked = totalStars >= STARS_TO_UNLOCK[li];

      // Card bg
      ctx.fillStyle = unlocked ? "#374151" : "#1f2937";
      ctx.strokeStyle = unlocked ? "#6b7280" : "#374151";
      ctx.lineWidth = 2;
      roundRect(ctx, cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Level info
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = unlocked ? "#fff" : "#6b7280";
      ctx.font = "bold " + Math.round(15 * scale) + "px Nunito, sans-serif";
      ctx.fillText(level.emoji + " " + level.name, cx + 14, cy + cardH / 2 - 10 * scale);

      // Waves & stars
      ctx.font = Math.round(11 * scale) + "px Nunito, sans-serif";
      ctx.fillStyle = unlocked ? "#a3e635" : "#4b5563";
      ctx.fillText(level.waves.length + " waves", cx + 14, cy + cardH / 2 + 10 * scale);

      // Stars earned
      ctx.textAlign = "right";
      if (levelStars[li] > 0) {
        var starStr = "";
        for (var si = 0; si < levelStars[li]; si++) starStr += "⭐";
        ctx.fillText(starStr, cx + cardW - 14, cy + cardH / 2 - 8 * scale);
      }

      // Lock or play indicator
      if (!unlocked) {
        ctx.fillStyle = "#6b7280";
        ctx.font = Math.round(11 * scale) + "px Nunito, sans-serif";
        ctx.fillText("🔒 " + STARS_TO_UNLOCK[li] + " ⭐", cx + cardW - 14, cy + cardH / 2 + 10 * scale);
      } else {
        ctx.fillStyle = "#60a5fa";
        ctx.font = "bold " + Math.round(11 * scale) + "px Nunito, sans-serif";
        ctx.fillText("▶ PLAY", cx + cardW - 14, cy + cardH / 2 + 10 * scale);
      }

      // Dim locked levels
      if (!unlocked) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        roundRect(ctx, cx, cy, cardW, cardH, 12);
        ctx.fill();
      }
    }

    // Tap to start hint
    ctx.fillStyle = "#9ca3af";
    ctx.font = Math.round(12 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tap a level to play", W / 2, H - 40 * scale);
  }

  function drawLevelClear() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, W, H);

    var pct = wavesCompleted / totalWavesInLevel;
    var stars = 0;
    if (pct >= 1.0) stars = 5;
    else if (pct >= 0.75) stars = 2;
    else if (pct >= 0.5) stars = 1;

    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(24 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(stars === 5 ? "🌟 Perfect!" : "Level Complete!", W / 2, H / 2 - 60 * scale);

    // Stars
    var starStr = "";
    for (var i = 0; i < stars; i++) starStr += "⭐";
    if (starStr) {
      ctx.font = Math.round(30 * scale) + "px Nunito, sans-serif";
      ctx.fillText(starStr, W / 2, H / 2 - 20 * scale);
    }

    ctx.font = Math.round(14 * scale) + "px Nunito, sans-serif";
    ctx.fillStyle = "#a3e635";
    ctx.fillText("Waves: " + wavesCompleted + "/" + totalWavesInLevel, W / 2, H / 2 + 20 * scale);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("⚔️ " + score + " pts", W / 2, H / 2 + 45 * scale);

    // Arcade lives
    ctx.fillStyle = arcadeLives > 0 ? "#ef4444" : "#6b7280";
    ctx.font = Math.round(12 * scale) + "px Nunito, sans-serif";
    ctx.fillText(arcadeLives > 0 ? "❤️ " + arcadeLives + " lives left" : "No lives remaining!", W / 2, H / 2 + 62 * scale);

    // Buttons
    var btnW = 180 * scale;
    var btnH = 44 * scale;

    // Next level button (if not last level)
    if (currentLevel < LEVELS.length - 1) {
      var nextUnlocked = totalStars >= STARS_TO_UNLOCK[currentLevel + 1];
      var canPlay = nextUnlocked && arcadeLives > 0;
      ctx.fillStyle = canPlay ? "#22c55e" : "#4b5563";
      roundRect(ctx, (W - btnW) / 2, H / 2 + 78 * scale, btnW, btnH, 12);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + Math.round(14 * scale) + "px Nunito, sans-serif";
      var nextLabel = !nextUnlocked ? "🔒 Need " + STARS_TO_UNLOCK[currentLevel + 1] + " ⭐" : arcadeLives > 0 ? "Next Level ▶ (1 ❤️)" : "No lives!";
      ctx.fillText(nextLabel, W / 2, H / 2 + 78 * scale + btnH / 2);
    }

    // Back to levels
    ctx.fillStyle = "#374151";
    roundRect(ctx, (W - btnW) / 2, H / 2 + 133 * scale, btnW, btnH, 12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(14 * scale) + "px Nunito, sans-serif";
    ctx.fillText("Back to Levels", W / 2, H / 2 + 133 * scale + btnH / 2);
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, W, H);

    // Stars earned even in defeat
    var pct = wavesCompleted / totalWavesInLevel;
    var stars = 0;
    if (pct >= 1.0) stars = 5;
    else if (pct >= 0.75) stars = 2;
    else if (pct >= 0.5) stars = 1;

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold " + Math.round(24 * scale) + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💀 Game Over", W / 2, H / 2 - 60 * scale);

    if (stars > 0) {
      var starStr = "";
      for (var i = 0; i < stars; i++) starStr += "⭐";
      ctx.font = Math.round(24 * scale) + "px Nunito, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(starStr, W / 2, H / 2 - 25 * scale);
    }

    ctx.font = Math.round(14 * scale) + "px Nunito, sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("Waves: " + wavesCompleted + "/" + totalWavesInLevel, W / 2, H / 2 + 10 * scale);
    ctx.fillText("⚔️ " + score + " pts", W / 2, H / 2 + 35 * scale);

    // Arcade lives remaining
    ctx.fillStyle = arcadeLives > 0 ? "#ef4444" : "#6b7280";
    ctx.font = Math.round(12 * scale) + "px Nunito, sans-serif";
    ctx.fillText(arcadeLives > 0 ? "❤️ " + arcadeLives + " lives left" : "No lives remaining!", W / 2, H / 2 + 55 * scale);

    // Retry button
    var btnW = 180 * scale;
    var btnH = 44 * scale;
    ctx.fillStyle = arcadeLives > 0 ? "#3b82f6" : "#4b5563";
    roundRect(ctx, (W - btnW) / 2, H / 2 + 70 * scale, btnW, btnH, 12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold " + Math.round(14 * scale) + "px Nunito, sans-serif";
    ctx.fillText(arcadeLives > 0 ? "Retry Level (1 ❤️)" : "Buy Lives to Retry", W / 2, H / 2 + 70 * scale + btnH / 2);

    // Back to levels
    ctx.fillStyle = "#374151";
    roundRect(ctx, (W - btnW) / 2, H / 2 + 120 * scale, btnW, btnH, 12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("Back to Levels", W / 2, H / 2 + 125 * scale + btnH / 2);
  }

  // ── Helper Drawing Functions ───────────────────────────────────
  function drawEmoji(emoji, x, y, size) {
    ctx.font = Math.round(size) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Input Handling ─────────────────────────────────────────────
  var sellMode = false;

  function handleTap(px, py) {
    if (gameState === STATE_MENU) {
      handleMenuTap(px, py);
      return;
    }

    if (gameState === STATE_LEVEL_CLEAR) {
      handleLevelClearTap(px, py);
      return;
    }

    if (gameState === STATE_GAME_OVER) {
      handleGameOverTap(px, py);
      return;
    }

    if (gameState !== STATE_PLAYING) return;

    // Fast forward button (top-right)
    if (py < topBarH && px > W - 40) {
      fastForward = !fastForward;
      return;
    }

    // Bottom bar tower buttons
    var barTop = H - bottomBarH;
    if (py >= barTop) {
      handleBottomBarTap(px, py, barTop);
      return;
    }

    // Grid tap
    var col = Math.floor((px - gridOffX) / CELL);
    var row = Math.floor((py - gridOffY) / CELL);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

    // Sell mode: tap tower to sell
    if (sellMode) {
      for (var si = 0; si < towers.length; si++) {
        if (towers[si].col === col && towers[si].row === row) {
          sellTower(si);
          sellMode = false;
          selectedTower = -1;
          return;
        }
      }
      sellMode = false;
      selectedTower = -1;
      return;
    }

    // Place tower
    if (selectedTower >= 0) {
      var placed = placeTower(col, row, selectedTower);
      if (placed) {
        // Keep selected for rapid placement
      }
      return;
    }
  }

  function handleMenuTap(px, py) {
    // No lives = can't play, notify parent to show buy screen
    if (arcadeLives <= 0) {
      postMsg("game_over", {
        score: score,
        levelStars: levelStars,
        totalStars: totalStars
      });
      return;
    }

    var cardW = Math.min(W - 40, 320);
    var cardH = Math.round(70 * scale);
    var cardGap = Math.round(12 * scale);
    var startY = Math.round(116 * scale);

    for (var li = 0; li < LEVELS.length; li++) {
      var cy = startY + li * (cardH + cardGap);
      var cx = (W - cardW) / 2;
      var unlocked = totalStars >= STARS_TO_UNLOCK[li];

      if (px >= cx && px <= cx + cardW && py >= cy && py <= cy + cardH && unlocked) {
        initLevel(li);
        return;
      }
    }
  }

  function handleLevelClearTap(px, py) {
    var btnW = 180 * scale;
    var btnH = 44 * scale;
    var bx = (W - btnW) / 2;

    // Next level button
    if (currentLevel < LEVELS.length - 1) {
      var nextBtnY = H / 2 + 78 * scale;
      if (px >= bx && px <= bx + btnW && py >= nextBtnY && py <= nextBtnY + btnH) {
        var nextUnlocked = totalStars >= STARS_TO_UNLOCK[currentLevel + 1];
        if (nextUnlocked && arcadeLives > 0) {
          initLevel(currentLevel + 1);
          return;
        }
      }
    }

    // Back to levels
    var backBtnY = H / 2 + 133 * scale;
    if (px >= bx && px <= bx + btnW && py >= backBtnY && py <= backBtnY + btnH) {
      gameState = STATE_MENU;
      return;
    }
  }

  function handleGameOverTap(px, py) {
    var btnW = 180 * scale;
    var btnH = 44 * scale;
    var bx = (W - btnW) / 2;

    // Retry (costs another arcade life)
    var retryBtnY = H / 2 + 70 * scale;
    if (px >= bx && px <= bx + btnW && py >= retryBtnY && py <= retryBtnY + btnH) {
      if (arcadeLives > 0) {
        initLevel(currentLevel);
      } else {
        postMsg("game_over", {
          score: score,
          level: currentLevel,
          levelStars: levelStars,
          totalStars: totalStars
        });
      }
      return;
    }

    // Back to levels
    var backBtnY = H / 2 + 125 * scale;
    if (px >= bx && px <= bx + btnW && py >= backBtnY && py <= backBtnY + btnH) {
      if (arcadeLives > 0) {
        gameState = STATE_MENU;
      } else {
        postMsg("game_over", {
          score: score,
          level: currentLevel,
          levelStars: levelStars,
          totalStars: totalStars
        });
      }
      return;
    }
  }

  function handleBottomBarTap(px, py, barTop) {
    var btnSize = Math.round(CELL * 1.1);
    var btnGap = 6;
    var availableTowers = [];
    for (var i = 0; i < TOWER_DEFS.length; i++) {
      if (isTowerAvailable(TOWER_DEFS[i])) availableTowers.push(i);
    }
    var totalBtnW = availableTowers.length * (btnSize + btnGap) - btnGap;
    var btnStartX = (W - totalBtnW) / 2;

    for (var bi = 0; bi < availableTowers.length; bi++) {
      var bIdx = availableTowers[bi];
      var bx = btnStartX + bi * (btnSize + btnGap);
      var by = barTop + 8;
      if (px >= bx && px <= bx + btnSize && py >= by && py <= by + btnSize) {
        sellMode = false;
        if (selectedTower === bIdx) {
          selectedTower = -1; // deselect
        } else {
          selectedTower = bIdx;
        }
        return;
      }
    }

    // Sell button
    var sellBtnX = W - btnSize - 10;
    var sellBtnY = barTop + 8;
    if (px >= sellBtnX && px <= sellBtnX + btnSize && py >= sellBtnY && py <= sellBtnY + btnSize) {
      sellMode = !sellMode;
      selectedTower = -1;
      return;
    }
  }

  // Touch / mouse events
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    handleTap(x, y);
  });

  // ── Game Loop ──────────────────────────────────────────────────
  function loop(time) {
    var dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  lastTime = performance.now();
  requestAnimationFrame(loop);
})();
