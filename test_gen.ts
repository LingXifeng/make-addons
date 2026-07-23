import { generateItemJSON } from './src/core/generator';
import { weaponModule } from './src/modules/weapon/schema';
import type { ModuleDefinition, ProjectItem } from './src/core/types';

const item: ProjectItem = {
  id: 'test',
  moduleId: 'weapon',
  name: '测试剑',
  data: {
    identifier: 'test_sword',
    displayName: '测试剑',
    damage: 8,
    durability: 600,
    handEquipped: true,
    maxStackSize: 1,
    menuCategory: 'equipment',
    enchantableEnable: true,
    enchantable: 10,
    enchantableSlot: 'sword',
    rarity: 'rare',
    fireResistantEnable: true,
    fireAspectEnable: true,
    fireAspectDuration: 4,
    potionEffectsEnable: true,
    potionEffects: [{ effect: 'fire_resistance', duration: 13, amplifier: 2 }],
  },
} as any;

const json = generateItemJSON(weaponModule as ModuleDefinition, item);
console.log(JSON.stringify(json, null, 2));
