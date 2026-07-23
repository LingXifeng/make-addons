import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 弓模块字段定义 =====
// 基于 custom_bow.json 模板

export const bowFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_bow', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_bow', section: '基础信息', iconDir: 'bow' },

  // --- 射击属性 ---
  { key: 'maxDrawDuration', label: '最大拉弓时间(秒)', type: 'number', defaultValue: 1.5, min: 0.1, max: 10, step: 0.1, section: '射击属性' },
  { key: 'scalePowerByDraw', label: '按拉弓时间缩放力度', type: 'boolean', defaultValue: true, section: '射击属性' },
  { key: 'ammunition', label: '弹药类型', type: 'text', defaultValue: 'minecraft:arrow', section: '射击属性', hint: '弹药物品ID' },
  { key: 'useOffhand', label: '副手可用', type: 'boolean', defaultValue: true, section: '射击属性' },
  { key: 'searchInventory', label: '搜索物品栏', type: 'boolean', defaultValue: true, section: '射击属性' },
  { key: 'useInCreative', label: '创造模式可用', type: 'boolean', defaultValue: true, section: '射击属性' },

  // --- 耐久与修复 ---
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 421, min: 1, max: 10000, step: 1, section: '耐久与修复' },
  { key: 'enchantableValue', label: '附魔值', type: 'number', defaultValue: 15, min: 0, max: 100, step: 1, section: '耐久与修复' },
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: true, section: '耐久与修复' },
  { key: 'repairItems', label: '修复材料', type: 'repairItems', defaultValue: ['minecraft:string', 'minecraft:stick'], section: '耐久与修复', showWhen: { field: 'repairableEnable', value: true } },

  // --- 使用修饰符 ---
  { key: 'useDuration', label: '使用时长(tick)', type: 'number', defaultValue: 9999, min: 0, max: 999999, step: 1, section: '使用修饰符' },
  { key: 'movementModifier', label: '移动修正', type: 'number', defaultValue: 0.4, min: 0, max: 10, step: 0.05, section: '使用修饰符', hint: '1=正常速度，<1=减速' },

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

// ===== 弓模块定义 =====

export const bowModule: ModuleDefinition = {
  id: 'bow',
  name: '弓',
  icon: '🏹',
  category: 'custom_items',
  templateFile: 'templates/custom_bow.json',
  iconDir: 'bow',
  jsonRootKey: 'minecraft:item',
  generatorType: 'bow',
  fields: bowFields,
};
