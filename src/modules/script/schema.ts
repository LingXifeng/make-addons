import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 脚本模块字段定义 =====
// JavaScript 脚本（Script API），用于自定义游戏逻辑

export const scriptFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '脚本名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'scriptType', label: '脚本类型', type: 'select', defaultValue: 'behavior', section: '基础信息', options: [
    { label: '行为包脚本', value: 'behavior' }, { label: '资源包脚本', value: 'resource' },
  ]},
  { key: 'apiVersion', label: 'API 版本', type: 'select', defaultValue: '1.16.0', section: '基础信息', options: [
    { label: '1.16.0', value: '1.16.0' }, { label: '1.17.0', value: '1.17.0' },
    { label: '1.18.0', value: '1.18.0' }, { label: '1.19.0', value: '1.19.0' },
    { label: '1.20.0', value: '1.20.0' }, { label: '1.21.0', value: '1.21.0' },
  ]},

  // --- 脚本内容 ---
  { key: 'scriptContent', label: '脚本代码', type: 'textarea', defaultValue: '// 在此编写 JavaScript 代码\nimport { world } from "@minecraft/server";\n\nworld.afterEvents.entitySpawn.subscribe((event) => {\n  console.log("Entity spawned:", event.entity.typeId);\n});', section: '脚本内容' },

  // --- 事件订阅 ---
  { key: 'subscribeOnLoad', label: '订阅世界加载', type: 'boolean', defaultValue: true, section: '事件订阅' },
  { key: 'subscribeEntitySpawn', label: '订阅实体生成', type: 'boolean', defaultValue: false, section: '事件订阅' },
  { key: 'subscribeEntityHit', label: '订阅实体受伤', type: 'boolean', defaultValue: false, section: '事件订阅' },
  { key: 'subscribeItemUse', label: '订阅物品使用', type: 'boolean', defaultValue: false, section: '事件订阅' },
  { key: 'subscribeChat', label: '订阅聊天消息', type: 'boolean', defaultValue: false, section: '事件订阅' },

  // --- 模块依赖 ---
  { key: 'useServerModule', label: '使用 @minecraft/server', type: 'boolean', defaultValue: true, section: '模块依赖' },
  { key: 'useServerUiModule', label: '使用 @minecraft/server-ui', type: 'boolean', defaultValue: false, section: '模块依赖' },

  // --- 高级 ---
  { key: 'description', label: '描述', type: 'textarea', defaultValue: '', section: '高级' },
];

export const scriptModule: ModuleDefinition = {
  id: 'script',
  name: '脚本',
  description: 'JavaScript 脚本（Script API）',
  icon: '📜',
  category: 'custom_functions',
  templateFile: '',
  iconDir: 'script',
  jsonRootKey: 'script',
  generatorType: 'script',
  fields: scriptFields,
};
