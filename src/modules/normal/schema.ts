import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 普通物品模块字段定义 =====
// 燃料、堆肥、唱片、存储等非战斗非食物的普通物品

export const normalFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_item', section: '基础信息', iconDir: 'normal' },
  { key: 'normalType', label: '物品类型', type: 'select', defaultValue: 'normal', section: '基础信息', options: [
    { label: '普通物品', value: 'normal' }, { label: '燃料', value: 'fuel' },
    { label: '可堆肥', value: 'compostable' }, { label: '唱片', value: 'record' },
    { label: '存储物品', value: 'storage' },
  ]},

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 64, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'itemGroup', label: '物品栏分组', type: 'select', defaultValue: 'minecraft:itemGroup.name.misc', section: '物品栏属性', jsonPath: 'description.menu_category.group', options: [
    { label: '杂项', value: 'minecraft:itemGroup.name.misc' },
    { label: '矿物', value: 'minecraft:itemGroup.name.ore' },
    { label: '材料', value: 'minecraft:itemGroup.name.materials' },
    { label: '无分组', value: '' },
  ]},
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'items', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '物品', value: 'items' }, { label: '装备', value: 'equipment' },
    { label: '建造', value: 'construction' }, { label: '自然', value: 'nature' }, { label: '无', value: 'none' },
  ]},
  { key: 'handEquipped', label: '手持装备', type: 'boolean', defaultValue: false, section: '物品栏属性', jsonPath: 'components.minecraft:hand_equipped' },

  // --- 燃料属性 ---
  { key: 'fuelEnable', label: '作为燃料', type: 'boolean', defaultValue: false, section: '燃料属性', showWhen: { field: 'normalType', value: 'fuel' } },
  { key: 'fuelDuration', label: '燃烧时间(秒)', type: 'number', defaultValue: 10, min: 0, max: 9999, step: 1, section: '燃料属性', showWhen: { field: 'fuelEnable', value: true } },

  // --- 堆肥属性 ---
  { key: 'compostableEnable', label: '可堆肥', type: 'boolean', defaultValue: false, section: '堆肥属性', showWhen: { field: 'normalType', value: 'compostable' } },
  { key: 'compostingChance', label: '堆肥概率', type: 'number', defaultValue: 0.3, min: 0, max: 1, step: 0.05, section: '堆肥属性', showWhen: { field: 'compostableEnable', value: true } },

  // --- 唱片属性 ---
  { key: 'recordEnable', label: '音乐唱片', type: 'boolean', defaultValue: false, section: '唱片属性', showWhen: { field: 'normalType', value: 'record' } },
  { key: 'recordSoundEvent', label: '声音事件', type: 'text', defaultValue: 'music.menu', section: '唱片属性', showWhen: { field: 'recordEnable', value: true }, hint: '播放的声音事件ID' },
  { key: 'recordDuration', label: '播放时长(秒)', type: 'number', defaultValue: 120, min: 1, max: 9999, step: 1, section: '唱片属性', showWhen: { field: 'recordEnable', value: true } },
  { key: 'recordComparatorOutput', label: '红石信号强度', type: 'number', defaultValue: 15, min: 0, max: 15, step: 1, section: '唱片属性', showWhen: { field: 'recordEnable', value: true } },

  // --- 存储属性 ---
  { key: 'storageEnable', label: '存储物品', type: 'boolean', defaultValue: false, section: '存储属性', showWhen: { field: 'normalType', value: 'storage' } },
  { key: 'storageSlots', label: '存储格数', type: 'number', defaultValue: 27, min: 1, max: 54, step: 1, section: '存储属性', showWhen: { field: 'storageEnable', value: true } },

  // --- 通用属性 ---
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: '', section: '通用属性', jsonPath: 'components.minecraft:rarity', options: [
    { label: '无', value: '' }, { label: '普通', value: 'common' }, { label: '罕见', value: 'uncommon' }, { label: '稀有', value: 'rare' }, { label: '史诗', value: 'epic' },
  ]},
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '通用属性', jsonPath: 'components.minecraft:glint' },
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '通用属性' },
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '通用属性', hint: '多个标签用逗号分隔' },

  // --- 合成配方 ---
  { key: 'craftingEnable', label: '启用合成配方', type: 'boolean', defaultValue: false, section: '合成配方' },
  { key: 'craftingType', label: '配方类型', type: 'select', defaultValue: 'shapeless', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, options: [
    { label: '无序合成', value: 'shapeless' }, { label: '有序合成', value: 'shaped' },
  ]},
  { key: 'craftingIngredients', label: '合成材料', type: 'repairItems', defaultValue: [], section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '无序合成的材料列表' },
  { key: 'craftingGrid', label: '合成格子', type: 'craftingGrid', defaultValue: { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} }, section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '在3x3格子中填入字母，下方映射到物品' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 普通物品模块定义 =====

export const normalModule: ModuleDefinition = {
  id: 'normal',
  name: '普通物品',
  icon: '📦',
  category: 'custom_items',
  templateFile: 'templates/weapon_1_20.json',
  iconDir: 'normal',
  jsonRootKey: 'minecraft:item',
  generatorType: 'normal',
  fields: normalFields,
  subTypes: [
    { id: 'normal', name: '普通物品', templateFile: 'templates/weapon_1_20.json' },
    { id: 'fuel', name: '燃料', templateFile: 'templates/weapon_1_20.json' },
    { id: 'compostable', name: '可堆肥', templateFile: 'templates/weapon_1_20.json' },
    { id: 'record', name: '唱片', templateFile: 'templates/weapon_1_20.json' },
    { id: 'storage', name: '存储物品', templateFile: 'templates/weapon_1_20.json' },
  ],
};
