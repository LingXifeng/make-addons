import { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { allModules, getModuleById } from '../modules';
import { generateItemJson } from '../core/generator';
import { FormRenderer } from '../core/FormRenderer';
import { exportMcaddon } from '../core/exporter';

export function App() {
  const store = useProjectStore();
  const [previewJson, setPreviewJson] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const selectedItem = store.project.items.find(i => i.id === store.selectedItemId);
  const selectedModule = selectedItem ? getModuleById(selectedItem.moduleId) : null;

  // 加载本地存储
  useEffect(() => {
    store.loadFromStorage();
  }, []);

  // 生成预览 JSON
  useEffect(() => {
    if (selectedItem && selectedModule) {
      generateItemJson(selectedModule, selectedItem, selectedItem.subTypeId)
        .then(json => setPreviewJson(JSON.stringify(json, null, 2)))
        .catch(e => setPreviewJson(`生成错误: ${e.message}`));
    } else {
      setPreviewJson('');
    }
  }, [selectedItem?.data, selectedItem?.subTypeId, selectedModule]);

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
    if (store.project.items.length === 0) return;
    setExporting(true);
    try {
      const blob = await exportMcaddon({
        name: store.project.name,
        namespace: store.project.namespace,
        items: store.project.items,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${store.project.name}.mcaddon`;
      a.click();
      URL.revokeObjectURL(url);
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
            disabled={exporting || store.project.items.length === 0}
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
                      {module.subTypes.map(sub => (
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
            <h3>物品列表 ({store.project.items.length})</h3>
            <div className="item-list">
              {store.project.items.map(item => {
                const mod = getModuleById(item.moduleId);
                const subType = mod?.subTypes?.find(s => s.id === item.subTypeId);
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
              {store.project.items.length === 0 && (
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
                  {selectedItem.subTypeId && ` - ${selectedModule.subTypes?.find(s => s.id === selectedItem.subTypeId)?.name || ''}`}
                </h2>
              </div>
              <FormRenderer
                fields={selectedModule.subTypes?.find(s => s.id === selectedItem.subTypeId)?.fields || selectedModule.fields}
                data={selectedItem.data}
                onChange={(key, value) => store.updateItemField(selectedItem.id, key, value)}
                iconDir={selectedModule.iconDir}
                onTextureUpload={handleTextureUpload}
                customTexture={selectedItem.customTexture}
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
