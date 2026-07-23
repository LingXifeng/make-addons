import type { ModuleDefinition, ProjectItem, Project } from './types';
import { generateItemJSON, generateClientEntity } from './generator';

// ===== 导出器 =====
// 生成 .mcaddon (zip) 文件，包含完整附加包结构

interface AddonFile {
  path: string;
  content: string;
  isBase64?: boolean; // 贴图等二进制文件用 base64 字符串
}

// 生成 UUID
function generateUUID(): string {
  const hex = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
    uuid += hex[Math.floor(Math.random() * 16)];
  }
  return uuid;
}

// 生成行为包 manifest
function generateBehaviorManifest(project: Project, hasScript = false): string {
  const headerUUID = project.headerUUID || generateUUID();
  const moduleUUID = project.moduleUUID || generateUUID();

  const modules: any[] = [
    {
      type: 'data',
      uuid: moduleUUID,
      version: [1, 0, 0],
    },
  ];

  if (hasScript) {
    modules.push({
      type: 'script',
      uuid: generateUUID(),
      version: [1, 0, 0],
      entry: 'scripts/effect_manager.js',
    });
  }

  const manifest: Record<string, any> = {
    format_version: 2,
    header: {
      name: project.name || 'My Addon',
      description: project.description || 'Made with Make Addons',
      uuid: headerUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 21, 0],
    },
    modules,
    dependencies: [],
  };

  if (hasScript) {
    manifest.dependencies.push({
      module_name: '@minecraft/server',
      version: '1.13.0',
    });
  }

  // 依赖资源包（确保两个包同时加载）
  const resourceUUID = project.resourceHeaderUUID || '';
  if (resourceUUID) {
    manifest.dependencies.push({
      uuid: resourceUUID,
      version: [1, 0, 0],
    });
  }

  return JSON.stringify(manifest, null, 2);
}

// 生成资源包 manifest
function generateResourceManifest(project: Project): string {
  const headerUUID = project.resourceHeaderUUID || generateUUID();
  const moduleUUID = project.resourceModuleUUID || generateUUID();
  const behaviorUUID = project.headerUUID || '';

  const manifest: Record<string, any> = {
    format_version: 2,
    header: {
      name: project.name || 'My Addon',
      description: project.description || 'Made with Make Addons',
      uuid: headerUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 21, 0],
    },
    modules: [
      {
        type: 'resources',
        uuid: moduleUUID,
        version: [1, 0, 0],
      },
    ],
  };

  if (behaviorUUID) {
    manifest.dependencies = [
      {
        uuid: behaviorUUID,
        version: [1, 0, 0],
      },
    ];
  }

  return JSON.stringify(manifest, null, 2);
}

// 获取模块文件路径
function getItemFilePath(module: ModuleDefinition, item: ProjectItem): { behavior?: string; resource?: string } {
  const id = item.data.identifier || 'change_me';
  const paths: { behavior?: string; resource?: string } = {};

  switch (module.id) {
    case 'weapon':
    case 'armor':
    case 'food':
    case 'tool':
    case 'normal':
      paths.behavior = `items/${id}.json`;
      break;
    case 'block':
      paths.behavior = `blocks/${id}.json`;
      break;
    case 'entity':
      paths.behavior = `entities/${id}.json`;
      paths.resource = `entity/${id}.client.json`;
      break;
    case 'biome':
      paths.behavior = `biomes/${id}.json`;
      break;
    case 'recipe':
      paths.behavior = `recipes/${id}.json`;
      break;
  }

  return paths;
}

// 收集装备/武器的持续药水效果
interface ContinuousEffectEntry {
  itemId: string;       // pa:xxx
  effects: { effect: string; duration: number; amplifier: number; visible: boolean }[];
}

function collectContinuousEffects(items: { module: ModuleDefinition; item: ProjectItem }[]): ContinuousEffectEntry[] {
  const entries: ContinuousEffectEntry[] = [];
  for (const { module, item } of items) {
    // 只对 weapon / armor 生成持续效果脚本，food 走 on_consume
    if (module.id !== 'weapon' && module.id !== 'armor') continue;
    const data = item.data;
    if (!data.potionEffectsEnable || !data.potionEffects?.length) continue;
    const id = `pa:${data.identifier || 'change_me'}`;
    entries.push({
      itemId: id,
      effects: data.potionEffects.map((e: any) => ({
        effect: e.effect,
        duration: e.duration,
        amplifier: e.amplifier || 0,
        visible: e.visible !== false,
      })),
    });
  }
  return entries;
}

