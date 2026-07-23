import type { ModuleDefinition, ProjectItem, FieldSchema } from './types';

// ===== JSON 生成器 =====
// 根据 schema + 用户数据生成 Minecraft 附加包 JSON

// 从字段 schema 创建默认表单数据
export function createDefaultFormData(fields: FieldSchema[]): Record<string, any> {
  const data: Record<string, any> = {};
  for (const field of fields) {
    if (field.type === 'section') continue;
    data[field.key] = field.defaultValue;
  }
  return data;
}

// 设置嵌套对象路径上的值
function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// 检查条件是否满足
export function shouldShowField(field: FieldSchema, data: Record<string, any>): boolean {
  if (!field.showWhen) return true;
  return data[field.showWhen.field] === field.showWhen.value;
}

// 内部别名
function checkCondition(field: FieldSchema, data: Record<string, any>): boolean {
  return shouldShowField(field, data);
}

// ===== 物品生成器 (weapon/armor/food/shield) =====
function generateItem(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa'; // namespace
  const identifier = `${ns}:${data.identifier || 'change_me'}`;

  const result: Record<string, any> = {
    format_version: '1.21.100',
    'minecraft:item': {
      description: {
        identifier,
        menu_category: {
          category: data.menuCategory || 'none',
        },
      },
      components: {} as Record<string, any>,
    },
  };

  const components = result['minecraft:item'].components;

  // 设置物品栏分组
  if (data.itemGroup && data.itemGroup !== '') {
    result['minecraft:item'].description.menu_category.group = data.itemGroup;
  }

  // 遍历字段设置值
  for (const field of module.fields) {
    if (!checkCondition(field, data)) continue;
    if (field.type === 'section' || field.type === 'icon') continue;

    const value = data[field.key];
    if (value === undefined || value === null || value === '') continue;

    // 特殊字段处理
    if (field.key === 'identifier' || field.key === 'displayName' || field.key === 'menuCategory' || field.key === 'itemGroup') continue;

    // 使用 jsonPath 直接设置
    if (field.jsonPath) {
      const fullPath = `minecraft:item.${field.jsonPath}`;
      setNestedValue(result, fullPath, value);
    }
  }

  // --- 特殊组件处理 ---

  // 物品图标（贴图引用）— 用 identifier 作为贴图短名
  const itemId = data.identifier || 'change_me';
  components['minecraft:icon'] = itemId;

  // 附魔
  if (data.enchantableEnable && data.enchantable !== undefined) {
    components['minecraft:enchantable'] = {
      value: data.enchantable,
      slot: data.enchantableSlot || 'all',
    };
  }

  // 可修复
  if (data.repairableEnable && data.repairableItems?.length > 0) {
    components['minecraft:repairable'] = {
      repair_items: data.repairableItems.map((id: string) => ({ items: [id] })),
    };
  }

  // 冷却
  if (data.cooldownEnable && data.cooldown !== undefined) {
    components['minecraft:cooldown'] = {
      category: data.cooldownType || 'attack',
      duration: data.cooldown,
    };
  }

  // 燃料
  if (data.fuelEnable && data.fuelDuration !== undefined) {
    components['minecraft:fuel'] = { duration: data.fuelDuration };
  }

  // 可投掷
  if (data.throwableEnable) {
    components['minecraft:throwable'] = {
      throw_power: data.throwPower || 1.5,
      do_swing_animation: true,
    };
  }

  // 可破坏方块
  if (data.canDestroy?.length > 0) {
    components['minecraft:digger'] = {
      use_efficiency: true,
      destroy_speeds: data.canDestroy.map((blockId: string) => ({
        block: blockId,
        speed: data.miningSpeed || 1,
      })),
    };
  }

  // 挖掘工具
  if (data.diggerEnable && data.diggerBlocks?.length > 0) {
    if (!components['minecraft:digger']) {
      components['minecraft:digger'] = { use_efficiency: data.useEfficiency !== false, destroy_speeds: [] };
    }
    const digSpeed = data.diggerSpeed || 6;
    for (const block of data.diggerBlocks) {
      components['minecraft:digger'].destroy_speeds.push({ block, speed: digSpeed });
    }
  }

  // 药水效果
  // 食物：通过 on_consume 事件在食用时触发
  // 装备/武器：通过 effect_manager.js 脚本持续生效，物品 JSON 中添加标记标签
  if (module.id === 'food' && data.potionEffectsEnable && data.potionEffects?.length > 0) {
    const effects: Record<string, any> = {};
    for (const eff of data.potionEffects) {
      effects[eff.effect] = {
        duration: eff.duration,
        amplifier: eff.amplifier || 0,
      };
    }
    components['minecraft:food'] = components['minecraft:food'] || {};
    components['minecraft:food'].on_consume = {
      using_item: { condition: 'query.is_first_item', trigger: 'on_consume' },
    };
    // 食物效果通过 events 设置
    result['minecraft:item'].events = result['minecraft:item'].events || {};
    result['minecraft:item'].events.on_consume = {
      run_command: { command: [] },
      apply_effects_to_self: effects,
    };
  }

  // 装备/武器药水效果：在物品 JSON 中添加标记标签
  if ((module.id === 'weapon' || module.id === 'armor') && data.potionEffectsEnable && data.potionEffects?.length > 0) {
    const existingTags = components['minecraft:tags']?.tags || [];
    components['minecraft:tags'] = { tags: [...existingTags, 'pa:has_continuous_effects'] };
  }

  // 火焰附加：打上标记标签，由脚本在攻击时点燃生物
  if ((module.id === 'weapon' || module.id === 'tool') && data.fireAspectEnable) {
    const existingTags = components['minecraft:tags']?.tags || [];
    components['minecraft:tags'] = { tags: [...existingTags, 'pa:fire_aspect'] };
  }

  // 使用函数
  if (data.useFunctionEnable && data.useFunctionValue) {
    components['minecraft:on_use'] = { trigger: data.useFunctionValue };
  }

  // 方块放置器
  if (data.blockPlacerEnable && data.blockPlacerBlock) {
    const bp: Record<string, any> = { block_reference: data.blockPlacerBlock };
    if (data.blockPlacerUseOn?.length > 0) {
      bp.use_on = data.blockPlacerUseOn;
    }
    components['minecraft:block_placer'] = bp;
    // 冷却 + 类型
    if (data.blockPlacerCooldown && data.blockPlacerCooldown > 0) {
      components['minecraft:cooldown'] = {
        category: data.blockPlacerType || 'use',
        duration: data.blockPlacerCooldown,
      };
    }
  }

  // 实体放置器
  if (data.entityPlacerEnable && data.entityPlacerEntity) {
    const ep: Record<string, any> = { entity: data.entityPlacerEntity };
    if (data.entityPlacerDispenseOn?.length > 0) {
      ep.dispense_on = data.entityPlacerDispenseOn;
    }
    if (data.entityPlacerUseOn?.length > 0) {
      ep.use_on = data.entityPlacerUseOn;
    }
    components['minecraft:entity_placer'] = ep;
  }

  // 武器命中
  if (data.weaponHitEnable) {
    const weapon: Record<string, any> = {};
    // 伤害实体时
    const hurtEntityResp: Record<string, any> = {};
    if (data.hitEntityRandomize) hurtEntityResp.randomize = true;
    if (data.hitEntityFunction) hurtEntityResp.function = data.hitEntityFunction;
    if (data.hitEntityTarget) hurtEntityResp.target = data.hitEntityTarget;
    if (Object.keys(hurtEntityResp).length > 0) {
      weapon.on_hurt_entity = hurtEntityResp;
    }
    // 击中方块时
    const hitBlockResp: Record<string, any> = {};
    if (data.hitBlockRandomize) hitBlockResp.randomize = true;
    if (data.hitBlockFunction) hitBlockResp.function = data.hitBlockFunction;
    if (data.hitBlockTarget) hitBlockResp.target = data.hitBlockTarget;
    if (Object.keys(hitBlockResp).length > 0) {
      weapon.on_hit_block = hitBlockResp;
    }
    if (Object.keys(weapon).length > 0) {
      components['minecraft:weapon'] = weapon;
    }
  }

  // 动能武器
  if (data.kineticWeaponEnable) {
    components['minecraft:kinetic_weapon'] = {
      delay: data.kineticDelay ?? 13,
      reach: { min: data.kineticReachMin ?? 2, max: data.kineticReachMax ?? 4.5 },
      creative_reach: { min: data.kineticCreativeReachMin ?? 2, max: data.kineticCreativeReachMax ?? 7.5 },
      hitbox_margin: data.kineticHitboxMargin ?? 0.25,
      damage_multiplier: data.kineticDamageMultiplier ?? 0.82,
      damage_conditions: {
        max_duration: data.kineticDamageMaxDuration ?? 250,
        min_relative_speed: data.kineticDamageMinRelSpeed ?? 4.6,
      },
      knockback_conditions: {
        max_duration: data.kineticKnockbackMaxDuration ?? 100,
        min_speed: data.kineticKnockbackMinSpeed ?? 5.1,
      },
      dismount_conditions: {
        max_duration: data.kineticDismountMaxDuration ?? 80,
        min_speed: data.kineticDismountMinSpeed ?? 12,
      },
    };
  }

  // 穿刺武器
  if (data.piercingWeaponEnable) {
    components['minecraft:piercing_weapon'] = {
      reach: { min: data.piercingReachMin ?? 2, max: data.piercingReachMax ?? 4.5 },
      creative_reach: { min: data.piercingCreativeReachMin ?? 2, max: data.piercingCreativeReachMax ?? 7.5 },
      hitbox_margin: data.piercingHitboxMargin ?? 0.25,
    };
  }

  // 使用修饰符
  if (data.useModifiersEnable) {
    const um: Record<string, any> = {};
    if (data.useModifiersDuration !== undefined) um.use_duration = data.useModifiersDuration;
    um.emit_vibrations = data.useModifiersEmitVibration === true;
    if (data.useModifiersMovement !== undefined) um.movement_modifier = data.useModifiersMovement;
    components['minecraft:use_modifiers'] = um;
  }

  // 射击者
  if (data.shooterEnable) {
    const shooter: Record<string, any> = {
      ammunition: [{ item: data.shooterAmmunition || 'minecraft:arrow', use_offhand: true, search_inventory: true, use_in_creative: true }],
      max_draw_duration: data.shooterMaxDrawDuration || 1.5,
      scale_power_by_draw_duration: data.shooterScalePower !== false,
    };
    if (data.shooterChargeOnDraw) {
      shooter.charge_on_draw = true;
    }
    components['minecraft:shooter'] = shooter;
  }

  // 耐火
  if (data.fireResistant) {
    components['minecraft:fire_resistant'] = {};
  }

  // 标签
  if (data.tags) {
    const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      components[`tag:${tag}`] = {};
    }
  }

  // --- 食物特殊处理 ---
  if (module.id === 'food') {
    components['minecraft:food'] = components['minecraft:food'] || {};
    components['minecraft:food'].nutrition = data.nutrition ?? 4;
    components['minecraft:food'].saturation_modifier = data.saturation ?? 0.6;
    if (data.canAlwaysEat) {
      components['minecraft:food'].can_always_eat = true;
    }
    if (data.usingConvertsTo) {
      components['minecraft:food'].using_converts_to = data.usingConvertsTo;
    }
    if (data.useDuration) {
      components['minecraft:use_modifiers'] = {
        use_duration: data.useDuration,
        movement_modifier: 1,
      };
    }
    if (data.compostableEnable && data.compostingChance !== undefined) {
      components['minecraft:compostable'] = { composting_chance: data.compostingChance };
    }
  }

  // --- 护甲特殊处理 ---
  if (module.id === 'armor') {
    const armorSlotMap: Record<string, string> = {
      helmet: 'slot.armor.head',
      chestplate: 'slot.armor.chest',
      leggings: 'slot.armor.legs',
      boots: 'slot.armor.feet',
    };
    const slot = armorSlotMap[data.armorType || 'helmet'] || 'slot.armor.head';
    components['minecraft:wearable'] = { slot, protection: data.protection ?? 0 };
    if (data.knockbackResistance) {
      components['minecraft:wearable'].knockback_resistance = data.knockbackResistance;
    }
  }

  // 清理空对象
  if (Object.keys(result['minecraft:item'].events || {}).length === 0) {
    delete result['minecraft:item'].events;
  }

  return result;
}

