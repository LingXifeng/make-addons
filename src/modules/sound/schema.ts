import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 声音模块字段定义 =====
// 自定义声音定义（sound_definitions.json）

export const soundFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '声音名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '声音ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'soundCategory', label: '声音类别', type: 'select', defaultValue: 'neutral', section: '基础信息', options: [
    { label: '中立', value: 'neutral' }, { label: '方块', value: 'block' },
    { label: '天气', value: 'weather' }, { label: '生物', value: 'mob' },
    { label: '玩家', value: 'player' }, { label: '音乐', value: 'music' },
    { label: '记录', value: 'record' }, { label: '主', value: 'master' },
  ]},

  // --- 声音文件 ---
  { key: 'soundPath', label: '声音文件路径', type: 'text', defaultValue: 'sounds/custom/change_me', section: '声音文件', placeholder: '不含扩展名' },
  { key: 'volume', label: '音量', type: 'number', defaultValue: 1.0, min: 0, max: 10, step: 0.1, section: '声音文件' },
  { key: 'pitch', label: '音调', type: 'number', defaultValue: 1.0, min: 0.1, max: 10, step: 0.1, section: '声音文件' },
  { key: 'minDistance', label: '最小距离', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1, section: '声音文件' },
  { key: 'maxDistance', label: '最大距离', type: 'number', defaultValue: 16, min: 1, max: 1000, step: 1, section: '声音文件' },

  // --- 多声音变体 ---
  { key: 'useMultipleSounds', label: '多声音变体', type: 'boolean', defaultValue: false, section: '声音变体' },
  { key: 'soundVariants', label: '变体列表', type: 'tags', defaultValue: [], section: '声音变体', showWhen: { field: 'useMultipleSounds', value: true }, placeholder: '每项一个声音文件路径' },
  { key: 'equalWeight', label: '等权重随机', type: 'boolean', defaultValue: true, section: '声音变体', showWhen: { field: 'useMultipleSounds', value: true } },

  // --- 高级 ---
  { key: 'stream', label: '流式播放', type: 'boolean', defaultValue: false, section: '高级' },
  { key: 'loop', label: '循环播放', type: 'boolean', defaultValue: false, section: '高级' },
  { key: 'is3D', label: '3D 空间音效', type: 'boolean', defaultValue: true, section: '高级' },
  { key: 'useVariance', label: '随机变化', type: 'boolean', defaultValue: false, section: '高级' },
  { key: 'volumeVariance', label: '音量变化', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1, section: '高级', showWhen: { field: 'useVariance', value: true } },
  { key: 'pitchVariance', label: '音调变化', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1, section: '高级', showWhen: { field: 'useVariance', value: true } },
];

export const soundModule: ModuleDefinition = {
  id: 'sound',
  name: '声音',
  description: '自定义声音资源',
  icon: '🔊',
  category: 'custom_graphics',
  templateFile: '',
  iconDir: 'sound',
  jsonRootKey: 'sound_definitions',
  generatorType: 'sound',
  fields: soundFields,
};
