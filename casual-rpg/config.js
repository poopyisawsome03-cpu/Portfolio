/* ═══════════════════════════════════════════
   Card Pools (Weapon + Stat Cards)
   ═══════════════════════════════════════════ */

const normalCards = [
    // ── Stat buffs ──
    { name: "Hollow Points",     icon: "🔫", description: "+5 Attack Damage",  rarity: "common",  effect: p => p.damage += 5 },
    { name: "Iron Shield",       icon: "🛡️", description: "+3 Armor",          rarity: "common",  effect: p => p.armor += 3 },
    { name: "Med Kit",           icon: "❤️",  description: "Heal 30 HP",        rarity: "common",  effect: p => { p.health = Math.min(p.maxHealth, p.health + 30); } },
    { name: "Vitality Boost",    icon: "💚",  description: "+20 Max Health",    rarity: "common",  effect: p => { p.maxHealth += 20; p.health += 20; } },
    { name: "Rapid Fire",        icon: "⚡",  description: "+10% Attack Speed", rarity: "rare",    effect: p => p.attackSpeed *= 1.1 },
    { name: "Lucky Charm",       icon: "🍀",  description: "+5% Crit Chance",   rarity: "rare",    effect: p => p.critChance += 0.05 },
    { name: "Vampiric Rounds",   icon: "🦇",  description: "+15% Lifesteal chance, +5% heal",  rarity: "rare",    effect: p => { p.lifestealChance += 0.15; p.lifesteal += 0.05; } },
    { name: "Scope Upgrade",     icon: "🔭",  description: "+50 Attack Range",  rarity: "rare",    effect: p => p.attackRange += 50 },
    { name: "Kevlar Vest",       icon: "🔩",  description: "+5 Armor",          rarity: "rare",    effect: p => p.armor += 5 },
    { name: "High-Caliber Ammo", icon: "💥",  description: "+8 Attack Damage",  rarity: "rare",    effect: p => p.damage += 8 },

    // ── Weapon cards (unlock or upgrade) ──
    { name: "Spinning Blade",    icon: "🗡️", description: "Gain a sword that orbits you!", rarity: "rare",
      effect: p => { p.hasSword = true; } },
    { name: "Sharpen Blade",     icon: "⚔️",  description: "+10 Sword Damage",  rarity: "common",
      effect: p => { p.swordDamage += 10; } },
    { name: "Wider Orbit",       icon: "🔄",  description: "+15 Sword Radius",  rarity: "common",
      effect: p => { p.swordRadius += 15; } },
    { name: "Longer Spin",       icon: "⏱️",  description: "+500ms Sword Duration", rarity: "common",
      effect: p => { p.swordDuration += 500; } },
    { name: "Cannon Unlock",     icon: "💣",  description: "Gain a heavy cannon!", rarity: "rare",
      effect: p => { p.hasCannon = true; } },
    { name: "Heavier Shells",    icon: "🧨",  description: "+25 Cannon Damage", rarity: "rare",
      effect: p => { p.cannonDamage += 25; } },
    { name: "Bigger Blast",      icon: "💥",  description: "+20 Explosion Radius", rarity: "rare",
      effect: p => { p.cannonAoeRadius += 20; } },
];

