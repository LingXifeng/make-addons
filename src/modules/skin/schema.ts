import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 皮肤模块字段定义 =====
// 实体几何体/皮肤定义（entity .geometry.json）

export const skinFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '皮肤名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '几何体ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'textureWidth', label: '纹理宽度', type: 'number', defaultValue: 64, min: 1, max: 1024, step: 1, section: '基础信息' },
  { key: 'textureHeight', label: '纹理高度', type: 'number', defaultValue: 64, min: 1, max: 1024, step: 1, section: '基础信息' },
  { key: 'visibleBoundsWidth', label: '可见边界宽', type: 'number', defaultValue: 2, min: 0, max: 100, step: 1, section: '基础信息' },
  { key: 'visibleBoundsHeight', label: '可见边界高', type: 'number', defaultValue: 2, min: 0, max: 100, step: 1, section: '基础信息' },
  { key: 'visibleBoundsOffset', label: '可见边界偏移', type: 'text', defaultValue: '[0, 0, 0]', section: '基础信息' },

  // --- 骨骼结构 ---
  { key: 'rootBoneName', label: '根骨骼名称', type: 'text', defaultValue: 'root', section: '骨骼结构' },
  { key: 'parentBone', label: '父骨骼', type: 'text', defaultValue: '', section: '骨骼结构', placeholder: '留空表示根骨骼' },
  { key: 'pivotX', label: '轴心 X', type: 'number', defaultValue: 0, step: 0.5, section: '骨骼结构' },
  { key: 'pivotY', label: '轴心 Y', type: 'number', defaultValue: 0, step: 0.5, section: '骨骼结构' },
  { key: 'pivotZ', label: '轴心 Z', type: 'number', defaultValue: 0, step: 0.5, section: '骨骼结构' },
  { key: 'rotationX', label: '默认旋转 X', type: 'number', defaultValue: 0, step: 1, section: '骨骼结构' },
  { key: 'rotationY', label: '默认旋转 Y', type: 'number', defaultValue: 0, step: 1, section: '骨骼结构' },
  { key: 'rotationZ', label: '默认旋转 Z', type: 'number', defaultValue: 0, step: 1, section: '骨骼结构' },

  // --- 立方体 ---
  { key: 'cubeOriginX', label: '原点 X', type: 'number', defaultValue: 0, step: 0.5, section: '立方体' },
  { key: 'cubeOriginY', label: '原点 Y', type: 'number', defaultValue: 0, step: 0.5, section: '立方体' },
  { key: 'cubeOriginZ', label: '原点 Z', type: 'number', defaultValue: 0, step: 0.5, section: '立方体' },
  { key: 'cubeSizeX', label: '尺寸 X', type: 'number', defaultValue: 1, min: 1, max: 100, step: 1, section: '立方体' },
  { key: 'cubeSizeY', label: '尺寸 Y', type: 'number', defaultValue: 1, min: 1, max: 100, step: 1, section: '立方体' },
  { key: 'cubeSizeZ', label: '尺寸 Z', type: 'number', defaultValue: 1, min: 1, max: 100, step: 1, section: '立方体' },
  { key: 'uvX', label: 'UV X', type: 'number', defaultValue: 0, min: 0, step: 1, section: '立方体' },
  { key: 'uvY', label: 'UV Y', type: 'number', defaultValue: 0, min: 0, step: 1, section: '立方体' },
  { key: 'mirrorUV', label: '镜像 UV', type: 'boolean', defaultValue: false, section: '立方体' },
  { key: 'inflate', label: '膨胀值', type: 'number', defaultValue: 0, step: 0.1, section: '立方体' },

  // --- 高级 ---
  { key: 'formatVersion', label: '格式版本', type: 'text', defaultValue: '1.21.100', section: '高级' },
];

export const skinModule: ModuleDefinition = {
  id: 'skin',
  name: '皮肤',
  description: '自定义实体几何体/皮肤',
  icon: '🧍',
  category: 'custom_graphics',
  templateFile: '',
  iconDir: 'skin',
  jsonRootKey: 'minecraft:geometry',
  generatorType: 'skin',
  fields: skinFields,
};
