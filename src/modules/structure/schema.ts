import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 结构模块字段定义 =====
// .mcstructure 结构文件，用于保存和加载建筑结构

export const structureFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '结构名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '结构ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'namespace', label: '命名空间', type: 'text', defaultValue: 'pa', section: '基础信息' },

  // --- 结构尺寸 ---
  { key: 'sizeX', label: 'X 方向尺寸', type: 'number', defaultValue: 5, min: 1, max: 64, step: 1, section: '结构尺寸' },
  { key: 'sizeY', label: 'Y 方向尺寸', type: 'number', defaultValue: 5, min: 1, max: 64, step: 1, section: '结构尺寸' },
  { key: 'sizeZ', label: 'Z 方向尺寸', type: 'number', defaultValue: 5, min: 1, max: 64, step: 1, section: '结构尺寸' },

  // --- 生成设置 ---
  { key: 'ignoreBlocks', label: '忽略方块', type: 'boolean', defaultValue: false, section: '生成设置' },
  { key: 'ignoreEntities', label: '忽略实体', type: 'boolean', defaultValue: true, section: '生成设置' },
  { key: 'ignoreWater', label: '忽略水', type: 'boolean', defaultValue: false, section: '生成设置' },
  { key: 'ignoreAir', label: '忽略空气', type: 'boolean', defaultValue: false, section: '生成设置' },
  { key: 'includeWater', label: '包含水', type: 'boolean', defaultValue: true, section: '生成设置' },

  // --- 旋转与镜像 ---
  { key: 'rotation', label: '旋转', type: 'select', defaultValue: 'none', section: '旋转与镜像', options: [
    { label: '无旋转', value: 'none' }, { label: '90°', value: '90' },
    { label: '180°', value: '180' }, { label: '270°', value: '270' },
  ]},
  { key: 'mirror', label: '镜像', type: 'select', defaultValue: 'none', section: '旋转与镜像', options: [
    { label: '无镜像', value: 'none' }, { label: 'X 轴', value: 'x' },
    { label: 'Z 轴', value: 'z' }, { label: 'XZ 轴', value: 'xz' },
  ]},

  // --- 高级 ---
  { key: 'paletteMode', label: '调色板模式', type: 'select', defaultValue: 'linear', section: '高级', options: [
    { label: '线性', value: 'linear' }, { label: '块状', value: 'block' },
  ]},
  { key: 'description', label: '描述', type: 'textarea', defaultValue: '', section: '高级' },
];

export const structureModule: ModuleDefinition = {
  id: 'structure',
  name: '结构',
  description: '自定义建筑结构文件',
  icon: '🏛️',
  category: 'custom_functions',
  templateFile: '',
  iconDir: 'structure',
  jsonRootKey: 'structure',
  generatorType: 'structure',
  fields: structureFields,
};
