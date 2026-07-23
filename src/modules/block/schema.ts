import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 方块模块字段定义 =====
// 基于 block_1_20.json 模板 + 各子类型模板

export const blockFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '方块名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '方块ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'icon', label: '纹理', type: 'icon', defaultValue: 'my_block', section: '基础信息', iconDir: 'block' },
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'construction', section: '基础信息', jsonPath: 'description.menu_category.category', options: [
    { label: '建造', value: 'construction' }, { label: '自然', value: 'nature' },
    { label: '装备', value: 'equipment' }, { label: '物品', value: 'items' }, { label: '无', value: 'none' },
  ]},

  // --- 物理属性 ---
  { key: 'friction', label: '摩擦系数', type: 'number', defaultValue: 0.4, min: 0, max: 1, step: 0.01, section: '物理属性', jsonPath: 'components.minecraft:friction', hint: '玩家行走时的摩擦力，冰为0.02，石头为0.4' },
  { key: 'lightEmission', label: '发光强度', type: 'number', defaultValue: 0, min: 0, max: 15, step: 1, section: '物理属性', jsonPath: 'components.minecraft:light_emission' },
  { key: 'lightDampening', label: '透光衰减', type: 'number', defaultValue: 15, min: 0, max: 15, step: 1, section: '物理属性', jsonPath: 'components.minecraft:light_dampening', hint: '阻挡光线程度，0=完全透光，15=完全不透光' },
  { key: 'mapColor', label: '地图颜色', type: 'color', defaultValue: '#ffffff', section: '物理属性', jsonPath: 'components.minecraft:map_color' },
  { key: 'restUnder', label: '需要下方支撑', type: 'boolean', defaultValue: false, section: '物理属性', hint: '下方方块被破坏时此方块也会掉落' },

  // --- 破坏属性 ---
  { key: 'destructibleByMining', label: '可挖掘', type: 'boolean', defaultValue: true, section: '破坏属性' },
  { key: 'secondsToDestroy', label: '挖掘时间(秒)', type: 'number', defaultValue: 3, min: 0, max: 999, step: 0.1, section: '破坏属性', showWhen: { field: 'destructibleByMining', value: true }, jsonPath: 'components.minecraft:destructible_by_mining.seconds_to_destroy' },
  { key: 'destructibleByExplosion', label: '可被爆炸破坏', type: 'boolean', defaultValue: true, section: '破坏属性' },
  { key: 'explosionResistance', label: '爆炸抗性', type: 'number', defaultValue: 3, min: 0, max: 999, step: 0.1, section: '破坏属性', showWhen: { field: 'destructibleByExplosion', value: true }, jsonPath: 'components.minecraft:destructible_by_explosion.explosion_resistance' },

  // --- 碰撞和选择框 ---
  { key: 'customCollision', label: '自定义碰撞箱', type: 'boolean', defaultValue: false, section: '碰撞箱' },
  { key: 'collisionOriginX', label: '碰撞原点X', type: 'number', defaultValue: -8, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'collisionOriginY', label: '碰撞原点Y', type: 'number', defaultValue: 0, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'collisionOriginZ', label: '碰撞原点Z', type: 'number', defaultValue: -8, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'collisionSizeX', label: '碰撞尺寸X', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'collisionSizeY', label: '碰撞尺寸Y', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'collisionSizeZ', label: '碰撞尺寸Z', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customCollision', value: true } },
  { key: 'customSelection', label: '自定义选择框', type: 'boolean', defaultValue: false, section: '碰撞箱' },
  { key: 'selectionOriginX', label: '选择原点X', type: 'number', defaultValue: -8, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },
  { key: 'selectionOriginY', label: '选择原点Y', type: 'number', defaultValue: 0, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },
  { key: 'selectionOriginZ', label: '选择原点Z', type: 'number', defaultValue: -8, min: -16, max: 16, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },
  { key: 'selectionSizeX', label: '选择尺寸X', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },
  { key: 'selectionSizeY', label: '选择尺寸Y', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },
  { key: 'selectionSizeZ', label: '选择尺寸Z', type: 'number', defaultValue: 16, min: 0, max: 32, step: 1, section: '碰撞箱', showWhen: { field: 'customSelection', value: true } },

  // --- 燃烧属性 ---
  { key: 'flammable', label: '可燃', type: 'boolean', defaultValue: false, section: '燃烧属性' },
  { key: 'catchChance', label: '着火概率修正', type: 'number', defaultValue: 5, min: 0, max: 100, step: 1, section: '燃烧属性', showWhen: { field: 'flammable', value: true } },
  { key: 'destroyChance', label: '烧毁概率修正', type: 'number', defaultValue: 20, min: 0, max: 100, step: 1, section: '燃烧属性', showWhen: { field: 'flammable', value: true } },

  // --- 掉落物 ---
  { key: 'lootEnable', label: '自定义掉落', type: 'boolean', defaultValue: false, section: '掉落物' },
  { key: 'lootItem', label: '掉落物品ID', type: 'text', defaultValue: 'minecraft:diamond', section: '掉落物', showWhen: { field: 'lootEnable', value: true } },
  { key: 'lootCount', label: '掉落数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物', showWhen: { field: 'lootEnable', value: true } },

  // --- 渲染属性 ---
  { key: 'renderMethod', label: '渲染方法', type: 'select', defaultValue: 'opaque', section: '渲染属性', options: [
    { label: '不透明', value: 'opaque' }, { label: 'Alpha测试', value: 'alpha_test' },
    { label: 'Alpha混合', value: 'blend' }, { label: '连续', value: 'contiguous' },
  ]},
  { key: 'geometry', label: '几何模型', type: 'select', defaultValue: 'default', section: '渲染属性', options: [
    { label: '默认方块', value: 'default' }, { label: '自定义', value: 'custom' },
  ]},
  { key: 'customGeometry', label: '自定义几何ID', type: 'text', defaultValue: 'geometry.custom_block', section: '渲染属性', showWhen: { field: 'geometry', value: 'custom' } },

  // --- 高级属性 ---
  { key: 'tags', label: '方块标签', type: 'text', defaultValue: '', section: '高级属性', hint: '多个标签用逗号分隔' },
  { key: 'waterlogged', label: '含水', type: 'boolean', defaultValue: false, section: '高级属性', hint: '方块可以包含水' },
  { key: 'breathable', label: '可呼吸', type: 'boolean', defaultValue: false, section: '高级属性' },
  { key: 'redstoneConductor', label: '红石导体', type: 'boolean', defaultValue: true, section: '高级属性' },

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

// ===== 方块模块定义 =====

export const blockModule: ModuleDefinition = {
  id: 'block',
  name: '方块',
  icon: '🧱',
  category: 'custom_items',
  templateFile: 'templates/block_1_20.json',
  iconDir: 'block',
  jsonRootKey: 'minecraft:block',
  generatorType: 'block',
  fields: blockFields,
  subTypes: [
    { id: 'normal', name: '普通方块', templateFile: 'templates/block_1_20.json' },
    { id: 'stair', name: '台阶', templateFile: 'templates/block_stair_1_20.json' },
    { id: 'slab', name: '半砖', templateFile: 'templates/block_slab_1_20.json' },
    { id: 'fence', name: '栅栏', templateFile: 'templates/block_fence_1_20.json' },
    { id: 'wall', name: '墙', templateFile: 'templates/block_wall_1_20.json' },
    { id: 'door', name: '门', templateFile: 'templates/block_door_1_20.json' },
    { id: 'trapdoor', name: '活板门', templateFile: 'templates/block_trapdoor_1_20.json' },
    { id: 'fence_gate', name: '栅栏门', templateFile: 'templates/block_fence_gate_1_20.json' },
    { id: 'crop', name: '农作物', templateFile: 'templates/block_crop_1_20.json' },
    { id: 'sapling', name: '树苗', templateFile: 'templates/block_sapling_1_20.json' },
    { id: 'layer', name: '分层方块', templateFile: 'templates/block_layer.json' },
    { id: 'transparent', name: '透明方块', templateFile: 'templates/block_transparent_1_20.json' },
    { id: 'fluid', name: '液体方块', templateFile: 'templates/block_fluid_1_20.json' },
    { id: 'model', name: '自定义模型', templateFile: 'templates/block_model_1_20.json' },
  ],
};
