<template>
  <div class="hierarchy-panel" @contextmenu.prevent="showContextMenu($event, null)">
    <!-- 保留键盘事件处理，但通过文档级别的事件监听器处理 -->
    <div class="panel-header">
      <div class="panel-title">层级结构</div>
      <div class="panel-actions">
        <button class="panel-btn" @click="addNewGameObject">+</button>
        <button class="panel-btn">⋮</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索游戏对象..." 
          @input="handleSearch"
          ref="searchInput"
          @keydown.esc.prevent="clearSearch"
        />
        <button 
          v-if="searchQuery" 
          class="clear-search" 
          @click="clearSearch"
          title="清除搜索"
        >×</button>
      </div>
      
      <!-- 搜索结果信息 -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results-info">
        找到 {{ searchResults.length }} 个结果
      </div>
      <div v-else-if="searchQuery && searchResults.length === 0" class="search-results-info">
        未找到结果
      </div>
      <div class="hierarchy-list">
        <div class="hierarchy-item scene-item">
          <div class="item-icon">◆</div>
          <div class="item-name">SampleScene</div>
        </div>
        
        <!-- 递归渲染树形结构 -->
        <template v-if="!searchQuery">
          <game-object-item 
            v-for="obj in rootGameObjects" 
            :key="obj.id" 
            :game-object="obj" 
            :depth="0"
          />
        </template>
        
        <!-- 搜索结果平铺显示 -->
        <template v-else>
          <div 
            v-for="obj in filteredGameObjects()" 
            :key="obj.id"
            class="hierarchy-item search-result-item"
            :class="{ 
              'active': editorStore.state.activeGameObject === obj.id,
              'selected': editorStore.state.selectedGameObjects.includes(obj.id)
            }"
            @click="selectGameObject(obj.id, $event)"
            @contextmenu.prevent="showContextMenu($event, obj)"
            draggable="true"
            @dragstart="handleDragStart($event, obj)"
            @dragend="handleDragEnd"
          >
            <div class="item-icon">◆</div>
            <div class="item-name">{{ obj.name }}</div>
            <!-- 显示对象的路径 -->
            <div class="item-path">{{ getObjectPath(obj) }}</div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div 
      v-show="contextMenuVisible" 
      class="context-menu" 
      :style="{ top: contextMenuTop + 'px', left: contextMenuLeft + 'px' }"
    >
      <div class="menu-title" v-if="contextMenuTarget">对象: {{ contextMenuTarget.name }}</div>
      <div class="menu-title" v-else>层级面板</div>
      <div class="menu-divider"></div>
      
      <div class="menu-item" @click="handleCreateGameObject">创建游戏对象</div>
      <div class="menu-item" @click="handleCreateEmptyObject">创建空对象</div>
      
      <div class="menu-divider" v-if="contextMenuTarget || hasMultipleSelection"></div>
      
      <div class="menu-item" @click="handleDeleteObject" v-if="contextMenuTarget">删除对象</div>
      <div class="menu-item" @click="handleRenameObject" v-if="contextMenuTarget">重命名</div>
      <div class="menu-item" @click="handleDuplicateObject" v-if="contextMenuTarget">复制</div>
      
      <div class="menu-divider" v-if="hasMultipleSelection"></div>
      
      <div class="menu-item" @click="duplicateSelectedObjects" v-if="hasMultipleSelection">复制选中的对象</div>
      <div class="menu-item" @click="deleteSelectedObjects" v-if="hasMultipleSelection">删除选中的对象</div>
      
      <div class="menu-divider"></div>
      
      <div class="menu-item" @click="selectAllGameObjects">全选</div>
      <div class="menu-item" @click="editorStore.clearSelection()" v-if="editorStore.state.selectedGameObjects.length > 0">取消选择</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import editorStore from '../../store/editorStore';
import GameObjectItem from '../items/GameObjectItem.vue';

const searchQuery = ref('');
const searchResults = ref([]);
const searchInput = ref(null);

// 多选相关
const isShiftKeyPressed = ref(false);
const isCtrlKeyPressed = ref(false);
const lastSelectedId = ref(null);

// 右键菜单相关
const contextMenuVisible = ref(false);
const contextMenuTop = ref(0);
const contextMenuLeft = ref(0);
const contextMenuTarget = ref(null);

// 获取根级游戏对象
const rootGameObjects = computed(() => {
  return editorStore.getRootGameObjects();
});

