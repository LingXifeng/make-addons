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
