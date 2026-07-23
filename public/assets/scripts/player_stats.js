import { world, system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";

const TITLE_OPTS = { fadeInDuration: 0, stayDuration: 4, fadeOutDuration: 0 };

const flr = (v) => Math.floor(Number.isFinite(v) ? v : 0);

function attr(p, id) {
  try {
    const c = p.getComponent(id);
    return c ? c.currentValue : undefined;
  } catch {
    return undefined;
  }
}

const BUILDERS = [
  (p) => `uiVisBar_${p.getDynamicProperty("ui:show") === false ? 0 : 1}`,

  // Health — "cur,max"
  (p) => {
    const hp = attr(p, "minecraft:health");
    if (hp === undefined) return null;
    const max = p.getComponent("minecraft:health")?.effectiveMax ?? hp;
    return `hpBar_${flr(hp)},${flr(max)}`;
  },

  // Speed — actual current movement speed from velocity (blocks/sec, no max)
  (p) => {
    try {
      const v = p.getVelocity();
      const bps = Math.sqrt(v.x * v.x + v.z * v.z) * 20;
      return `speedBar_${bps.toFixed(2)}`;
    } catch { return null; }
  },

  // Hunger — player.hunger attribute (no max)
  (p) => {
    const food = attr(p, "minecraft:player.hunger");
    return food === undefined ? null : `foodBar_${flr(food)}`;
  },

  // Armor — equippable total (no max)
  (p) => {
    try {
      const eq = p.getComponent("minecraft:equippable");
      return eq ? `armorBar_${flr(eq.totalArmor)}` : null;
    } catch { return null; }
  },

  // Toughness — equippable total, only when > 0 (no max)
  (p) => {
    try {
      const eq = p.getComponent("minecraft:equippable");
      if (eq && eq.totalToughness > 0) return `toughBar_${flr(eq.totalToughness)}`;
      return `toughBar_0`;
    } catch { }
    return null;
  },

  // EXP — "cur,max" within the current level
  (p) => {
    try {
      return `expBar_${flr(p.xpEarnedAtCurrentLevel)},${flr(p.totalXpNeededForNextLevel) || 1}`;
    } catch { return null; }
  },

  // Level — plain value for the bottom line
  (p) => {
    try { return `lvlBar_${flr(p.level)}`; } catch { return null; }
  },
];

function setShow(origin, action) {
  const p = origin.sourceEntity;
  if (!p || p.typeId !== "minecraft:player") return;
  const next = action === "toggle" ? p.getDynamicProperty("ui:show") === false : action === "show";
  system.run(() => p.setDynamicProperty("ui:show", next));
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerEnum("stats:action", ["show", "hide", "toggle"]);
  customCommandRegistry.registerCommand(
    {
      name: "stats:ui",
      description: "Show / hide / toggle the player stats card",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        { name: "stats:action", type: CustomCommandParamType.Enum }
      ]
    },
    (origin, action) => { setShow(origin, action); return { status: 0 }; }
  );
});

let cursor = 0;
system.runInterval(() => {
  const players = world.getAllPlayers();
  if (players.length === 0) return;

  for (const p of players) {
    let tries = 0;
    let idx = cursor;
    while (tries < BUILDERS.length) {
      const line = BUILDERS[idx % BUILDERS.length](p);
      idx++;
      tries++;
      if (line) { p.onScreenDisplay.setTitle(line, TITLE_OPTS); break; }
    }
  }
  cursor++;
}, 2);