// ===== 方块生成器 =====
function generateBlock(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const identifier = `${ns}:${data.identifier || 'change_me'}`;

  const result: Record<string, any> = {
    format_version: '1.21.100',
    'minecraft:block': {
      description: { identifier },
      components: {} as Record<string, any>,
      permutations: [],
    },
  };

  const components = result['minecraft:block'].components;

  // 遍历字段设置值
  for (const field of module.fields) {
    if (!checkCondition(field, data)) continue;
    if (field.type === 'section' || field.type === 'icon') continue;
    const value = data[field.key];
    if (value === undefined || value === null || value === '') continue;
    if (['identifier', 'displayName', 'blockType'].includes(field.key)) continue;
    if (field.jsonPath) {
      setNestedValue(result, `minecraft:block.${field.jsonPath}`, value);
    }
  }

  // 材质
  if (data.materialInstance) {
    components['minecraft:material_instances'] = {
      '*': { texture: data.materialInstance },
    };
  }

  // 碰撞箱
  if (data.collisionBoxEnable) {
    components['minecraft:collision_box'] = {
      origin: [-8, 0, -8],
      size: [16, data.collisionHeight ?? 16, 16],
    };
  }

  // 选区
  if (data.selectionBoxEnable) {
    components['minecraft:selection_box'] = {
      origin: [-8, 0, -8],
      size: [16, data.selectionHeight ?? 16, 16],
    };
  }

  // 几何体
  if (data.geometryEnable && data.geometry) {
    components['minecraft:geometry'] = data.geometry;
  }

  // 光照
  if (data.lightEmission !== undefined && data.lightEmission > 0) {
    components['minecraft:light_emission'] = data.lightEmission;
  }

  // 可燃
  if (data.flammableEnable) {
    components['minecraft:flammable'] = {
      flame_odds: data.flameOdds ?? 0,
      burn_odds: data.burnOdds ?? 0,
    };
  }

  // 红石
  if (data.redstoneConductor === false) {
    components['minecraft:breathable'] = { breathable: true };
  }

  // 可破坏
  if (data.destroyTime !== undefined && data.destroyTime > 0) {
    components['minecraft:destructible_by_mining'] = { seconds_to_destroy: data.destroyTime };
  }

  // 可爆炸
  if (data.explosionResistance !== undefined && data.explosionResistance > 0) {
    components['minecraft:destructible_by_explosion'] = { explosion_resistance: data.explosionResistance };
  }

  // 方块实体
  if (data.blockEntityEnable) {
    result['minecraft:block'].description.identifier = identifier;
    result['minecraft:block'].components['minecraft:custom_components'] = [];
  }

  // 楼梯变体
  if (data.blockType === 'stair') {
    components['minecraft:geometry'] = 'minecraft:stairs';
    components['minecraft:material_instances'] = {
      '*': { texture: data.materialInstance || 'iron_block' },
      'stairs': { texture: data.materialInstance || 'iron_block' },
    };
  }

  // 门变体
  if (data.blockType === 'door') {
    components['minecraft:geometry'] = 'minecraft:geometry.full_block';
    components['minecraft:custom_components'] = ['pa:door_behavior'];
  }

  // 栅栏变体
  if (data.blockType === 'fence') {
    components['minecraft:geometry'] = 'minecraft:fence';
  }

  // 栅栏门变体
  if (data.blockType === 'fence_gate') {
    components['minecraft:geometry'] = 'minecraft:fence_gate';
  }

  // 活板门变体
  if (data.blockType === 'trapdoor') {
    components['minecraft:geometry'] = 'minecraft:trapdoor';
  }

  // 墙变体
  if (data.blockType === 'wall') {
    components['minecraft:geometry'] = 'minecraft:wall';
  }

  return result;
}

