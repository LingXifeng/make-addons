import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 着色器模块字段定义 =====
// 自定义着色器（Render Dragon material / shader）

export const shaderFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '着色器名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '材质ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'shaderType', label: '着色器类型', type: 'select', defaultValue: 'material', section: '基础信息', options: [
    { label: '材质文件', value: 'material' }, { label: '片段着色器', value: 'fragment' },
    { label: '顶点着色器', value: 'vertex' }, { label: '几何着色器', value: 'geometry' },
  ]},

  // --- 渲染属性 ---
  { key: 'renderMethod', label: '渲染方法', type: 'select', defaultValue: 'alpha_blend', section: '渲染属性', options: [
    { label: '不透明', value: 'opaque' }, { label: 'Alpha 混合', value: 'alpha_blend' },
    { label: 'Alpha 测试', value: 'alpha_test' }, { label: 'Alpha 测试单面', value: 'alpha_test_single_sided' },
    { label: 'Alpha 混合单面', value: 'alpha_blend_single_sided' }, { label: '双面', value: 'double_sided' },
  ]},
  { key: 'faceCulling', label: '面剔除', type: 'select', defaultValue: 'back', section: '渲染属性', options: [
    { label: '剔除背面', value: 'back' }, { label: '剔除前面', value: 'front' }, { label: '不剔除', value: 'none' },
  ]},
  { key: 'depthBias', label: '深度偏移', type: 'number', defaultValue: 0, step: 0.001, section: '渲染属性' },
  { key: 'slopeScaledDepthBias', label: '斜率深度偏移', type: 'number', defaultValue: 0, step: 0.001, section: '渲染属性' },

  // --- 纹理采样 ---
  { key: 'textureSamplerName', label: '纹理采样器名', type: 'text', defaultValue: 'tDiffuse', section: '纹理采样' },
  { key: 'useNormalMap', label: '使用法线贴图', type: 'boolean', defaultValue: false, section: '纹理采样' },
  { key: 'useEmissiveMap', label: '使用发光贴图', type: 'boolean', defaultValue: false, section: '纹理采样' },
  { key: 'useMetallicMap', label: '使用金属贴图', type: 'boolean', defaultValue: false, section: '纹理采样' },
  { key: 'useRoughnessMap', label: '使用粗糙度贴图', type: 'boolean', defaultValue: false, section: '纹理采样' },

  // --- 颜色混合 ---
  { key: 'useColorBlend', label: '颜色混合', type: 'boolean', defaultValue: false, section: '颜色混合' },
  { key: 'blendSrcColor', label: '源颜色因子', type: 'select', defaultValue: 'one', section: '颜色混合', showWhen: { field: 'useColorBlend', value: true }, options: [
    { label: 'One', value: 'one' }, { label: 'Zero', value: 'zero' },
    { label: 'Src Alpha', value: 'src_alpha' }, { label: 'One - Src Alpha', value: 'one_minus_src_alpha' },
  ]},
  { key: 'blendDstColor', label: '目标颜色因子', type: 'select', defaultValue: 'one_minus_src_alpha', section: '颜色混合', showWhen: { field: 'useColorBlend', value: true }, options: [
    { label: 'One', value: 'one' }, { label: 'Zero', value: 'zero' },
    { label: 'Src Alpha', value: 'src_alpha' }, { label: 'One - Src Alpha', value: 'one_minus_src_alpha' },
  ]},

  // --- 着色器代码 ---
  { key: 'fragmentShader', label: '片段着色器代码', type: 'textarea', defaultValue: '// GLSL 片段着色器代码\nvoid main() {\n  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n}', section: '着色器代码' },
  { key: 'vertexShader', label: '顶点着色器代码', type: 'textarea', defaultValue: '// GLSL 顶点着色器代码\nvoid main() {\n  gl_Position = vec4(position, 1.0);\n}', section: '着色器代码' },

  // --- 高级 ---
  { key: 'useFog', label: '启用雾效', type: 'boolean', defaultValue: true, section: '高级' },
  { key: 'useLighting', label: '启用光照', type: 'boolean', defaultValue: true, section: '高级' },
  { key: 'useToneMapping', label: '色调映射', type: 'boolean', defaultValue: true, section: '高级' },
  { key: 'useBloom', label: '泛光效果', type: 'boolean', defaultValue: false, section: '高级' },
];

export const shaderModule: ModuleDefinition = {
  id: 'shader',
  name: '着色器',
  description: '自定义 Render Dragon 着色器',
  icon: '🎨',
  category: 'custom_graphics',
  templateFile: '',
  iconDir: 'shader',
  jsonRootKey: 'material',
  generatorType: 'shader',
  fields: shaderFields,
};
