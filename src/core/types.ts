// 核心类型系统

// ===== 字段 Schema 类型 =====

export type FieldType =
  | 'text'        // 文本输入
  | 'number'      // 数字输入
  | 'boolean'     // 开关
  | 'select'      // 下拉选择
  | 'icon'        // 图标选择器
  | 'texture'     // 纹理上传
  | 'blockList'   // 方块多选
  | 'itemList'    // 物品多选
  | 'repairItems' // 可修复物品列表
  | 'potionEffects' // 药水效果列表
  | 'stringList'  // 字符串列表（标签等）
  | 'recipePattern' // 配方图案网格
  | 'recipeItems'   // 配方物品映射
  | 'color'       // 颜色选择器
  | 'section';    // 分组标题

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  defaultValue: any;
  // JSON 路径，如 "components.minecraft:damage" 或 "description.identifier"
  jsonPath?: string;
  // 对于 select 类型
  options?: SelectOption[];
  // 对于 number 类型
  min?: number;
  max?: number;
  step?: number;
  // 分组
  section?: string;
  // 条件显示：依赖另一个字段的值
  showWhen?: { field: string; value: any };
  // 提示文本
  hint?: string;
  // 是否需要特殊处理
  specialHandler?: string;
  // 图标目录
  iconDir?: string;
}

// ===== 模块定义 =====

// 模块类别（对应 HomeCategory）
export type ModuleCategory =
  | 'custom_items'       // 自定义物品
  | 'custom_entities'    // 自定义实体
  | 'custom_environment' // 自定义环境
  | 'custom_recipes';    // 自定义配方

// JSON 根键类型
export type JsonRootKey =
  | 'minecraft:item'
  | 'minecraft:block'
  | 'minecraft:entity'
  | 'minecraft:biome'
  | 'minecraft:recipe_shaped'
  | 'minecraft:recipe_shapeless'
  | 'minecraft:recipe_furnace'
  | 'minecraft:particle_effect'
  | 'minecraft:spawn_rules';

// 生成器类型
export type GeneratorType =
  | 'weapon' | 'armor' | 'food' | 'shield' | 'bow' | 'crossbow' | 'arrow' | 'mace'
  | 'tool' | 'normal'
  | 'block' | 'block_model' | 'block_slab' | 'block_stair' | 'block_fence' | 'block_wall'
  | 'block_door' | 'block_trapdoor' | 'block_fence_gate' | 'block_crop' | 'block_sapling'
  | 'block_layer' | 'block_transparent' | 'block_fluid'
  | 'entity' | 'biome'
  | 'recipe_shaped' | 'recipe_shapeless' | 'recipe_furnace'
  | 'particle' | 'projectile' | 'spawn_rule'
  | 'music_disc' | 'bundle' | 'recall_item' | 'soul_stone';

export interface SubType {
  id: string;
  name: string;
  templateFile: string;
  fields?: FieldSchema[];
}

export interface ModuleDefinition {
  id: string;
  name: string;          // 中文名
  icon: string;          // 模块图标 emoji
  category: ModuleCategory;
  templateFile: string;  // 模板文件路径 (相对于 public/assets/)
  iconDir: string;       // 图标目录
  fields: FieldSchema[]; // 字段定义
  jsonRootKey: JsonRootKey; // JSON 根键
  generatorType: GeneratorType;
  // 子类型
  subTypes?: SubType[];
}

// ===== 项目状态 =====

export interface ProjectItem {
  id: string;
  moduleId: string;
  subTypeId?: string;
  name: string;
  data: Record<string, any>;
  customTexture?: {
    name: string;
    dataUrl: string;
  };
  createdAt: number;
}

export interface Project {
  name: string;
  description: string;
  namespace: string;
  items: Record<string, ProjectItem[]>; // keyed by module id
  // UUIDs for manifests (generated on first export)
  headerUUID?: string;
  moduleUUID?: string;
  resourceHeaderUUID?: string;
  resourceModuleUUID?: string;
}

// ===== 导出相关 =====

export interface ExportFile {
  path: string;
  content: string | Uint8Array;
}

export interface AddonStructure {
  behaviorPack: ExportFile[];
  resourcePack: ExportFile[];
}