// ===== 实体生成器 =====
function generateEntity(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const identifier = `${ns}:${data.identifier || 'change_me'}`;

  // 服务端实体定义
  const serverEntity: Record<string, any> = {
    format_version: '1.21.100',
    'minecraft:entity': {
      description: {
        identifier,
        is_summonable: true,
        is_spawnable: data.isSpawnable !== false,
        is_experimental: false,
      },
      component_groups: {},
      components: {} as Record<string, any>,
      events: {},
    },
  };

  const components = serverEntity['minecraft:entity'].components;

  // 遍历字段设置值
  for (const field of module.fields) {
    if (!checkCondition(field, data)) continue;
    if (field.type === 'section' || field.type === 'icon') continue;
    const value = data[field.key];
    if (value === undefined || value === null || value === '') continue;
    if (['identifier', 'displayName', 'entityType', 'isSpawnable'].includes(field.key)) continue;
    if (field.jsonPath) {
      setNestedValue(serverEntity, `minecraft:entity.${field.jsonPath}`, value);
    }
  }

  // 类型属性
  if (data.entityType === 'animal') {
    components['minecraft:behavior.float'] = { priority: 0 };
    components['minecraft:behavior.random_look_around'] = { priority: 7 };
    components['minecraft:behavior.random_stroll'] = { priority: 6, speed_multiplier: 0.8 };
    components['minecraft:behavior.look_at_player'] = { priority: 8, look_distance: 6.0 };
    components['minecraft:physics'] = {};
    components['minecraft:pushable'] = { is_pushable: true, is_pushable_by_piston: true };
    components['minecraft:environment_sensor'] = {};
    components['minecraft:jump.static'] = {};
    components['minecraft:navigation.walk'] = { can_path_over_water: true };
    components['minecraft:movement.basic'] = {};
    components['minecraft:movement'] = { value: data.movementSpeed ?? 0.25 };
    components['minecraft:health'] = { value: data.maxHealth ?? 20, max: data.maxHealth ?? 20 };
    components['minecraft:attack'] = { damage: data.attackDamage ?? 0 };
    components['minecraft:despawn'] = { despawn_from_distance: {} };
  } else if (data.entityType === 'monster') {
    components['minecraft:behavior.float'] = { priority: 0 };
    components['minecraft:behavior.random_look_around'] = { priority: 7 };
    components['minecraft:behavior.random_stroll'] = { priority: 6, speed_multiplier: 0.8 };
    components['minecraft:behavior.look_at_player'] = { priority: 8, look_distance: 6.0 };
    components['minecraft:behavior.hurt_by_target'] = { priority: 1 };
    components['minecraft:behavior.nearest_attackable_target'] = {
      priority: 2,
      entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'player' }, max_dist: 16 }],
      must_see: true,
    };
    components['minecraft:behavior.melee_attack'] = { priority: 3, speed_multiplier: 1.2, track_target: true };
    components['minecraft:physics'] = {};
    components['minecraft:pushable'] = { is_pushable: true, is_pushable_by_piston: true };
    components['minecraft:jump.static'] = {};
    components['minecraft:navigation.walk'] = { can_path_over_water: true };
    components['minecraft:movement.basic'] = {};
    components['minecraft:movement'] = { value: data.movementSpeed ?? 0.25 };
    components['minecraft:health'] = { value: data.maxHealth ?? 20, max: data.maxHealth ?? 20 };
    components['minecraft:attack'] = { damage: data.attackDamage ?? 2 };
    components['minecraft:despawn'] = { despawn_from_distance: {} };
    serverEntity['minecraft:entity'].description.properties = { family: { type: 'monster' } };
  } else if (data.entityType === 'projectile') {
    components['minecraft:projectile'] = {
      on_hit: { impact_effect: { particle: 'minecraft:large_explosion', sound: 'minecraft:random.explode' } },
      power: data.projectilePower ?? 2,
      gravity: data.projectileGravity ?? 0.05,
      anchor: 1,
      offset: [0, 0.5, 0],
      reflect_immovable: true,
      catch_fire: false,
    };
    components['minecraft:physics'] = {};
  }

  // 碰撞箱
  if (data.collisionBoxEnable) {
    components['minecraft:collision_box'] = {
      width: data.collisionWidth ?? 1,
      height: data.collisionHeight ?? 1,
    };
  }

  // 可骑乘
  if (data.ridableEnable) {
    components['minecraft:rideable'] = {
      seat_count: 1,
      family_types: ['player'],
      seats: { position: [0, data.seatHeight ?? 1, 0] },
    };
    components['minecraft:behavior.player_ride_tamed'] = { priority: 0 };
  }

  // 可繁殖
  if (data.breedableEnable) {
    components['minecraft:is_breedable'] = {};
    components['minecraft:behavior.breed'] = { priority: 4, speed_multiplier: 1.0 };
    components['minecraft:behavior.tameable'] = { priority: 5, tame_items: [data.tameItem || 'minecraft:wheat'] };
  }

  // 掉落物
  if (data.lootTableEnable && data.lootTable) {
    components['minecraft:loot'] = { table: data.lootTable };
  }

  // 生成蛋
  if (data.spawnEggEnable) {
    serverEntity['minecraft:entity'].description.spawn_egg = {
      base_color: data.spawnEggBaseColor ?? '#000000',
      overlay_color: data.spawnEggOverlayColor ?? '#ffffff',
    };
  }

  // 标签
  if (data.tags) {
    const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      components[`tag:${tag}`] = {};
    }
  }

  return serverEntity;
}

