import { describe, it, expect } from 'vitest';
import { allModules } from '../modules';
import { generateItemJSON, createDefaultFormData } from '../core/generator';
import type { ProjectItem, ModuleDefinition } from '../core/types';

function createTestItem(module: ModuleDefinition, subTypeId?: string): ProjectItem {
  const subType = subTypeId ? module.subTypes?.find(s => s.id === subTypeId) : undefined;
  const fields = subType?.fields || module.fields;
  const data = createDefaultFormData(fields);
  return {
    id: `test_${module.id}_${subTypeId || 'default'}`,
    moduleId: module.id,
    subTypeId,
    name: subType?.name || module.name,
    data,
    createdAt: Date.now(),
  };
}

describe('模块注册表', () => {
  it('应包含所有 31 个模块', () => {
    expect(allModules.length).toBe(31);
    const ids = allModules.map(m => m.id);
    expect(ids).toContain('weapon');
    expect(ids).toContain('armor');
    expect(ids).toContain('food');
    expect(ids).toContain('block');
    expect(ids).toContain('entity');
    expect(ids).toContain('biome');
    expect(ids).toContain('recipe');
    expect(ids).toContain('particle');
    expect(ids).toContain('projectile');
    expect(ids).toContain('spawn_rule');
    expect(ids).toContain('bow');
    expect(ids).toContain('crossbow');
    expect(ids).toContain('shield');
    expect(ids).toContain('mace');
    expect(ids).toContain('arrow');
    expect(ids).toContain('music_disc');
    expect(ids).toContain('bundle');
    expect(ids).toContain('recall_item');
    expect(ids).toContain('soul_stone');
  });

  it('每个模块应有非空 fields', () => {
    for (const mod of allModules) {
      expect(mod.fields.length).toBeGreaterThan(0);
    }
  });
});

describe('JSON 生成 - Weapon', () => {
  const mod = allModules.find(m => m.id === 'weapon')!;

  it('应生成包含 format_version 的 JSON', () => {
    const item = createTestItem(mod, 'sword');
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json['format_version']).toBe('1.21.100');
  });

  it('应包含 minecraft:item 根键', () => {
    const item = createTestItem(mod, 'sword');
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('minecraft:item');
  });

  it('应包含 description.identifier', () => {
    const item = createTestItem(mod, 'sword');
    item.data.identifier = 'test_sword';
    const json = generateItemJSON(mod, item);
    const mcItem = json['minecraft:item'];
    expect(mcItem).toHaveProperty('description');
    expect(mcItem.description).toHaveProperty('identifier');
    expect(mcItem.description.identifier).toBe('pa:test_sword');
  });

  it('剑应包含 damage 组件', () => {
    const item = createTestItem(mod, 'sword');
    item.data.identifier = 'pa:test_sword';
    item.data.damage = 7;
    const json = generateItemJSON(mod, item);
    const components = json['minecraft:item']?.components;
    expect(components).toHaveProperty('minecraft:damage');
    expect(components['minecraft:damage']).toBe(7);
  });
});

describe('JSON 生成 - Armor', () => {
  const mod = allModules.find(m => m.id === 'armor')!;

  it('应生成正确的护甲 JSON', () => {
    const item = createTestItem(mod, 'helmet');
    item.data.identifier = 'pa:test_helmet';
    item.data.protection = 3;
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json).toHaveProperty('minecraft:item');
    const components = json['minecraft:item']?.components;
    expect(components).toHaveProperty('minecraft:armor');
  });
});

describe('JSON 生成 - Food', () => {
  const mod = allModules.find(m => m.id === 'food')!;

  it('应生成正确的食物 JSON', () => {
    const item = createTestItem(mod);
    item.data.identifier = 'pa:test_food';
    item.data.nutrition = 6;
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json).toHaveProperty('minecraft:item');
    const components = json['minecraft:item']?.components;
    expect(components).toHaveProperty('minecraft:food');
  });
});

describe('JSON 生成 - Block', () => {
  const mod = allModules.find(m => m.id === 'block')!;

  it('应生成包含 minecraft:block 根键的 JSON', () => {
    const item = createTestItem(mod);
    item.data.identifier = 'pa:test_block';
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json).toHaveProperty('minecraft:block');
  });

  it('楼梯子类型应正确生成', () => {
    const item = createTestItem(mod, 'stair');
    item.data.identifier = 'pa:test_stair';
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('minecraft:block');
  });
});

describe('JSON 生成 - Entity', () => {
  const mod = allModules.find(m => m.id === 'entity')!;

  it('应生成包含 minecraft:entity 根键的 JSON', () => {
    const item = createTestItem(mod);
    item.data.identifier = 'pa:test_entity';
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json).toHaveProperty('minecraft:entity');
  });
});

describe('JSON 生成 - Biome', () => {
  const mod = allModules.find(m => m.id === 'biome')!;

  it('应生成包含 minecraft:biome 根键的 JSON', () => {
    const item = createTestItem(mod);
    item.data.identifier = 'pa:test_biome';
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    expect(json).toHaveProperty('minecraft:biome');
  });
});

describe('JSON 生成 - Recipe', () => {
  const mod = allModules.find(m => m.id === 'recipe')!;

  it('应生成配方 JSON', () => {
    const item = createTestItem(mod, 'shaped');
    item.data.identifier = 'pa:test_recipe';
    const json = generateItemJSON(mod, item);
    expect(json).toHaveProperty('format_version');
    // 配方可能使用 minecraft:recipe_shaped 或其他键
    const keys = Object.keys(json).filter(k => k.startsWith('minecraft:'));
    expect(keys.length).toBeGreaterThan(0);
  });
});

describe('createDefaultFormData', () => {
  it('应为所有字段创建默认值', () => {
    for (const mod of allModules) {
      const fields = mod.fields;
      const data = createDefaultFormData(fields);
      for (const field of fields) {
        expect(data).toHaveProperty(field.key);
      }
    }
  });

  it('应为子类型字段创建默认值', () => {
    for (const mod of allModules) {
      if (!mod.subTypes) continue;
      for (const sub of mod.subTypes) {
        const fields = sub.fields || mod.fields;
        const data = createDefaultFormData(fields);
        for (const field of fields) {
          expect(data).toHaveProperty(field.key);
        }
      }
    }
  });
});
