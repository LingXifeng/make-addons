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
        {renderControl(field, value, onChange, iconDir, onTextureUpload, customTexture)}
      </div>
    </div>
  );
}

function renderControl(
  field: FieldSchema,
  value: any,
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
          placeholder={field.hint || ''}
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
          <img src={`/assets/icons/${iconDir}/${value}.png`} alt={value} onError={(e) => {
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
                <img src={`/assets/icons/${icon.path}.png`} alt={icon.name} loading="lazy" />
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
            value={item.repairAmount || ''}
            placeholder="q.max_durability * 0.25"
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...item, repairAmount: e.target.value };
              onChange(newValue);
            }}
          />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}>删除</button>
        </div>
      ))}
      <button onClick={() => onChange([...value, { items: ['minecraft:diamond'], repairAmount: 'q.max_durability * 0.25' }])}>
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
          <input
            type="number"
            value={effect.amplifier ?? 0}
            min={0}
            max={255}
            placeholder="等级"
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...effect, amplifier: parseInt(e.target.value) || 0 };
              onChange(newValue);
            }}
          />
          <input
            type="number"
            value={effect.duration ?? 10}
            min={0}
            step={0.1}
            placeholder="持续时间(秒)"
            onChange={e => {
              const newValue = [...value];
              newValue[i] = { ...effect, duration: parseFloat(e.target.value) || 0 };
              onChange(newValue);
            }}
          />
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
