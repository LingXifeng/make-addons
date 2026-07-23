import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 工具模块字段定义 =====
// 镐/斧/锹/锄等挖掘工具，核心是 digger 组件（自定义挖掘速度）

export const toolFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_tool', section: '基础信息', iconDir: 'tool' },
  { key: 'toolType', label: '工具类型', type: 'select', defaultValue: 'pickaxe', section: '基础信息', options: [
    { label: '镐', value: 'pickaxe' }, { label: '斧', value: 'axe' },
    { label: '锹', value: 'shovel' }, { label: '锄', value: 'hoe' },
  ]},

  // --- 挖掘属性 ---
  { key: 'diggerEnable', label: '自定义挖掘速度', type: 'boolean', defaultValue: true, section: '挖掘属性', hint: '为不同方块设置不同挖掘速度' },
  { key: 'diggerBlocks', label: '挖掘方块列表', type: 'repairItems', defaultValue: [], section: '挖掘属性', showWhen: { field: 'diggerEnable', value: true }, hint: '可快速挖掘的方块ID列表' },
  { key: 'diggerSpeed', label: '挖掘速度', type: 'number', defaultValue: 6, min: 1, max: 100, step: 0.5, section: '挖掘属性', showWhen: { field: 'diggerEnable', value: true } },
  { key: 'useEfficiency', label: '使用效率', type: 'boolean', defaultValue: true, section: '挖掘属性', showWhen: { field: 'diggerEnable', value: true }, hint: '附魔效率生效' },
  { key: 'miningSpeed', label: '基础挖掘速度', type: 'number', defaultValue: 1, min: 1, max: 100, step: 0.1, section: '挖掘属性', jsonPath: 'components.minecraft:mining_speed' },

  // --- 耐久与附魔 ---
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 500, min: 1, max: 10000, step: 1, section: '耐久与附魔', jsonPath: 'components.minecraft:durability.max_durability' },
  { key: 'enchantableEnable', label: '启用附魔', type: 'boolean', defaultValue: true, section: '耐久与附魔' },
  { key: 'enchantable', label: '附魔值', type: 'number', defaultValue: 10, min: 0, max: 100, step: 1, section: '耐久与附魔', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.value' },
  { key: 'enchantableSlot', label: '附魔槽位', type: 'select', defaultValue: 'pickaxe', section: '耐久与附魔', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.slot', options: [
    { label: '镐', value: 'pickaxe' }, { label: '斧', value: 'axe' },
    { label: '锹', value: 'shovel' }, { label: '锄', value: 'hoe' },
    { label: '全部', value: 'all' },
  ]},
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '耐久与附魔', jsonPath: 'components.minecraft:glint' },

  // --- 战斗属性 ---
  { key: 'damage', label: '攻击伤害', type: 'number', defaultValue: 2, min: 0, max: 1000, step: 1, section: '战斗属性', jsonPath: 'components.minecraft:damage' },
  { key: 'handEquipped', label: '手持装备', type: 'boolean', defaultValue: true, section: '战斗属性', jsonPath: 'components.minecraft:hand_equipped' },
  { key: 'fireAspectEnable', label: '火焰附加', type: 'boolean', defaultValue: false, section: '战斗属性', hint: '攻击生物时使其着火' },
  { key: 'fireAspectSeconds', label: '燃烧时间(秒)', type: 'number', defaultValue: 4, min: 1, max: 30, step: 1, section: '战斗属性', showWhen: { field: 'fireAspectEnable', value: true } },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'itemGroup', label: '物品栏分组', type: 'select', defaultValue: 'minecraft:itemGroup.name.pickaxe', section: '物品栏属性', jsonPath: 'description.menu_category.group', options: [
    { label: '镐', value: 'minecraft:itemGroup.name.pickaxe' }, { label: '斧', value: 'minecraft:itemGroup.name.axe' },
    { label: '锹', value: 'minecraft:itemGroup.name.shovel' }, { label: '锄', value: 'minecraft:itemGroup.name.hoe' },
    { label: '无分组', value: '' },
  ]},
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'equipment', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' },
    { label: '建造', value: 'construction' }, { label: '自然', value: 'nature' }, { label: '无', value: 'none' },
  ]},

  // --- 交互属性 ---
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'repairableItems', label: '修复材料', type: 'repairItems', defaultValue: [], section: '交互属性', showWhen: { field: 'repairableEnable', value: true } },
  { key: 'allowOffHand', label: '允许副手', type: 'boolean', defaultValue: false, section: '交互属性', jsonPath: 'components.minecraft:allow_off_hand' },
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '交互属性', hint: '多个标签用逗号分隔' },

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

// ===== 工具模块定义 =====

export const toolModule: ModuleDefinition = {
  id: 'tool',
  name: '工具',
  icon: '⛏️',
  category: 'custom_items',
  templateFile: 'templates/weapon_1_20.json',
  iconDir: 'tool',
  jsonRootKey: 'minecraft:item',
  generatorType: 'weapon', // 复用 weapon 生成器
  fields: toolFields,
  subTypes: [
    { id: 'pickaxe', name: '镐', templateFile: 'templates/weapon_1_20.json' },
    { id: 'axe', name: '斧', templateFile: 'templates/weapon_1_20.json' },
    { id: 'shovel', name: '锹', templateFile: 'templates/weapon_1_20.json' },
    { id: 'hoe', name: '锄', templateFile: 'templates/weapon_1_20.json' },
  ],
};