// ===== 群系生成器 =====
function generateBiome(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const identifier = data.identifier || 'change_me';

  const result: Record<string, any> = {
    format_version: '1.21.110',
    'minecraft:biome': {
      description: { identifier },
      components: {} as Record<string, any>,
    },
  };

  const components = result['minecraft:biome'].components;

  // 遍历字段设置值
  for (const field of module.fields) {
    if (!checkCondition(field, data)) continue;
    if (field.type === 'section' || field.type === 'icon') continue;
    const value = data[field.key];
    if (value === undefined || value === null || value === '') continue;
    if (['identifier', 'displayName', 'biomeType'].includes(field.key)) continue;
    if (field.jsonPath) {
      setNestedValue(result, `minecraft:biome.${field.jsonPath}`, value);
    }
  }

  // 群系类型预设
  const biomePresets: Record<string, any> = {
    plains: {
      'minecraft:overworld_generation': {},
      'minecraft:climate': { temperature: 0.8, downfall: 0.4 },
      'minecraft:overworld_height': { noise_type: 'default' },
      'minecraft:surface_parameters': {
        sea_floor_depth: 1,
        sea_floor_material: 'minecraft:stone',
        foundation_material: 'minecraft:stone',
        mid_material: 'minecraft:dirt',
        top_material: 'minecraft:grass',
      },
    },
    desert: {
      'minecraft:overworld_generation': {},
      'minecraft:climate': { temperature: 2.0, downfall: 0.0 },
      'minecraft:overworld_height': { noise_type: 'default' },
      'minecraft:surface_parameters': {
        sea_floor_depth: 1,
        sea_floor_material: 'minecraft:sandstone',
        foundation_material: 'minecraft:stone',
        mid_material: 'minecraft:sandstone',
        top_material: 'minecraft:sand',
      },
    },
    snowy: {
      'minecraft:overworld_generation': {},
      'minecraft:climate': { temperature: 0.0, downfall: 0.5 },
      'minecraft:overworld_height': { noise_type: 'default' },
      'minecraft:surface_parameters': {
        sea_floor_depth: 1,
        sea_floor_material: 'minecraft:stone',
        foundation_material: 'minecraft:stone',
        mid_material: 'minecraft:dirt',
        top_material: 'minecraft:snow_block',
      },
    },
    ocean: {
      'minecraft:overworld_generation': {},
      'minecraft:climate': { temperature: 0.5, downfall: 0.5 },
      'minecraft:overworld_height': { noise_type: 'ocean' },
      'minecraft:surface_parameters': {
        sea_floor_depth: 1,
        sea_floor_material: 'minecraft:gravel',
        foundation_material: 'minecraft:stone',
        mid_material: 'minecraft:dirt',
        top_material: 'minecraft:gravel',
      },
    },
    mountain: {
      'minecraft:overworld_generation': {},
      'minecraft:climate': { temperature: 0.2, downfall: 0.3 },
      'minecraft:overworld_height': { noise_type: 'mountain' },
      'minecraft:surface_parameters': {
        sea_floor_depth: 1,
        sea_floor_material: 'minecraft:stone',
        foundation_material: 'minecraft:stone',
        mid_material: 'minecraft:stone',
        top_material: 'minecraft:stone',
      },
    },
    nether: {
      'minecraft:nether_generation': {},
      'minecraft:climate': { temperature: 2.0, downfall: 0.0 },
      'minecraft:surface_parameters': {
        sea_floor_material: 'minecraft:netherrack',
        foundation_material: 'minecraft:netherrack',
        mid_material: 'minecraft:netherrack',
        top_material: 'minecraft:netherrack',
      },
    },
    end: {
      'minecraft:the_end_generation': {},
      'minecraft:climate': { temperature: 0.5, downfall: 0.5 },
    },
  };

  const preset = biomePresets[data.biomeType || 'plains'];
  if (preset) {
    Object.assign(components, preset);
  }

  // 自定义覆盖
  if (data.temperature !== undefined) {
    components['minecraft:climate'] = components['minecraft:climate'] || {};
    components['minecraft:climate'].temperature = data.temperature;
  }
  if (data.downfall !== undefined) {
    components['minecraft:climate'] = components['minecraft:climate'] || {};
    components['minecraft:climate'].downfall = data.downfall;
  }

  // 标签
  if (data.tags) {
    const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      components[`tag:${tag}`] = {};
    }
  }

  return result;
}

