import { describe, it } from 'vitest';
import { allModules } from '../modules';
import { createDefaultFormData } from '../core/generator';
import { generateAddonFiles } from '../core/exporter';
import type { Project, ProjectItem } from '../core/types';

describe('verify', () => {
  it('script', () => {
    const m = allModules.find(m => m.id === 'weapon')!;
    const data = createDefaultFormData(m.fields);
    Object.assign(data, {
      identifier: 'fire_sword', displayName: '火焰剑', menuCategory: 'equipment',
      itemGroup: 'minecraft:itemGroup.name.sword', damage: 8, durability: 600,
      enchantableEnable: true, enchantable: 10, enchantableSlot: 'sword',
      rarity: 'uncommon', fireResistant: true, fireAspectEnable: true, fireAspectSeconds: 4,
      potionEffectsEnable: true,
      potionEffects: [{ effect: 'fire_resistance', duration: 13.2, amplifier: 3, visible: true }],
      repairableEnable: true, repairableItems: ['minecraft:torch'],
      canDestroyInCreative: true, stackedByData: true,
    });
    const item: ProjectItem = { id: 'test', moduleId: 'weapon', name: '火焰剑', data, createdAt: Date.now() };
    const project: Project = { id: 'test', name: '火焰剑', description: 'test', namespace: 'pa',
      items: { weapon: [item] }, createdAt: Date.now(), updatedAt: Date.now() } as any;
    const files = generateAddonFiles(project, allModules);
    const scriptFile = files.find(f => f.path.includes('effect_manager.js'));
    if (scriptFile) console.log(scriptFile.content);
  });
});
