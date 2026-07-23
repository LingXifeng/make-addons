import JSZip from 'jszip';
import type { ProjectItem } from './types';
import { generateItemJson, generateItemTextureEntry, generateLangEntry } from './generator';
import { getModuleById } from '../modules';

// ===== 生成完整 Addon 结构 =====

export async function generateAddon(project: { name: string; namespace: string; items: ProjectItem[] }): Promise<{ zip: JSZip; fileCount: number }> {
  const zip = new JSZip();
  let fileCount = 0;
  const namespace = project.namespace || 'pa';

  // 生成匹配的 UUID 对
  const bpUuid = uuid();
  const rpUuid = uuid();

  // === Behavior Pack ===
  const bp = zip.folder('behavior_pack')!;
  const bpManifest = createBehaviorManifest(project.name, namespace, bpUuid, rpUuid);
  bp.file('manifest.json', JSON.stringify(bpManifest, null, 2));
  fileCount++;

  const bpItems = bp.folder('items')!;

  // === Resource Pack ===
  const rp = zip.folder('resource_pack')!;
  const rpManifest = createResourceManifest(project.name, namespace, rpUuid, bpUuid);
  rp.file('manifest.json', JSON.stringify(rpManifest, null, 2));
  fileCount++;

  const rpTextures = rp.folder('textures')!.folder('items')!;
  const rpLang = rp.folder('texts')!;

  // 收集纹理和语言条目
  const textureData: Record<string, { textures: string }> = {};
  const langEntries: string[] = [];

  // 加载图标清单
  let iconManifest: Record<string, string[]> = {};
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}assets/icon_manifest.json`);
    iconManifest = await response.json();
  } catch (e) {
    // 清单加载失败，继续处理
  }

  // 查找图标路径
  function findIconPath(iconDir: string, iconName: string): string | null {
    for (const [dir, names] of Object.entries(iconManifest)) {
      if ((dir === iconDir || dir.startsWith(iconDir + '/')) && names.includes(iconName)) {
        return `icons/${dir}/${iconName}.png`;
      }
    }
    return null;
  }

  // 处理每个物品
  for (const item of project.items) {
    const module = getModuleById(item.moduleId);
    if (!module) continue;

    // 生成 item JSON
    const itemJson = await generateItemJson(module, item, item.subTypeId);
    const id = item.data.identifier || 'change_me';
    const fileName = `${namespace}_${id}.json`;

    // 写入 behavior pack
    bpItems.file(fileName, JSON.stringify(itemJson, null, 2));
    fileCount++;

    // 纹理注册
    const { textureName, texturePath } = generateItemTextureEntry(item, namespace);
    textureData[textureName] = { textures: texturePath };

    // 语言条目
    langEntries.push(generateLangEntry(item, namespace));

    // 自定义纹理
    if (item.customTexture) {
      const base64Data = item.customTexture.dataUrl.split(',')[1];
      rpTextures.file(`${textureName}.png`, base64Data, { base64: true });
      fileCount++;
    } else {
      // 从 public/assets/icons/ 复制预设图标
      const iconDir = module.iconDir;
      const iconName = item.data.icon;
      const iconPath = findIconPath(iconDir, iconName);
      if (iconPath) {
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}assets/${iconPath}`);
          if (response.ok) {
            const blob = await response.blob();
            rpTextures.file(`${textureName}.png`, blob);
            fileCount++;
          }
        } catch (e) {
          // 图标不存在，跳过
        }
      }
    }

    // 生成 attachable 文件（武器需要）
    if (module.generatorType === 'weapon' || module.generatorType === 'bow' || module.generatorType === 'crossbow') {
      const attachable = generateAttachable(namespace, id, module.generatorType);
      const attachableDir = rp.folder('attachables')!;
      attachableDir.file(`${namespace}_${id}.json`, JSON.stringify(attachable, null, 2));
      fileCount++;
    }
  }

  // 写入 item_texture.json
  const itemTexture = {
    resource_pack_name: namespace,
    texture_name: 'atlas.items',
    texture_data: textureData,
  };
  rp.file('item_texture.json', JSON.stringify(itemTexture, null, 2));
  fileCount++;

  // 写入语言文件
  rpLang.file('en_US.lang', langEntries.join('\n') + '\n');
  rpLang.file('zh_CN.lang', langEntries.join('\n') + '\n');
  fileCount += 2;

  return { zip, fileCount };
}

// ===== 导出为 .mcaddon 文件 =====

export async function exportMcaddon(project: { name: string; namespace: string; items: ProjectItem[] }): Promise<Blob> {
  const { zip } = await generateAddon(project);
  return zip.generateAsync({ type: 'blob' });
}

// ===== Manifest 生成 =====

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createBehaviorManifest(name: string, _namespace: string, bpUuid: string, rpUuid: string): any {
  return {
    format_version: 2,
    header: {
      name: `${name} - BP`,
      description: `${name} Behavior Pack`,
      uuid: bpUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 21, 100],
    },
    modules: [
      {
        type: 'data',
        uuid: uuid(),
        version: [1, 0, 0],
      },
    ],
    dependencies: [
      {
        uuid: rpUuid,
        version: [1, 0, 0],
      },
    ],
  };
}

function createResourceManifest(name: string, _namespace: string, rpUuid: string, bpUuid: string): any {
  return {
    format_version: 2,
    header: {
      name: `${name} - RP`,
      description: `${name} Resource Pack`,
      uuid: rpUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 21, 100],
    },
    modules: [
      {
        type: 'resources',
        uuid: uuid(),
        version: [1, 0, 0],
      },
    ],
    dependencies: [
      {
        uuid: bpUuid,
        version: [1, 0, 0],
      },
    ],
  };
}

// ===== Attachable 生成 =====

function generateAttachable(namespace: string, id: string, _type: string): any {
  const identifier = `${namespace}:${id}`;
  return {
    format_version: '1.10.0',
    'minecraft:attachable': {
      description: {
        identifier,
        materials: {
          default: 'entity_alphatest',
          enchanted: 'entity_alphatest_glint',
        },
        textures: {
          default: `textures/items/${namespace}_${id}`,
          enchanted: 'textures/misc/enchanted_item_glint',
        },
        geometry: {
          default: `geometry.${namespace}_${id}`,
        },
        animations: {
          wield_first_person: `animation.${namespace}_${id}.first_person`,
          wield_third_person: `animation.${namespace}_${id}.third_person`,
        },
        scripts: {
          pre_animation: [
            'variable.charge_amount = math.clamp((query.main_hand_item_max_duration - (query.main_hand_item_use_duration - query.frame_alpha + 1.0)) / 10.0, 0.0, 1.0f);',
          ],
          animate: [
            { wield_first_person: 'c.is_first_person' },
            { wield_third_person: '!c.is_first_person' },
          ],
        },
        render_controllers: ['controller.render.item_default'],
      },
    },
  };
}