// 收集火焰附加武器
interface FireAspectEntry {
  itemId: string;
  seconds: number;
}

function collectFireAspectItems(items: { module: ModuleDefinition; item: ProjectItem }[]): FireAspectEntry[] {
  const entries: FireAspectEntry[] = [];
  for (const { module, item } of items) {
    if (module.id !== 'weapon' && module.id !== 'tool') continue;
    const data = item.data;
    if (!data.fireAspectEnable) continue;
    const id = `pa:${data.identifier || 'change_me'}`;
    entries.push({ itemId: id, seconds: data.fireAspectSeconds || 4 });
  }
  return entries;
}

// 生成持续药水效果脚本
function generateEffectScript(entries: ContinuousEffectEntry[], fireAspectEntries: FireAspectEntry[] = []): string {
  const effectMap = entries.map(e => {
    const effectsStr = e.effects.map(ef =>
      `    "${ef.effect}": { duration: ${(ef.duration || 10) + 3}, amplifier: ${ef.amplifier || 0}, showParticles: ${ef.visible} }`
    ).join(',\n');
    return `  "${e.itemId}": {\n${effectsStr}\n  }`;
  }).join(',\n');

  const fireAspectMap = fireAspectEntries.map(e =>
    `  "${e.itemId}": ${e.seconds}`
  ).join(',\n');

  const hasEffects = entries.length > 0;
  const hasFireAspect = fireAspectEntries.length > 0;

  // 持续效果部分
  const effectScript = hasEffects ? `
const EFFECT_MAP = {
${effectMap}
};

// 每 20 tick (1秒) 检查一次
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    try {
      // 检查主手和副手
      const inv = player.getComponent("minecraft:inventory");
      if (inv) {
        const mainHand = inv.itemHeld;
        if (mainHand && EFFECT_MAP[mainHand.typeId]) {
          applyEffects(player, EFFECT_MAP[mainHand.typeId]);
        }
      }
      // 检查装备栏 (头盔/胸甲/护腿/靴子)
      const equippable = player.getComponent("minecraft:equippable");
      if (equippable) {
        for (const slot of ["Head", "Chest", "Legs", "Feet"]) {
          try {
            const item = equippable.getEquipmentSlot(slot);
            if (item && EFFECT_MAP[item.typeId]) {
              applyEffects(player, EFFECT_MAP[item.typeId]);
            }
          } catch {}
        }
      }
    } catch {}
  }
}, 20);

function applyEffects(player, effects) {
  for (const [effectId, opts] of Object.entries(effects)) {
    try {
      player.addEffect(effectId, opts.duration, {
        amplifier: opts.amplifier,
        showParticles: opts.showParticles,
      });
    } catch {}
  }
}
` : '';

  // 火焰附加部分
  const fireAspectScript = hasFireAspect ? `
const FIRE_ASPECT_MAP = {
${fireAspectMap}
};

// 监听实体受伤事件 — 攻击者手持火焰附加武器时点燃被攻击者
world.afterEvents.entityHurt.subscribe((event) => {
  try {
    const attacker = event.damageSource.damagingEntity;
    const victim = event.hurtEntity;
    if (!attacker || !victim) return;

    const inv = attacker.getComponent("minecraft:inventory");
    if (!inv) return;
    const mainHand = inv.itemHeld;
    if (!mainHand) return;

    const seconds = FIRE_ASPECT_MAP[mainHand.typeId];
    if (seconds) {
      victim.setOnFire(seconds);
    }
  } catch {}
});
` : '';

  const parts = ['// 脚本 — 由 Make Addons 生成'];
  if (hasEffects) parts.push('// 持续药水效果：装备/武器上的药水效果在手持或穿戴时持续生效');
  if (hasFireAspect) parts.push('// 火焰附加：攻击生物时使其着火');
  parts.push('import { world, system } from "@minecraft/server";');
  parts.push(effectScript + fireAspectScript);

  return parts.join('\n');
}

