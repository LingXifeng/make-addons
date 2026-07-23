import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 生物群系模块字段定义 =====
// 基于 biome_1_21_110.json 模板

export const biomeFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '生物群系名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '生物群系ID', type: 'text', defaultValue: 'custom_biome', section: '基础信息' },

  // --- 气候属性 ---
  { key: 'temperature', label: '温度', type: 'number', defaultValue: 2, min: -2, max: 2, step: 0.1, section: '气候属性', jsonPath: 'components.minecraft:climate.temperature', hint: '影响降水类型（雨/雪）和植物生长' },
  { key: 'downfall', label: '降水量', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.05, section: '气候属性', jsonPath: 'components.minecraft:climate.downfall' },
  { key: 'snowAccumulationMin', label: '最小积雪厚度', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1, section: '气候属性' },
  { key: 'snowAccumulationMax', label: '最大积雪厚度', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1, section: '气候属性' },

  // --- 地形属性 ---
  { key: 'noiseType', label: '地形噪声类型', type: 'select', defaultValue: 'default', section: '地形属性', jsonPath: 'components.minecraft:overworld_height.noise_type', options: [
    { label: '默认', value: 'default' }, { label: '海洋', value: 'ocean' }, { label: '深海', value: 'deep_ocean' },
    { label: '低地', value: 'lowlands' }, { label: '高山', value: 'highlands' }, { label: '山脉', value: 'mountains' },
    { label: '极端山脉', value: 'extreme_mountains' }, { label: '下界', value: 'nether' }, { label: '末地', value: 'end' },
  ]},
  { key: 'seaFloorDepth', label: '海底深度', type: 'number', defaultValue: 7, min: 0, max: 30, step: 1, section: '地形属性' },
  { key: 'seaFloorMaterial', label: '海底材料', type: 'text', defaultValue: 'minecraft:gravel', section: '地形属性' },
  { key: 'foundationMaterial', label: '基础材料', type: 'text', defaultValue: 'minecraft:stone', section: '地形属性' },
  { key: 'midMaterial', label: '中间材料', type: 'text', defaultValue: 'minecraft:dirt', section: '地形属性' },
  { key: 'topMaterial', label: '表层材料', type: 'text', defaultValue: 'minecraft:grass_block', section: '地形属性' },
  { key: 'seaMaterial', label: '海洋材料', type: 'text', defaultValue: 'minecraft:water', section: '地形属性' },

  // --- 生成规则 ---
  { key: 'dimension', label: '维度', type: 'select', defaultValue: 'overworld', section: '生成规则', options: [
    { label: '主世界', value: 'overworld' }, { label: '下界', value: 'nether' }, { label: '末地', value: 'end' },
  ]},
  { key: 'hillsTransformation', label: '丘陵转换', type: 'text', defaultValue: 'minecraft:forest_hills', section: '生成规则' },
  { key: 'riverTransformation', label: '河流转换', type: 'text', defaultValue: '', section: '生成规则' },
  { key: 'generateWarmWeight', label: '温暖气候权重', type: 'number', defaultValue: 1, min: 0, max: 100, step: 1, section: '生成规则' },
  { key: 'generateMediumWeight', label: '中等气候权重', type: 'number', defaultValue: 3, min: 0, max: 100, step: 1, section: '生成规则' },
  { key: 'generateColdWeight', label: '寒冷气候权重', type: 'number', defaultValue: 1, min: 0, max: 100, step: 1, section: '生成规则' },

  // --- 标签 ---
  { key: 'tagAnimal', label: '动物生成', type: 'boolean', defaultValue: true, section: '标签' },
  { key: 'tagMonster', label: '怪物生成', type: 'boolean', defaultValue: true, section: '标签' },
  { key: 'tagOverworld', label: '主世界标签', type: 'boolean', defaultValue: true, section: '标签' },
  { key: 'tagNether', label: '下界标签', type: 'boolean', defaultValue: false, section: '标签' },
  { key: 'tagEnd', label: '末地标签', type: 'boolean', defaultValue: false, section: '标签' },
  { key: 'customTags', label: '自定义标签', type: 'text', defaultValue: '', section: '标签', hint: '逗号分隔' },
];

// ===== 生物群系模块定义 =====

export const biomeModule: ModuleDefinition = {
  id: 'biome',
  name: '生物群系',
  icon: '🌍',
  category: 'custom_environment',
  templateFile: 'templates/biome_1_21_110.json',
  iconDir: 'biome',
  jsonRootKey: 'minecraft:biome',
  generatorType: 'biome',
  fields: biomeFields,
};
