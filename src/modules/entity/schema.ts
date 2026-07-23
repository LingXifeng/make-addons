import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 实体模块字段定义 =====
// 基于 entities/*.json 模板 + 分析报告 §6.4

export const entityFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '实体名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '实体ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '纹理', type: 'icon', defaultValue: 'my_entity', section: '基础信息', iconDir: 'entity' },
  { key: 'isSummonable', label: '可召唤', type: 'boolean', defaultValue: true, section: '基础信息', jsonPath: 'description.is_summonable' },
  { key: 'isSpawnable', label: '可自然生成', type: 'boolean', defaultValue: true, section: '基础信息', jsonPath: 'description.is_spawnable' },
  { key: 'spawnCategory', label: '生成类别', type: 'select', defaultValue: 'creature', section: '基础信息', jsonPath: 'description.spawn_category', options: [
    { label: '生物', value: 'creature' }, { label: '怪物', value: 'monster' },
    { label: '环境', value: 'ambient' }, { label: '水生生物', value: 'water_creature' },
    { label: '无', value: 'none' },
  ]},

  // --- 生命属性 ---
  { key: 'health', label: '生命值', type: 'number', defaultValue: 20, min: 1, max: 9999, step: 1, section: '生命属性', jsonPath: 'components.minecraft:health.value' },
  { key: 'healthMax', label: '最大生命值', type: 'number', defaultValue: 20, min: 1, max: 9999, step: 1, section: '生命属性', jsonPath: 'components.minecraft:health.max' },
  { key: 'knockbackResistance', label: '击退抗性', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.05, section: '生命属性', jsonPath: 'components.minecraft:knockback_resistance' },
  { key: 'fireImmune', label: '免疫火焰', type: 'boolean', defaultValue: false, section: '生命属性', jsonPath: 'components.minecraft:fire_immune' },
  { key: 'damageImmuneEnable', label: '免疫伤害类型', type: 'boolean', defaultValue: false, section: '生命属性' },
  { key: 'damageImmuneTypes', label: '伤害类型', type: 'text', defaultValue: 'fire,lava', section: '生命属性', showWhen: { field: 'damageImmuneEnable', value: true }, hint: '逗号分隔' },

  // --- 移动属性 ---
  { key: 'movement', label: '移动速度', type: 'number', defaultValue: 0.25, min: 0, max: 10, step: 0.01, section: '移动属性', jsonPath: 'components.minecraft:movement.value' },
  { key: 'movementType', label: '移动类型', type: 'select', defaultValue: 'basic', section: '移动属性', options: [
    { label: '基础', value: 'basic' }, { label: '飞行', value: 'fly' }, { label: '游泳', value: 'swim' },
    { label: '攀爬', value: 'climb' }, { label: '滑行', value: 'generic' },
  ]},
  { key: 'canFly', label: '可以飞行', type: 'boolean', defaultValue: false, section: '移动属性' },
  { key: 'canSwim', label: '可以游泳', type: 'boolean', defaultValue: true, section: '移动属性' },
  { key: 'canClimb', label: '可以攀爬', type: 'boolean', defaultValue: false, section: '移动属性' },
  { key: 'canWalk', label: '可以行走', type: 'boolean', defaultValue: true, section: '移动属性' },
  { key: 'hasGravity', label: '受重力影响', type: 'boolean', defaultValue: true, section: '移动属性' },
  { key: 'navigationType', label: '导航类型', type: 'select', defaultValue: 'walk', section: '移动属性', options: [
    { label: '行走', value: 'walk' }, { label: '飞行', value: 'fly' }, { label: '游泳', value: 'swim' },
    { label: '攀爬', value: 'climb' }, { label: '通用', value: 'generic' },
  ]},

  // --- 碰撞和尺寸 ---
  { key: 'collisionWidth', label: '碰撞箱宽度', type: 'number', defaultValue: 0.6, min: 0, max: 10, step: 0.1, section: '碰撞箱' },
  { key: 'collisionHeight', label: '碰撞箱高度', type: 'number', defaultValue: 1.8, min: 0, max: 10, step: 0.1, section: '碰撞箱' },
  { key: 'scale', label: '缩放比例', type: 'number', defaultValue: 1, min: 0.1, max: 10, step: 0.1, section: '碰撞箱' },
  { key: 'pushThrough', label: '可推过', type: 'boolean', defaultValue: false, section: '碰撞箱' },
  { key: 'isPersistent', label: '持久存在', type: 'boolean', defaultValue: false, section: '碰撞箱' },

  // --- 战斗属性 ---
  { key: 'attackDamage', label: '攻击伤害', type: 'number', defaultValue: 3, min: 0, max: 999, step: 1, section: '战斗属性', jsonPath: 'components.minecraft:attack.damage' },
  { key: 'attackEnable', label: '启用攻击', type: 'boolean', defaultValue: true, section: '战斗属性' },
  { key: 'isBreedable', label: '可繁殖', type: 'boolean', defaultValue: false, section: '战斗属性' },
  { key: 'isTameable', label: '可驯服', type: 'boolean', defaultValue: false, section: '战斗属性' },
  { key: 'family', label: '实体族群', type: 'text', defaultValue: 'mob', section: '战斗属性', hint: '逗号分隔，如 mob,monster' },

  // --- 视觉属性 ---
  { key: 'spawnEggBaseColor', label: '生成蛋基色', type: 'color', defaultValue: '#ffffff', section: '视觉属性' },
  { key: 'spawnEggOverlayColor', label: '生成蛋斑点色', type: 'color', defaultValue: '#000000', section: '视觉属性' },
  { key: 'geometry', label: '几何模型ID', type: 'text', defaultValue: 'geometry.default', section: '视觉属性' },
  { key: 'texture', label: '纹理路径', type: 'text', defaultValue: 'textures/entity/custom', section: '视觉属性' },
  { key: 'renderController', label: '渲染控制器', type: 'select', defaultValue: 'controller.render.default', section: '视觉属性', options: [
    { label: '默认', value: 'controller.render.default' }, { label: '玩家', value: 'controller.render.player' },
    { label: '半透明', value: 'controller.render.translucence' }, { label: '潜影贝', value: 'controller.render.shulker' },
  ]},

  // --- AI行为 ---
  { key: 'aiEnable', label: '启用AI行为', type: 'boolean', defaultValue: true, section: 'AI行为' },
  { key: 'behaviorType', label: '行为模式', type: 'select', defaultValue: 'passive', section: 'AI行为', showWhen: { field: 'aiEnable', value: true }, options: [
    { label: '被动', value: 'passive' }, { label: '中立', value: 'neutral' }, { label: '敌对', value: 'hostile' },
  ]},
  { key: 'lookAtPlayer', label: '看向玩家', type: 'boolean', defaultValue: true, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },
  { key: 'randomLookAround', label: '随机张望', type: 'boolean', defaultValue: true, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },
  { key: 'randomStroll', label: '随机漫步', type: 'boolean', defaultValue: true, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },
  { key: 'avoidSun', label: '躲避阳光', type: 'boolean', defaultValue: false, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },
  { key: 'avoidWater', label: '躲避水', type: 'boolean', defaultValue: false, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },
  { key: 'floatInWater', label: '水中漂浮', type: 'boolean', defaultValue: true, section: 'AI行为', showWhen: { field: 'aiEnable', value: true } },

  // --- 掉落物 ---
  { key: 'lootEnable', label: '自定义掉落', type: 'boolean', defaultValue: false, section: '掉落物' },
  { key: 'lootItem', label: '掉落物品ID', type: 'text', defaultValue: 'minecraft:rotten_flesh', section: '掉落物', showWhen: { field: 'lootEnable', value: true } },
  { key: 'lootCount', label: '掉落数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物', showWhen: { field: 'lootEnable', value: true } },
  { key: 'lootChance', label: '掉落概率', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.05, section: '掉落物', showWhen: { field: 'lootEnable', value: true } },
];

// ===== 实体模块定义 =====

export const entityModule: ModuleDefinition = {
  id: 'entity',
  name: '实体',
  icon: '🐾',
  category: 'custom_entities',
  templateFile: 'templates/normal_1_20.json',
  iconDir: 'entity',
  jsonRootKey: 'minecraft:entity',
  generatorType: 'entity',
  fields: entityFields,
  subTypes: [
    { id: 'passive', name: '被动生物', templateFile: 'templates/normal_1_20.json' },
    { id: 'hostile', name: '敌对生物', templateFile: 'templates/normal_1_20.json' },
    { id: 'projectile', name: '投射物', templateFile: 'templates/projectile.json' },
  ],
};
