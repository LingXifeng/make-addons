import { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../store/projectStore';
import { allModules, getModuleById } from '../modules';
import { generatePreviewJSON } from '../core/generator';
import { exportAsMcaddon, downloadBlob } from '../core/exporter';
import { FormRenderer } from '../core/FormRenderer';
import type { ProjectItem, SubType } from '../core/types';

export function App() {
  console.log('App rendering, modules:', allModules.length);
  const store = useProjectStore();
  const [previewJson, setPreviewJson] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  // 获取所有物品的扁平列表
  const allItems = useMemo(() => {
    const items: { item: ProjectItem; moduleId: string }[] = [];
    const projectItems = store.project.items;
    if (projectItems && typeof projectItems === 'object' && !Array.isArray(projectItems)) {
      for (const [moduleId, moduleItems] of Object.entries(projectItems)) {
        if (Array.isArray(moduleItems)) {
          for (const item of moduleItems) {
            items.push({ item, moduleId });
          }
        }
      }
    }
    return items;
  }, [store.project.items]);

  const selectedItem = allItems.find(({ item }) => item.id === store.selectedItemId)?.item || null;
  const selectedModule = selectedItem ? getModuleById(selectedItem.moduleId) : null;
  const totalItems = allItems.length;

  // 加载本地存储
  useEffect(() => {
    store.loadFromStorage();
  }, []);

  // 生成预览 JSON
  useEffect(() => {
    if (selectedItem && selectedModule) {
      try {
        const json = generatePreviewJSON(selectedModule, selectedItem);
        setPreviewJson(json);
      } catch (e) {
        setPreviewJson(`生成错误: ${e}`);
      }
    } else {
      setPreviewJson('');
    }
  }, [selectedItem?.data, selectedModule]);

  // 处理纹理上传
  const handleTextureUpload = (file: File) => {
    if (!selectedItem) return;
    const reader = new FileReader();
    reader.onload = () => {
      store.setCustomTexture(selectedItem.id, {
        name: file.name.replace(/\.png$/i, ''),
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // 导出
  const handleExport = async () => {
    if (totalItems === 0) return;
    setExporting(true);
    try {
      const blob = await exportAsMcaddon(store.project, allModules);
      downloadBlob(blob, `${store.project.name}.mcaddon`);
    } catch (e) {
      alert(`导出失败: ${e}`);
    }
    setExporting(false);
  };

  return (
    <div className="app">
      {/* 顶部栏 */}
      <header className="app-header">
        <h1>🎮 Make Addons</h1>
        <div className="header-actions">
          <input
            type="text"
            value={store.project.name}
            onChange={e => store.setProjectName(e.target.value)}
            className="project-name-input"
            placeholder="项目名称"
          />
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting || totalItems === 0}
          >
            {exporting ? '导出中...' : '📦 导出 .mcaddon'}
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* 左侧栏 - 模块选择 + 物品列表 */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>创建物品</h3>
            <div className="module-list">
              {allModules.map(module => (
                <div key={module.id} className="module-item">
                  <div
                    className="module-header"
                    onClick={() => store.selectModule(store.selectedModuleId === module.id ? null : module.id)}
                  >
                    <span className="module-icon">{module.icon}</span>
                    <span className="module-name">{module.name}</span>
                    {module.subTypes && <span className="expand-arrow">▶</span>}
                  </div>
                  {store.selectedModuleId === module.id && module.subTypes && (
                    <div className="sub-types">
                      {module.subTypes.map((sub: SubType) => (
                        <button
                          key={sub.id}
                          className="subtype-btn"
                          onClick={() => store.addItem(module.id, sub.id)}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {store.selectedModuleId === module.id && !module.subTypes && (
                    <div className="sub-types">
                      <button
                        className="subtype-btn"
                        onClick={() => store.addItem(module.id)}
                      >
                        新建{module.name}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>物品列表 ({totalItems})</h3>
            <div className="item-list">
              {allItems.map(({ item, moduleId }) => {
                const mod = getModuleById(moduleId);
                const subType = mod?.subTypes?.find((s: SubType) => s.id === item.subTypeId);
                return (
                  <div
                    key={item.id}
                    className={`item-list-item ${store.selectedItemId === item.id ? 'selected' : ''}`}
                    onClick={() => store.selectItem(item.id)}
                  >
                    <span className="item-list-icon">{mod?.icon}</span>
                    <span className="item-list-name">{item.data.displayName || item.data.identifier || item.name}</span>
                    {subType && <span className="item-list-subtype">{subType.name}</span>}
                    <button
                      className="item-list-delete"
                      onClick={e => { e.stopPropagation(); store.removeItem(item.id); }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {totalItems === 0 && (
                <p className="empty-hint">从上方选择模块创建物品</p>
              )}
            </div>
          </div>
        </aside>

        {/* 中间 - 编辑表单 */}
        <main className="editor-panel">
          {selectedItem && selectedModule ? (
            <>
              <div className="editor-header">
                <h2>{selectedModule.icon} {selectedModule.name}
                  {selectedItem.subTypeId && ` - ${selectedModule.subTypes?.find((s: SubType) => s.id === selectedItem.subTypeId)?.name || ''}`}
                </h2>
              </div>
              <FormRenderer
                fields={selectedModule.subTypes?.find((s: SubType) => s.id === selectedItem.subTypeId)?.fields || selectedModule.fields}
                data={selectedItem.data}
                onChange={(key, value) => store.updateItemField(selectedItem.id, key, value)}
                iconDir={selectedModule.iconDir}
                onTextureUpload={handleTextureUpload}
                customTexture={selectedItem.customTexture}
                moduleId={selectedModule.id}
              />
            </>
          ) : (
            <div className="editor-empty">
              <h2>欢迎使用 Make Addons</h2>
              <p>这是一个 Minecraft Bedrock Edition Addon 制作工具</p>
              <p>从左侧选择模块类型，创建你的第一个物品</p>
              <div className="feature-list">
                <p>⚔️ 武器 - 剑/弓/弩/盾/箭/锤</p>
                <p>🛡️ 防具 - 头盔/胸甲/护腿/靴子</p>
                <p>🍎 食物 - 自定义食物</p>
                <p>🧱 方块 - 自定义方块</p>
                <p>🐾 实体 - 自定义实体</p>
                <p>🌍 群系 - 自定义群系</p>
                <p>📖 配方 - 自定义配方</p>
              </div>
            </div>
          )}
        </main>

        {/* 右侧 - JSON 预览 */}
        <aside className="preview-panel">
          <div className="preview-header">
            <h3>JSON 预览</h3>
            {previewJson && (
              <button onClick={() => navigator.clipboard.writeText(previewJson)}>复制</button>
            )}
          </div>
          <pre className="preview-json">{previewJson || '选择物品后显示预览'}</pre>
        </aside>
      </div>
    </div>
  );
}
