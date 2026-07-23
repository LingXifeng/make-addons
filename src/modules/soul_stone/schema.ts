import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 灵魂石模块字段定义 =====
// 基于 soul_stone.json 模板 — 捕获/释放实体功能

export const soulStoneFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '灵魂石', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'soul_stone', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'soul_stone', section: '基础信息', iconDir: 'soul_stone' },

  // --- 捕获属性 ---
  { key: 'captureMode', label: '捕获模式', type: 'select', defaultValue: 'all', section: '捕获属性', options: [
    { label: '所有实体', value: 'all' }, { label: '仅怪物', value: 'monster' },
    { label: '仅动物', value: 'animal' }, { label: '指定实体', value: 'specific' },
  ]},
  { key: 'captureEntityTypes', label: '指定实体类型', type: 'text', defaultValue: '', section: '捕获属性', showWhen: { field: 'captureMode', value: 'specific' }, hint: '实体ID，逗号分隔，如 minecraft:cow,minecraft:pig' },
  { key: 'requiresSneaking', label: '需潜行捕获', type: 'boolean', defaultValue: true, section: '捕获属性' },
  { key: 'captureHealthThreshold', label: '最低血量要求', type: 'number', defaultValue: 0, min: 0, max: 1000, step: 0.5, section: '捕获属性', hint: '0=无限制' },
  { key: 'captureOnKill', label: '击杀时捕获', type: 'boolean', defaultValue: false, section: '捕获属性', hint: 'true=击杀时捕获，false=交互时捕获' },

  // --- 释放属性 ---
  { key: 'releaseMode', label: '释放模式', type: 'select', defaultValue: 'interact', section: '释放属性', options: [
    { label: '右键交互', value: 'interact' }, { label: '右键方块', value: 'block' }, { label: '丢弃物品', value: 'drop' },
  ]},
  { key: 'releaseHealthRestore', label: '恢复血量', type: 'boolean', defaultValue: true, section: '释放属性' },
  { key: 'releaseParticles', label: '释放粒子效果', type: 'boolean', defaultValue: true, section: '释放属性' },
  { key: 'releaseSound', label: '释放音效', type: 'boolean', defaultValue: true, section: '释放属性' },

  // --- 使用属性 ---
  { key: 'cooldown', label: '冷却时间(秒)', type: 'number', defaultValue: 5, min: 0, max: 3600, step: 1, section: '使用属性' },
  { key: 'consumeOnCapture', label: '捕获时消耗', type: 'boolean', defaultValue: false, section: '使用属性' },

  // --- 耐久度 ---
  { key: 'durabilityEnable', label: '启用耐久度', type: 'boolean', defaultValue: true, section: '耐久度' },
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 100, min: 1, max: 10000, step: 1, section: '耐久度', showWhen: { field: 'durabilityEnable', value: true } },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', showWhen: { field: 'durabilityEnable', value: false } },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'items', section: '物品栏属性', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' }, { label: '无', value: 'none' },
  ]},

  // --- 通用属性 ---
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: 'rare', section: '通用属性', options: [
    { label: '无', value: '' }, { label: '普通', value: 'common' }, { label: '罕见', value: 'uncommon' }, { label: '稀有', value: 'rare' }, { label: '史诗', value: 'epic' },
  ]},
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: true, section: '通用属性' },
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '通用属性', hint: '多个标签用逗号分隔' },

  // --- 合成配方 ---
  { key: 'craftingEnable', label: '启用合成配方', type: 'boolean', defaultValue: false, section: '合成配方' },
  { key: 'craftingType', label: '配方类型', type: 'select', defaultValue: 'shapeless', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, options: [
    { label: '无序合成', value: 'shapeless' }, { label: '有序合成', value: 'shaped' },
  ]},
  { key: 'craftingIngredients', label: '合成材料', type: 'repairItems', defaultValue: [], section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
  { key: 'craftingGrid', label: '合成格子', type: 'craftingGrid', defaultValue: { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} }, section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '在3x3格子中填入字母，下方映射到物品' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 灵魂石模块定义 =====

export const soulStoneModule: ModuleDefinition = {
  id: 'soul_stone',
  name: '灵魂石',
  icon: '🔮',
  category: 'custom_items',
  templateFile: 'templates/soul_stone.json',
  iconDir: 'soul_stone',
  jsonRootKey: 'minecraft:item',
  generatorType: 'soul_stone',
  fields: soulStoneFields,
};