// ===== 配方生成器 =====
function generateRecipe(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const identifier = `${ns}:${data.identifier || 'change_me'}`;
  const recipeType = data.recipeType || 'shaped';

  // 有序合成
  if (recipeType === 'shaped') {
    const pattern = (data.pattern || ['', '', '']).filter((row: string) => row.length > 0);
    const ingredientMap: Record<string, any> = {};
    const ingredients = data.ingredients || {};
    for (const [key, itemId] of Object.entries(ingredients)) {
      if (key && itemId) {
        ingredientMap[key] = { item: itemId as string };
      }
    }

    return {
      format_version: '1.21.100',
      'minecraft:recipe_shaped': {
        description: { identifier },
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : ['crafting_table'],
        pattern,
        key: ingredientMap,
        result: { item: data.resultItem || 'minecraft:diamond', count: data.resultCount ?? 1 },
        unlock: data.unlockEnable && data.unlockItems?.length > 0
          ? { context: 'AlwaysUnlocked' }
          : undefined,
      },
    };
  }

  // 无序合成
  if (recipeType === 'shapeless') {
    const items = (data.shapelessItems || []).map((id: string) => ({ item: id }));
    return {
      format_version: '1.21.100',
      'minecraft:recipe_shapeless': {
        description: { identifier },
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : ['crafting_table'],
        ingredients: items,
        result: { item: data.resultItem || 'minecraft:diamond', count: data.resultCount ?? 1 },
        unlock: data.unlockEnable && data.unlockItems?.length > 0
          ? { context: 'AlwaysUnlocked' }
          : undefined,
      },
    };
  }

  // 熔炼
  if (recipeType === 'furnace') {
    const furnaceKey = `minecraft:recipe_furnace`;
    const tag = data.furnaceType || 'furnace';
    const tagMap: Record<string, string> = {
      furnace: 'furnace',
      blast_furnace: 'blast_furnace',
      smoker: 'smoker',
      campfire: 'campfire',
    };
    return {
      format_version: '1.21.100',
      [furnaceKey]: {
        description: { identifier },
        tags: [tagMap[tag] || 'furnace'],
        input: data.furnaceInput || 'minecraft:iron_ore',
        output: data.resultItem || 'minecraft:iron_ingot',
      },
    };
  }

  return { format_version: '1.21.100' };
}

// ===== 普通物品生成器 =====
function generateNormal(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const identifier = `${ns}:${data.identifier || 'change_me'}`;

  const result: Record<string, any> = {
    format_version: '1.21.100',
    'minecraft:item': {
      description: {
        identifier,
        menu_category: {
          category: data.menuCategory || 'items',
        },
      },
      components: {} as Record<string, any>,
    },
  };

  const components = result['minecraft:item'].components;

  // 设置物品栏分组
  if (data.itemGroup && data.itemGroup !== '') {
    result['minecraft:item'].description.menu_category.group = data.itemGroup;
  }

  // 遍历字段设置值（jsonPath 自动处理）
  for (const field of module.fields) {
    if (!checkCondition(field, data)) continue;
    if (field.type === 'section' || field.type === 'icon') continue;

    const value = data[field.key];
    if (value === undefined || value === null || value === '') continue;

    if (field.key === 'identifier' || field.key === 'displayName' || field.key === 'menuCategory' || field.key === 'itemGroup' || field.key === 'normalType') continue;

    if (field.jsonPath) {
      const fullPath = `minecraft:item.${field.jsonPath}`;
      setNestedValue(result, fullPath, value);
    }
  }

  // --- 燃料 ---
  if (data.fuelEnable && data.fuelDuration !== undefined) {
    components['minecraft:fuel'] = { duration: data.fuelDuration };
  }

  // --- 堆肥 ---
  if (data.compostableEnable && data.compostingChance !== undefined) {
    components['minecraft:compostable'] = { composting_chance: data.compostingChance };
  }

  // --- 唱片 ---
  if (data.recordEnable) {
    components['minecraft:record'] = {
      sound_event: data.recordSoundEvent || 'music.menu',
      duration: data.recordDuration || 120,
      comparator_signal: data.recordComparatorOutput ?? 15,
    };
  }

  // --- 耐火 ---
  if (data.fireResistant) {
    components['minecraft:fire_resistant'] = {};
  }

  // --- 标签 ---
  if (data.tags) {
    const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      components[`tag:${tag}`] = {};
    }
  }

  return result;
}


// ===== Particle 生成器 =====
function generateParticle(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || item.name;

  return {
    format_version: '1.21.100',
    'minecraft:particle_effect': {
      description: {
        identifier: `${ns}:${id}`,
        basic_render_parameters: {
          material: data.material || 'particles_alpha',
          texture: data.texture || `textures/particle/${id}`,
        },
      },
      components: {
        'minecraft:emitter_rate_instant': {
          num_particles: data.numParticles ?? 10,
        },
        'minecraft:emitter_lifetime_once': {
          active_time: data.activeTime ?? 1.0,
        },
        'minecraft:emitter_shape_sphere': {
          radius: data.radius ?? 0.1,
          surface_only: data.surfaceOnly ?? false,
        },
        'minecraft:particle_lifetime_expression': {
          max_lifetime: data.maxLifetime ?? 1.0,
        },
        'minecraft:particle_initial_speed': data.initialSpeed ?? 2.0,
        'minecraft:particle_motion_dynamic': {},
        'minecraft:particle_appearance_billboard': {
          size: [data.sizeWidth ?? 0.1, data.sizeHeight ?? 0.1],
          facing_camera_mode: data.facingMode || 'rotate_xyz',
        },
        'minecraft:particle_appearance_tinting': {
          color: data.color || [1.0, 1.0, 1.0, 1.0],
        },
      },
    },
  };
}

// ===== Projectile 生成器 =====
function generateProjectile(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || item.name;

  const components: Record<string, any> = {
    'minecraft:collision_box': {
      width: data.collisionWidth ?? 0.25,
      height: data.collisionHeight ?? 0.25,
    },
    'minecraft:projectile': {
      on_hit: {
        impact_damage: {
          damage: data.damage ?? 4,
          knockback: data.knockback ?? true,
          semi_random_diff_raycasting: data.semiRandom ?? false,
          destroy_on_hit: data.destroyOnHit ?? true,
        },
        remove_entity: {},
      },
      power: data.power ?? 2.0,
      gravity: data.gravity ?? 0.05,
      uncertainty: data.uncertainty ?? 0.0,
    },
    'minecraft:physics': {},
    'minecraft:pushable': {
      is_pushable: false,
      is_pushable_by_piston: false,
    },
    'minecraft:conditional_kill': {
      conditional_kill_on_hit: true,
    },
  };

  if (data.particleEffect) {
    components['minecraft:trail'] = {
      particle_effect: data.particleEffect,
      spawn_interval: data.trailInterval ?? 1,
      spawn_distance: data.trailDistance ?? 1,
    };
  }

  if (data.lightingOnFire) {
    components['minecraft:ignite'] = {
      fire_ignition_duration: data.fireDuration ?? 5,
    };
  }

  return {
    format_version: '1.21.100',
    'minecraft:entity': {
      description: {
        identifier: `${ns}:${id}`,
        is_summonable: true,
        is_spawnable: false,
        is_experimental: false,
        properties: {},
      },
      components,
    },
  };
}

