import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 武器模块字段定义 (25个属性) =====

export const weaponFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '自定义名称', type: 'text', defaultValue: '', section: '基础信息', hint: '物品在游戏内显示的名称，留空则使用ID' },
  { key: 'identifier', label: '物品ID', type: 'text', defaultValue: 'change_me', section: '基础信息', hint: '小写字母、数字和下划线' },
  { key: 'icon', label: '图标/纹理', type: 'icon', defaultValue: 'my_sword', section: '基础信息', iconDir: 'weapon' },

  // --- 战斗属性 ---
  { key: 'damage', label: '攻击伤害', type: 'number', defaultValue: 250, min: 0, max: 1000, step: 1, section: '战斗属性', jsonPath: 'components.minecraft:damage' },
  { key: 'durability', label: '耐久度', type: 'number', defaultValue: 600, min: 1, max: 10000, step: 1, section: '战斗属性', jsonPath: 'components.minecraft:durability.max_durability' },
  { key: 'enchantableEnable', label: '启用附魔', type: 'boolean', defaultValue: true, section: '战斗属性' },
  { key: 'enchantable', label: '附魔值', type: 'number', defaultValue: 10, min: 0, max: 100, step: 1, section: '战斗属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.value' },
  { key: 'enchantableSlot', label: '附魔槽位', type: 'select', defaultValue: 'all', section: '战斗属性', showWhen: { field: 'enchantableEnable', value: true }, jsonPath: 'components.minecraft:enchantable.slot', options: [
    { label: '全部', value: 'all' },
    { label: '剑', value: 'sword' },
    { label: '弓', value: 'bow' },
    { label: '弩', value: 'crossbow' },
    { label: '盾牌', value: 'shield' },
    { label: '头盔', value: 'armor_head' },
    { label: '胸甲', value: 'armor_torso' },
    { label: '护腿', value: 'armor_legs' },
    { label: '靴子', value: 'armor_feet' },
    { label: '书', value: 'book' },
    { label: '钓鱼竿', value: 'fishing' },
    { label: '装饰', value: 'cosmetic' },
  ]},
  { key: 'glint', label: '附魔光效', type: 'boolean', defaultValue: false, section: '战斗属性', jsonPath: 'components.minecraft:glint' },
  { key: 'handEquipped', label: '手持装备', type: 'boolean', defaultValue: true, section: '战斗属性', jsonPath: 'components.minecraft:hand_equipped', hint: 'true时像工具一样在手中显示3D模型' },
  { key: 'lootingEnchantEnable', label: '掠夺附魔', type: 'boolean', defaultValue: false, section: '战斗属性', hint: '启用后击杀生物时额外掉落（需脚本支持）' },

  // --- 物品栏属性 ---
  { key: 'maxStackSize', label: '最大堆叠数', type: 'number', defaultValue: 1, min: 1, max: 64, step: 1, section: '物品栏属性', jsonPath: 'components.minecraft:max_stack_size' },
  { key: 'stackedByData', label: '按数据堆叠', type: 'boolean', defaultValue: true, section: '物品栏属性', jsonPath: 'components.minecraft:stacked_by_data' },
  { key: 'miningSpeed', label: '挖掘速度', type: 'number', defaultValue: 1, min: 1, max: 100, step: 0.1, section: '物品栏属性', jsonPath: 'components.minecraft:mining_speed' },
  { key: 'renderOffsets', label: '渲染偏移', type: 'select', defaultValue: 'tools', section: '物品栏属性', jsonPath: 'components.minecraft:render_offsets', options: [
    { label: '工具', value: 'tools' },
    { label: 'GUI', value: 'gui' },
    { label: '无', value: 'none' },
  ]},
  { key: 'itemGroup', label: '物品栏分组', type: 'select', defaultValue: 'minecraft:itemGroup.name.sword', section: '物品栏属性', jsonPath: 'description.menu_category.group', options: [
    { label: '剑', value: 'minecraft:itemGroup.name.sword' },
    { label: '斧', value: 'minecraft:itemGroup.name.axe' },
    { label: '镐', value: 'minecraft:itemGroup.name.pickaxe' },
    { label: '锹', value: 'minecraft:itemGroup.name.shovel' },
    { label: '锄', value: 'minecraft:itemGroup.name.hoe' },
    { label: '弓', value: 'minecraft:itemGroup.name.bow' },
    { label: '弩', value: 'minecraft:itemGroup.name.crossbow' },
    { label: '盾牌', value: 'minecraft:itemGroup.name.shield' },
    { label: '箭', value: 'minecraft:itemGroup.name.arrow' },
    { label: '药水', value: 'minecraft:itemGroup.name.potion' },
    { label: '无分组', value: '' },
  ]},
  { key: 'menuCategory', label: '创造模式分类', type: 'select', defaultValue: 'equipment', section: '物品栏属性', jsonPath: 'description.menu_category.category', options: [
    { label: '装备', value: 'equipment' },
    { label: '物品', value: 'items' },
    { label: '建造', value: 'construction' },
    { label: '自然', value: 'nature' },
    { label: '无', value: 'none' },
  ]},
  { key: 'tags', label: '物品标签', type: 'text', defaultValue: '', section: '物品栏属性', hint: '多个标签用逗号分隔，如 pa:custom,pa:weapon' },

  // --- 交互属性 ---
  { key: 'repairableEnable', label: '启用可修复', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'repairableItems', label: '修复材料', type: 'repairItems', defaultValue: [], section: '交互属性', showWhen: { field: 'repairableEnable', value: true } },
  { key: 'useAnimation', label: '使用动画', type: 'select', defaultValue: '', section: '交互属性', jsonPath: 'components.minecraft:use_animation', options: [
    { label: '无', value: '' },
    { label: '弓', value: 'bow' },
    { label: '弩', value: 'crossbow' },
    { label: '饮用', value: 'drink' },
    { label: '格挡', value: 'block' },
    { label: '三叉戟', value: 'spear' },
    { label: '食用', value: 'eat' },
  ]},
  { key: 'cooldownEnable', label: '启用冷却', type: 'boolean', defaultValue: false, section: '交互属性' },
  { key: 'cooldown', label: '冷却时间(秒)', type: 'number', defaultValue: 1, min: 0, max: 100, step: 0.1, section: '交互属性', showWhen: { field: 'cooldownEnable', value: true } },
  { key: 'cooldownType', label: '冷却类型', type: 'select', defaultValue: 'attack', section: '交互属性', showWhen: { field: 'cooldownEnable', value: true }, options: [
    { label: '攻击', value: 'attack' },
    { label: '使用', value: 'use' },
  ]},
  { key: 'allowOffHand', label: '允许副手', type: 'boolean', defaultValue: false, section: '交互属性', jsonPath: 'components.minecraft:allow_off_hand' },

  // 燃料
  { key: 'fuelEnable', label: '燃料', type: 'boolean', defaultValue: false, section: '交互属性', hint: '物品可作为熔炉燃料使用' },
  { key: 'fuelDuration', label: '燃烧时间(秒)', type: 'number', defaultValue: 10, min: 0, max: 9999, step: 1, section: '交互属性', showWhen: { field: 'fuelEnable', value: true }, hint: '物品在熔炉中燃烧的秒数' },

  // 可投掷
  { key: 'throwableEnable', label: '可投掷', type: 'boolean', defaultValue: false, section: '交互属性', hint: '物品可以像三叉戟一样投掷' },
  { key: 'throwPower', label: '投掷力度', type: 'number', defaultValue: 1.5, min: 0.1, max: 10, step: 0.1, section: '交互属性', showWhen: { field: 'throwableEnable', value: true }, hint: '投掷时的初始速度' },

  // --- 方块交互 ---
  { key: 'canDestroy', label: '可破坏方块', type: 'blockList', defaultValue: [], section: '方块交互' },
  { key: 'canDestroyInCreative', label: '创造模式可破坏', type: 'boolean', defaultValue: false, section: '方块交互', showWhen: { field: 'canDestroy', value: 'nonempty' } },

  // 使用方块限制 (minecraft:use_on)
  { key: 'useOnBlocks', label: '使用方块限制', type: 'blockList', defaultValue: [], section: '方块交互', hint: '物品只能在这些方块上使用（留空则无限制）' },

  // 挖掘工具 (minecraft:digger)
  { key: 'diggerEnable', label: '挖掘工具', type: 'boolean', defaultValue: false, section: '方块交互', hint: '自定义对不同方块的挖掘速度' },
  { key: 'diggerBlocks', label: '挖掘方块列表', type: 'repairItems', defaultValue: [], section: '方块交互', showWhen: { field: 'diggerEnable', value: true }, hint: '每项为方块ID和挖掘速度' },

  // --- 高级属性 ---

  // 药水效果
  { key: 'potionEffectsEnable', label: '药水效果', type: 'boolean', defaultValue: false, section: '高级属性', hint: '使用物品时给予药水效果' },
  { key: 'potionEffects', label: '效果列表', type: 'potionEffects', defaultValue: [], section: '高级属性', showWhen: { field: 'potionEffectsEnable', value: true } },

  // 使用行为 (on_use 事件)
  { key: 'onUseEnable', label: '使用行为', type: 'boolean', defaultValue: false, section: '高级属性', hint: '物品使用时触发事件' },
  { key: 'onUseEvent', label: '使用事件名称', type: 'text', defaultValue: 'on_use_event', section: '高级属性', showWhen: { field: 'onUseEnable', value: true } },

  // 使用函数
  { key: 'onUseFunc', label: '使用函数', type: 'text', defaultValue: '', section: '高级属性', hint: '物品使用时调用的函数路径，如 scripts/my_func' },

  // 方块放置器
  { key: 'blockPlacerEnable', label: '方块放置器', type: 'boolean', defaultValue: false, section: '高级属性', hint: '使用物品时放置方块' },
  { key: 'blockPlacerBlock', label: '放置的方块', type: 'text', defaultValue: 'minecraft:stone', section: '高级属性', showWhen: { field: 'blockPlacerEnable', value: true } },

  // 实体放置器
  { key: 'entityPlacerEnable', label: '实体放置器', type: 'boolean', defaultValue: false, section: '高级属性', hint: '使用物品时生成实体' },
  { key: 'entityPlacerEntity', label: '生成的实体', type: 'text', defaultValue: 'minecraft:zombie', section: '高级属性', showWhen: { field: 'entityPlacerEnable', value: true } },

  // 武器命中事件
  { key: 'weaponHitEventEnable', label: '武器命中事件', type: 'boolean', defaultValue: false, section: '高级属性', hint: '攻击实体/方块时触发事件' },
  { key: 'onHurtEntityEvent', label: '命中实体事件', type: 'text', defaultValue: 'on_hurt_entity_event', section: '高级属性', showWhen: { field: 'weaponHitEventEnable', value: true } },
  { key: 'onNotHurtEntityEvent', label: '未命中事件', type: 'text', defaultValue: 'on_not_hurt_entity_event', section: '高级属性', showWhen: { field: 'weaponHitEventEnable', value: true } },
  { key: 'onHitBlockEvent', label: '命中方块事件', type: 'text', defaultValue: 'on_hit_block_event', section: '高级属性', showWhen: { field: 'weaponHitEventEnable', value: true } },

  // 使用修饰符
  { key: 'useModifiersEnable', label: '使用修饰符', type: 'boolean', defaultValue: false, section: '高级属性', hint: '控制使用时间和移动速度' },
  { key: 'useDuration', label: '使用持续时间', type: 'number', defaultValue: 9999, min: 0, max: 99999, step: 0.1, section: '高级属性', showWhen: { field: 'useModifiersEnable', value: true }, hint: '物品使用的持续时间（秒）' },
  { key: 'movementModifier', label: '移动速度修饰符', type: 'number', defaultValue: 0.4, min: 0, max: 1, step: 0.1, section: '高级属性', showWhen: { field: 'useModifiersEnable', value: true }, hint: '使用时移动速度倍率（0=无法移动，1=正常速度）' },

  // 射击者 (弓/弩射击)
  { key: 'shooterEnable', label: '射击者', type: 'boolean', defaultValue: false, section: '高级属性', hint: '启用射击机制（弓/弩）' },
  { key: 'shooterAmmunition', label: '弹药类型', type: 'text', defaultValue: 'minecraft:arrow', section: '高级属性', showWhen: { field: 'shooterEnable', value: true } },
  { key: 'shooterMaxDrawDuration', label: '最大拉弓时间', type: 'number', defaultValue: 1.5, min: 0.1, max: 10, step: 0.1, section: '高级属性', showWhen: { field: 'shooterEnable', value: true } },
  { key: 'shooterScalePower', label: '按拉弓时间缩放威力', type: 'boolean', defaultValue: true, section: '高级属性', showWhen: { field: 'shooterEnable', value: true } },

  // 耐火
  { key: 'fireResistant', label: '耐火', type: 'boolean', defaultValue: false, section: '高级属性', hint: '物品在火焰和岩浆中不会被销毁' },

  // 稀有度
  { key: 'rarity', label: '稀有度', type: 'select', defaultValue: '', section: '高级属性', options: [
    { label: '无', value: '' },
    { label: '普通', value: 'common' },
    { label: '少见', value: 'uncommon' },
    { label: '稀有', value: 'rare' },
    { label: '史诗', value: 'epic' },
  ]},

  // 穿透武器
  { key: 'piercingWeaponEnable', label: '穿透武器', type: 'boolean', defaultValue: false, section: '高级属性', hint: '攻击穿透盔甲造成伤害（需脚本支持）' },

  // 动能武器
  { key: 'kineticWeaponEnable', label: '动能武器', type: 'boolean', defaultValue: false, section: '高级属性', hint: '下落攻击增加伤害（需脚本支持）' },

  // 可穿戴 (minecraft:wearable)
  { key: 'wearableEnable', label: '可穿戴', type: 'boolean', defaultValue: false, section: '高级属性', hint: '物品可装备到指定槽位' },
  { key: 'wearableSlot', label: '穿戴槽位', type: 'select', defaultValue: 'slot.weapon.mainhand', section: '高级属性', showWhen: { field: 'wearableEnable', value: true }, options: [
    { label: '主手', value: 'slot.weapon.mainhand' },
    { label: '副手', value: 'slot.weapon.offhand' },
    { label: '头盔', value: 'slot.armor.head' },
    { label: '胸甲', value: 'slot.armor.chest' },
    { label: '护腿', value: 'slot.armor.legs' },
    { label: '靴子', value: 'slot.armor.feet' },
  ]},

  // 可命名 (minecraft:nameable)
  { key: 'nameableEnable', label: '可命名', type: 'boolean', defaultValue: false, section: '高级属性', hint: '允许在铁砧上重命名物品' },
  { key: 'allowNameTagRenaming', label: '允许命名牌重命名', type: 'boolean', defaultValue: true, section: '高级属性', showWhen: { field: 'nameableEnable', value: true } },

  // 战利品 (minecraft:loot)
  { key: 'lootEnable', label: '战利品表', type: 'boolean', defaultValue: false, section: '高级属性', hint: '物品破坏时掉落战利品表内容' },
  { key: 'lootTablePath', label: '战利品表路径', type: 'text', defaultValue: 'loot_tables/custom/weapon', section: '高级属性', showWhen: { field: 'lootEnable', value: true }, hint: '如 loot_tables/custom/weapon' },

  // 伤害吸收 (MAM自定义)
  { key: 'damageAbsorptionEnable', label: '伤害吸收', type: 'boolean', defaultValue: false, section: '高级属性', hint: '吸收特定来源的伤害（需脚本支持）' },
  { key: 'absorbableCauses', label: '可吸收伤害来源', type: 'text', defaultValue: 'entity.player,entity.mob', section: '高级属性', showWhen: { field: 'damageAbsorptionEnable', value: true }, hint: '逗号分隔的伤害来源，如 entity.player,entity.mob' },

  // 暴击粒子 (MAM自定义/Projectile)
  { key: 'critParticleOnHurt', label: '暴击粒子', type: 'boolean', defaultValue: false, section: '高级属性', hint: '暴击时显示粒子效果（需脚本支持）' },

  // 命中销毁 (MAM自定义/Projectile)
  { key: 'destroyOnHit', label: '命中销毁', type: 'boolean', defaultValue: false, section: '高级属性', hint: '投掷物命中后立即销毁（需脚本支持）' },

  // 反弹伤害 (MAM自定义/Projectile)
  { key: 'reflectOnHurt', label: '反弹伤害', type: 'boolean', defaultValue: false, section: '高级属性', hint: '受到攻击时反弹伤害给攻击者（需脚本支持）' },

  // 半随机差异伤害 (MAM自定义/Projectile)
  { key: 'semiRandomDiffDamage', label: '半随机差异伤害', type: 'boolean', defaultValue: false, section: '高级属性', hint: '伤害值在基础值附近半随机波动（需脚本支持）' },
];

// ===== 武器模块定义 =====

export const weaponModule: ModuleDefinition = {
  id: 'weapon',
  name: '武器',
  icon: '⚔️',
  templateFile: 'templates/weapon_1_20.json',
  iconDir: 'weapon',
  fields: weaponFields,
  generatorType: 'weapon',
  subTypes: [
    { id: 'sword', name: '剑', templateFile: 'templates/weapon_1_20.json' },
    { id: 'bow', name: '弓', templateFile: 'templates/custom_bow.json' },
    { id: 'crossbow', name: '弩', templateFile: 'templates/custom_crossbow.json' },
    { id: 'shield', name: '盾牌', templateFile: 'templates/shield_1_20.json' },
    { id: 'arrow', name: '箭', templateFile: 'templates/custom_arrow.json' },
    { id: 'mace', name: '锤', templateFile: 'templates/custom_mace.json' },
  ],
};