const bossCards = [
    // ── Big stat buffs ──
    { name: "Golden Gun",          icon: "🏆",  description: "+15 Attack Damage",        rarity: "legendary", effect: p => p.damage += 15 },
    { name: "Dragon Heart",        icon: "🐉",  description: "+50 Max HP & Full Heal",   rarity: "legendary", effect: p => { p.maxHealth += 50; p.health = p.maxHealth; } },
    { name: "Titan's Armor",       icon: "🏛️",  description: "+10 Armor",                rarity: "legendary", effect: p => p.armor += 10 },
    { name: "Minigun Module",      icon: "😤",  description: "+25% Attack Speed",        rarity: "epic",      effect: p => p.attackSpeed *= 1.25 },
    { name: "Sniper Precision",    icon: "🎯",  description: "+20% Crit Damage",         rarity: "epic",      effect: p => p.critDamage += 0.2 },
    { name: "Life-Drain Bullets",  icon: "🩸",  description: "+30% Lifesteal chance, +15% heal",  rarity: "epic",      effect: p => { p.lifestealChance += 0.30; p.lifesteal += 0.15; } },
    { name: "Phoenix Feather",     icon: "🔥",  description: "+30 Max HP & +10 Damage",  rarity: "legendary", effect: p => { p.maxHealth += 30; p.health += 30; p.damage += 10; } },
    { name: "Ancient Relic",       icon: "🏺",  description: "+5 All Stats",             rarity: "legendary", effect: p => { p.damage += 5; p.armor += 5; p.maxHealth += 25; p.health += 25; } },
    { name: "Critical Master",     icon: "🎯",  description: "+15% Crit Chance",         rarity: "epic",      effect: p => p.critChance += 0.15 },
    { name: "War God's Blessing",  icon: "⚡",  description: "+10 Dmg, +20% Speed",     rarity: "legendary", effect: p => { p.damage += 10; p.attackSpeed *= 1.2; } },

    // ── Weapon mega-upgrades ──
    { name: "Whirlwind Blade",     icon: "🌀",  description: "Sword: +30 Dmg, +20 Radius, +Spin",  rarity: "legendary",
      effect: p => { p.hasSword = true; p.swordDamage += 30; p.swordRadius += 20; p.swordSpeed += 0.5; } },
    { name: "Railgun Core",        icon: "⚙️",  description: "Cannon: +60 Dmg, −500ms CD",         rarity: "legendary",
      effect: p => { p.hasCannon = true; p.cannonDamage += 60; p.cannonCooldown = Math.max(800, p.cannonCooldown - 500); } },
    { name: "Arsenal Mastery",     icon: "🎖️",  description: "Unlock ALL weapons + buff each",     rarity: "legendary",
      effect: p => { p.hasSword = true; p.hasCannon = true; p.swordDamage += 15; p.cannonDamage += 30; p.damage += 10; } },
];

// ── Mythical cards (unique powerful buffs + a debuff) ──
// These can appear in both normal and boss selections (wave >= 5)
const mythicalCards = [
    {
        name: "Berserker's Rage",   icon: "🩸", rarity: "mythical",
        description: "Double attack speed",
        debuffText: "−30 Max HP",
        effect: p => { p.attackSpeed *= 2; p.maxHealth -= 30; p.health = Math.min(p.health, p.maxHealth); },
    },
    {
        name: "Glass Cannon",       icon: "💎", rarity: "mythical",
        description: "+40 Damage, +50% Crit Damage",
        debuffText: "Armor set to 0 permanently",
        effect: p => { p.damage += 40; p.critDamage += 0.5; p.armor = 0; p.armorLocked = true; },
    },
    {
        name: "Soul Pact",          icon: "👻", rarity: "mythical",
        description: "100% Lifesteal chance, +30% heal",
        debuffText: "−25% Attack Speed",
        effect: p => { p.lifestealChance = 1.0; p.lifesteal += 0.30; p.attackSpeed *= 0.75; },
    },
    {
        name: "Phantom Blade",      icon: "🌑", rarity: "mythical",
        description: "Sword: +50 Dmg, +40 Radius, always active",
        debuffText: "−15 Gun Damage",
        effect: p => { p.hasSword = true; p.swordDamage += 50; p.swordRadius += 40; p.swordDuration = 999999; p.damage = Math.max(1, p.damage - 15); },
    },
    {
        name: "Titan's Fist",       icon: "🪨", rarity: "mythical",
        description: "Cannon: +100 Dmg, +40 AOE",
        debuffText: "Move 25% slower",
        effect: p => { p.hasCannon = true; p.cannonDamage += 100; p.cannonAoeRadius += 40; p.moveSpeedMul = (p.moveSpeedMul || 1) * 0.75; },
    },
    {
        name: "Temporal Rift",      icon: "⏳", rarity: "mythical",
        description: "+60% Attack Speed, +20% Crit",
        debuffText: "−40 Max HP, −3 Armor",
        effect: p => { p.attackSpeed *= 1.6; p.critChance += 0.2; p.maxHealth -= 40; p.health = Math.min(p.health, p.maxHealth); p.armor = Math.max(0, p.armor - 3); },
    },
    {
        name: "Blood Moon",         icon: "🌙", rarity: "mythical",
        description: "+25 Dmg, +50% Crit Dmg, full heal",
        debuffText: "Enemies move 15% faster",
        effect: p => { p.damage += 25; p.critDamage += 0.5; p.health = p.maxHealth; p.enemySpeedMul = (p.enemySpeedMul || 1) * 1.15; },
    },
    {
        name: "Void Armor",         icon: "🛡️", rarity: "mythical",
        description: "+20 Armor, +60 Max HP",
        debuffText: "−30% Attack Speed",
        effect: p => { p.armor += 20; p.maxHealth += 60; p.health += 60; p.attackSpeed *= 0.7; },
    },
];
