import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 箭模块字段定义 =====
// 基于 custom_arrow.json 模板

export const arrowFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_arrow', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_arrow', section: '基础信息', iconDir: 'arrow' },

  // --- 弹射物属性 ---
  { key: 'projectileEntity', label: '弹射物实体', type: 'text', defaultValue: 'minecraft:arrow', section: '弹射物属性', hint: '射出时生成的弹射物实体ID' },
  { key: 'damage', label: '伤害值', type: 'number', defaultValue: 4, min: 0, max: 100, step: 0.5, section: '弹射物属性' },
  { key: 'knockback', label: '击退力', type: 'number', defaultValue: 0, min: 0, max: 10, step: 0.1, section: '弹射物属性' },
  { key: 'criticalOnFullDraw', label: '满弓暴击', type: 'boolean', defaultValue: true, section: '弹射物属性' },
  { key: 'piercingLevel', label: '穿透等级', type: 'number', defaultValue: 0, min: 0, max: 10, step: 1, section: '弹射物属性' },

  // --- 状态效果 ---
  { key: 'effectEnable', label: '启用状态效果', type: 'boolean', defaultValue: false, section: '状态效果' },
  { key: 'effectType', label: '效果类型', type: 'select', defaultValue: 'minecraft:poison', section: '状态效果', showWhen: { field: 'effectEnable', value: true }, options: [
    { label: '中毒', value: 'minecraft:poison' }, { label: '凋零', value: 'minecraft:wither' },
    { label: '缓慢', value: 'minecraft:slowness' }, { label: '虚弱', value: 'minecraft:weakness' },
    { label: '反胃', value: 'minecraft:nausea' }, { label: '失明', value: 'minecraft:blindness' },
    { label: '火焰附加', value: 'minecraft:fire_resistance' }, { label: '瞬间伤害', value: 'minecraft:instant_damage' },
  ]},
  { key: 'effectDuration', label: '效果时长(秒)', type: 'number', defaultValue: 5, min: 0, max: 600, step: 1, section: '状态效果', showWhen: { field: 'effectEnable', value: true } },
  { key: 'effectAmplifier', label: '效果等级', type: 'number', defaultValue: 0, min: 0, max: 10, step: 1, section: '状态效果', showWhen: { field: 'effectEnable', value: true }, hint: '0=I, 1=II, ...' },

  // --- 粒子效果 ---
  { key: 'particleEnable', label: '启用飞行粒子', type: 'boolean', defaultValue: false, section: '粒子效果' },
  { key: 'particleType', label: '粒子类型', type: 'select', defaultValue: 'minecraft:enchant', section: '粒子效果', showWhen: { field: 'particleEnable', value: true }, options: [
    { label: '附魔', value: 'minecraft:enchant' }, { label: '火焰', value: 'minecraft:flame' },
    { label: '传送', value: 'minecraft:portal' }, { label: '红石', value: 'minecraft:redstone' },
    { label: '心', value: 'minecraft:heart' }, { label: '愤怒', value: 'minecraft:villager_angry' },
    { label: '气泡', value: 'minecraft:bubble' }, { label: '末影之眼', value: 'minecraft:eye_of_ender' },
  ]},

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 64, min: 1, max: 64, step: 1, section: '物品栏属性' },
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
  { key: 'craftingPattern', label: '合成图案', type: 'text', defaultValue: 'XX\nXX', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '有序合成图案，每行用\\n分隔' },
  { key: 'craftingKey', label: '图案映射', type: 'text', defaultValue: 'X=minecraft:stick', section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '字符=物品ID，每行一个' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 4, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 箭模块定义 =====

export const arrowModule: ModuleDefinition = {
  id: 'arrow',
  name: '箭',
  icon: '➹',
  category: 'custom_items',
  templateFile: 'templates/custom_arrow.json',
  iconDir: 'arrow',
  jsonRootKey: 'minecraft:item',
  generatorType: 'arrow',
  fields: arrowFields,
};