// 计算属性：是否有多选
const hasMultipleSelection = computed(() => {
  return editorStore.state.selectedGameObjects.length > 0;
});

// 递归搜索所有游戏对象（包括子对象）
const filteredGameObjects = () => {
  if (!searchQuery.value) return [];
  return searchResults.value;
};

// 处理搜索
const handleSearch = () => {
  const query = searchQuery.value.toLowerCase();
  if (!query) {
    searchResults.value = [];
    return;
  }
  
  const results = [];
  
  const searchInObjects = (objects) => {
    for (const obj of objects) {
      if (obj.name.toLowerCase().includes(query)) {
        results.push(obj);
      }
      
      if (obj.children && obj.children.length > 0) {
        searchInObjects(obj.children);
      }
    }
  };
  
  searchInObjects(editorStore.state.gameObjects);
  searchResults.value = results;
  
  // 如果有搜索结果，自动展开相关的父对象
  if (results.length > 0) {
    // 展开包含搜索结果的父对象
    for (const obj of results) {
      let parentId = obj.parentId;
      while (parentId !== null) {
        const parent = editorStore.findGameObjectById(parentId);
        if (parent) {
          parent.isExpanded = true;
          parentId = parent.parentId;
        } else {
          break;
        }
      }
    }
  }
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus();
    }
  });
  
  // 清除搜索时显示一个反馈
  editorStore.addConsoleMessage('info', '搜索已清除', '在层级面板中');
};

// 获取对象路径
const getObjectPath = (obj) => {
  let path = '';
  let currentObj = obj;
  let parentId = currentObj.parentId;
  
  while (parentId !== null) {
    const parent = editorStore.findGameObjectById(parentId);
    if (parent) {
      path = parent.name + ' / ' + path;
      parentId = parent.parentId;
    } else {
      break;
    }
  }
  
  return path ? path : '根级';
};

// 选择游戏对象
const selectGameObject = (id, event) => {
  // 检查是否按下了 Ctrl 键（Mac 上是 Command 键）
  const isMultiSelect = event && (isCtrlKeyPressed.value || event.metaKey || event.ctrlKey);
  
  // 检查是否按下了 Shift 键进行范围选择
  const isRangeSelect = event && (isShiftKeyPressed.value || event.shiftKey);
  
  if (isRangeSelect && lastSelectedId.value) {
    // 范围选择逻辑
    const allObjects = getAllGameObjects();
    const currentIndex = allObjects.findIndex(obj => obj.id === id);
    const lastIndex = allObjects.findIndex(obj => obj.id === lastSelectedId.value);
    
    if (currentIndex !== -1 && lastIndex !== -1) {
      // 清除当前选择
      editorStore.clearSelection();
      
      // 确定范围的起止索引
      const startIndex = Math.min(currentIndex, lastIndex);
      const endIndex = Math.max(currentIndex, lastIndex);
      
      // 选择范围内的所有对象
      for (let i = startIndex; i <= endIndex; i++) {
        editorStore.selectGameObject(allObjects[i].id, true);
      }
    }
  } else {
    // 普通选择或多选
    editorStore.selectGameObject(id, isMultiSelect);
    lastSelectedId.value = id;
  }
};

// 获取所有游戏对象（扁平化层级结构）
const getAllGameObjects = () => {
  const allObjects = [];
  
  const collectObjects = (objects) => {
    for (const obj of objects) {
      allObjects.push(obj);
      
      if (obj.children && obj.children.length > 0) {
        collectObjects(obj.children);
      }
    }
  };
  
  collectObjects(editorStore.state.gameObjects);
  return allObjects;
};

const toggleExpanded = (id) => {
  editorStore.toggleGameObjectExpanded(id);
};

const addNewGameObject = (parentId = null) => {
  // 添加新的游戏对象
  const newId = Math.max(...editorStore.state.gameObjects.map(obj => obj.id), 0) + 1;
  const newGameObject = {
    id: newId,
    name: '新游戏对象',
    type: 'GameObject',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    components: ['Transform'],
    parentId: parentId,
    isExpanded: true,
    children: []
  };
  
  editorStore.state.gameObjects.push(newGameObject);
  editorStore.selectGameObject(newId);
  editorStore.addConsoleMessage('info', `创建了新游戏对象: ${newGameObject.name}`, 'at Editor.CreateGameObject()');
  return newId;
};

