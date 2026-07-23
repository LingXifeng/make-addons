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
import { particleModule } from './particle/schema';
import { projectileModule } from './projectile/schema';
import { spawnRuleModule } from './spawn_rule/schema';
import { bowModule } from './bow/schema';
import { crossbowModule } from './crossbow/schema';
import { shieldModule } from './shield/schema';
import { maceModule } from './mace/schema';
import { arrowModule } from './arrow/schema';
import { musicDiscModule } from './music_disc/schema';
import { bundleModule } from './bundle/schema';
import { recallItemModule } from './recall_item/schema';
import { soulStoneModule } from './soul_stone/schema';

// ===== 所有模块注册表 =====

export const allModules: ModuleDefinition[] = [
  weaponModule,
  armorModule,
  foodModule,
  toolModule,
  normalModule,
  blockModule,
  bowModule,
  crossbowModule,
  shieldModule,
  maceModule,
  arrowModule,
  musicDiscModule,
  bundleModule,
  recallItemModule,
  soulStoneModule,
  entityModule,
  projectileModule,
  biomeModule,
  spawnRuleModule,
  recipeModule,
  particleModule,
];

// 按类别分组
export const modulesByCategory: Record<string, ModuleDefinition[]> = {
  custom_items: [
    weaponModule,
    armorModule,
    foodModule,
    toolModule,
    normalModule,
    blockModule,
    bowModule,
    crossbowModule,
    shieldModule,
    maceModule,
    arrowModule,
    musicDiscModule,
    bundleModule,
    recallItemModule,
    soulStoneModule,
  ],
  custom_entities: [entityModule, projectileModule],
  custom_environment: [biomeModule, spawnRuleModule],
  custom_recipes: [recipeModule],
  custom_particles: [particleModule],
};

// 类别中文名
export const categoryNames: Record<string, string> = {
  custom_items: '自定义物品',
  custom_entities: '自定义实体',
  custom_environment: '自定义环境',
  custom_recipes: '自定义配方',
  custom_particles: '自定义粒子',
};

// 类别图标
export const categoryIcons: Record<string, string> = {
  custom_items: '📦',
  custom_entities: '🐾',
  custom_environment: '🌍',
  custom_recipes: '📖',
  custom_particles: '✨',
};

// 根据 ID 获取模块
export function getModuleById(id: string): ModuleDefinition | undefined {
  return allModules.find((m) => m.id === id);
}