// ===== SpawnRule 生成器 =====
function generateSpawnRule(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || item.name;

  const conditions: Record<string, any> = {};

  if (data.minBrightness !== undefined || data.maxBrightness !== undefined) {
    conditions.brightness_interval = {
      min: data.minBrightness ?? 0,
      max: data.maxBrightness ?? 15,
    };
  }

  if (data.minHeight !== undefined || data.maxHeight !== undefined) {
    conditions.height_interval = [data.minHeight ?? -64, data.maxHeight ?? 320];
  }

  if (data.requiredBiomes?.length) {
    conditions.required_biomes = data.requiredBiomes;
  }

  if (data.excludedBiomes?.length) {
    conditions.excluded_biomes = data.excludedBiomes;
  }

  if (data.temperature !== undefined) {
    conditions.temperature = data.temperature;
  }

  if (data.spawnAboveBlock) {
    conditions.spawn_above_block = data.spawnAboveBlock;
  }

  return {
    format_version: '1.21.100',
    'minecraft:spawn_rules': {
      description: {
        identifier: `${ns}:${id}`,
        population_control: data.populationControl || 'animal',
      },
      conditions: [
        {
          ...conditions,
          spawns_on_surface: data.spawnsOnSurface ?? true,
          weight: data.weight ?? 100,
          herd: {
            min_size: data.herdMin ?? 1,
            max_size: data.herdMax ?? 4,
          },
        },
      ],
    },
  };
}

// ===== 自定义物品生成器 (bow/crossbow/shield/mace/arrow/music_disc/bundle/recall_item/soul_stone) =====
function generateCustomItem(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || item.name;

  const components: Record<string, any> = {};

  // 通用物品组件
  if (data.maxStackSize !== undefined) {
    components['minecraft:max_stack_size'] = data.maxStackSize;
  }

  if (data.icon) {
    components['minecraft:icon'] = { texture: data.icon };
  }

  if (data.displayName) {
    components['minecraft:display_name'] = { value: data.displayName };
  }

  if (data.rarity) {
    components['minecraft:rarity'] = data.rarity;
  }

  if (data.fireResistant) {
    components['minecraft:fire_resistant'] = {};
  }

  if (data.menuCategory) {
    components['minecraft:menu_category'] = {
      category: data.menuCategory,
    };
  }

  if (data.tags?.length) {
    components['minecraft:tags'] = { tags: data.tags };
  }

  // 模块特定组件
  switch (module.id) {
    case 'bow':
    case 'crossbow':
      components['minecraft:shooter'] = {
        ammunition: data.ammunition || 'minecraft:arrow',
        max_draw_duration: data.maxDrawDuration ?? 1.2,
        scale_power_by_draw_duration: data.scalePowerByDraw ?? true,
      };
      if (module.id === 'crossbow') {
        components['minecraft:chargeable'] = {};
      }
      components['minecraft:durability'] = {
        max_durability: data.maxDurability ?? 384,
      };
      components['minecraft:hand_equipped'] = {};
      break;

    case 'shield':
      components['minecraft:wearable'] = {
        slot: 'slot.offhand',
      };
      components['minecraft:durability'] = {
        max_durability: data.maxDurability ?? 336,
      };
      components['minecraft:blocking'] = {};
      break;

    case 'mace':
      components['minecraft:damage'] = data.damage ?? 7;
      components['minecraft:weapon'] = {};
      components['minecraft:durability'] = {
        max_durability: data.maxDurability ?? 500,
      };
      components['minecraft:hand_equipped'] = {};
      components['minecraft:enchantable'] = {
        slot: 'sword',
        value: data.enchantValue ?? 14,
      };
      if (data.smashAttackCooldown !== undefined) {
        components['minecraft:custom_components'] = ['pa:mace_smash_attack'];
      }
      break;

    case 'arrow':
      components['minecraft:projectile'] = {
        projectile_entity: data.projectileEntity || 'minecraft:arrow',
      };
      components['minecraft:ammo'] = {};
      break;

    case 'music_disc':
      components['minecraft:record'] = {
        sound_event: data.soundEvent || 'music.custom',
        duration: data.duration ?? 120,
        comparator_signal: data.comparatorSignal ?? 13,
      };
      components['minecraft:max_stack_size'] = 1;
      break;

    case 'bundle':
      components['minecraft:bundle'] = {};
      components['minecraft:max_stack_size'] = 1;
      break;

    case 'recall_item':
      components['minecraft:custom_components'] = ['pa:recall_teleport'];
      components['minecraft:max_stack_size'] = data.maxStackSize ?? 1;
      if (data.cooldown !== undefined) {
        components['minecraft:cooldown'] = {
          category: 'recall',
          duration: data.cooldown,
        };
      }
      break;

    case 'soul_stone':
      components['minecraft:custom_components'] = ['pa:soul_capture'];
      components['minecraft:max_stack_size'] = data.maxStackSize ?? 16;
      if (data.captureRadius !== undefined) {
        components['minecraft:custom_components'].push('pa:soul_stone_radius');
      }
      break;
  }

  // 可修复组件
  if (data.repairable) {
    components['minecraft:repairable'] = {
      repair_items: [data.repairable],
    };
  }

  // 附魔槽位
  if (data.enchantableSlot && !components['minecraft:enchantable']) {
    components['minecraft:enchantable'] = {
      slot: data.enchantableSlot,
      value: data.enchantableValue ?? 10,
    };
  }

  return {
    format_version: '1.21.100',
    'minecraft:item': {
      description: {
        identifier: `${ns}:${id}`,
        menu_category: {
          category: data.menuCategory || 'items',
        },
      },
      components,
    },
  };
}
// ===== 函数生成器 (function) =====
function generateFunction(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = data.namespace || 'pa';
  const id = data.identifier || 'change_me';

  return {
    format_version: '1.21.100',
    'minecraft:function': {
      description: {
        identifier: `${ns}:${id}`,
      },
      commands: (data.commands || '').split('\n').filter((c: string) => c.trim()),
    },
  };
}

// ===== 生怪蛋生成器 (spawn_egg) =====
function generateSpawnEgg(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || 'change_me';
  const identifier = `${ns}:${id}`;

  const components: Record<string, any> = {
    'minecraft:spawn_egg': {
      entity_type: data.entityType || `${ns}:change_me`,
    },
  };

  if (data.baseColor && data.spotColor) {
    components['minecraft:spawn_egg'].base_color = data.baseColor;
    components['minecraft:spawn_egg'].spot_color = data.spotColor;
  }

  if (data.maxStackSize !== undefined) {
    components['minecraft:max_stack_size'] = data.maxStackSize;
  }

  if (data.icon) {
    components['minecraft:icon'] = { texture: data.icon };
  }

  if (data.aliases?.length) {
    components['minecraft:aliases'] = data.aliases;
  }

  return {
    format_version: '1.21.100',
    'minecraft:item': {
      description: {
        identifier,
        menu_category: {
          category: data.menuCategory || 'nature',
        },
      },
      components,
    },
  };
}

