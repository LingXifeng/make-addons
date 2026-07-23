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

export interface ModuleDefinition {
  id: string;
  name: string;          // 中文名
  icon: string;          // 模块图标 emoji 或路径
  templateFile: string;  // 模板文件路径 (相对于 public/assets/)
  iconDir: string;       // 图标目录 (相对于 public/assets/icons/)
  fields: FieldSchema[]; // 字段定义
  // 子类型（如 Armor 有4件套）
  subTypes?: { id: string; name: string; templateFile: string; fields?: FieldSchema[] }[];
  // 生成器函数名
  generatorType: 'weapon' | 'armor' | 'food' | 'shield' | 'bow' | 'crossbow' | 'arrow' | 'mace';
}

// ===== 项目状态 =====

export interface ProjectItem {
  id: string;            // 唯一ID
  moduleId: string;      // 模块ID
  subTypeId?: string;    // 子类型ID
  name: string;          // 用户给物品起的名字
  data: Record<string, any>; // 表单数据
  customTexture?: {      // 自定义上传的纹理
    name: string;
    dataUrl: string;     // base64 data URL
  };
  createdAt: number;
}

export interface Project {
  name: string;
  description: string;
  namespace: string;     // 默认命名空间
  items: ProjectItem[];
}

// ===== 导出相关 =====

export interface ExportFile {
  path: string;          // 相对于包根目录的路径
  content: string | Uint8Array;
}

export interface AddonStructure {
  behaviorPack: ExportFile[];
  resourcePack: ExportFile[];
}
