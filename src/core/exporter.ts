import type { ModuleDefinition, ProjectItem, Project } from './types';
import { generateItemJSON, generateClientEntity } from './generator';

// ===== 导出器 =====
// 生成 .mcaddon (zip) 文件，包含完整附加包结构

interface AddonFile {
  path: string;
  content: string;
  isBase64?: boolean; // 贴图等二进制文件用 base64 字符串
  iconFetch?: { iconDir: string; icon_name: string }; // 需要异步 fetch 的内置图标
  fetchUrl?: string; // 需要异步 fetch 的任意资源 URL（相对于 BASE_URL）
}

// 需要贴图的模块 — 基础物品（minecraft:icon = identifier）
const BASIC_TEXTURE_MODULES = ['weapon', 'armor', 'food', 'tool', 'normal', 'spawn_egg'];
// 需要贴图的模块 — 自定义物品（minecraft:icon = { texture: data.icon }）
const CUSTOM_TEXTURE_MODULES = ['bow', 'crossbow', 'shield', 'mace', 'arrow', 'music_disc', 'bundle', 'recall_item', 'soul_stone'];
const ALL_TEXTURE_MODULES = [...BASIC_TEXTURE_MODULES, ...CUSTOM_TEXTURE_MODULES];

// 获取物品的贴图 key（item_texture.json 中的键名）
function getTextureKey(module: ModuleDefinition, item: ProjectItem): string {
  const id = item.data.identifier || 'change_me';
  if (CUSTOM_TEXTURE_MODULES.includes(module.id)) {
    return item.data.icon || id;
  }
  return id;
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
      language: 'javascript',
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
      version: [0, 0, 1],
      min_engine_version: [1, 21, 0],
    },
    modules,
    dependencies: [],
    metadata: {
      authors: ['Make Addons'],
      generated_with: {
        make_addons: ['1.0.0'],
      },
    },
  };

  if (hasScript) {
    manifest.dependencies.push({
      module_name: '@minecraft/server',
      version: '1.13.0',
    });
  }

  // 添加资源包 UUID 依赖 — 确保资源包随行为包自动加载
  const resourceHeaderUUID = project.resourceHeaderUUID;
  if (resourceHeaderUUID) {
    manifest.dependencies.push({
      uuid: resourceHeaderUUID,
      version: [1, 0, 0],
    });
  }

  return JSON.stringify(manifest, null, 2);
}

// 生成资源包 manifest
function generateResourceManifest(project: Project): string {
  const headerUUID = project.resourceHeaderUUID || generateUUID();
  const moduleUUID = project.resourceModuleUUID || generateUUID();

  const manifest: Record<string, any> = {
    format_version: 2,
    header: {
      name: project.name || 'My Addon',
      description: project.description || 'Made with Make Addons',
      uuid: headerUUID,
      version: [0, 0, 1],
      min_engine_version: [1, 21, 0],
    },
    modules: [
      {
        type: 'resources',
        uuid: moduleUUID,
        version: [0, 0, 1],
      },
    ],
    metadata: {
      authors: ['Make Addons'],
      generated_with: {
        make_addons: ['1.0.0'],
      },
    },
  };

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
    case 'spawn_egg':
      paths.behavior = `items/${id}.json`;
      break;
    case 'loot':
      paths.behavior = `loot_tables/${id}.json`;
      break;
    case 'function':
      paths.behavior = `functions/${id}.mcfunction`;
      break;
    case 'animation':
      paths.resource = `animations/${id}.animation.json`;
      break;
    case 'sound':
      paths.resource = `sounds/sound_definitions.json`;
      break;
    case 'texture':
      paths.resource = `textures/texture_data.json`;
      break;
    case 'skin':
      paths.resource = `models/entity/${id}.geometry.json`;
      break;
    case 'shader':
      paths.resource = `materials/${id}.material.json`;
      break;
    case 'script':
      paths.behavior = `scripts/${id}.js`;
      break;
    case 'structure':
      paths.behavior = `structures/${id}.mcstructure`;
      break;
  }

  return paths;
}