// ===== 纹理生成器 (texture) =====
function generateTexture(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const key = data.textureKey || 'my_texture';
  const path = data.texturePath || `textures/items/${key}`;

  const textureEntry: Record<string, any> = {
    textures: path,
  };

  if (data.isAnimated) {
    textureEntry.frames = data.frames?.length ? data.frames : [0];
    textureEntry.frame_time = data.frameTime || 1;
    if (data.interpolate) {
      textureEntry.interpolate = true;
    }
  }

  if (data.blur) {
    textureEntry.blur = true;
  }
  if (data.clamp) {
    textureEntry.clamp = true;
  }

  return {
    texture_data: {
      [key]: textureEntry,
    },
  };
}

// ===== 动画生成器 (animation) =====
function generateAnimation(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || 'change_me';
  const animId = `animation.${ns}.${id}`;

  const animation: Record<string, any> = {
    anim_length: data.animationLength || 1.0,
  };

  // 循环模式
  if (data.loop === 'loop') {
    animation.loop = true;
  } else if (data.loop === 'hold_on_last_frame') {
    animation.loop = 'hold_on_last_frame';
  }

  if (data.overridePreviousAnimation) {
    animation.override_previous_animation = true;
  }

  if (data.animTimeUpdate) {
    animation.anim_time_update = data.animTimeUpdate;
  }

  if (data.blendWeight && data.blendWeight !== '1.0') {
    animation.blend_weight = data.blendWeight;
  }

  if (data.startDelay) {
    animation.start_delay = data.startDelay;
  }

  // 骨骼动画
  const bone: Record<string, any> = {};
  const hasRotation = data.rotationX !== '0' || data.rotationY !== '0' || data.rotationZ !== '0';
  const hasPosition = data.positionX !== '0' || data.positionY !== '0' || data.positionZ !== '0';
  const hasScale = data.scaleX !== '1' || data.scaleY !== '1' || data.scaleZ !== '1';

  if (hasRotation) {
    bone.rotation = [data.rotationX || '0', data.rotationY || '0', data.rotationZ || '0'];
  }
  if (hasPosition) {
    bone.position = [data.positionX || '0', data.positionY || '0', data.positionZ || '0'];
  }
  if (hasScale) {
    bone.scale = [data.scaleX || '1', data.scaleY || '1', data.scaleZ || '1'];
  }

  if (Object.keys(bone).length > 0) {
    animation.bones = { [data.boneName || 'root']: bone };
  }

  return {
    format_version: '1.21.100',
    animations: {
      [animId]: animation,
    },
  };
}

// ===== 声音生成器 (sound) =====
function generateSound(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || 'change_me';
  const soundId = `${ns}.${id}`;

  const soundDef: Record<string, any> = {
    category: data.soundCategory || 'neutral',
  };

  // 单声音或多变体
  if (data.useMultipleSounds && data.soundVariants?.length) {
    const sounds = data.soundVariants.map((s: string) => ({ sound: s }));
    soundDef.sounds = sounds;
    if (!data.equalWeight) {
      // 加权随机需要单独处理
      soundDef.sounds = data.soundVariants.map((s: string) => ({ sound: s, weight: 1 }));
    }
  } else {
    const singleSound: Record<string, any> = {
      sound: data.soundPath || `sounds/custom/${id}`,
    };
    if (data.volume !== undefined && data.volume !== 1.0) {
      singleSound.volume = data.volume;
    }
    if (data.pitch !== undefined && data.pitch !== 1.0) {
      singleSound.pitch = data.pitch;
    }
    if (data.minDistance) {
      singleSound.min_distance = data.minDistance;
    }
    if (data.maxDistance && data.maxDistance !== 16) {
      singleSound.max_distance = data.maxDistance;
    }
    soundDef.sounds = [singleSound];
  }

  if (data.stream) {
    soundDef.stream = true;
  }
  if (data.loop) {
    soundDef.loop = true;
  }
  if (!data.is3D) {
    soundDef.is_3d = false;
  }

  return {
    format_version: '1.21.100',
    sound_definitions: {
      [soundId]: soundDef,
    },
  };
}

// ===== 皮肤生成器 (skin/geometry) =====
function generateSkin(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || 'change_me';
  const geoId = `geometry.${ns}.${id}`;

  // 构建立方体
  const cube: Record<string, any> = {
    origin: [data.cubeOriginX || 0, data.cubeOriginY || 0, data.cubeOriginZ || 0],
    size: [data.cubeSizeX || 1, data.cubeSizeY || 1, data.cubeSizeZ || 1],
    uv: [data.uvX || 0, data.uvY || 0],
  };

  if (data.mirrorUV) {
    cube.mirror = true;
  }
  if (data.inflate) {
    cube.inflate = data.inflate;
  }

  // 构建骨骼
  const bone: Record<string, any> = {
    name: data.rootBoneName || 'root',
    cubes: [cube],
  };

  if (data.parentBone) {
    bone.parent = data.parentBone;
  }
  bone.pivot = [data.pivotX || 0, data.pivotY || 0, data.pivotZ || 0];
  if (data.rotationX || data.rotationY || data.rotationZ) {
    bone.rotation = [data.rotationX || 0, data.rotationY || 0, data.rotationZ || 0];
  }

  return {
    format_version: data.formatVersion || '1.21.100',
    'minecraft:geometry': [
      {
        description: {
          identifier: geoId,
          texture_width: data.textureWidth || 64,
          texture_height: data.textureHeight || 64,
          visible_bounds_width: data.visibleBoundsWidth || 2,
          visible_bounds_height: data.visibleBoundsHeight || 2,
          visible_bounds_offset: JSON.parse(data.visibleBoundsOffset || '[0, 0, 0]'),
        },
        bones: [bone],
      },
    ],
  };
}

// ===== 脚本生成器 (script) =====
function generateScript(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;

  // 脚本模块生成 manifest 入口信息 + 脚本内容
  const dependencies: string[] = [];
  if (data.useServerModule) {
    dependencies.push('@minecraft/server');
  }
  if (data.useServerUiModule) {
    dependencies.push('@minecraft/server-ui');
  }

  return {
    type: 'script',
    content: data.scriptContent || '',
    manifest_entry: {
      type: 'script',
      language: 'javascript',
      entry: 'scripts/main.js',
    },
    dependencies: dependencies.map((dep) => {
      if (dep === '@minecraft/server') {
        return { module_name: '@minecraft/server', version: data.apiVersion || '1.16.0' };
      }
      return { module_name: dep, version: '1.0.0' };
    }),
  };
}