// 右键菜单显示
const showContextMenu = (event, target) => {
  contextMenuVisible.value = true;
  contextMenuTarget.value = target;
  contextMenuTop.value = event.clientY;
  contextMenuLeft.value = event.clientX;
};

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false;
};

// 点击其他地方隐藏右键菜单
const handleDocumentClick = (event) => {
  if (contextMenuVisible.value) {
    hideContextMenu();
  }
};

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === 'Shift') {
    isShiftKeyPressed.value = true;
  } else if (event.key === 'Control' || event.key === 'Meta') {
    isCtrlKeyPressed.value = true;
  } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
    // Ctrl+A 或 Command+A 全选
    event.preventDefault();
    selectAllGameObjects();
  } else if (event.key === 'Escape') {
    // Esc 键清除选择和搜索
    editorStore.clearSelection();
    clearSearch();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    // 删除选中的对象
    deleteSelectedObjects();
  }
};

const handleKeyUp = (event) => {
  if (event.key === 'Shift') {
    isShiftKeyPressed.value = false;
  } else if (event.key === 'Control' || event.key === 'Meta') {
    isCtrlKeyPressed.value = false;
  }
};

// 全选游戏对象
const selectAllGameObjects = () => {
  editorStore.selectAllGameObjects();
  editorStore.addConsoleMessage('info', '已选中所有游戏对象', '层级面板');
};

// 这部分功能已经在上面的 handleKeyDown 函数中实现，删除重复定义

// 不再需要自动聚焦

// 拖拽相关方法
const handleDragStart = (event, gameObject) => {
  // 获取选中的游戏对象
  const selectedObjects = editorStore.getSelectedGameObjects();
  
  // 如果当前拖拽的对象不在选中列表中，则先选中它
  if (!editorStore.state.selectedGameObjects.includes(gameObject.id)) {
    editorStore.selectGameObject(gameObject.id);
    editorStore.startDrag(gameObject, 'gameObject', [gameObject]);
  } else {
    // 如果已经选中，则拖拽所有选中的对象
    editorStore.startDrag(gameObject, 'gameObject', selectedObjects);
  }
  
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', JSON.stringify(gameObject));
  event.dataTransfer.effectAllowed = 'move';
};

const handleDragEnd = () => {
  // 结束拖拽
  editorStore.endDrag();
};

// 删除选中的对象
const deleteSelectedObjects = () => {
  const selectedObjects = editorStore.getSelectedGameObjects();
  
  if (selectedObjects.length > 0) {
    for (const obj of selectedObjects) {
      editorStore.removeGameObject(obj.id);
    }
    
    editorStore.clearSelection();
    editorStore.addConsoleMessage('info', `已删除 ${selectedObjects.length} 个对象`, '在层级面板中');
  }
};

// 添加和移除事件监听
onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
});

// 右键菜单操作
const handleCreateGameObject = () => {
  const parentId = contextMenuTarget.value ? contextMenuTarget.value.id : null;
  addNewGameObject(parentId);
  hideContextMenu();
};

const handleCreateEmptyObject = () => {
  const parentId = contextMenuTarget.value ? contextMenuTarget.value.id : null;
  // 创建一个没有组件的空对象
  const newId = Math.max(...editorStore.state.gameObjects.map(obj => obj.id), 0) + 1;
  const newGameObject = {
    id: newId,
    name: '空对象',
    type: 'GameObject',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    components: [], // 空对象没有组件
    parentId: parentId,
    isExpanded: true,
    children: []
  };
  
  editorStore.state.gameObjects.push(newGameObject);
  editorStore.selectGameObject(newId);
  editorStore.addConsoleMessage('info', `创建了空对象: ${newGameObject.name}`, 'at Editor.CreateEmptyObject()');
  hideContextMenu();
};

const handleDeleteObject = () => {
  if (contextMenuTarget.value) {
    // 删除对象的逻辑
    const id = contextMenuTarget.value.id;
    const name = contextMenuTarget.value.name;
    
    // 递归删除子对象
    const removeGameObjectAndChildren = (objId) => {
      const childrenToRemove = editorStore.state.gameObjects.filter(obj => obj.parentId === objId);
      childrenToRemove.forEach(child => removeGameObjectAndChildren(child.id));
      
      const index = editorStore.state.gameObjects.findIndex(obj => obj.id === objId);
      if (index !== -1) {
        editorStore.state.gameObjects.splice(index, 1);
      }
    };
    
    removeGameObjectAndChildren(id);
    editorStore.addConsoleMessage('info', `删除了游戏对象: ${name}`, 'at Editor.DeleteGameObject()');
    hideContextMenu();
  }
};

