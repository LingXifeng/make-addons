import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 生怪蛋模块字段定义 =====
// 自定义刷怪蛋物品，用于生成自定义实体

export const spawnEggFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'spawn_egg', section: '基础信息', iconDir: 'spawn_egg' },
  { key: 'entityType', label: '目标实体', type: 'text', defaultValue: 'pa:change_me', section: '基础信息', placeholder: 'pa:my_entity' },

  // --- 外观 ---
  { key: 'baseColor', label: '基础颜色', type: 'color', defaultValue: '#FFFFFF', section: '外观' },
  { key: 'spotColor', label: '斑点颜色', type: 'color', defaultValue: '#000000', section: '外观' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 64, min: 1, max: 64, step: 1, section: '物品栏属性' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'nature', section: '物品栏属性', options: [
    { label: '自然', value: 'nature' }, { label: '物品', value: 'items' },
    { label: '装备', value: 'equipment' }, { label: '无', value: 'none' },
  ]},

  // --- 高级 ---
  { key: 'aliases', label: '别名', type: 'tags', defaultValue: [], section: '高级' },
];

export const spawnEggModule: ModuleDefinition = {
  id: 'spawn_egg',
  name: '生怪蛋',
  description: '自定义刷怪蛋物品',
  icon: '🥚',
  category: 'custom_items',
  templateFile: '',
  iconDir: 'spawn_egg',
  jsonRootKey: 'minecraft:item',
  generatorType: 'spawn_egg',
  fields: spawnEggFields,
};
