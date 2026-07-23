import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 收纳袋模块字段定义 =====
// 基于 bundle.json 模板

export const bundleFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_bundle', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_bundle', section: '基础信息', iconDir: 'bundle' },

  // --- 收纳属性 ---
  { key: 'maxStackCount', label: '最大收纳数量', type: 'number', defaultValue: 64, min: 1, max: 999, step: 1, section: '收纳属性', hint: '每个物品的最大堆叠数' },
  { key: 'allowBulk', label: '允许批量操作', type: 'boolean', defaultValue: true, section: '收纳属性' },
  { key: 'pickupOnInteract', label: '交互时拾取', type: 'boolean', defaultValue: true, section: '收纳属性' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'items', section: '物品栏属性', options: [
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
  { key: 'craftingType', label: '配方类型', 'type': 'select', defaultValue: 'shapeless', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, options: [
    { label: '无序合成', value: 'shapeless' }, { label: '有序合成', value: 'shaped' },
  ]},
  { key: 'craftingIngredients', label: '合成材料', type: 'repairItems', defaultValue: [], section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
  { key: 'craftingGrid', label: '合成格子', type: 'craftingGrid', defaultValue: { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} }, section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '在3x3格子中填入字母，下方映射到物品' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 收纳袋模块定义 =====

export const bundleModule: ModuleDefinition = {
  id: 'bundle',
  name: '收纳袋',
  icon: '🎒',
  category: 'custom_items',
  templateFile: 'templates/bundle.json',
  iconDir: 'bundle',
  jsonRootKey: 'minecraft:item',
  generatorType: 'bundle',
  fields: bundleFields,
};