const handleRenameObject = () => {
  if (contextMenuTarget.value) {
    // 重命名对象的逻辑
    const newName = prompt('输入新名称:', contextMenuTarget.value.name);
    if (newName && newName.trim() !== '') {
      const obj = editorStore.state.gameObjects.find(obj => obj.id === contextMenuTarget.value.id);
      if (obj) {
        const oldName = obj.name;
        obj.name = newName.trim();
        editorStore.addConsoleMessage('info', `重命名游戏对象: ${oldName} -> ${newName}`, 'at Editor.RenameGameObject()');
      }
    }
    hideContextMenu();
  }
};

const handleDuplicateObject = () => {
  if (contextMenuTarget.value) {
    // 复制对象的逻辑
    const original = contextMenuTarget.value;
    const newId = Math.max(...editorStore.state.gameObjects.map(obj => obj.id), 0) + 1;
    
    // 创建副本（浅拷贝）
    const duplicate = {
      ...original,
      id: newId,
      name: original.name + ' 副本',
      parentId: original.parentId,
      children: [] // 不复制子对象
    };
    
    editorStore.state.gameObjects.push(duplicate);
    editorStore.selectGameObject(newId);
    editorStore.addConsoleMessage('info', `复制了游戏对象: ${original.name} -> ${duplicate.name}`, 'at Editor.DuplicateGameObject()');
    hideContextMenu();
  }
};
</script>

<!-- 游戏对象项组件 -->
<script>
import { defineComponent } from 'vue';
import editorStore from '../../store/editorStore';

export default defineComponent({
  name: 'GameObjectItem',
  props: {
    gameObject: Object,
    depth: Number
  },
  methods: {
    selectGameObject(id) {
      editorStore.selectGameObject(id);
    },
    toggleExpanded(id) {
      editorStore.toggleGameObjectExpanded(id);
    }
  }
});
</script>

<style scoped>
.hierarchy-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #2a2a2a;
  color: #e0e0e0;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  background-color: #3a3a3a;
  padding: 0 10px;
  border-bottom: 1px solid #222;
}

.panel-title {
  font-weight: bold;
  font-size: 14px;
}

.panel-actions {
  display: flex;
  gap: 5px;
}

.panel-btn {
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-btn:hover {
  background-color: #4a4a4a;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.search-bar {
  margin-bottom: 10px;
  position: relative;
}

.search-bar input {
  width: 100%;
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 5px 25px 5px 5px;
  font-size: 12px;
  border-radius: 3px;
}

.hierarchy-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hierarchy-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 2px;
  white-space: nowrap;
}

.hierarchy-item:hover {
  background-color: #3a3a3a;
}

.hierarchy-item.active {
  background-color: #4d78cc;
  color: white;
}

.hierarchy-item.selected:not(.active) {
  background-color: #3a5a8c;
  color: white;
}

.search-result-item {
  margin-bottom: 4px;
  border-left: 2px solid #4d78cc;
}

.search-result-item .item-path {
  font-size: 10px;
  color: #aaa;
  margin-left: 8px;
  opacity: 0.7;
}

.scene-item {
  font-weight: bold;
  margin-bottom: 5px;
  border-bottom: 1px solid #444;
  padding-bottom: 8px;
}

.clear-search {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #fff;
}

.search-results-info {
  font-size: 11px;
  color: #aaa;
  margin: 5px 0;
  padding: 0 5px;
}

.expand-icon {
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  color: #aaa;
  cursor: pointer;
}

.expand-placeholder {
  width: 16px;
  height: 16px;
  margin-right: 2px;
}

.item-icon {
  margin-right: 5px;
  font-size: 10px;
  color: #aaa;
}

.active .item-icon,
.active .expand-icon {
  color: #fff;
}

.item-name {
  font-size: 13px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 150px;
}

.menu-title {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  color: #aaa;
  background-color: #2a2a2a;
}

.menu-divider {
  height: 1px;
  background-color: #444;
  margin: 4px 0;
}

.menu-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #4d78cc;
  color: white;
}
</style>
