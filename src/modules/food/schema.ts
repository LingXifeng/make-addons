import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 食物模块字段定义 =====
// 基于 libapp_comprehensive_analysis.md §6.3 + food_1_20.json 模板

export const foodFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_food', section: '基础信息', iconDir: 'food' },

  // --- 食物属性 ---
  { key: 'nutrition', label: '营养值', type: 'number', defaultValue: 4, min: 0, max: 20, step: 1, section: '食物属性', jsonPath: 'components.minecraft:food.nutrition' },
  { key: 'saturation', label: '饱和度', type: 'number', defaultValue: 0.6, min: 0, max: 20, step: 0.1, section: '食物属性', jsonPath: 'components.minecraft:food.saturation_modifier' },
  { key: 'canAlwaysEat', label: '随时可食用', type: 'boolean', defaultValue: false, section: '食物属性', jsonPath: 'components.minecraft:food.can_always_eat', hint: '即使饱腹也可食用' },
  { key: 'usingConvertsTo', label: '食用后转换为', type: 'text', defaultValue: '', section: '食物属性', hint: '食用后返回的物品ID（如碗）' },
  { key: 'useDuration', label: '食用时间(秒)', type: 'number', defaultValue: 1.6, min: 0.1, max: 10, step: 0.1, section: '食物属性' },
  { key: 'useAnimation', label: '使用动画', type: 'select', defaultValue: 'eat', section: '食物属性', jsonPath: 'components.minecraft:use_animation', options: [
    { label: '食用', value: 'eat' }, { label: '饮用', value: 'drink' },
  ]},

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 64, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'itemGroup', label: '物品栏分组', type: 'select', defaultValue: 'minecraft:itemGroup.name.miscFood', section: '物品栏属性', jsonPath: 'description.menu_category.group', options: [
    { label: '食物', value: 'minecraft:itemGroup.name.miscFood' }, { label: '无分组', value: '' },
  ]},
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'nature', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '自然', value: 'nature' }, { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' },
    { label: '建造', value: 'construction' }, { label: '无', value: 'none' },
  ]},

  // --- 药水效果 ---
  { key: 'potionEffectsEnable', label: '药水效果', type: 'boolean', defaultValue: false, section: '药水效果', hint: '食用后给予药水效果' },
  { key: 'potionEffects', label: '效果列表', type: 'potionEffects', defaultValue: [], section: '药水效果', showWhen: { field: 'potionEffectsEnable', value: true } },

  // --- 交互属性 ---
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '交互属性', jsonPath: 'components.minecraft:glint' },
  { key: 'fuelEnable', label: '燃料', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'fuelDuration', label: '燃烧时间(秒)', type: 'number', defaultValue: 10, min: 0, max: 9999, step: 1, section: '交互属性', showWhen: { field: 'fuelEnable', value: true } },
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '交互属性', hint: '多个标签用逗号分隔' },

  // --- 高级属性 ---
  { key: 'onUseEnable', label: '使用行为', type: 'boolean', defaultValue: false, section: '高级属性' },
  { key: 'onUseEvent', label: '使用事件名称', type: 'text', defaultValue: 'on_use_event', section: '高级属性', showWhen: { field: 'onUseEnable', value: true } },
  { key: 'compostableEnable', label: '可堆肥', type: 'boolean', defaultValue: false, section: '高级属性', hint: '放入堆肥桶有概率提升堆肥等级' },
  { key: 'compostingChance', label: '堆肥概率', type: 'number', defaultValue: 0.3, min: 0, max: 1, step: 0.05, section: '高级属性', showWhen: { field: 'compostableEnable', value: true } },

  // --- 合成配方 ---
  { key: 'craftingEnable', label: '启用合成配方', type: 'boolean', defaultValue: false, section: '合成配方' },
  { key: 'craftingType', label: '配方类型', type: 'select', defaultValue: 'shapeless', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, options: [
    { label: '无序合成', value: 'shapeless' }, { label: '有序合成', value: 'shaped' },
  ]},
  { key: 'craftingIngredients', label: '合成材料', type: 'repairItems', defaultValue: [], section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '无序合成的材料列表' },
  { key: 'craftingPattern', label: '合成图案', type: 'text', defaultValue: 'XX\nXX', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '有序合成图案，每行用\\n分隔' },
  { key: 'craftingKey', label: '图案映射', type: 'text', defaultValue: 'X=minecraft:stick', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '字符=物品ID，每行一个' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 食物模块定义 =====

export const foodModule: ModuleDefinition = {
  id: 'food',
  name: '食物',
  icon: '🍎',
  category: 'custom_items',
  templateFile: 'templates/food_1_20.json',
  iconDir: 'food',
  jsonRootKey: 'minecraft:item',
  generatorType: 'food',
  fields: foodFields,
};
