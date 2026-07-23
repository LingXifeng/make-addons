import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 函数模块字段定义 =====
// MCfunction 命令脚本，用于创建自定义命令函数

export const functionFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '函数名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '函数ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'namespace', label: '命名空间', type: 'text', defaultValue: 'pa', section: '基础信息' },

  // --- 命令内容 ---
  { key: 'commands', label: '命令列表', type: 'textarea', defaultValue: 'say Hello World!', section: '命令内容', placeholder: '每行一条命令' },
  { key: 'tickEnabled', label: '每刻执行', type: 'boolean', defaultValue: false, section: '命令内容' },
  { key: 'loadEnabled', label: '加载时执行', type: 'boolean', defaultValue: false, section: '命令内容' },

  // --- 高级 ---
  { key: 'description', label: '描述', type: 'textarea', defaultValue: '', section: '高级' },
];

export const functionModule: ModuleDefinition = {
  id: 'function',
  name: '函数',
  description: '自定义 MCfunction 命令函数',
  icon: '⚙️',
  category: 'custom_functions',
  templateFile: '',
  iconDir: 'function',
  jsonRootKey: 'minecraft:function',
  generatorType: 'function',
  fields: functionFields,
};
