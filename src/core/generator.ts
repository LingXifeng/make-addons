import type { FieldSchema, ModuleDefinition, ProjectItem } from './types';

// ===== 深层路径设置/获取 =====

export function setByPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
}

export function getByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

export function deleteByPath(obj: any, path: string): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) return;
    current = current[parts[i]];
  }
  delete current[parts[parts.length - 1]];
}

// ===== 从 schema 生成默认表单数据 =====

export function createDefaultFormData(fields: FieldSchema[]): Record<string, any> {
  const data: Record<string, any> = {};
  for (const field of fields) {
    if (field.type === 'section') continue;
    data[field.key] = JSON.parse(JSON.stringify(field.defaultValue));
  }
  return data;
}

// ===== 检查字段是否应该显示 =====

export function shouldShowField(field: FieldSchema, data: Record<string, any>): boolean {
  if (!field.showWhen) return true;
  const depValue = data[field.showWhen.field];
  if (field.showWhen.value === 'nonempty') {
    return Array.isArray(depValue) ? depValue.length > 0 : !!depValue;
  }
  return depValue === field.showWhen.value;
}

// ===== 核心：从表单数据 + 模板生成 item JSON =====

export async function generateItemJson(
  module: ModuleDefinition,
  item: ProjectItem,
  subTypeId?: string,
): Promise<any> {
  // 确定子类型和字段
  const subType = subTypeId ? module.subTypes?.find(s => s.id === subTypeId) : undefined;
  const templateFile = subType?.templateFile || module.templateFile;
  const fields = subType?.fields || module.fields;

  // 加载模板
  const response = await fetch(`${import.meta.env.BASE_URL}assets/${templateFile}`);
  const template = await response.json();

  // 深拷贝模板
  const result = JSON.parse(JSON.stringify(template));
  const itemDef = result['minecraft:item'];
  const components = itemDef.components || (itemDef.components = {});

  const data = item.data;
  const namespace = 'pa'; // 默认命名空间
  const identifier = `${namespace}:${data.identifier || 'change_me'}`;

  // 设置 identifier
  setByPath(result, 'minecraft:item.description.identifier', identifier);

  // 设置 display_name
  if (data.displayName) {
    components['minecraft:display_name'] = { value: `item.add:${namespace}_${data.identifier}.name` };
  }

  // 设置 icon
  if (data.icon) {
    components['minecraft:icon'] = data.icon;
  }

  // 处理每个字段
  for (const field of fields) {
    if (field.type === 'section' || field.type === 'icon') continue;
    if (!field.jsonPath) continue;
    if (!shouldShowField(field, data)) {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    const value = data[field.key];
    if (value === undefined || value === null) continue;

    // 跳过空字符串（除非有特殊处理）
    if (value === '' && field.type === 'text') {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    // 特殊处理
    if (field.key === 'repairableItems' && data.repairableEnable) {
      if (Array.isArray(value) && value.length > 0) {
        components['minecraft:repairable'] = {
          repair_items: value.map((r: any) => ({
            items: r.items,
            repair_amount: r.repairAmount,
          })),
        };
      }
      continue;
    }

    if (field.key === 'canDestroy' && Array.isArray(value) && value.length > 0) {
      components['minecraft:can_destroy'] = { blocks: value };
      if (data.canDestroyInCreative !== undefined) {
        components['minecraft:can_destroy_in_creative'] = data.canDestroyInCreative;
      }
      continue;
    }

    if (field.key === 'cooldown' && data.cooldownEnable) {
      components['minecraft:cooldown'] = {
        category: data.cooldownType || 'attack',
        duration: value,
      };
      continue;
    }

    if (field.key === 'useAnimation' && value === '') {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    // === 高级属性特殊处理 ===

    // 药水效果
    if (field.key === 'potionEffects' && data.potionEffectsEnable) {
      if (Array.isArray(value) && value.length > 0) {
        components['minecraft:food'] = components['minecraft:food'] || {};
        components['minecraft:food'].on_consume = {
          apply_effects_to_player: value.map((e: any) => ({
            effect: e.effect,
            amplifier: e.amplifier ?? 0,
            duration: e.duration ?? 10,
            visible: e.visible !== false,
          })),
        };
      }
      continue;
    }

    // 使用行为 (on_use 事件)
    if (field.key === 'onUseEvent' && data.onUseEnable) {
      components['minecraft:on_use'] = {
        on_use: { event: value || 'on_use_event' },
      };
      continue;
    }

    // 使用函数
    if (field.key === 'onUseFunc' && value) {
      if (!components['minecraft:on_use']) {
        components['minecraft:on_use'] = { on_use: {} };
      }
      components['minecraft:on_use'].on_use.function = value;
      continue;
    }

    // 方块放置器
    if (field.key === 'blockPlacerBlock' && data.blockPlacerEnable) {
      components['minecraft:block_placer'] = {
        block_reference: value || 'minecraft:stone',
      };
      continue;
    }

    // 实体放置器
    if (field.key === 'entityPlacerEntity' && data.entityPlacerEnable) {
      components['minecraft:entity_placer'] = {
        entity_reference: value || 'minecraft:zombie',
      };
      continue;
    }

    // 武器命中事件
    if (field.key === 'onHurtEntityEvent' && data.weaponHitEventEnable) {
      components['minecraft:weapon'] = components['minecraft:weapon'] || {};
      components['minecraft:weapon'].on_hurt_entity = { event: value || 'on_hurt_entity_event' };
      continue;
    }
    if (field.key === 'onNotHurtEntityEvent' && data.weaponHitEventEnable) {
      components['minecraft:weapon'] = components['minecraft:weapon'] || {};
      components['minecraft:weapon'].on_not_hurt_entity = { event: value || 'on_not_hurt_entity_event' };
      continue;
    }
    if (field.key === 'onHitBlockEvent' && data.weaponHitEventEnable) {
      components['minecraft:weapon'] = components['minecraft:weapon'] || {};
      components['minecraft:weapon'].on_hit_block = { event: value || 'on_hit_block_event' };
      continue;
    }

    // 使用修饰符
    if (field.key === 'useDuration' && data.useModifiersEnable) {
      components['minecraft:use_duration'] = value;
      continue;
    }
    if (field.key === 'movementModifier' && data.useModifiersEnable) {
      components['minecraft:use_modifiers'] = {
        movement_modifier: value,
      };
      continue;
    }

    // 射击者
    if (field.key === 'shooterAmmunition' && data.shooterEnable) {
      components['minecraft:shooter'] = {
        ammunition: [{ item: value || 'minecraft:arrow' }],
        max_draw_duration: data.shooterMaxDrawDuration ?? 1.5,
        scale_power_by_draw_duration: data.shooterScalePower !== false,
      };
      continue;
    }
    if (field.key === 'shooterMaxDrawDuration' && data.shooterEnable) {
      // 已在 shooterAmmunition 中处理
      continue;
    }
    if (field.key === 'shooterScalePower' && data.shooterEnable) {
      // 已在 shooterAmmunition 中处理
      continue;
    }

    // 耐火
    if (field.key === 'fireResistant' && value === true) {
      components['minecraft:fire_resistant'] = {};
      continue;
    }

    // 稀有度
    if (field.key === 'rarity' && value) {
      components['minecraft:rarity'] = value;
      continue;
    }

    // 穿透武器 / 动能武器（需脚本支持，添加 item tag）
    if (field.key === 'piercingWeaponEnable' && value === true) {
      components['minecraft:weapon'] = components['minecraft:weapon'] || {};
      // 标记为穿透武器，脚本可读取此 tag
      const tags = itemDef.description?.tags || [];
      if (!tags.includes('pa:piercing_weapon')) {
        tags.push('pa:piercing_weapon');
      }
      setByPath(result, 'minecraft:item.description.tags', tags);
      continue;
    }
    if (field.key === 'kineticWeaponEnable' && value === true) {
      components['minecraft:weapon'] = components['minecraft:weapon'] || {};
      // 标记为动能武器，脚本可读取此 tag
      const tags = itemDef.description?.tags || [];
      if (!tags.includes('pa:kinetic_weapon')) {
        tags.push('pa:kinetic_weapon');
      }
      setByPath(result, 'minecraft:item.description.tags', tags);
      continue;
    }

    // === 新增标准组件处理 ===

    // 燃料 (minecraft:fuel)
    if (field.key === 'fuelDuration' && data.fuelEnable) {
      components['minecraft:fuel'] = { duration: value };
      continue;
    }

    // 可投掷 (minecraft:throwable)
    if (field.key === 'throwPower' && data.throwableEnable) {
      components['minecraft:throwable'] = { throw_power: value };
      continue;
    }

    // 使用方块限制 (minecraft:use_on)
    if (field.key === 'useOnBlocks' && Array.isArray(value) && value.length > 0) {
      components['minecraft:use_on'] = { blocks: value };
      continue;
    }

    // 挖掘工具 (minecraft:digger)
    if (field.key === 'diggerBlocks' && data.diggerEnable) {
      if (Array.isArray(value) && value.length > 0) {
        components['minecraft:digger'] = {
          destroy_speeds: value.map((d: any) => ({
            block: d.items?.[0] || d.items || 'minecraft:stone',
            speed: d.repairAmount ?? 1,
          })),
        };
      }
      continue;
    }

    // 可穿戴 (minecraft:wearable)
    if (field.key === 'wearableSlot' && data.wearableEnable) {
      components['minecraft:wearable'] = { slot: value };
      continue;
    }

    // 物品标签 (description.tags)
    if (field.key === 'tags' && value) {
      const tagList = value.split(',').map((t: string) => t.trim()).filter(Boolean);
      const existingTags = itemDef.description?.tags || [];
      for (const t of tagList) {
        if (!existingTags.includes(t)) {
          existingTags.push(t);
        }
      }
      setByPath(result, 'minecraft:item.description.tags', existingTags);
      continue;
    }

    // 可命名 (minecraft:nameable)
    if (field.key === 'allowNameTagRenaming' && data.nameableEnable) {
      components['minecraft:nameable'] = { allow_name_tag_renaming: value };
      continue;
    }

    // 战利品表 (minecraft:loot)
    if (field.key === 'lootTablePath' && data.lootEnable && value) {
      components['minecraft:loot'] = { loot_table: value };
      continue;
    }

    // === MAM 自定义/脚本属性（通过 item tag 标记，脚本读取） ===

    // 掠夺附魔
    if (field.key === 'lootingEnchantEnable' && value === true) {
      const tags2 = itemDef.description?.tags || [];
      if (!tags2.includes('pa:looting_enchant')) {
        tags2.push('pa:looting_enchant');
      }
      setByPath(result, 'minecraft:item.description.tags', tags2);
      continue;
    }

    // 伤害吸收
    if (field.key === 'absorbableCauses' && data.damageAbsorptionEnable && value) {
      const tags3 = itemDef.description?.tags || [];
      if (!tags3.includes('pa:damage_absorption')) {
        tags3.push('pa:damage_absorption');
      }
      setByPath(result, 'minecraft:item.description.tags', tags3);
      components['minecraft:custom_components'] = components['minecraft:custom_components'] || [];
      if (!components['minecraft:custom_components'].includes('pa:absorb_damage')) {
        components['minecraft:custom_components'].push('pa:absorb_damage');
      }
      continue;
    }

    // 暴击粒子
    if (field.key === 'critParticleOnHurt' && value === true) {
      const tags4 = itemDef.description?.tags || [];
      if (!tags4.includes('pa:crit_particle_on_hurt')) {
        tags4.push('pa:crit_particle_on_hurt');
      }
      setByPath(result, 'minecraft:item.description.tags', tags4);
      continue;
    }

    // 命中销毁
    if (field.key === 'destroyOnHit' && value === true) {
      const tags5 = itemDef.description?.tags || [];
      if (!tags5.includes('pa:destroy_on_hit')) {
        tags5.push('pa:destroy_on_hit');
      }
      setByPath(result, 'minecraft:item.description.tags', tags5);
      continue;
    }

    // 反弹伤害
    if (field.key === 'reflectOnHurt' && value === true) {
      const tags6 = itemDef.description?.tags || [];
      if (!tags6.includes('pa:reflect_on_hurt')) {
        tags6.push('pa:reflect_on_hurt');
      }
      setByPath(result, 'minecraft:item.description.tags', tags6);
      continue;
    }

    // 半随机差异伤害
    if (field.key === 'semiRandomDiffDamage' && value === true) {
      const tags7 = itemDef.description?.tags || [];
      if (!tags7.includes('pa:semi_random_diff_damage')) {
        tags7.push('pa:semi_random_diff_damage');
      }
      setByPath(result, 'minecraft:item.description.tags', tags7);
      continue;
    }

    // 普通字段直接设置
    setByPath(result, field.jsonPath, value);
  }

  // 清理：移除空值组件
  cleanupEmpty(result);

  return result;
}

// ===== 清理空值 =====

function cleanupEmpty(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    if (obj[key] === '' || obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      cleanupEmpty(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// ===== 生成辅助文件 =====

export function generateItemTextureEntry(item: ProjectItem, namespace = 'pa'): { textureName: string; texturePath: string } {
  const id = item.data.identifier || 'change_me';
  const textureName = item.data.icon || `${namespace}_${id}`;
  return {
    textureName,
    texturePath: `textures/items/${textureName}`,
  };
}

export function generateLangEntry(item: ProjectItem, namespace = 'pa'): string {
  const id = item.data.identifier || 'change_me';
  const name = item.data.displayName || id;
  return `item.add:${namespace}_${id}.name=${name}`;
}
