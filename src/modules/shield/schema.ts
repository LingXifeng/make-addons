import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 盾牌模块字段定义 =====
// 基于 shield.json 模板

export const shieldFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_shield', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_shield', section: '基础信息', iconDir: 'shield' },

  // --- 防御属性 ---
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 100, min: 1, max: 10000, step: 1, section: '防御属性' },
  { key: 'enchantableValue', label: '附魔值', type: 'number', defaultValue: 12, min: 0, max: 100, step: 1, section: '防御属性' },
  { key: 'enchantableSlot', label: '附魔槽位', type: 'select', defaultValue: 'shield', section: '防御属性', options: [
    { label: '盾牌', value: 'shield' }, { label: '全部', value: 'all' }, { label: '剑', value: 'sword' },
  ]},

  // --- 修复 ---
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: true, section: '修复' },
  { key: 'repairItems', label: '修复材料', type: 'repairItems', defaultValue: ['minecraft:planks'], section: '修复', showWhen: { field: 'repairableEnable', value: true } },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性' },
  { key: 'allowOffHand', label: '允许副手', type: 'boolean', defaultValue: true, section: '物品栏属性' },
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
  { key: 'craftingPattern', label: '合成图案', type: 'text', defaultValue: 'XX\nXX', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '有序合成图案，每行用\\n分隔' },
  { key: 'craftingKey', label: '图案映射', type: 'text', defaultValue: 'X=minecraft:planks', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '字符=物品ID，每行一个' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 盾牌模块定义 =====

export const shieldModule: ModuleDefinition = {
  id: 'shield',
  name: '盾牌',
  icon: '🛡️',
  category: 'custom_items',
  templateFile: 'templates/shield.json',
  iconDir: 'shield',
  jsonRootKey: 'minecraft:item',
  generatorType: 'shield',
  fields: shieldFields,
};
