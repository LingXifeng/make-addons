import type { ModuleDefinition } from '../core/types';
import { weaponModule } from './weapon/schema';
import { armorModule } from './armor/schema';
import { foodModule } from './food/schema';

export const allModules: ModuleDefinition[] = [
  weaponModule,
  armorModule,
  foodModule,
];

export function getModuleById(id: string): ModuleDefinition | undefined {
  return allModules.find(m => m.id === id);
}