// 生成合成配方 JSON
function generateRecipeJSON(item: ProjectItem, module: ModuleDefinition): string | null {
  const data = item.data;
  if (!data.craftingEnable) return null;

  const itemId = data.identifier || 'change_me';
  const resultId = module.id === 'block' ? `pa:${itemId}` : `pa:${itemId}`;
  const count = data.craftingCount || 1;
  const recipeId = `pa:recipe_${itemId}`;

  if (data.craftingType === 'shaped') {
    // 有序合成
    const pattern = (data.craftingPattern || 'XX\nXX').split('\n').filter((line: string) => line.length > 0);
    const keyMap: Record<string, { item: string }> = {};
    const keyLines = (data.craftingKey || '').split('\n').filter((line: string) => line.trim().length > 0);
    for (const line of keyLines) {
      const [char, itemPath] = line.split('=').map((s: string) => s.trim());
      if (char && itemPath) {
        keyMap[char] = { item: itemPath };
      }
    }
    const recipe = {
      format_version: '1.21.0',
      'minecraft:recipe_shaped': {
        description: { identifier: recipeId },
        tags: ['crafting_table'],
        pattern,
        key: keyMap,
        result: { item: resultId, count },
      },
    };
    return JSON.stringify(recipe, null, 2);
  } else {
    // 无序合成
    const ingredients = (data.craftingIngredients || []).map((ing: string) => {
      // repairItems 格式可能是 "minecraft:stick" 或带冒号
      return ing.includes(':') ? ing : `minecraft:${ing}`;
    });
    if (ingredients.length === 0) return null;
    const recipe = {
      format_version: '1.21.0',
      'minecraft:recipe_shapeless': {
        description: { identifier: recipeId },
        tags: ['crafting_table'],
        ingredients,
        result: { item: resultId, count },
      },
    };
    return JSON.stringify(recipe, null, 2);
  }
}

// 生成语言文件
function generateLanguageFile(items: { module: ModuleDefinition; item: ProjectItem }[]): string {
  const lines: string[] = [];

  for (const { module, item } of items) {
    const id = item.data.identifier || 'change_me';
    const name = item.data.displayName || id;
    const ns = 'pa';

    switch (module.id) {
      case 'weapon':
      case 'armor':
      case 'food':
      case 'tool':
      case 'normal':
        lines.push(`item.${ns}:${id}.name=${name}`);
        break;
      case 'block':
        lines.push(`tile.${ns}:${id}.name=${name}`);
        break;
      case 'entity':
        lines.push(`entity.${ns}:${id}.name=${name}`);
        break;
      case 'biome':
        lines.push(`biome.${id}.name=${name}`);
        break;
    }
  }

  return lines.join('\n');
}

