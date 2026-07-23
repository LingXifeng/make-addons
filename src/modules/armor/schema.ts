import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 护甲模块字段定义 =====
// 基于 libapp_comprehensive_analysis.md §6.2 + leggings_1_20.json / helmet_1_20.json 模板

export const armorFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_armor', section: '基础信息', iconDir: 'armor' },
  { key: 'armorType', label: '护甲类型', type: 'select', defaultValue: 'helmet', section: '基础信息', options: [
    { label: '头盔', value: 'helmet' }, { label: '胸甲', value: 'chestplate' },
    { label: '护腿', value: 'leggings' }, { label: '靴子', value: 'boots' },
  ]},

  // --- 防御属性 ---
  { key: 'protection', label: '护甲值', type: 'number', defaultValue: 3, min: 0, max: 20, step: 1, section: '防御属性', jsonPath: 'components.minecraft:armor.protection' },
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 300, min: 1, max: 10000, step: 1, section: '防御属性', jsonPath: 'components.minecraft:durability.max_durability' },
  { key: 'enchantableEnable', label: '启用附魔', type: 'boolean', defaultValue: true, section: '防御属性' },
  { key: 'enchantable', label: '附魔值', type: 'number', defaultValue: 10, min: 0, max: 100, step: 1, section: '防御属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.value' },
  { key: 'enchantableSlot', label: '附魔槽位', type: 'select', defaultValue: 'armor_head', section: '防御属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.slot', options: [
    { label: '头盔', value: 'armor_head' }, { label: '胸甲', value: 'armor_torso' },
    { label: '护腿', value: 'armor_legs' }, { label: '靴子', value: 'armor_feet' },
    { label: '全部', value: 'all' },
  ]},
  { key: 'knockbackResistance', label: '击退抗性', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.05, section: '防御属性', jsonPath: 'components.minecraft:wearable.knockback_resistance' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'itemGroup', label: '物品栏分组', type: 'select', defaultValue: 'minecraft:itemGroup.name.helmet', section: '物品栏属性', jsonPath: 'description.menu_category.group', options: [
    { label: '头盔', value: 'minecraft:itemGroup.name.helmet' }, { label: '胸甲', value: 'minecraft:itemGroup.name.chestplate' },
    { label: '护腿', value: 'minecraft:itemGroup.name.leggings' }, { label: '靴子', value: 'minecraft:itemGroup.name.boots' },
    { label: '无分组', value: '' },
  ]},
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'equipment', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' },
    { label: '建造', value: 'construction' }, { label: '自然', value: 'nature' }, { label: '无', value: 'none' },
  ]},
  { key: 'renderOffsets', label: '渲染偏移', type: 'select', defaultValue: 'none', section: '物品栏属性', jsonPath: 'components.minecraft:render_offsets', options: [
    { label: '无', value: 'none' }, { label: '头盔', value: 'helmet' }, { label: '胸甲', value: 'chestplate' },
    { label: '护腿', value: 'leggings' }, { label: '靴子', value: 'boots' },
  ]},

  // --- 交互属性 ---
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'repairableItems', label: '修复材料', type: 'repairItems', defaultValue: [], section: '交互属性', showWhen: { field: 'repairableEnable', value: true } },
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '交互属性', jsonPath: 'components.minecraft:glint' },
  { key: 'allowOffHand', label: '允许副手', type: 'boolean', defaultValue: false, section: '交互属性', jsonPath: 'components.minecraft:allow_off_hand' },
  { key: 'fuelEnable', label: '燃料', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'fuelDuration', label: '燃烧时间(秒)', type: 'number', defaultValue: 10, min: 0, max: 9999, step: 1, section: '交互属性', showWhen: { field: 'fuelEnable', value: true } },
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '交互属性', hint: '多个标签用逗号分隔' },

  // --- 高级属性 ---
  { key: 'dispensableEnable', label: '可发射器发射', type: 'boolean', defaultValue: false, section: '高级属性' },
  { key: 'onUseEnable', label: '使用行为', type: 'boolean', defaultValue: false, section: '高级属性' },
  { key: 'onUseEvent', label: '使用事件名称', type: 'text', defaultValue: 'on_use_event', section: '高级属性', showWhen: { field: 'onUseEnable', value: true } },
  { key: 'potionEffectsEnable', label: '药水效果', type: 'boolean', defaultValue: false, section: '高级属性', hint: '穿戴时持续生效' },
  { key: 'potionEffects', label: '效果列表', type: 'potionEffects', defaultValue: [], section: '高级属性', showWhen: { field: 'potionEffectsEnable', value: true } },

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

// ===== 护甲模块定义 =====

export const armorModule: ModuleDefinition = {
  id: 'armor',
  name: '护甲',
  icon: '🛡️',
  category: 'custom_items',
  templateFile: 'templates/helmet_1_20.json',
  iconDir: 'armor',
  jsonRootKey: 'minecraft:item',
  generatorType: 'armor',
  fields: armorFields,
  subTypes: [
    { id: 'helmet', name: '头盔', templateFile: 'templates/helmet_1_20.json' },
    { id: 'chestplate', name: '胸甲', templateFile: 'templates/chestplate_1_20.json' },
    { id: 'leggings', name: '护腿', templateFile: 'templates/leggings_1_20.json' },
    { id: 'boots', name: '靴子', templateFile: 'templates/boots_1_20.json' },
  ],
};
