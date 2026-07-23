import type { ModuleDefinition } from '../core/types';
import { weaponModule } from './weapon/schema';
import { armorModule } from './armor/schema';
import { foodModule } from './food/schema';
import { blockModule } from './block/schema';
import { entityModule } from './entity/schema';
import { biomeModule } from './biome/schema';
import { recipeModule } from './recipe/schema';
import { toolModule } from './tool/schema';
import { normalModule } from './normal/schema';

// ===== 所有模块注册表 =====

export const allModules: ModuleDefinition[] = [
  weaponModule,
  armorModule,
  foodModule,
  toolModule,
  normalModule,
  blockModule,
  entityModule,
  biomeModule,
  recipeModule,
];

// 按类别分组
export const modulesByCategory: Record<string, ModuleDefinition[]> = {
  custom_items: [weaponModule, armorModule, foodModule, toolModule, normalModule, blockModule],
  custom_entities: [entityModule],
  custom_environment: [biomeModule],
  custom_recipes: [recipeModule],
};

// 类别中文名
export const categoryNames: Record<string, string> = {
  custom_items: '自定义物品',
  custom_entities: '自定义实体',
  custom_environment: '自定义环境',
  custom_recipes: '自定义配方',
};

// 类别图标
export const categoryIcons: Record<string, string> = {
  custom_items: '📦',
  custom_entities: '🐾',
  custom_environment: '🌍',
  custom_recipes: '📖',
};

// 根据 ID 获取模块
export function getModuleById(id: string): ModuleDefinition | undefined {
  return allModules.find((m) => m.id === id);
}
