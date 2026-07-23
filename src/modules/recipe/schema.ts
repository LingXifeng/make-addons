import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 配方模块字段定义 =====
// 基于基岩版配方格式规范

export const recipeFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '配方名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '配方ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'recipeType', label: '配方类型', type: 'select', defaultValue: 'shaped', section: '基础信息', options: [
    { label: '有序合成', value: 'shaped' }, { label: '无序合成', value: 'shapeless' }, { label: '熔炼', value: 'furnace' },
  ]},

  // --- 结果 ---
  { key: 'resultItem', label: '结果物品ID', type: 'text', defaultValue: 'minecraft:diamond', section: '结果' },
  { key: 'resultCount', label: '结果数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '结果' },

  // --- 有序合成图案 ---
  { key: 'pattern', label: '合成图案', type: 'recipePattern', defaultValue: ['', '', ''], section: '合成图案', showWhen: { field: 'recipeType', value: 'shaped' } },
  { key: 'ingredients', label: '材料映射', type: 'recipeItems', defaultValue: {}, section: '合成图案', showWhen: { field: 'recipeType', value: 'shaped' } },

  // --- 无序合成材料 ---
  { key: 'shapelessItems', label: '材料列表', type: 'itemList', defaultValue: [], section: '无序合成', showWhen: { field: 'recipeType', value: 'shapeless' } },

  // --- 熔炼属性 ---
  { key: 'furnaceInput', label: '输入物品', type: 'text', defaultValue: 'minecraft:iron_ore', section: '熔炼', showWhen: { field: 'recipeType', value: 'furnace' } },
  { key: 'furnaceType', label: '熔炉类型', type: 'select', defaultValue: 'furnace', section: '熔炼', showWhen: { field: 'recipeType', value: 'furnace' }, options: [
    { label: '熔炉', value: 'furnace' }, { label: '高炉', value: 'blast_furnace' }, { label: '烟熏炉', value: 'smoker' }, { label: '营火', value: 'campfire' },
  ]},

  // --- 其他 ---
  { key: 'unlockEnable', label: '解锁条件', type: 'boolean', defaultValue: false, section: '其他' },
  { key: 'unlockItems', label: '解锁物品', type: 'itemList', defaultValue: [], section: '其他', showWhen: { field: 'unlockEnable', value: true } },
  { key: 'priority', label: '优先级', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1, section: '其他', hint: '数字越大优先级越高' },
  { key: 'tags', label: '配方标签', type: 'text', defaultValue: '', section: '其他', hint: '如 minecraft:smelting, 逗号分隔' },
];

// ===== 配方模块定义 =====

export const recipeModule: ModuleDefinition = {
  id: 'recipe',
  name: '配方',
  icon: '📖',
  category: 'custom_recipes',
  templateFile: 'templates/recipes.json',
  iconDir: 'recipe',
  jsonRootKey: 'minecraft:recipe_shaped',
  generatorType: 'recipe_shaped',
  fields: recipeFields,
  subTypes: [
    { id: 'shaped', name: '有序合成', templateFile: 'templates/recipes.json' },
    { id: 'shapeless', name: '无序合成', templateFile: 'templates/recipes.json' },
    { id: 'furnace', name: '熔炼', templateFile: 'templates/recipes.json' },
  ],
};