// 收集装备/武器的持续药水效果
interface ContinuousEffectEntry {
  itemId: string;       // pa:xxx
  location: string;     // slot.weapon.mainhand, slot.armor.head 等
  effects: { effect: string; duration: number; amplifier: number; visible: boolean }[];
}

function collectContinuousEffects(items: { module: ModuleDefinition; item: ProjectItem }[]): ContinuousEffectEntry[] {
  const entries: ContinuousEffectEntry[] = [];
  for (const { module, item } of items) {
    // 只对 weapon / armor 生成持续效果，food 走 on_consume
    if (module.id !== 'weapon' && module.id !== 'armor') continue;
    const data = item.data;
    if (!data.potionEffectsEnable || !data.potionEffects?.length) continue;
    const id = `pa:${data.identifier || 'change_me'}`;

    // 确定槽位
    let location = 'slot.weapon.mainhand';
    if (module.id === 'armor') {
      const armorSlotMap: Record<string, string> = {
        helmet: 'slot.armor.head',
        chestplate: 'slot.armor.chest',
        leggings: 'slot.armor.legs',
        boots: 'slot.armor.feet',
      };
      location = armorSlotMap[data.armorType || 'helmet'] || 'slot.armor.head';
    }

    entries.push({
      itemId: id,
      location,
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

// 生成火焰附加脚本（药水效果改用 mcfunction + hasitem，复刻 MAM 方案）
function generateEffectScript(fireAspectEntries: FireAspectEntry[]): string {
  if (fireAspectEntries.length === 0) return '';

  // 火焰附加 MAP
  const fireAspectMap = fireAspectEntries.map(e =>
    `  "${e.itemId}": ${e.seconds}`
  ).join(',\n');

  const parts: string[] = [
    '// 火焰附加脚本 — 由 Make Addons 生成',
    '// 攻击生物时使其着火（事件驱动，无闪烁）',
    'import { world, system, EquipmentSlot } from "@minecraft/server";',
    '',
    'const FIRE_ASPECT_MAP = {',
    fireAspectMap,
    '};',
    '',
    '// 监听实体受伤事件 — 攻击者手持火焰附加武器时点燃被攻击者',
    'world.afterEvents.entityHurt.subscribe((event) => {',
    '  try {',
    '    const attacker = event.damageSource.damagingEntity;',
    '    const victim = event.hurtEntity;',
    '    if (!attacker || !victim) return;',
    '',
    '    const equippable = attacker.getComponent("minecraft:equippable");',
    '    if (!equippable) return;',
    '    const mainHand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();',
    '    if (!mainHand) return;',
    '',
    '    const seconds = FIRE_ASPECT_MAP[mainHand.typeId];',
    '    if (seconds) {',
    '      victim.setOnFire(seconds);',
    '    }',
    '  } catch {}',
    '});',
  ];

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
    // 有序合成 - 从 craftingGrid 生成 pattern 和 key
    const gridData = data.craftingGrid || { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} };
    const grid: string[] = gridData.grid || ['', '', '', '', '', '', '', '', ''];
    const mapping: Record<string, string> = gridData.mapping || {};

    // 将 9 格转换为 3 行 pattern
    const rows: string[] = [];
    for (let r = 0; r < 3; r++) {
      let row = '';
      for (let c = 0; c < 3; c++) {
        row += grid[r * 3 + c] || ' ';
      }
      rows.push(row);
    }
    // 去掉全空行
    const pattern = rows.filter(row => row.trim().length > 0);

    // 构建 key 映射 (1.12 格式需要 data: 0)
    const keyMap: Record<string, { item: string; data: number }> = {};
    for (const [char, itemPath] of Object.entries(mapping)) {
      if (char && itemPath) {
        keyMap[char] = { item: itemPath, data: 0 };
      }
    }

    if (pattern.length === 0 || Object.keys(keyMap).length === 0) return null;
    const recipe = {
      format_version: '1.12',
      'minecraft:recipe_shaped': {
        description: { identifier: recipeId },
        tags: ['crafting_table'],
        pattern,
        key: keyMap,
        result: { item: resultId, data: 0, count },
      },
    };
    return JSON.stringify(recipe, null, 2);
  } else {
    // 无序合成
    const ingredients = (data.craftingIngredients || []).map((ing: string) => {
      // 1.12 格式需要对象形式 { item, data }
      const itemId = ing.includes(':') ? ing : `minecraft:${ing}`;
      return { item: itemId, data: 0 };
    });
    if (ingredients.length === 0) return null;
    const recipe = {
      format_version: '1.12',
      'minecraft:recipe_shapeless': {
        description: { identifier: recipeId },
        tags: ['crafting_table'],
        ingredients,
        result: { item: resultId, data: 0, count },
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
      case 'bow':
      case 'crossbow':
      case 'shield':
      case 'mace':
      case 'arrow':
      case 'music_disc':
      case 'bundle':
      case 'recall_item':
      case 'soul_stone':
      case 'spawn_egg':
        lines.push(`item.${ns}:${id}.name=${name}`);
        lines.push(`item.${ns}:${id}=${name}`); // MAM 格式：额外一行不带 .name
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
      case 'animation':
      case 'sound':
      case 'texture':
      case 'skin':
      case 'shader':
      case 'function':
      case 'script':
      case 'structure':
      case 'loot':
        // 这些模块不需要语言文件条目
        break;
    }
  }

  return lines.join('\n') + '\n';
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

  // 检查是否需要脚本模块（火焰附加 + 持续药水效果都需要脚本 API）
  const continuousEffects = collectContinuousEffects(allItems);
  const fireAspectItems = collectFireAspectItems(allItems);
  const hasScript = fireAspectItems.length > 0 || allItems.some(({ module }) => module.id === 'script');

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

  // 收集 tick.json 函数列表（函数模块 + 持续效果 mcfunction）
  const tickValues: string[] = [];

  // 生成每个项目的 JSON 文件
  for (const { module, item } of allItems) {
    const json = generateItemJSON(module, item);
    const paths = getItemFilePath(module, item);

    // 函数模块：生成 .mcfunction 纯文本文件
    if (module.id === 'function') {
      if (paths.behavior) {
        files.push({
          path: `behavior_pack/${paths.behavior}`,
          content: item.data.commands || '',
        });
      }
      // tick/load 函数 — 收集到 tickValues 统一生成 tick.json
      if (item.data.tickEnabled) {
        tickValues.push(`pa:${item.data.identifier || 'change_me'}`);
      }
      if (item.data.loadEnabled) {
        files.push({
          path: `behavior_pack/functions/load.json`,
          content: JSON.stringify({ values: [`pa:${item.data.identifier || 'change_me'}`] }, null, 2),
        });
      }
      continue;
    }

    // 脚本模块：生成 .js 纯文本文件
    if (module.id === 'script') {
      if (paths.behavior) {
        files.push({
          path: `behavior_pack/${paths.behavior}`,
          content: item.data.scriptContent || '',
        });
      }
      continue;
    }

    // 结构模块：生成占位 .mcstructure 文件
    if (module.id === 'structure') {
      if (paths.behavior) {
        files.push({
          path: `behavior_pack/${paths.behavior}`,
          content: JSON.stringify(json, null, 2),
        });
      }
      continue;
    }

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

    // 资源包模块（animation/sound/texture/skin/shader）
    if (paths.resource && ['animation', 'sound', 'texture', 'skin', 'shader'].includes(module.id)) {
      files.push({
        path: `resource_pack/${paths.resource}`,
        content: JSON.stringify(json, null, 2),
      });
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
    ALL_TEXTURE_MODULES.includes(module.id)
  );

  if (textureItems.length > 0) {
    // 生成 item_texture.json
    const textureData: Record<string, { textures: string }> = {};
    for (const { module, item } of textureItems) {
      const texKey = getTextureKey(module, item);
      textureData[texKey] = { textures: `textures/items/${texKey}` };
    }
    files.push({
      path: 'resource_pack/textures/item_texture.json',
      content: JSON.stringify({
        resource_pack_name: 'pa',
        texture_name: 'atlas.items',
        texture_data: textureData,
      }, null, 2),
    });

    // 导出贴图 PNG（自定义上传 或 内置图标）
    for (const { module, item } of textureItems) {
      const texKey = getTextureKey(module, item);

      if (item.customTexture?.dataUrl) {
        // 用户上传的自定义贴图
        const base64Match = item.customTexture.dataUrl.match(/^data:[^;]+;base64,(.+)$/);
        if (base64Match) {
          files.push({
            path: `resource_pack/textures/items/${texKey}.png`,
            content: base64Match[1],
            isBase64: true,
          });
        }
      } else {
        // 内置图标 — 标记为需要异步 fetch
        const iconName = CUSTOM_TEXTURE_MODULES.includes(module.id)
          ? (item.data.icon || texKey)
          : (item.data.icon || texKey);
        files.push({
          path: `resource_pack/textures/items/${texKey}.png`,
          content: '',
          iconFetch: { iconDir: module.iconDir, icon_name: iconName },
        });
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

  // 火焰附加脚本（仅用于火焰附加，药水效果用 mcfunction）
  if (fireAspectItems.length > 0) {
    files.push({
      path: 'behavior_pack/scripts/effect_manager.js',
      content: generateEffectScript(fireAspectItems),
    });
  }

  // 药水效果 mcfunction — 复刻 MAM 方案
  // 每个有药水效果的物品生成一个 mcfunction，每 tick 执行
  for (const entry of continuousEffects) {
    const fnName = `pa_${entry.itemId.replace('pa:', '')}_effect`;
    const lines = entry.effects.map(e => {
      const amp = Math.max(0, (e.amplifier || 1) - 1);
      const hide = e.visible === false ? 'true' : 'false';
      return `effect @e[hasitem={item=${entry.itemId},location=${entry.location}}] ${e.effect} 1 ${amp} ${hide}`;
    });
    files.push({
      path: `behavior_pack/functions/pa/${fnName}.mcfunction`,
      content: `# pa:${fnName} — 由 Make Addons 生成（每 tick 执行）\n` + lines.join('\n') + '\n',
    });
    tickValues.push(`pa:${fnName}`);
  }

  // tick.json — 合并所有需要每 tick 执行的函数
  if (tickValues.length > 0) {
    files.push({
      path: 'behavior_pack/functions/tick.json',
      content: JSON.stringify({ values: tickValues }, null, 2),
    });
  }

  // pack_icon.png — 行为包和资源包各一份
  files.push({
    path: 'behavior_pack/pack_icon.png',
    content: '',
    fetchUrl: 'assets/pack_icon.png',
  });
  files.push({
    path: 'resource_pack/pack_icon.png',
    content: '',
    fetchUrl: 'assets/pack_icon.png',
  });

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

      // 异步 fetch 任意资源（如 pack_icon.png）
      if (file.fetchUrl && !file.content) {
        try {
          const url = `${import.meta.env.BASE_URL}${file.fetchUrl}`;
          const resp = await fetch(url);
          if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            behaviorFolder.file(relPath, arrayBuffer);
          }
        } catch {}
        continue;
      }

      if (relPath && file.content) {
        behaviorFolder.file(relPath, file.content, file.isBase64 ? { base64: true } : undefined);
      }
    } else if (file.path.startsWith('resource_pack/')) {
      const relPath = file.path.replace('resource_pack/', '');

      // 异步 fetch 任意资源（如 pack_icon.png）
      if (file.fetchUrl && !file.content) {
        try {
          const url = `${import.meta.env.BASE_URL}${file.fetchUrl}`;
          const resp = await fetch(url);
          if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            resourceFolder.file(relPath, arrayBuffer);
          }
        } catch {}
        continue;
      }

      // 异步 fetch 内置图标 PNG
      if (file.iconFetch && !file.content) {
        try {
          const iconUrl = `${import.meta.env.BASE_URL}assets/icons/${file.iconFetch.iconDir}/${file.iconFetch.icon_name}.png`;
          const resp = await fetch(iconUrl);
          if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            resourceFolder.file(relPath, arrayBuffer);
          }
        } catch {
          // 图标 fetch 失败时跳过，不影响其他文件
        }
        continue;
      }

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
