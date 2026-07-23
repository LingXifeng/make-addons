import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 食物模块字段定义 =====

export const foodFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_food', section: '基础信息', iconDir: 'food' },

  // --- 食物属性 ---
  { key: 'nutrition', label: '营养值', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1, section: '食物属性', jsonPath: 'components.minecraft:food.nutrition' },
  { key: 'saturationModifier', label: '饱和度修正', type: 'number', defaultValue: 0.6, min: 0, max: 10, step: 0.1, section: '食物属性', jsonPath: 'components.minecraft:food.saturation_modifier' },
  { key: 'canAlwaysEat', label: '随时可食用', type: 'boolean', defaultValue: false, section: '食物属性', jsonPath: 'components.minecraft:food.can_always_eat' },
  { key: 'usingConvertsTo', label: '食用后转换为', type: 'text', defaultValue: '', section: '食物属性', jsonPath: 'components.minecraft:food.using_converts_to', hint: '如碗: minecraft:bowl' },

  // --- 使用属性 ---
  { key: 'useDuration', label: '食用时间(秒)', type: 'number', defaultValue: 1.6, min: 0, max: 100, step: 0.1, section: '使用属性', jsonPath: 'components.minecraft:use_modifiers.use_duration' },
  { key: 'movementModifier', label: '移动速度修正', type: 'number', defaultValue: 0.35, min: 0, max: 1, step: 0.05, section: '使用属性', jsonPath: 'components.minecraft:use_modifiers.movement_modifier' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 64, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '物品栏属性', jsonPath: 'components.minecraft:glint' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'nature', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '自然', value: 'nature' },
    { label: '装备', value: 'equipment' },
    { label: '物品', value: 'items' },
    { label: '建造', value: 'construction' },
    { label: '无', value: 'none' },
  ]},
];

// ===== 食物模块定义 =====

export const foodModule: ModuleDefinition = {
  id: 'food',
  name: '食物',
  icon: '🍎',
  templateFile: 'templates/food_1_20.json',
  iconDir: 'food',
  fields: foodFields,
  generatorType: 'food',
};
