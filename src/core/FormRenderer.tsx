import { useState, useEffect } from 'react';
import type { FieldSchema } from '../core/types';
import { shouldShowField } from '../core/generator';

interface FormRendererProps {
  fields: FieldSchema[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  iconDir?: string;
  onTextureUpload?: (file: File) => void;
  customTexture?: { name: string; dataUrl: string };
}

export function FormRenderer({ fields, data, onChange, iconDir, onTextureUpload, customTexture }: FormRendererProps) {
  // 按分组组织字段
  const sections: Record<string, FieldSchema[]> = {};
  for (const field of fields) {
    const section = field.section || '其他';
    if (!sections[section]) sections[section] = [];
    sections[section].push(field);
  }

  return (
    <div className="form-renderer">
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <div key={sectionName} className="form-section">
          <h3 className="form-section-title">{sectionName}</h3>
          <div className="form-section-fields">
            {sectionFields.map(field => (
              <FieldInput
                key={field.key}
                field={field}
                value={data[field.key]}
                data={data}
                onChange={onChange}
                iconDir={iconDir || field.iconDir}
                onTextureUpload={onTextureUpload}
                customTexture={customTexture}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field, value, data, onChange, iconDir, onTextureUpload, customTexture }: {
  field: FieldSchema;
  value: any;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  iconDir?: string;
  onTextureUpload?: (file: File) => void;
  customTexture?: { name: string; dataUrl: string };
}) {
  if (!shouldShowField(field, data)) return null;

  return (
    <div className="field-input">
      <label className="field-label">{field.label}</label>
      {field.hint && <span className="field-hint">{field.hint}</span>}
      <div className="field-control">
        {renderControl(field, value, data, onChange, iconDir, onTextureUpload, customTexture)}
      </div>
    </div>
  );
}

function renderControl(
  field: FieldSchema,
  value: any,
  data: Record<string, any>,
  onChange: (key: string, value: any) => void,
  iconDir?: string,
  onTextureUpload?: (file: File) => void,
  customTexture?: { name: string; dataUrl: string },
) {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder || field.hint || ''}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder || field.hint || ''}
          rows={6}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
        />
      );

    case 'tags':
      return (
        <input
          type="text"
          value={Array.isArray(value) ? value.join(', ') : (value || '')}
          onChange={e => onChange(field.key, e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
          placeholder={field.placeholder || field.hint || '用逗号分隔'}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value ?? 0}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          onChange={e => onChange(field.key, parseFloat(e.target.value) || 0)}
        />
      );

    case 'boolean':
      return (
        <label className="switch">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(field.key, e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
        >
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'icon':
      return (
        <IconPicker
          value={value}
          onChange={v => onChange(field.key, v)}
          iconDir={iconDir || 'weapon'}
          onTextureUpload={onTextureUpload}
          customTexture={customTexture}
        />
      );

    case 'blockList':
      return (
        <BlockListInput
          value={value || []}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'itemList':
      return (
        <ItemListInput
          value={value || []}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'stringList':
      return (
        <StringListInput
          value={value || []}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'color':
      return (
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(field.key, e.target.value)}
        />
      );

    case 'texture':
      return (
        <div className="texture-field">
          {customTexture && (
            <img src={customTexture.dataUrl} alt="texture" className="texture-preview" />
          )}
          {onTextureUpload && (
            <label className="upload-btn">
              上传纹理
              <input
                type="file"
                accept="image/png"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onTextureUpload(file);
                }}
              />
            </label>
          )}
        </div>
      );

    case 'recipePattern':
      return (
        <RecipePatternInput
          value={value || ['', '', '']}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'recipeItems':
      return (
        <RecipeItemsInput
          value={value || {}}
          data={data}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'craftingGrid':
      return (
        <CraftingGridInput
          value={value || { grid: ['', '', '', '', '', '', '', '', ''], mapping: {} }}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'repairItems':
      return (
        <RepairItemsInput
          value={value || []}
          onChange={v => onChange(field.key, v)}
        />
      );

    case 'potionEffects':
      return (
        <PotionEffectsInput
          value={value || []}
          onChange={v => onChange(field.key, v)}
        />
      );

    default:
      return <span>不支持的字段类型: {field.type}</span>;
  }
}

// ===== 图标选择器 =====

function IconPicker({ value, onChange, iconDir, onTextureUpload, customTexture }: {
  value: string;
  onChange: (v: string) => void;
  iconDir: string;
  onTextureUpload?: (file: File) => void;
  customTexture?: { name: string; dataUrl: string };
}) {
  const [icons, setIcons] = useState<{ name: string; path: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // 加载图标清单
    fetch(`${import.meta.env.BASE_URL}assets/icon_manifest.json`)
      .then(r => r.json())
      .then((manifest: Record<string, string[]>) => {
        const result: { name: string; path: string }[] = [];
        for (const [dir, names] of Object.entries(manifest)) {
          // 匹配 iconDir：精确匹配或子目录匹配
          if (dir === iconDir || dir.startsWith(iconDir + '/')) {
            for (const name of names) {
              result.push({ name, path: `${dir}/${name}` });
            }
          }
        }
        setIcons(result.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => setIcons([]));
  }, [iconDir]);

  const filtered = icons.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="icon-picker">
      <div className="icon-preview" onClick={() => setShowPicker(!showPicker)}>
        {customTexture ? (
          <img src={customTexture.dataUrl} alt="custom" />
        ) : value ? (
          <img src={`${import.meta.env.BASE_URL}assets/icons/${iconDir}/${value}.png`} alt={value} onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.3';
          }} />
        ) : null}
        <span className="icon-name">{customTexture ? customTexture.name : value}</span>
      </div>

      {onTextureUpload && (
        <div className="texture-upload">
          <label className="upload-btn">
            上传自定义纹理
            <input
              type="file"
              accept="image/png"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onTextureUpload(file);
              }}
            />
          </label>
        </div>
      )}

      {showPicker && (
        <div className="icon-grid-modal">
          <div className="icon-grid-header">
            <input
              type="text"
              placeholder="搜索图标..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="icon-search"
            />
            <button onClick={() => setShowPicker(false)}>✕</button>
          </div>
          <div className="icon-grid">
            {filtered.slice(0, 200).map(icon => (
              <div
                key={icon.path}
                className={`icon-grid-item ${value === icon.name ? 'selected' : ''}`}
                onClick={() => {
                  onChange(icon.name);
                  setShowPicker(false);
                }}
              >
                <img src={`${import.meta.env.BASE_URL}assets/icons/${icon.path}.png`} alt={icon.name} loading="lazy" />
                <span>{icon.name}</span>
              </div>
            ))}
          </div>
          {filtered.length > 200 && <p className="icon-more">还有 {filtered.length - 200} 个图标，请搜索...</p>}
        </div>
      )}
    </div>
  );
}

// ===== 方块列表输入 =====

function BlockListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  return (
    <div className="block-list-input">
      <div className="tag-list">
        {value.map(block => (
          <span key={block} className="tag">
            {block}
            <button onClick={() => onChange(value.filter(b => b !== block))}>✕</button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="minecraft:stone"
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              onChange([...value, input.trim()]);
              setInput('');
            }
          }}
        />
        <button onClick={() => {
          if (input.trim()) {
            onChange([...value, input.trim()]);
            setInput('');
          }
        }}>添加</button>
      </div>
    </div>
  );
}

// ===== 修复物品列表输入 =====

function RepairItemsInput({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  return (
    <div className="repair-items-input">
      {value.map((item, i) => (
        <div key={i} className="repair-item-row">
          <input
            type="text"
            value={item.items?.[0] || ''}
            placeholder="minecraft:diamond"
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...item, items: [e.target.value] };
              onChange(newValue);
            }}
          />
          <input
            type="text"
            value={item.repair_amount || ''}
            placeholder="q.max_durability * 0.25"
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...item, repair_amount: e.target.value };
              onChange(newValue);
            }}
          />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}>删除</button>
        </div>
      ))}
      <button onClick={() => onChange([...value, { items: ['minecraft:diamond'], repair_amount: 'q.max_durability * 0.25' }])}>
        + 添加修复材料
      </button>
    </div>
  );
}

