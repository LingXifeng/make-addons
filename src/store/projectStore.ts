import { create } from 'zustand';
import type { Project, ProjectItem, ModuleDefinition } from '../core/types';
import { createDefaultFormData } from '../core/generator';
import { getModuleById } from '../modules';

interface ProjectStore {
  project: Project;
  selectedItemId: string | null;
  selectedModuleId: string | null;

  // 项目操作
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;

  // 物品操作
  addItem: (moduleId: string, subTypeId?: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, data: Partial<Record<string, any>>) => void;
  updateItemField: (id: string, field: string, value: any) => void;
  setCustomTexture: (id: string, texture: { name: string; dataUrl: string }) => void;
  selectItem: (id: string | null) => void;
  selectModule: (id: string | null) => void;

  // 持久化
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'make-addons-project';

function createItem(moduleId: string, subTypeId?: string): ProjectItem {
  const module = getModuleById(moduleId);
  if (!module) throw new Error(`Module ${moduleId} not found`);

  const subType = subTypeId ? module.subTypes?.find(s => s.id === subTypeId) : undefined;
  const fields = subType?.fields || module.fields;
  const data = createDefaultFormData(fields);

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    moduleId,
    subTypeId,
    name: subType?.name || module.name,
    data,
    createdAt: Date.now(),
  };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: {
    name: '我的Addon',
    description: '',
    namespace: 'pa',
    items: [],
  },
  selectedItemId: null,
  selectedModuleId: null,

  setProjectName: (name) => set(state => ({ project: { ...state.project, name } })),
  setProjectDescription: (desc) => set(state => ({ project: { ...state.project, description: desc } })),

  addItem: (moduleId, subTypeId) => {
    const item = createItem(moduleId, subTypeId);
    set(state => ({
      project: { ...state.project, items: [...state.project.items, item] },
      selectedItemId: item.id,
    }));
    get().saveToStorage();
  },

  removeItem: (id) => {
    set(state => ({
      project: {
        ...state.project,
        items: state.project.items.filter(i => i.id !== id),
      },
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    }));
    get().saveToStorage();
  },

  updateItem: (id, data) => {
    set(state => ({
      project: {
        ...state.project,
        items: state.project.items.map(i =>
          i.id === id ? { ...i, data: { ...i.data, ...data } } : i
        ),
      },
    }));
    get().saveToStorage();
  },

  updateItemField: (id, field, value) => {
    set(state => ({
      project: {
        ...state.project,
        items: state.project.items.map(i =>
          i.id === id ? { ...i, data: { ...i.data, [field]: value } } : i
        ),
      },
    }));
    get().saveToStorage();
  },

  setCustomTexture: (id, texture) => {
    set(state => ({
      project: {
        ...state.project,
        items: state.project.items.map(i =>
          i.id === id ? { ...i, customTexture: texture } : i
        ),
      },
    }));
    get().saveToStorage();
  },

  selectItem: (id) => set({ selectedItemId: id }),
  selectModule: (id) => set({ selectedModuleId: id }),

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const project = JSON.parse(stored);
        set({ project });
      }
    } catch (e) {
      console.error('Failed to load project:', e);
    }
  },

  saveToStorage: () => {
    try {
      const { project } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  },
}));
