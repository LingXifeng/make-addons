import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 防具通用字段 =====

const armorCommonFields: FieldSchema[] = [
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_armor', section: '基础信息', iconDir: 'armor' },

  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 200, min: 1, max: 10000, step: 1, section: '防具属性', jsonPath: 'components.minecraft:durability.max_durability' },
  { key: 'enchantableEnable', label: '启用附魔', type: 'boolean', defaultValue: true, section: '防具属性' },
  { key: 'enchantable', label: '附魔值', type: 'number', defaultValue: 10, min: 0, max: 100, step: 1, section: '防具属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.value' },
  { key: 'enchantableSlot', label: '附魔槽位', type: 'select', defaultValue: 'armor_head', section: '防具属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.slot', options: [
    { label: '全部', value: 'all' },
    { label: '头盔', value: 'armor_head' },
    { label: '胸甲', value: 'armor_torso' },
    { label: '护腿', value: 'armor_legs' },
    { label: '靴子', value: 'armor_feet' },
  ]},
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '防具属性', jsonPath: 'components.minecraft:glint' },

  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'repairableItems', label: '修复材料', type: 'repairItems', defaultValue: [], section: '交互属性', showWhen: { field: 'repairableEnable', value: true } },
];

// ===== 防具模块定义 =====

export const armorModule: ModuleDefinition = {
  id: 'armor',
  name: '防具',
  icon: '🛡️',
  templateFile: 'templates/helmet_1_20.json',
  iconDir: 'armor',
  fields: armorCommonFields,
  generatorType: 'armor',
  subTypes: [
    { id: 'helmet', name: '头盔', templateFile: 'templates/helmet_1_20.json', fields: armorCommonFields.map(f => f.key === 'enchantableSlot' ? { ...f, defaultValue: 'armor_head' } : f) },
    { id: 'chestplate', name: '胸甲', templateFile: 'templates/chestplate_1_20.json', fields: armorCommonFields.map(f => f.key === 'enchantableSlot' ? { ...f, defaultValue: 'armor_torso' } : f) },
    { id: 'leggings', name: '护腿', templateFile: 'templates/leggings_1_20.json', fields: armorCommonFields.map(f => f.key === 'enchantableSlot' ? { ...f, defaultValue: 'armor_legs' } : f) },
    { id: 'boots', name: '靴子', templateFile: 'templates/boots_1_20.json', fields: armorCommonFields.map(f => f.key === 'enchantableSlot' ? { ...f, defaultValue: 'armor_feet' } : f) },
  ],
};
