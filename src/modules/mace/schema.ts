import type { FieldSchema, ModuleDefinition } from '../../core/types';

// === 锤模块字段定义 ===
// 基于 mace.json 模板 (1.21+ 新武器)

export const maceFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_mace', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_mace', section: '基础信息', iconDir: 'mace' },

  // --- 攻击属性 ---
  { key: 'attackDamage', label: '攻击伤害', type: 'number', defaultValue: 7, min: 0, max: 100, step: 0.5, section: '攻击属性' },
  { key: 'attackSpeed', label: '攻击速度', type: 'number', defaultValue: 0.8, min: 0.1, max: 10, step: 0.1, section: '攻击属性' },
  { key: 'knockbackResistance', label: '击退抗性', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.05, section: '攻击属性' },

  // --- 锤专属属性 ---
  { key: 'smashAttackDamage', label: '砸击伤害加成', type: 'number', defaultValue: 4, min: 0, max: 50, step: 0.5, section: '锤专属属性', hint: '从高处落下时的额外伤害' },
  { key: 'smashAttackKnockback', label: '砸击击退', type: 'number', defaultValue: 3.5, min: 0, max: 10, step: 0.1, section: '锤专属属性' },
  { key: 'smashAttackVerticalKnockback', label: '砸击垂直击退', type: 'number', defaultValue: 0.8, min: 0, max: 10, step: 0.1, section: '锤专属属性' },
  { key: 'smashAttackEffectDuration', label: '砸击效果时长(秒)', type: 'number', defaultValue: 0, min: 0, max: 60, step: 1, section: '锤专属属性', hint: '0=无效果' },
  { key: 'smashAttackEffectType', label: '砸击效果类型', type: 'select', defaultValue: 'minecraft:slowness', section: '锤专属属性', options: [
    { label: '无', value: '' }, { label: '缓慢', value: 'minecraft:slowness' }, { label: '虚弱', value: 'minecraft:weakness' },
    { label: '中毒', value: 'minecraft:poison' }, { label: '凋零', value: 'minecraft:wither' },
  ]},

  // --- 耐久与修复 ---
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 500, min: 1, max: 10000, step: 1, section: '耐久与修复' },
  { key: 'enchantableValue', label: '附魔值', type: 'number', defaultValue: 15, min: 0, max: 100, step: 1, section: '耐久与修复' },
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: true, section: '耐久与修复' },
  { key: 'repairItems', label: '修复材料', type: 'repairItems', defaultValue: ['minecraft:diamond'], section: '耐久与修复', showWhen: { field: 'repairableEnable', value: true } },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性' },
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '物品栏属性' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'equipment', section: '物品栏属性', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' }, { label: '无', value: 'none' },
  ]},

  // --- 通用属性 ---
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: '', section: '通用属性', options: [
    { label: '无', value: '' }, { label: '普通', value: 'common' }, { label: '罕见', value: 'uncommon' }, { label: '稀有', value: 'rare' }, { label: '史诗', value: 'epic' },
  ]},
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '通用属性' },
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

// ===== 锤模块定义 =====

export const maceModule: ModuleDefinition = {
  id: 'mace',
  name: '锤',
  icon: '🔨',
  category: 'custom_items',
  templateFile: 'templates/mace.json',
  iconDir: 'mace',
  jsonRootKey: 'minecraft:item',
  generatorType: 'mace',
  fields: maceFields,
};
