import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 弹射物模块字段定义 =====
// 基于 MAM 弹射物模板（13个预设：arrow/snowball/fireball/ender_pearl/egg/small_fireball/wither_skull/trident/lightning_bolt/tnt/custom_arrow/custom_snowball/custom_fireball）

export const projectileFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '弹射物名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '弹射物ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'projectilePreset', label: '预设类型', type: 'select', defaultValue: 'arrow', section: '基础信息', options: [
    { label: '箭矢', value: 'arrow' }, { label: '雪球', value: 'snowball' },
    { label: '火球', value: 'fireball' }, { label: '末影珍珠', value: 'ender_pearl' },
    { label: '鸡蛋', value: 'egg' }, { label: '小火球', value: 'small_fireball' },
    { label: '凋灵之首', value: 'wither_skull' }, { label: '三叉戟', value: 'trident' },
    { label: '闪电', value: 'lightning_bolt' }, { label: 'TNT', value: 'tnt' },
    { label: '自定义箭矢', value: 'custom_arrow' }, { label: '自定义雪球', value: 'custom_snowball' },
    { label: '自定义火球', value: 'custom_fireball' },
  ]},
  { key: 'runtimeIdentifier', label: '运行时标识符', type: 'text', defaultValue: 'minecraft:arrow', section: '基础信息', hint: '原版弹射物标识符，用于继承行为' },

  // --- 物理属性 ---
  { key: 'power', label: '初始速度', type: 'number', defaultValue: 3.0, min: 0, max: 100, step: 0.1, section: '物理属性' },
  { key: 'gravity', label: '重力', type: 'number', defaultValue: 0.05, min: -1, max: 1, step: 0.01, section: '物理属性' },
  { key: 'uncertaintyBase', label: '基础偏差', type: 'number', defaultValue: 0, min: 0, max: 100, step: 0.01, section: '物理属性' },
  { key: 'uncertaintyMultiplier', label: '偏差乘数', type: 'number', defaultValue: 0, min: 0, max: 100, step: 0.01, section: '物理属性' },
  { key: 'anchor', label: '锚点', type: 'number', defaultValue: 0, min: 0, max: 10, step: 1, section: '物理属性' },
  { key: 'angleOffset', label: '角度偏移', type: 'number', defaultValue: 0, min: -360, max: 360, step: 0.1, section: '物理属性' },
  { key: 'shouldBounce', label: '是否反弹', type: 'boolean', defaultValue: false, section: '物理属性' },
  { key: 'multipleTargets', label: '穿透多目标', type: 'boolean', defaultValue: false, section: '物理属性' },
  { key: 'hitChance', label: '命中概率', type: 'number', defaultValue: 1.0, min: 0, max: 1, step: 0.01, section: '物理属性' },

  // --- 碰撞箱 ---
  { key: 'collisionWidth', label: '碰撞箱宽度', type: 'number', defaultValue: 0.25, min: 0, max: 10, step: 0.01, section: '碰撞箱' },
  { key: 'collisionHeight', label: '碰撞箱高度', type: 'number', defaultValue: 0.25, min: 0, max: 10, step: 0.01, section: '碰撞箱' },

  // --- 命中效果 ---
  { key: 'impactDamageEnable', label: '撞击伤害', type: 'boolean', defaultValue: true, section: '命中效果' },
  { key: 'impactDamage', label: '伤害值', type: 'number', defaultValue: 5, min: 0, max: 1000, step: 1, section: '命中效果', showWhen: { field: 'impactDamageEnable', value: true } },
  { key: 'semiRandomDiffDamage', label: '半随机伤害', type: 'boolean', defaultValue: false, section: '命中效果', showWhen: { field: 'impactDamageEnable', value: true } },
  { key: 'knockback', label: '击退', type: 'boolean', defaultValue: true, section: '命中效果', showWhen: { field: 'impactDamageEnable', value: true } },
  { key: 'damageFilter', label: '伤害过滤', type: 'text', defaultValue: '', section: '命中效果', showWhen: { field: 'impactDamageEnable', value: true }, hint: '如 blaze 表示只对烈焰人造成伤害' },

  { key: 'catchFire', label: '点燃目标', type: 'boolean', defaultValue: false, section: '命中效果' },
  { key: 'removeOnHit', label: '命中后移除', type: 'boolean', defaultValue: true, section: '命中效果' },
  { key: 'stickInGround', label: '插入地面', type: 'boolean', defaultValue: false, section: '命中效果' },

  // --- 命中粒子 ---
  { key: 'particleOnHitEnable', label: '命中粒子效果', type: 'boolean', defaultValue: true, section: '命中粒子' },
  { key: 'particleType', label: '粒子类型', type: 'text', defaultValue: 'ironcrack_iron', section: '命中粒子', showWhen: { field: 'particleOnHitEnable', value: true } },
  { key: 'numParticles', label: '粒子数量', type: 'number', defaultValue: 6, min: 0, max: 1000, step: 1, section: '命中粒子', showWhen: { field: 'particleOnHitEnable', value: true } },
  { key: 'onEntityHit', label: '实体命中时', type: 'boolean', defaultValue: true, section: '命中粒子', showWhen: { field: 'particleOnHitEnable', value: true } },
  { key: 'onOtherHit', label: '其他命中时', type: 'boolean', defaultValue: true, section: '命中粒子', showWhen: { field: 'particleOnHitEnable', value: true } },

  // --- 命中声音 ---
  { key: 'hitSound', label: '命中声音', type: 'text', defaultValue: 'bow.hit', section: '命中声音' },

  // --- 爆炸效果 ---
  { key: 'explodeEnable', label: '爆炸效果', type: 'boolean', defaultValue: false, section: '爆炸效果' },
  { key: 'explodePower', label: '爆炸威力', type: 'number', defaultValue: 3, min: 0, max: 100, step: 0.1, section: '爆炸效果', showWhen: { field: 'explodeEnable', value: true } },
  { key: 'explodeFire', label: '引发火灾', type: 'boolean', defaultValue: false, section: '爆炸效果', showWhen: { field: 'explodeEnable', value: true } },
  { key: 'explodeBreaksBlocks', label: '破坏方块', type: 'boolean', defaultValue: true, section: '爆炸效果', showWhen: { field: 'explodeEnable', value: true } },

  // --- 伴随粒子 ---
  { key: 'particleEffect', label: '伴随粒子', type: 'text', defaultValue: '', section: '伴随粒子', hint: '弹射物飞行时的粒子效果ID，如 pa:flame' },
];

