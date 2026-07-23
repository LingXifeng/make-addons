import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 回城卷轴模块字段定义 =====
// 基于 recall_item.json 模板 — 使用自定义组件实现传送功能

export const recallItemFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '回城卷轴', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'recall_item', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'recall_item', section: '基础信息', iconDir: 'recall_item' },

  // --- 传送属性 ---
  { key: 'teleportTarget', label: '传送目标', type: 'select', defaultValue: 'spawn', section: '传送属性', options: [
    { label: '世界出生点', value: 'spawn' }, { label: '床的出生点', value: 'bed_spawn' },
    { label: '固定坐标', value: 'fixed' }, { label: '记录的坐标', value: 'recorded' },
  ]},
  { key: 'fixedX', label: '固定X坐标', type: 'number', defaultValue: 0, step: 1, section: '传送属性', showWhen: { field: 'teleportTarget', value: 'fixed' } },
  { key: 'fixedY', label: '固定Y坐标', type: 'number', defaultValue: 64, step: 1, section: '传送属性', showWhen: { field: 'teleportTarget', value: 'fixed' } },
  { key: 'fixedZ', label: '固定Z坐标', type: 'number', defaultValue: 0, step: 1, section: '传送属性', showWhen: { field: 'teleportTarget', value: 'fixed' } },
  { key: 'recordOnUse', label: '使用时记录当前位置', type: 'boolean', defaultValue: true, section: '传送属性', showWhen: { field: 'teleportTarget', value: 'recorded' } },

  // --- 使用属性 ---
  { key: 'useDuration', label: '使用时长(秒)', type: 'number', defaultValue: 1.5, min: 0.1, max: 10, step: 0.1, section: '使用属性' },
  { key: 'cooldown', label: '冷却时间(秒)', type: 'number', defaultValue: 10, min: 0, max: 3600, step: 1, section: '使用属性' },
  { key: 'consumeOnUse', label: '使用后消耗', type: 'boolean', defaultValue: false, section: '使用属性' },
  { key: 'particlesOnUse', label: '使用时粒子效果', type: 'boolean', defaultValue: true, section: '使用属性' },
  { key: 'soundOnUse', label: '使用时音效', type: 'boolean', defaultValue: true, section: '使用属性' },

  // --- 耐久度 ---
  { key: 'durabilityEnable', label: '启用耐久度', type: 'boolean', defaultValue: true, section: '耐久度' },
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 10, min: 1, max: 10000, step: 1, section: '耐久度', showWhen: { field: 'durabilityEnable', value: true } },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', showWhen: { field: 'durabilityEnable', value: false } },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'items', section: '物品栏属性', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' }, { label: '无', value: 'none' },
  ]},

  // --- 通用属性 ---
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: 'uncommon', section: '通用属性', options: [
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
  { key: 'craftingKey', label: '图案映射', type: 'text', defaultValue: 'X=minecraft:paper', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '字符=物品ID，每行一个' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 回城卷轴模块定义 =====

export const recallItemModule: ModuleDefinition = {
  id: 'recall_item',
  name: '回城卷轴',
  icon: '📜',
  category: 'custom_items',
  templateFile: 'templates/recall_item.json',
  iconDir: 'recall_item',
  jsonRootKey: 'minecraft:item',
  generatorType: 'recall_item',
  fields: recallItemFields,
};
