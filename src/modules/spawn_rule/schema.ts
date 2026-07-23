import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 生成规则模块字段定义 =====
// 基于 MAM 生成规则模板（custom_spawn / entity_spawn）

export const spawnRuleFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '规则名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '实体ID', type: 'text', defaultValue: 'change_me', section: '基础信息', hint: '要生成规则的实体标识符' },
  { key: 'populationControl', label: '种群控制', type: 'select', defaultValue: 'animal', section: '基础信息', options: [
    { label: '动物', value: 'animal' }, { label: '怪物', value: 'monster' },
    { label: '水生动物', value: 'water_animal' }, { label: '环境', value: 'ambient' },
  ]},

  // --- 生成条件 ---
  { key: 'spawnsOnSurface', label: '地表生成', type: 'boolean', defaultValue: true, section: '生成条件' },
  { key: 'spawnsUnderground', label: '地下生成', type: 'boolean', defaultValue: false, section: '生成条件' },
  { key: 'spawnsOnBlock', label: '方块上生成', type: 'boolean', defaultValue: false, section: '生成条件' },
  { key: 'spawnBlock', label: '生成方块', type: 'text', defaultValue: 'minecraft:grass', section: '生成条件', showWhen: { field: 'spawnsOnBlock', value: true } },

  // --- 亮度过滤 ---
  { key: 'brightnessMin', label: '最小亮度', type: 'number', defaultValue: 7, min: 0, max: 15, step: 1, section: '亮度过滤' },
  { key: 'brightnessMax', label: '最大亮度', type: 'number', defaultValue: 15, min: 0, max: 15, step: 1, section: '亮度过滤' },
  { key: 'adjustForWeather', label: '根据天气调整', type: 'boolean', defaultValue: false, section: '亮度过滤' },

  // --- 生成权重与种群 ---
  { key: 'weight', label: '生成权重', type: 'number', defaultValue: 10, min: 0, max: 1000, step: 1, section: '生成权重' },
  { key: 'herdMin', label: '最小种群', type: 'number', defaultValue: 2, min: 1, max: 100, step: 1, section: '生成权重' },
  { key: 'herdMax', label: '最大种群', type: 'number', defaultValue: 4, min: 1, max: 100, step: 1, section: '生成权重' },

  // --- 群系过滤 ---
  { key: 'biomeTag', label: '群系标签', type: 'select', defaultValue: 'plains', section: '群系过滤', options: [
    { label: '平原', value: 'plains' }, { label: '沙漠', value: 'desert' },
    { label: '丛林', value: 'jungle' }, { label: '针叶林', value: 'taiga' },
    { label: '雪原', value: 'ice' }, { label: '沼泽', value: 'swamp' },
    { label: '海洋', value: 'ocean' }, { label: '河流', value: 'river' },
    { label: '海滩', value: 'beach' }, { label: '森林', value: 'forest' },
    { label: '山地', value: 'mountain' }, { label: '下界', value: 'nether' },
    { label: '末地', value: 'the_end' },
  ]},

  // --- 高度限制 ---
  { key: 'heightLimitEnable', label: '启用高度限制', type: 'boolean', defaultValue: false, section: '高度限制' },
  { key: 'heightMin', label: '最小高度', type: 'number', defaultValue: 0, min: -64, max: 320, step: 1, section: '高度限制', showWhen: { field: 'heightLimitEnable', value: true } },
  { key: 'heightMax', label: '最大高度', type: 'number', defaultValue: 64, min: -64, max: 320, step: 1, section: '高度限制', showWhen: { field: 'heightLimitEnable', value: true } },

  // --- 间距限制 ---
  { key: 'spacingEnable', label: '启用间距限制', type: 'boolean', defaultValue: false, section: '间距限制' },
  { key: 'spacingMin', label: '最小间距', type: 'number', defaultValue: 16, min: 1, max: 256, step: 1, section: '间距限制', showWhen: { field: 'spacingEnable', value: true } },
  { key: 'spacingMax', label: '最大间距', type: 'number', defaultValue: 64, min: 1, max: 512, step: 1, section: '间距限制', showWhen: { field: 'spacingEnable', value: true } },
];

// ===== 生成规则模块定义 =====

export const spawnRuleModule: ModuleDefinition = {
  id: 'spawn_rule',
  name: '生成规则',
  icon: '🥚',
  category: 'custom_environment',
  templateFile: 'templates/projectile.json',
  iconDir: 'spawn_rule',
  jsonRootKey: 'minecraft:spawn_rules',
  generatorType: 'spawn_rule',
  fields: spawnRuleFields,
  subTypes: [
    { id: 'custom_spawn', name: '自定义生成', templateFile: 'templates/projectile.json' },
    { id: 'entity_spawn', name: '实体生成', templateFile: 'templates/projectile.json' },
  ],
};
