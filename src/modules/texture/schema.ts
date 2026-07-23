import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 纹理模块字段定义 =====
// 纹理资源管理，定义物品/方块/实体的贴图映射

export const textureFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '纹理名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'textureKey', label: '纹理键名', type: 'text', defaultValue: 'my_texture', section: '基础信息' },
  { key: 'texturePath', label: '纹理文件路径', type: 'text', defaultValue: 'textures/items/my_texture', section: '基础信息' },

  // --- 纹理类型 ---
  { key: 'textureType', label: '纹理类型', type: 'select', defaultValue: 'item', section: '纹理类型', options: [
    { label: '物品贴图', value: 'item' }, { label: '方块贴图', value: 'block' },
    { label: '实体贴图', value: 'entity' }, { label: '粒子贴图', value: 'particle' },
    { label: 'UI 贴图', value: 'ui' },
  ]},

  // --- 帧动画 ---
  { key: 'isAnimated', label: '帧动画', type: 'boolean', defaultValue: false, section: '帧动画' },
  { key: 'frames', label: '帧序列', type: 'tags', defaultValue: [], section: '帧动画', showWhen: { field: 'isAnimated', value: true } },
  { key: 'frameTime', label: '每帧时长（刻）', type: 'number', defaultValue: 1, min: 1, max: 100, step: 1, section: '帧动画', showWhen: { field: 'isAnimated', value: true } },
  { key: 'interpolate', label: '插值过渡', type: 'boolean', defaultValue: false, section: '帧动画', showWhen: { field: 'isAnimated', value: true } },

  // --- 高级 ---
  { key: 'blur', label: '模糊过滤', type: 'boolean', defaultValue: false, section: '高级' },
  { key: 'clamp', label: '边缘钳制', type: 'boolean', defaultValue: false, section: '高级' },
];

export const textureModule: ModuleDefinition = {
  id: 'texture',
  name: '纹理',
  description: '自定义纹理贴图资源',
  icon: '🖼️',
  category: 'custom_graphics',
  templateFile: '',
  iconDir: 'texture',
  jsonRootKey: 'texture_data',
  generatorType: 'texture',
  fields: textureFields,
};