// ===== 弹射物模块定义 =====

export const projectileModule: ModuleDefinition = {
  id: 'projectile',
  name: '弹射物',
  icon: '🎯',
  category: 'custom_entities',
  templateFile: 'templates/projectile.json',
  iconDir: 'projectile',
  jsonRootKey: 'minecraft:entity',
  generatorType: 'projectile',
  fields: projectileFields,
  subTypes: [
    { id: 'arrow', name: '箭矢', templateFile: 'templates/projectile.json' },
    { id: 'snowball', name: '雪球', templateFile: 'templates/projectile.json' },
    { id: 'fireball', name: '火球', templateFile: 'templates/projectile.json' },
    { id: 'ender_pearl', name: '末影珍珠', templateFile: 'templates/projectile.json' },
    { id: 'egg', name: '鸡蛋', templateFile: 'templates/projectile.json' },
    { id: 'small_fireball', name: '小火球', templateFile: 'templates/projectile.json' },
    { id: 'wither_skull', name: '凋灵之首', templateFile: 'templates/projectile.json' },
    { id: 'trident', name: '三叉戟', templateFile: 'templates/projectile.json' },
    { id: 'lightning_bolt', name: '闪电', templateFile: 'templates/projectile.json' },
    { id: 'tnt', name: 'TNT', templateFile: 'templates/projectile.json' },
    { id: 'custom_arrow', name: '自定义箭矢', templateFile: 'templates/projectile.json' },
    { id: 'custom_snowball', name: '自定义雪球', templateFile: 'templates/projectile.json' },
    { id: 'custom_fireball', name: '自定义火球', templateFile: 'templates/projectile.json' },
  ],
};