// ===== 药水效果列表输入 =====

const POTION_EFFECTS = [
  'speed', 'slowness', 'haste', 'mining_fatigue',
  'strength', 'instant_health', 'instant_damage',
  'jump_boost', 'nausea', 'regeneration', 'resistance',
  'fire_resistance', 'water_breathing', 'invisibility',
  'blindness', 'night_vision', 'hunger', 'weakness',
  'poison', 'wither', 'health_boost', 'absorption',
  'saturation', 'levitation', 'fatal_poison', 'conduit_power',
  'slow_falling', 'bad_omen', 'hero_of_the_village',
];

function PotionEffectsInput({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  return (
    <div className="potion-effects-input">
      {value.map((effect, i) => (
        <div key={i} className="potion-effect-row">
          <select
            value={effect.effect || 'speed'}
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...effect, effect: e.target.value };
              onChange(newValue);
            }}
          >
            {POTION_EFFECTS.map(ef => (
              <option key={ef} value={ef}>{ef}</option>
            ))}
          </select>
          <label className="potion-effect-label">
            <span>等级</span>
            <input
              type="number"
              value={effect.amplifier ?? 0}
              min={0}
              max={255}
              onChange={e => {
                const newValue = [...value];
                newValue[i] = { ...effect, amplifier: parseInt(e.target.value) || 0 };
                onChange(newValue);
              }}
            />
          </label>
          <label className="potion-effect-label">
            <span>秒数</span>
            <input
              type="number"
              value={effect.duration ?? 10}
              min={0}
              step={0.1}
              onChange={e => {
                const newValue = [...value];
                newValue[i] = { ...effect, duration: parseFloat(e.target.value) || 0 };
                onChange(newValue);
              }}
            />
          </label>
          <label className="potion-effect-visible">
            <input
              type="checkbox"
              checked={effect.visible !== false}
              onChange={e => {
                const newValue = [...value];
                newValue[i] = { ...effect, visible: e.target.checked };
                onChange(newValue);
              }}
            />
            显示粒子
          </label>
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}>删除</button>
        </div>
      ))}
      <button onClick={() => onChange([...value, { effect: 'speed', amplifier: 0, duration: 10, visible: true }])}>
        + 添加药水效果
      </button>
    </div>
  );
}

