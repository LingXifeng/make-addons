import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 粒子效果模块字段定义 =====
// 基于 MAM 粒子模板（8个预设：basic/flame/snowstorm/explosion/lightning/magic/portal/smoke）

export const particleFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '粒子名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '粒子ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'particlePreset', label: '预设类型', type: 'select', defaultValue: 'basic', section: '基础信息', options: [
    { label: '基础粒子', value: 'basic' }, { label: '火焰', value: 'flame' },
    { label: '暴风雪', value: 'snowstorm' }, { label: '爆炸', value: 'explosion' },
    { label: '闪电', value: 'lightning' }, { label: '魔法', value: 'magic' },
    { label: '传送门', value: 'portal' }, { label: '烟雾', value: 'smoke' },
  ]},

  // --- 渲染参数 ---
  { key: 'material', label: '材质', type: 'select', defaultValue: 'particles_alpha', section: '渲染参数', jsonPath: 'description.basic_render_parameters.material', options: [
    { label: '粒子透明', value: 'particles_alpha' }, { label: '粒子加色', value: 'particles_add' },
    { label: '粒子不透明', value: 'particles_opaque' }, { label: '粒子混合', value: 'particles_blend' },
  ]},
  { key: 'texture', label: '纹理路径', type: 'text', defaultValue: 'textures/particle/change_me', section: '渲染参数', jsonPath: 'description.basic_render_parameters.texture', hint: '相对于资源包的纹理路径' },

  // --- 发射器速率 ---
  { key: 'emitterRateType', label: '发射速率类型', type: 'select', defaultValue: 'instant', section: '发射器速率', options: [
    { label: '瞬间发射', value: 'instant' }, { label: '持续发射', value: 'steady' },
  ]},
  { key: 'numParticles', label: '粒子数量', type: 'number', defaultValue: 20, min: 1, max: 10000, step: 1, section: '发射器速率', showWhen: { field: 'emitterRateType', value: 'instant' } },
  { key: 'spawnRate', label: '发射速率(个/秒)', type: 'number', defaultValue: 10, min: 0.1, max: 1000, step: 0.1, section: '发射器速率', showWhen: { field: 'emitterRateType', value: 'steady' } },
  { key: 'maxParticles', label: '最大粒子数', type: 'number', defaultValue: 100, min: 1, max: 10000, step: 1, section: '发射器速率', showWhen: { field: 'emitterRateType', value: 'steady' } },

  // --- 发射器生命周期 ---
  { key: 'emitterLifetime', label: '生命周期', type: 'select', defaultValue: 'once', section: '发射器生命周期', options: [
    { label: '单次发射', value: 'once' }, { label: '循环发射', value: 'looping' },
  ]},
  { key: 'activeTime', label: '活跃时间(秒)', type: 'number', defaultValue: 1.0, min: 0.1, max: 999, step: 0.1, section: '发射器生命周期', showWhen: { field: 'emitterLifetime', value: 'looping' } },
  { key: 'sleepTime', label: '休眠时间(秒)', type: 'number', defaultValue: 0.0, min: 0, max: 999, step: 0.1, section: '发射器生命周期', showWhen: { field: 'emitterLifetime', value: 'looping' } },

  // --- 发射器形状 ---
  { key: 'emitterShape', label: '发射形状', type: 'select', defaultValue: 'sphere', section: '发射器形状', options: [
    { label: '球形', value: 'sphere' }, { label: '盒形', value: 'box' }, { label: '点', value: 'point' },
  ]},
  { key: 'sphereRadius', label: '球半径', type: 'number', defaultValue: 1.0, min: 0, max: 100, step: 0.1, section: '发射器形状', showWhen: { field: 'emitterShape', value: 'sphere' } },
  { key: 'sphereDirection', label: '方向', type: 'select', defaultValue: 'outwards', section: '发射器形状', showWhen: { field: 'emitterShape', value: 'sphere' }, options: [
    { label: '向外', value: 'outwards' }, { label: '向内', value: 'inwards' },
  ]},
  { key: 'boxHalfDimX', label: '盒半宽X', type: 'number', defaultValue: 1.0, min: 0, max: 100, step: 0.1, section: '发射器形状', showWhen: { field: 'emitterShape', value: 'box' } },
  { key: 'boxHalfDimY', label: '盒半宽Y', type: 'number', defaultValue: 1.0, min: 0, max: 100, step: 0.1, section: '发射器形状', showWhen: { field: 'emitterShape', value: 'box' } },
  { key: 'boxHalfDimZ', label: '盒半宽Z', type: 'number', defaultValue: 1.0, min: 0, max: 100, step: 0.1, section: '发射器形状', showWhen: { field: 'emitterShape', value: 'box' } },
  { key: 'boxDirection', label: '方向', type: 'select', defaultValue: 'outwards', section: '发射器形状', showWhen: { field: 'emitterShape', value: 'box' }, options: [
    { label: '向外', value: 'outwards' }, { label: '向内', value: 'inwards' },
  ]},

  // --- 粒子属性 ---
  { key: 'initialSpeed', label: '初始速度', type: 'number', defaultValue: 2.0, min: 0, max: 100, step: 0.1, section: '粒子属性' },
  { key: 'maxLifetime', label: '最大存活时间(秒)', type: 'number', defaultValue: 1.0, min: 0.1, max: 999, step: 0.1, section: '粒子属性' },
  { key: 'initialRotation', label: '初始旋转(度)', type: 'number', defaultValue: 0, min: 0, max: 360, step: 1, section: '粒子属性' },
  { key: 'rotationRate', label: '旋转速率(度/秒)', type: 'number', defaultValue: 90, min: -360, max: 360, step: 1, section: '粒子属性' },

  // --- 外观 ---
  { key: 'billboardSizeW', label: '面板宽度', type: 'number', defaultValue: 0.2, min: 0.01, max: 10, step: 0.01, section: '外观' },
  { key: 'billboardSizeH', label: '面板高度', type: 'number', defaultValue: 0.2, min: 0.01, max: 10, step: 0.01, section: '外观' },
  { key: 'facingCameraMode', label: '朝向相机模式', type: 'select', defaultValue: 'rotate_xyz', section: '外观', options: [
    { label: '旋转XYZ', value: 'rotate_xyz' }, { label: '面向相机', value: 'face_camera' },
    { label: '面向相机Y轴', value: 'face_camera_y' }, { label: '方向', value: 'direction' },
  ]},

  // --- 颜色 ---
  { key: 'colorR', label: '红色', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.01, section: '颜色' },
  { key: 'colorG', label: '绿色', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.01, section: '颜色' },
  { key: 'colorB', label: '蓝色', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.01, section: '颜色' },
  { key: 'colorA', label: '透明度', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.01, section: '颜色' },

  // --- 动态运动 ---
  { key: 'motionDynamicEnable', label: '启用动态运动', type: 'boolean', defaultValue: false, section: '动态运动' },
  { key: 'linearAccelX', label: '线性加速度X', type: 'number', defaultValue: 0, min: -100, max: 100, step: 0.1, section: '动态运动', showWhen: { field: 'motionDynamicEnable', value: true } },
  { key: 'linearAccelY', label: '线性加速度Y', type: 'number', defaultValue: -9.8, min: -100, max: 100, step: 0.1, section: '动态运动', showWhen: { field: 'motionDynamicEnable', value: true }, hint: '负值=向下重力' },
  { key: 'linearAccelZ', label: '线性加速度Z', type: 'number', defaultValue: 0, min: -100, max: 100, step: 0.1, section: '动态运动', showWhen: { field: 'motionDynamicEnable', value: true } },
  { key: 'linearDragCoeff', label: '线性阻力系数', type: 'number', defaultValue: 0.01, min: 0, max: 10, step: 0.01, section: '动态运动', showWhen: { field: 'motionDynamicEnable', value: true } },
];

// ===== 粒子效果模块定义 =====

export const particleModule: ModuleDefinition = {
  id: 'particle',
  name: '粒子效果',
  icon: '✨',
  category: 'custom_environment',
  templateFile: 'templates/projectile.json',
  iconDir: 'particle',
  jsonRootKey: 'minecraft:particle_effect',
  generatorType: 'particle',
  fields: particleFields,
  subTypes: [
    { id: 'basic', name: '基础粒子', templateFile: 'templates/projectile.json' },
    { id: 'flame', name: '火焰', templateFile: 'templates/projectile.json' },
    { id: 'snowstorm', name: '暴风雪', templateFile: 'templates/projectile.json' },
    { id: 'explosion', name: '爆炸', templateFile: 'templates/projectile.json' },
    { id: 'lightning', name: '闪电', templateFile: 'templates/projectile.json' },
    { id: 'magic', name: '魔法', templateFile: 'templates/projectile.json' },
    { id: 'portal', name: '传送门', templateFile: 'templates/projectile.json' },
    { id: 'smoke', name: '烟雾', templateFile: 'templates/projectile.json' },
  ],
};
