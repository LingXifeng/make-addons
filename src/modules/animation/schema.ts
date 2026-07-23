import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 动画模块字段定义 =====
// 实体/方块动画定义（.animation.json）

export const animationFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '动画名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '动画ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'animationType', label: '动画类型', type: 'select', defaultValue: 'entity', section: '基础信息', options: [
    { label: '实体动画', value: 'entity' }, { label: '方块动画', value: 'block' },
    { label: '物品动画', value: 'item' }, { label: 'UI 动画', value: 'ui' },
  ]},

  // --- 动画属性 ---
  { key: 'loop', label: '循环模式', type: 'select', defaultValue: 'false', section: '动画属性', options: [
    { label: '播放一次', value: 'false' }, { label: '循环播放', value: 'loop' }, { label: '保持最后帧', value: 'hold_on_last_frame' },
  ]},
  { key: 'animationLength', label: '动画时长（秒）', type: 'number', defaultValue: 1.0, min: 0.1, max: 60, step: 0.1, section: '动画属性' },
  { key: 'overridePreviousAnimation', label: '覆盖先前动画', type: 'boolean', defaultValue: false, section: '动画属性' },
  { key: 'animTimeUpdate', label: '动画时间更新', type: 'text', defaultValue: '', section: '动画属性', placeholder: '如 query.anim_time + query.delta_time' },

  // --- 骨骼动画 ---
  { key: 'boneName', label: '骨骼名称', type: 'text', defaultValue: 'root', section: '骨骼动画' },
  { key: 'rotationX', label: 'X轴旋转', type: 'text', defaultValue: '0', section: '骨骼动画', placeholder: '如 Math.cos(query.anim_time * 360) * 30' },
  { key: 'rotationY', label: 'Y轴旋转', type: 'text', defaultValue: '0', section: '骨骼动画' },
  { key: 'rotationZ', label: 'Z轴旋转', type: 'text', defaultValue: '0', section: '骨骼动画' },
  { key: 'positionX', label: 'X轴位移', type: 'text', defaultValue: '0', section: '骨骼动画' },
  { key: 'positionY', label: 'Y轴位移', type: 'text', defaultValue: '0', section: '骨骼动画' },
  { key: 'positionZ', label: 'Z轴位移', type: 'text', defaultValue: '0', section: '骨骼动画' },
  { key: 'scaleX', label: 'X轴缩放', type: 'text', defaultValue: '1', section: '骨骼动画' },
  { key: 'scaleY', label: 'Y轴缩放', type: 'text', defaultValue: '1', section: '骨骼动画' },
  { key: 'scaleZ', label: 'Z轴缩放', type: 'text', defaultValue: '1', section: '骨骼动画' },

  // --- 高级 ---
  { key: 'blendWeight', label: '混合权重', type: 'text', defaultValue: '1.0', section: '高级' },
  { key: 'startDelay', label: '开始延迟（秒）', type: 'number', defaultValue: 0, min: 0, max: 10, step: 0.1, section: '高级' },
];

export const animationModule: ModuleDefinition = {
  id: 'animation',
  name: '动画',
  description: '自定义实体/方块动画',
  icon: '🎬',
  category: 'custom_graphics',
  templateFile: '',
  iconDir: 'animation',
  jsonRootKey: 'animations',
  generatorType: 'animation',
  fields: animationFields,
};
