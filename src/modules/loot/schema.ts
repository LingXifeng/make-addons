import type { FieldSchema, ModuleDefinition } from '../../core/types';

// ===== 战利品表模块字段定义 =====
// 自定义战利品表（loot table JSON）

export const lootFields: FieldSchema[] = [
  // --- 基础信息 ---
  { key: 'displayName', label: '战利品表名称', type: 'text', defaultValue: '', section: '基础信息' },
  { key: 'identifier', label: '战利品表ID', type: 'text', defaultValue: 'change_me', section: '基础信息' },
  { key: 'lootType', label: '战利品类型', type: 'select', defaultValue: 'entity', section: '基础信息', options: [
    { label: '实体掉落', value: 'entity' }, { label: '方块掉落', value: 'block' },
    { label: '钓鱼', value: 'fishing' }, { label: '宝箱', value: 'chest' },
    { label: '弓箭礼物', value: 'gift' }, { label: '交易', value: 'trade' },
  ]},

  // --- 池子设置 ---
  { key: 'poolRolls', label: '抽取次数', type: 'number', defaultValue: 1, min: 0, max: 100, step: 1, section: '池子设置' },
  { key: 'poolBonusRolls', label: '额外抽取（幸运）', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1, section: '池子设置' },

  // --- 掉落物 1 ---
  { key: 'item1Id', label: '物品1 ID', type: 'text', defaultValue: 'minecraft:stick', section: '掉落物 1' },
  { key: 'item1Weight', label: '物品1 权重', type: 'number', defaultValue: 1, min: 1, max: 1000, step: 1, section: '掉落物 1' },
  { key: 'item1MinCount', label: '物品1 最小数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物 1' },
  { key: 'item1MaxCount', label: '物品1 最大数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物 1' },
  { key: 'item1Enchant', label: '物品1 附魔', type: 'boolean', defaultValue: false, section: '掉落物 1' },
  { key: 'item1EnchantLevel', label: '物品1 附魔等级', type: 'number', defaultValue: 1, min: 1, max: 30, step: 1, section: '掉落物 1', showWhen: { field: 'item1Enchant', value: true } },

  // --- 掉落物 2 ---
  { key: 'useItem2', label: '启用掉落物2', type: 'boolean', defaultValue: false, section: '掉落物 2' },
  { key: 'item2Id', label: '物品2 ID', type: 'text', defaultValue: 'minecraft:iron_ingot', section: '掉落物 2', showWhen: { field: 'useItem2', value: true } },
  { key: 'item2Weight', label: '物品2 权重', type: 'number', defaultValue: 1, min: 1, max: 1000, step: 1, section: '掉落物 2', showWhen: { field: 'useItem2', value: true } },
  { key: 'item2MinCount', label: '物品2 最小数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物 2', showWhen: { field: 'useItem2', value: true } },
  { key: 'item2MaxCount', label: '物品2 最大数量', type: 'number', defaultValue: 1, min: 0, max: 64, step: 1, section: '掉落物 2', showWhen: { field: 'useItem2', value: true } },

  // --- 条件 ---
  { key: 'useKilledByPlayer', label: '要求被玩家击杀', type: 'boolean', defaultValue: false, section: '条件' },
  { key: 'useRandomChance', label: '随机概率', type: 'boolean', defaultValue: false, section: '条件' },
  { key: 'randomChance', label: '概率值', type: 'number', defaultValue: 0.5, min: 0, max: 1, step: 0.05, section: '条件', showWhen: { field: 'useRandomChance', value: true } },

  // --- 高级 ---
  { key: 'useLootingEnchant', label: '受抢夺附魔影响', type: 'boolean', defaultValue: false, section: '高级' },
];

export const lootModule: ModuleDefinition = {
  id: 'loot',
  name: '战利品表',
  description: '自定义战利品掉落表',
  icon: '💰',
  category: 'custom_items',
  templateFile: '',
  iconDir: 'loot',
  jsonRootKey: 'pools',
  generatorType: 'loot',
  fields: lootFields,
};