// ===== 物品列表输入 =====

function ItemListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  return (
    <div className="item-list-input">
      <div className="tag-list">
        {value.map((item, i) => (
          <span key={i} className="tag">
            {item}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="minecraft:item_id"
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              onChange([...value, input.trim()]);
              setInput('');
            }
          }}
        />
        <button onClick={() => {
          if (input.trim()) {
            onChange([...value, input.trim()]);
            setInput('');
          }
        }}>添加</button>
      </div>
    </div>
  );
}

// ===== 字符串列表输入 =====

function StringListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  return (
    <div className="string-list-input">
      <div className="tag-list">
        {value.map((s, i) => (
          <span key={i} className="tag">
            {s}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入字符串"
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              onChange([...value, input.trim()]);
              setInput('');
            }
          }}
        />
        <button onClick={() => {
          if (input.trim()) {
            onChange([...value, input.trim()]);
            setInput('');
          }
        }}>添加</button>
      </div>
    </div>
  );
}

// ===== 配方图案输入 =====

function RecipePatternInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const rows = value.length > 0 ? value : ['', '', ''];

  return (
    <div className="recipe-pattern-input">
      {rows.map((row, i) => (
        <div key={i} className="recipe-pattern-row">
          <label>第{i + 1}行</label>
          <input
            type="text"
            value={row}
            maxLength={3}
            onChange={e => {
              const newValue = [...rows];
              newValue[i] = e.target.value;
              onChange(newValue);
            }}
            placeholder="如 ABC 或空"
          />
        </div>
      ))}
      <p className="field-hint">使用字母代表材料，在下方映射到具体物品</p>
    </div>
  );
}

