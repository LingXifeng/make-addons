import type { FieldSchema, ModuleDefinition, ProjectItem } from './types';

// ===== 深层路径设置/获取 =====

export function setByPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
}

export function getByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

export function deleteByPath(obj: any, path: string): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) return;
    current = current[parts[i]];
  }
  delete current[parts[parts.length - 1]];
}

// ===== 从 schema 生成默认表单数据 =====

export function createDefaultFormData(fields: FieldSchema[]): Record<string, any> {
  const data: Record<string, any> = {};
  for (const field of fields) {
    if (field.type === 'section') continue;
    data[field.key] = JSON.parse(JSON.stringify(field.defaultValue));
  }
  return data;
}

// ===== 检查字段是否应该显示 =====

export function shouldShowField(field: FieldSchema, data: Record<string, any>): boolean {
  if (!field.showWhen) return true;
  const depValue = data[field.showWhen.field];
  if (field.showWhen.value === 'nonempty') {
    return Array.isArray(depValue) ? depValue.length > 0 : !!depValue;
  }
  return depValue === field.showWhen.value;
}

// ===== 核心：从表单数据 + 模板生成 item JSON =====

export async function generateItemJson(
  module: ModuleDefinition,
  item: ProjectItem,
  subTypeId?: string,
): Promise<any> {
  // 确定子类型和字段
  const subType = subTypeId ? module.subTypes?.find(s => s.id === subTypeId) : undefined;
  const templateFile = subType?.templateFile || module.templateFile;
  const fields = subType?.fields || module.fields;

  // 加载模板
  const response = await fetch(`/assets/${templateFile}`);
  const template = await response.json();

  // 深拷贝模板
  const result = JSON.parse(JSON.stringify(template));
  const itemDef = result['minecraft:item'];
  const components = itemDef.components || (itemDef.components = {});

  const data = item.data;
  const namespace = 'pa'; // 默认命名空间
  const identifier = `${namespace}:${data.identifier || 'change_me'}`;

  // 设置 identifier
  setByPath(result, 'minecraft:item.description.identifier', identifier);

  // 设置 display_name
  if (data.displayName) {
    components['minecraft:display_name'] = { value: `item.add:${namespace}_${data.identifier}.name` };
  }

  // 设置 icon
  if (data.icon) {
    components['minecraft:icon'] = data.icon;
  }

  // 处理每个字段
  for (const field of fields) {
    if (field.type === 'section' || field.type === 'icon') continue;
    if (!field.jsonPath) continue;
    if (!shouldShowField(field, data)) {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    const value = data[field.key];
    if (value === undefined || value === null) continue;

    // 跳过空字符串（除非有特殊处理）
    if (value === '' && field.type === 'text') {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    // 特殊处理
    if (field.key === 'repairableItems' && data.repairableEnable) {
      if (Array.isArray(value) && value.length > 0) {
        components['minecraft:repairable'] = {
          repair_items: value.map((r: any) => ({
            items: r.items,
            repair_amount: r.repairAmount,
          })),
        };
      }
      continue;
    }

    if (field.key === 'canDestroy' && Array.isArray(value) && value.length > 0) {
      components['minecraft:can_destroy'] = { blocks: value };
      if (data.canDestroyInCreative !== undefined) {
        components['minecraft:can_destroy_in_creative'] = data.canDestroyInCreative;
      }
      continue;
    }

    if (field.key === 'cooldown' && data.cooldownEnable) {
      components['minecraft:cooldown'] = {
        category: data.cooldownType || 'attack',
        duration: value,
      };
      continue;
    }

    if (field.key === 'useAnimation' && value === '') {
      deleteByPath(result, field.jsonPath);
      continue;
    }

    // 普通字段直接设置
    setByPath(result, field.jsonPath, value);
  }

  // 清理：移除空值组件
  cleanupEmpty(result);

  return result;
}

// ===== 清理空值 =====

function cleanupEmpty(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    if (obj[key] === '' || obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      cleanupEmpty(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// ===== 生成辅助文件 =====

export function generateItemTextureEntry(item: ProjectItem, namespace = 'pa'): { textureName: string; texturePath: string } {
  const id = item.data.identifier || 'change_me';
  const textureName = item.data.icon || `${namespace}_${id}`;
  return {
    textureName,
    texturePath: `textures/items/${textureName}`,
  };
}

export function generateLangEntry(item: ProjectItem, namespace = 'pa'): string {
  const id = item.data.identifier || 'change_me';
  const name = item.data.displayName || id;
  return `item.add:${namespace}_${id}.name=${name}`;
}