// 生成所有文件
export function generateAddonFiles(project: Project, modules: ModuleDefinition[]): AddonFile[] {
  const files: AddonFile[] = [];

  // 预生成 UUID，确保行为包和资源包的依赖关系正确
  const p: Project = {
    ...project,
    headerUUID: project.headerUUID || generateUUID(),
    moduleUUID: project.moduleUUID || generateUUID(),
    resourceHeaderUUID: project.resourceHeaderUUID || generateUUID(),
    resourceModuleUUID: project.resourceModuleUUID || generateUUID(),
  };

  // 收集所有项目
  const allItems: { module: ModuleDefinition; item: ProjectItem }[] = [];
  for (const module of modules) {
    const items = p.items[module.id] || [];
    for (const item of items) {
      allItems.push({ module, item });
    }
  }

  // 检查是否需要脚本模块（装备/武器有药水效果 或 火焰附加）
  const continuousEffects = collectContinuousEffects(allItems);
  const fireAspectItems = collectFireAspectItems(allItems);
  const hasScript = continuousEffects.length > 0 || fireAspectItems.length > 0;

  // 行为包 manifest
  files.push({
    path: 'behavior_pack/manifest.json',
    content: generateBehaviorManifest(p, hasScript),
  });

  // 资源包 manifest
  files.push({
    path: 'resource_pack/manifest.json',
    content: generateResourceManifest(p),
  });

  // 生成每个项目的 JSON 文件
  for (const { module, item } of allItems) {
    const json = generateItemJSON(module, item);
    const paths = getItemFilePath(module, item);

    if (paths.behavior) {
      files.push({
        path: `behavior_pack/${paths.behavior}`,
        content: JSON.stringify(json, null, 2),
      });
    }

    // 实体客户端定义
    if (module.id === 'entity') {
      const clientJson = generateClientEntity(item);
      if (clientJson && paths.resource) {
        files.push({
          path: `resource_pack/${paths.resource}`,
          content: JSON.stringify(clientJson, null, 2),
        });
      }
    }

    // 合成配方
    const recipeJson = generateRecipeJSON(item, module);
    if (recipeJson) {
      const id = item.data.identifier || 'change_me';
      files.push({
        path: `behavior_pack/recipes/${id}_craft.json`,
        content: recipeJson,
      });
    }
  }

  // 贴图文件 + item_texture.json 映射
  const textureItems = allItems.filter(({ module }) =>
    ['weapon', 'armor', 'food', 'tool', 'normal', 'block'].includes(module.id)
  );

  if (textureItems.length > 0) {
    // 生成 item_texture.json
    const textureData: Record<string, { textures: string }> = {};
    for (const { item } of textureItems) {
      const id = item.data.identifier || 'change_me';
      textureData[id] = { textures: `textures/items/${id}` };
    }
    files.push({
      path: 'resource_pack/textures/item_texture.json',
      content: JSON.stringify({
        resource_pack_name: 'pa',
        texture_name: 'atlas.items',
        texture_data: textureData,
      }, null, 2),
    });

    // 导出自定义贴图 PNG
    for (const { item } of textureItems) {
      if (item.customTexture?.dataUrl) {
        const id = item.data.identifier || 'change_me';
        // 从 data URL 提取 base64 数据
        const base64Match = item.customTexture.dataUrl.match(/^data:[^;]+;base64,(.+)$/);
        if (base64Match) {
          files.push({
            path: `resource_pack/textures/items/${id}.png`,
            content: base64Match[1],
            isBase64: true,
          });
        }
      }
    }
  }

  // 语言文件
  if (allItems.length > 0) {
    const langContent = generateLanguageFile(allItems);
    files.push({
      path: 'resource_pack/texts/zh_CN.lang',
      content: langContent,
    });
    files.push({
      path: 'resource_pack/texts/en_US.lang',
      content: langContent,
    });
    files.push({
      path: 'resource_pack/texts/languages.json',
      content: JSON.stringify(['zh_CN', 'en_US'], null, 2),
    });
  }

  // 持续药水效果脚本 + 火焰附加脚本 (装备/武器)
  if (continuousEffects.length > 0 || fireAspectItems.length > 0) {
    files.push({
      path: 'behavior_pack/scripts/effect_manager.js',
      content: generateEffectScript(continuousEffects, fireAspectItems),
    });
  }

  return files;
}

// 生成单个项目的预览 JSON
export function generatePreviewJSON(module: ModuleDefinition, item: ProjectItem): string {
  const json = generateItemJSON(module, item);
  return JSON.stringify(json, null, 2);
}

// 导出为 zip 文件 (使用浏览器 API)
export async function exportAsMcaddon(project: Project, modules: ModuleDefinition[]): Promise<Blob> {
  const files = generateAddonFiles(project, modules);

  // 动态导入 JSZip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // 行为包文件夹
  const behaviorFolder = zip.folder('behavior_pack')!;
  const resourceFolder = zip.folder('resource_pack')!;

  for (const file of files) {
    if (file.path.startsWith('behavior_pack/')) {
      const relPath = file.path.replace('behavior_pack/', '');
      if (relPath && file.content) {
        behaviorFolder.file(relPath, file.content, file.isBase64 ? { base64: true } : undefined);
      }
    } else if (file.path.startsWith('resource_pack/')) {
      const relPath = file.path.replace('resource_pack/', '');
      if (relPath && file.content) {
        resourceFolder.file(relPath, file.content, file.isBase64 ? { base64: true } : undefined);
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

// 下载文件
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
