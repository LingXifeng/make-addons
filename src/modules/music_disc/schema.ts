import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 音乐唱片模块字段定义 =====
// 基于 music_disc.json 模板

export const musicDiscFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'custom_music_disc', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'custom_music_disc', section: '基础信息', iconDir: 'music_disc' },

  // --- 唱片属性 ---
  { key: 'musicItem', label: '音乐ID', type: 'text', defaultValue: 'music.custom', section: '唱片属性', hint: '定义在声音定义文件中的音乐事件ID' },
  { key: 'description', label: '唱片描述', type: 'text', defaultValue: 'Author - Title', section: '唱片属性', hint: '显示在唱片下方的描述文本' },
  { key: 'lengthInTicks', label: '时长(tick)', type: 'number', defaultValue: 2000, min: 1, max: 100000, step: 1, section: '唱片属性', hint: '20 tick = 1 秒' },
  { key: 'comparatorOutput', label: '比较器输出', type: 'number', defaultValue: 0, min: 0, max: 15, step: 1, section: '唱片属性', hint: '红石比较器信号强度' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'items', section: '物品栏属性', options: [
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' }, { label: '无', value: 'none' },
  ]},

  // --- 通用属性 ---
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: 'rare', section: '通用属性', options: [
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
  { key: 'craftingGrid', label: '合成格子', type: 'craftingGrid', defaultValue: { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} }, section: '合成配方', showWhen: { field: 'craftingEnable', value: true }, hint: '在3x3格子中填入字母，下方映射到物品' },
  { key: 'craftingCount', label: '产物数量', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '合成配方', showWhen: { field: 'craftingEnable', value: true } },
];

// ===== 音乐唱片模块定义 =====

export const musicDiscModule: ModuleDefinition = {
  id: 'music_disc',
  name: '音乐唱片',
  icon: '🎵',
  category: 'custom_items',
  templateFile: 'templates/music_disc.json',
  iconDir: 'music_disc',
  jsonRootKey: 'minecraft:item',
  generatorType: 'music_disc',
  fields: musicDiscFields,
};