// ===== 结构生成器 (structure) =====
function generateStructure(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = data.namespace || 'pa';
  const id = data.identifier || 'change_me';

  return {
    type: 'structure',
    identifier: `${ns}:${id}`,
    format_version: '1.21.100',
    size: [data.sizeX || 5, data.sizeY || 5, data.sizeZ || 5],
    structure_world_origin: [0, 0, 0],
    options: {
      ignore_blocks: data.ignoreBlocks || false,
      ignore_entities: data.ignoreEntities || false,
      ignore_water: data.ignoreWater || false,
      ignore_air: data.ignoreAir || false,
      include_water: data.includeWater !== false,
    },
    transform: {
      rotation: data.rotation || 'none',
      mirror: data.mirror || 'none',
    },
    palette_mode: data.paletteMode || 'linear',
  };
}

// ===== 战利品表生成器 (loot) =====
function generateLoot(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;

  // 构建条目
  const entries: Record<string, any>[] = [];

  // 条目 1
  const entry1: Record<string, any> = {
    type: 'item',
    name: data.item1Id || 'minecraft:stick',
    weight: data.item1Weight || 1,
  };
  const functions1: Record<string, any>[] = [];
  functions1.push({
    function: 'set_count',
    count: { min: data.item1MinCount || 1, max: data.item1MaxCount || 1 },
  });
  if (data.item1Enchant) {
    functions1.push({
      function: 'enchant_randomly',
      levels: { min: 1, max: data.item1EnchantLevel || 1 },
    });
  }
  entry1.functions = functions1;
  entries.push(entry1);

  // 条目 2
  if (data.useItem2) {
    const entry2: Record<string, any> = {
      type: 'item',
      name: data.item2Id || 'minecraft:iron_ingot',
      weight: data.item2Weight || 1,
      functions: [{
        function: 'set_count',
        count: { min: data.item2MinCount || 1, max: data.item2MaxCount || 1 },
      }],
    };
    entries.push(entry2);
  }

  // 构建条件
  const conditions: Record<string, any>[] = [];
  if (data.useKilledByPlayer) {
    conditions.push({ condition: 'killed_by_player' });
  }
  if (data.useRandomChance) {
    conditions.push({ condition: 'random_chance', chance: data.randomChance || 0.5 });
  }
  if (data.useLootingEnchant) {
    conditions.push({ condition: 'random_looting_chance', chance: 0.5, looting_multiplier: 0.1 });
  }

  // 构建池子
  const pool: Record<string, any> = {
    rolls: data.poolRolls || 1,
    entries,
  };
  if (data.poolBonusRolls) {
    pool.bonus_rolls = data.poolBonusRolls;
  }
  if (conditions.length > 0) {
    pool.conditions = conditions;
  }

  return {
    format_version: '1.21.100',
    pools: [pool],
  };
}

// ===== 着色器生成器 (shader) =====
function generateShader(_module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  const data = item.data;
  const ns = 'pa';
  const id = data.identifier || 'change_me';

  const material: Record<string, any> = {
    render_method: data.renderMethod || 'alpha_blend',
    face_culling: data.faceCulling || 'back',
  };

  if (data.depthBias) {
    material.depth_bias = data.depthBias;
  }
  if (data.slopeScaledDepthBias) {
    material.slope_scaled_depth_bias = data.slopeScaledDepthBias;
  }

  // 纹理采样器
  const samplers: Record<string, string>[] = [{ sampler: data.textureSamplerName || 'tDiffuse' }];
  if (data.useNormalMap) samplers.push({ sampler: 'tNormal' });
  if (data.useEmissiveMap) samplers.push({ sampler: 'tEmissive' });
  if (data.useMetallicMap) samplers.push({ sampler: 'tMetallic' });
  if (data.useRoughnessMap) samplers.push({ sampler: 'tRoughness' });
  material.samplers = samplers;

  // 颜色混合
  if (data.useColorBlend) {
    material.blend_color = {
      src: data.blendSrcColor || 'one',
      dst: data.blendDstColor || 'one_minus_src_alpha',
    };
  }

  // 着色器代码
  material.fragment_shader = data.fragmentShader || '';
  material.vertex_shader = data.vertexShader || '';

  // 高级属性
  material.fog = data.useFog !== false;
  material.lighting = data.useLighting !== false;
  material.tone_mapping = data.useToneMapping !== false;
  if (data.useBloom) {
    material.bloom = true;
  }

  return {
    format_version: '1.21.100',
    material: {
      [`${ns}:${id}`]: material,
    },
  };
}

// ===== 主生成函数 =====
export function generateItemJSON(module: ModuleDefinition, item: ProjectItem): Record<string, any> {
  switch (module.id) {
    case 'weapon':
    case 'armor':
    case 'food':
    case 'tool':
      return generateItem(module, item);
    case 'normal':
      return generateNormal(module, item);
    case 'block':
      return generateBlock(module, item);
    case 'entity':
      return generateEntity(module, item);
    case 'biome':
      return generateBiome(module, item);
    case 'recipe':
      return generateRecipe(module, item);
    case 'particle':
      return generateParticle(module, item);
    case 'projectile':
      return generateProjectile(module, item);
    case 'spawn_rule':
      return generateSpawnRule(module, item);
    case 'bow':
    case 'crossbow':
    case 'shield':
    case 'mace':
    case 'arrow':
    case 'music_disc':
    case 'bundle':
    case 'recall_item':
    case 'soul_stone':
      return generateCustomItem(module, item);
    case 'function':
      return generateFunction(module, item);
    case 'spawn_egg':
      return generateSpawnEgg(module, item);
    case 'texture':
      return generateTexture(module, item);
    case 'animation':
      return generateAnimation(module, item);
    case 'sound':
      return generateSound(module, item);
    case 'skin':
      return generateSkin(module, item);
    case 'script':
      return generateScript(module, item);
    case 'structure':
      return generateStructure(module, item);
    case 'loot':
      return generateLoot(module, item);
    case 'shader':
      return generateShader(module, item);
    default:
      return generateItem(module, item);
  }
}

// 生成客户端实体定义（实体需要额外文件）
export function generateClientEntity(item: ProjectItem): Record<string, any> | null {
  const data = item.data;
  const ns = 'pa';
  const identifier = `${ns}:${data.identifier || 'change_me'}`;

  if (!data.geometry && !data.texture) return null;

  return {
    format_version: '1.21.100',
    'minecraft:client_entity': {
      description: {
        identifier,
        materials: { default: 'entity_alphatest' },
        textures: { default: data.texture || 'textures/entity/custom' },
        geometry: { default: data.geometry || 'geometry.custom' },
        render_controllers: ['controller.render.default'],
        spawn_egg: data.spawnEggEnable ? {
          base_color: data.spawnEggBaseColor ?? '#000000',
          overlay_color: data.spawnEggOverlayColor ?? '#ffffff',
        } : undefined,
      },
    },
  };
}

// 生成单个项目的预览 JSON
export function generatePreviewJSON(module: ModuleDefinition, item: ProjectItem): string {
  const json = generateItemJSON(module, item);
  return JSON.stringify(json, null, 2);
}