// ===== 配方物品映射输入 =====

function RecipeItemsInput({ value, onChange, data }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void; data: Record<string, any> }) {
  // 从 pattern 中提取所有使用的字符
  const pattern: string[] = data.pattern || ['', '', ''];
  const usedChars = new Set<string>();
  for (const row of pattern) {
    for (const char of row) {
      if (char !== ' ' && char.trim()) {
        usedChars.add(char);
      }
    }
  }

  const chars = Array.from(usedChars).sort();

  return (
    <div className="recipe-items-input">
      {chars.length === 0 && <p className="field-hint">请先填写合成图案</p>}
      {chars.map(char => (
        <div key={char} className="recipe-item-mapping">
          <span className="recipe-key">{char}</span>
          <span>→</span>
          <input
            type="text"
            value={value[char] || ''}
            onChange={e => onChange({ ...value, [char]: e.target.value })}
            placeholder="minecraft:item_id"
          />
        </div>
      ))}
    </div>
  );
}

// ===== 3x3 合成格子 + 字母映射表 =====

interface CraftingGridData {
  grid: string[];      // 9 个格子，每个格子一个字符或空字符串
  mapping: Record<string, string>;  // 字母 → 物品ID
}

function CraftingGridInput({ value, onChange }: {
  value: CraftingGridData;
  onChange: (v: CraftingGridData) => void;
}) {
  const grid: string[] = (value.grid && value.grid.length === 9)
    ? value.grid
    : ['', '', '', '', '', '', '', '', ''];
  const mapping: Record<string, string> = value.mapping || {};

  // 从格子中提取所有使用过的字符（去重排序）
  const usedChars = Array.from(new Set(grid.filter(c => c.trim()))).sort();

  // 更新某个格子
  const updateCell = (index: number, char: string) => {
    // 只取第一个字符，转大写
    const c = char.trim().slice(0, 1).toUpperCase();
    const newGrid = [...grid];
    newGrid[index] = c;
    onChange({ grid: newGrid, mapping });
  };

  // 更新某个字母的映射
  const updateMapping = (char: string, item: string) => {
    onChange({ grid, mapping: { ...mapping, [char]: item } });
  };

  // 清空格子
  const clearGrid = () => {
    onChange({ grid: ['', '', '', '', '', '', '', '', ''], mapping });
  };

  return (
    <div className="crafting-grid-input">
      {/* 3x3 格子 */}
      <div className="crafting-grid-3x3">
        {grid.map((cell, i) => (
          <input
            key={i}
            type="text"
            className="crafting-cell"
            value={cell}
            maxLength={1}
            onChange={e => updateCell(i, e.target.value)}
            placeholder="·"
          />
        ))}
      </div>

      <div className="crafting-grid-actions">
        <button type="button" onClick={clearGrid}>清空格子</button>
      </div>

      {/* 字母映射表 */}
      <div className="crafting-mapping-section">
        <h4 className="crafting-mapping-title">字母映射表</h4>
        {usedChars.length === 0 && (
          <p className="field-hint">请先在上方格子中填入字母</p>
        )}
        {usedChars.map(char => (
          <div key={char} className="crafting-mapping-row">
            <span className="crafting-mapping-key">{char}</span>
            <span className="crafting-mapping-arrow">→</span>
            <input
              type="text"
              className="crafting-mapping-input"
              value={mapping[char] || ''}
              onChange={e => updateMapping(char, e.target.value)}
              placeholder="minecraft:item_id"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
