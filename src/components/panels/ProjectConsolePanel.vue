<template>
  <div class="project-console-panel">
    <div class="tabs">
      <div class="tab" 
           :class="{ 'active': activeTab === 'project' }" 
           @click="activeTab = 'project'">
        Project
      </div>
      <div class="tab" 
           :class="{ 'active': activeTab === 'console' }" 
           @click="activeTab = 'console'">
        Console
      </div>
    </div>
    
    <div class="panel-content">
      <!-- Project Tab -->
      <div class="tab-content" v-if="activeTab === 'project'">
        <div class="toolbar">
          <input type="text" v-model="projectSearchQuery" placeholder="搜索..." class="search-input" />
          <div class="view-options">
            <button class="view-btn" :class="{ 'active': viewMode === 'grid' }" @click="viewMode = 'grid'">
              <span class="icon">□</span>
            </button>
            <button class="view-btn" :class="{ 'active': viewMode === 'list' }" @click="viewMode = 'list'">
              <span class="icon">≡</span>
            </button>
          </div>
        </div>
        
        <!-- 搜索模式下的平铺显示 -->
        <template v-if="projectSearchQuery">
          <div class="search-results" :class="viewMode">
            <!-- 网格视图 -->
            <template v-if="viewMode === 'grid'">
              <div 
                v-for="asset in filteredAssets()" 
                :key="asset.id"
                class="asset-item"
                :class="{ active: editorStore.state.activeAsset === asset.id }"
                @click="selectAsset(asset.id)"
                @dblclick="handleDoubleClick(asset)"
                draggable="true"
                @dragstart="handleDragStart($event, asset)"
                @dragend="handleDragEnd"
              >
                <div class="asset-icon">{{ getAssetIcon(asset.type) }}</div>
                <div class="asset-name">{{ asset.name }}</div>
              </div>
            </template>
            
            <!-- 列表视图 -->
            <template v-else>
              <div 
                v-for="asset in filteredAssets()" 
                :key="asset.id"
                class="folder-item"
                :class="{ active: editorStore.state.activeAsset === asset.id }"
                @click="selectAsset(asset.id)"
                @dblclick="handleDoubleClick(asset)"
                draggable="true"
                @dragstart="handleDragStart($event, asset)"
                @dragend="handleDragEnd"
              >
                <div class="expand-placeholder"></div>
                <div class="folder-icon">{{ getAssetIcon(asset.type) }}</div>
                <div class="folder-name">{{ asset.name }}</div>
              </div>
            </template>
            
            <div v-if="filteredAssets().length === 0" class="no-results">
              没有找到符合条件的资产
            </div>
          </div>
        </template>
        
        <!-- 分屏显示：左边文件夹树，右边内容 -->
        <template v-else>
          <div class="project-split-view">
            <!-- 左侧文件夹树 -->
            <div class="folder-tree-container">
              <div class="folder-tree">
                <div 
                  v-for="folder in folderList" 
                  :key="folder.id"
                  class="folder-tree-item"
                  :class="{ 'active': currentFolder === folder.id, 'expanded': isExpanded(folder.id) }"
                  :style="{ paddingLeft: `${getDepth(folder) * 16 + 8}px` }"
                  @click="selectFolder(folder.id)"
                >
                  <div 
                    class="expand-icon" 
                    v-if="hasFolderChildren(folder)"
                    @click.stop="toggleFolderExpanded(folder.id)"
                  >
                    {{ isExpanded(folder.id) ? '▼' : '▶' }}
                  </div>
                  <div class="expand-placeholder" v-else></div>
                  <div class="folder-icon">📁</div>
                  <div class="folder-name">{{ folder.name }}</div>
                </div>
              </div>
            </div>
            
            <!-- 右侧内容区域 -->
            <div class="folder-content-container" :class="viewMode">
              <!-- 网格视图 -->
              <template v-if="viewMode === 'grid'">
                <div 
                  v-for="asset in currentFolderContents" 
                  :key="asset.id"
                  class="asset-item"
                  :class="{ active: editorStore.state.activeAsset === asset.id }"
                  @click="selectAsset(asset.id)"
                  @dblclick="handleDoubleClick(asset)"
                  draggable="true"
                  @dragstart="handleDragStart($event, asset)"
                  @dragend="handleDragEnd"
                >
                  <div class="asset-icon">{{ getAssetIcon(asset.type) }}</div>
                  <div class="asset-name">{{ asset.name }}</div>
                </div>
              </template>
              
              <!-- 列表视图 -->
              <template v-else>
                <div 
                  v-for="asset in currentFolderContents" 
                  :key="asset.id"
                  class="folder-item"
                  :class="{ active: editorStore.state.activeAsset === asset.id }"
                  @click="selectAsset(asset.id)"
                  @dblclick="handleDoubleClick(asset)"
                  draggable="true"
                  @dragstart="handleDragStart($event, asset)"
                  @dragend="handleDragEnd"
                >
                  <div class="folder-icon">{{ getAssetIcon(asset.type) }}</div>
                  <div class="folder-name">{{ asset.name }}</div>
                </div>
              </template>
              
              <div v-if="currentFolderContents.length === 0" class="no-results">
                此文件夹为空
              </div>
            </div>
          </div>
          
          <!-- 底部导航路径 -->
          <div class="folder-path">
            <span v-for="(part, index) in folderPath" :key="index" class="path-part">
              <span class="path-link" @click="navigateToPath(index)">{{ part.name }}</span>
              <span v-if="index < folderPath.length - 1" class="path-separator">/</span>
            </span>
          </div>
        </template>
      </div>
      

      
      <!-- Console Tab -->
      <div class="tab-content" v-if="activeTab === 'console'">
        <div class="toolbar">
          <div class="filter-buttons">
            <button class="filter-btn" @click="clearConsole">清除</button>
            <button 
              class="filter-btn" 
              :class="{ 'active': consoleFilter.error }" 
              @click="toggleFilter('error')"
            >错误</button>
            <button 
              class="filter-btn" 
              :class="{ 'active': consoleFilter.warning }" 
              @click="toggleFilter('warning')"
            >警告</button>
            <button 
              class="filter-btn" 
              :class="{ 'active': consoleFilter.info }" 
              @click="toggleFilter('info')"
            >信息</button>
          </div>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="筛选..." 
            class="search-input" 
          />
        </div>
        
        <div class="console-logs">
          <div 
            v-for="(msg, index) in filteredConsoleMessages()" 
            :key="index" 
            class="log-item" 
            :class="msg.type"
          >
            <div class="log-icon">
              <span v-if="msg.type === 'error'">⚠️</span>
              <span v-else-if="msg.type === 'warning'">⚠</span>
              <span v-else>ℹ</span>
            </div>
            <div class="log-content">
              <div class="log-message">{{ msg.message }}</div>
              <div class="log-details">{{ msg.details }}</div>
            </div>
          </div>
          
          <div v-if="filteredConsoleMessages().length === 0" class="no-logs">
            控制台没有消息
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue';
import editorStore from '../../store/editorStore';
import AssetFolderItem from '../items/AssetFolderItem.vue';

const activeTab = ref('project');
const viewMode = ref('grid'); // 'grid' 或 'list'
const projectSearchQuery = ref('');
const consoleFilter = ref({
  error: true,
  warning: true,
  info: true
});

const searchQuery = ref('');

// 提供 viewMode 给子组件
provide('viewMode', viewMode);

// 当前文件夹上下文
const currentFolder = ref(null); // 当前选中的文件夹 ID
const expandedFolders = ref([]); // 已展开的文件夹 ID 列表

// 获取所有文件夹
// 按照层级结构排序
const folderList = computed(() => {
  // 只返回类型为文件夹的资产
  const folders = editorStore.state.assets.filter(asset => asset.type === 'folder');
  
  // 排序：首先依照层级排序，然后按名称排序
  folders.sort((a, b) => {
    const depthA = getDepth(a);
    const depthB = getDepth(b);
    
    if (depthA !== depthB) {
      return depthA - depthB;
    }
    
    return a.name.localeCompare(b.name);
  });
  
  return folders;
});

// 当前文件夹的内容
const currentFolderContents = computed(() => {
  if (currentFolder.value === null) {
    // 如果没有选中文件夹，显示根资产
    return editorStore.state.assets.filter(asset => asset.parentId === null);
  }
  
  // 显示选中文件夹的直接子资产
  return editorStore.state.assets.filter(asset => asset.parentId === currentFolder.value);
});

// 当前文件夹路径
const folderPath = computed(() => {
  if (currentFolder.value === null) {
    return [{ id: null, name: 'Assets' }];
  }
  
  const path = [];
  let current = editorStore.state.assets.find(a => a.id === currentFolder.value);
  
  while (current) {
    path.unshift(current);
    current = current.parentId !== null ? editorStore.state.assets.find(a => a.id === current.parentId) : null;
  }
  
  // 添加根目录
  path.unshift({ id: null, name: 'Assets' });
  
  return path;
});

// 获取根级资产
const rootAssets = computed(() => {
  return editorStore.getRootAssets();
});

// 递归搜索所有资产（包括子资产）
const filteredAssets = () => {
  const query = projectSearchQuery.value.toLowerCase();
  if (!query) return [];
  
  // 直接搜索所有资产而不考虑层级结构
  return editorStore.state.assets.filter(asset => {
    return asset.name.toLowerCase().includes(query);
  }).sort((a, b) => {
    // 先按类型排序（文件夹在前）
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    // 再按名称排序
    return a.name.localeCompare(b.name);
  });
};

// 根据资产类型获取图标
const getAssetIcon = (type) => {
  switch (type) {
    case 'folder': return '📁';
    case 'texture': return '🖼️';
    case 'script': return '📄';
    case 'model': return '📦';
    case 'prefab': return '🎮';
    default: return '📄';
  }
};

// 选择资产
const selectAsset = (id) => {
  editorStore.selectAsset(id);
};

// 切换资产展开状态
const toggleAssetExpanded = (id) => {
  editorStore.toggleAssetExpanded(id);
};

const filteredConsoleMessages = () => {
  return editorStore.state.consoleMessages.filter(msg => {
    // 应用类型过滤
    if (!consoleFilter.value[msg.type]) return false;
    
    // 应用搜索过滤
    const query = searchQuery.value.toLowerCase();
    if (query && !msg.message.toLowerCase().includes(query) && 
        !msg.details.toLowerCase().includes(query)) {
      return false;
    }
    
    return true;
  });
};

const toggleFilter = (type) => {
  consoleFilter.value[type] = !consoleFilter.value[type];
};

const clearConsole = () => {
  editorStore.clearConsole();
};

// 处理双击事件
const handleDoubleClick = (asset) => {
  if (asset.type === 'folder') {
    // 如果是文件夹，选中并打开文件夹
    currentFolder.value = asset.id;
    
    // 在已展开列表中添加该文件夹
    if (!expandedFolders.value.includes(asset.id)) {
      expandedFolders.value.push(asset.id);
    }
  } else {
    // 如果是资产文件，则打开资产
    openAsset(asset);
  }
};

// 获取资产的层级深度
const getDepth = (asset) => {
  let depth = 0;
  let current = asset;
  
  while (current && current.parentId !== null) {
    depth++;
    current = editorStore.state.assets.find(a => a.id === current.parentId);
  }
  
  return depth;
};

// 检查文件夹是否有子文件夹
const hasFolderChildren = (folder) => {
  return editorStore.state.assets.some(asset => 
    asset.parentId === folder.id && asset.type === 'folder'
  );
};

// 切换文件夹展开/收起状态
const toggleFolderExpanded = (folderId) => {
  const index = expandedFolders.value.indexOf(folderId);
  if (index === -1) {
    expandedFolders.value.push(folderId);
  } else {
    expandedFolders.value.splice(index, 1);
  }
};

// 检查文件夹是否已展开
const isExpanded = (folderId) => {
  return expandedFolders.value.includes(folderId);
};

// 选择文件夹
const selectFolder = (folderId) => {
  currentFolder.value = folderId;
};

// 导航到指定路径
const navigateToPath = (index) => {
  if (index === 0) {
    currentFolder.value = null; // 导航到根目录
  } else {
    currentFolder.value = folderPath.value[index].id;
  }
};

// handleDoubleClick 函数已在前面定义

// 打开资产
const openAsset = (asset) => {
  // 根据资产类型执行不同的打开操作
  console.log('打开资产:', asset.name, asset.type);
  editorStore.addConsoleMessage('info', `打开资产: ${asset.name}`, `类型: ${asset.type}`);
};

// 拖拽相关方法
const handleDragStart = (event, asset) => {
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', asset.id);
  event.dataTransfer.effectAllowed = 'move';
  
  // 在 store 中记录拖拽状态
  editorStore.startDrag(asset, 'asset');
};

const handleDragEnd = () => {
  // 结束拖拽
  editorStore.endDrag();
};

// 初始化设置
// 将根文件夹设置为已展开
const initializeFolderView = () => {
  // 设置所有根级文件夹为已展开
  const rootFolders = editorStore.state.assets.filter(asset => 
    asset.parentId === null && asset.type === 'folder'
  );
  
  rootFolders.forEach(folder => {
    if (!expandedFolders.value.includes(folder.id)) {
      expandedFolders.value.push(folder.id);
    }
  });
};

// 在组件挂载时初始化
initializeFolderView();
</script>

<style scoped>
.project-console-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #2a2a2a;
  color: #e0e0e0;
}

.tabs {
  display: flex;
  height: 30px;
  background-color: #333;
  border-bottom: 1px solid #222;
}

.tab {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  border-right: 1px solid #222;
}

.tab:hover {
  background-color: #3a3a3a;
}

.tab.active {
  background-color: #2a2a2a;
  border-bottom: 2px solid #4d78cc;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  background-color: #333;
  border-bottom: 1px solid #222;
}

.search-input {
  flex: 1;
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 3px 6px;
  font-size: 12px;
  max-width: 200px;
}

.view-options {
  display: flex;
  gap: 3px;
}

.view-btn {
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.view-btn:hover {
  background-color: #555;
}

.view-btn.active {
  background-color: #4d78cc;
  border-color: #6699ff;
}

.project-split-view {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100% - 70px); /* 减去工具栏和底部路径的高度 */
}

.folder-tree-container {
  width: 200px;
  overflow-y: auto;
  border-right: 1px solid #333;
  background-color: #252525;
}

.folder-tree {
  padding: 5px 0;
}

.folder-tree-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.folder-tree-item:hover {
  background-color: #3a3a3a;
}

.folder-tree-item.active {
  background-color: #2d5c8a;
}

.expand-icon {
  width: 16px;
  height: 16px;
  text-align: center;
  margin-right: 4px;
  cursor: pointer;
  font-size: 10px;
  line-height: 16px;
}

.folder-content-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #2a2a2a;
  transition: all 0.3s ease;
}

/* 网格视图 */
.folder-content-container.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 列表视图 */
.folder-content-container.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.folder-path {
  height: 24px;
  background-color: #1e1e1e;
  border-top: 1px solid #333;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  color: #ddd;
}

.path-part {
  display: inline-flex;
  align-items: center;
}

.path-link {
  cursor: pointer;
}

.path-link:hover {
  color: #fff;
  text-decoration: underline;
}

.path-separator {
  margin: 0 5px;
  color: #666;
}

/* 网格视图 */
.asset-browser.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  align-content: flex-start;
}

/* 列表视图 */
.asset-browser.list {
  display: flex;
  flex-direction: column;
}

/* 搜索结果样式 */
.search-results {
  flex: 1;
  overflow-y: auto;
  height: calc(100% - 35px);
  padding: 10px;
  background-color: #2a2a2a;
}

.search-results.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-results.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.asset-tree {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 2px;
  white-space: nowrap;
}

.folder-item:hover {
  background-color: #3a3a3a;
}

.folder-item.active {
  background-color: #4d78cc;
  color: white;
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

.folder-icon {
  margin-right: 5px;
  font-size: 14px;
}

.folder-name {
  font-size: 12px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-results {
  padding: 5px;
}

.search-results.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.search-results.list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.asset-item {
  width: 80px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  padding: 8px 4px;
  transition: background-color 0.2s ease;
}

.asset-item:hover {
  background-color: #3a3a3a;
  border-radius: 3px;
}

.asset-item.active {
  background-color: #4d78cc;
  color: white;
  border-radius: 3px;
}

.asset-icon {
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.asset-name {
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  width: 100%;
}

.filter-buttons {
  display: flex;
  gap: 3px;
}

.filter-btn {
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #555;
}

.filter-btn.active {
  background-color: #4d78cc;
  border-color: #6699ff;
}

.console-logs {
  flex: 1;
  overflow-y: auto;
  padding: 0 5px;
}

.log-item {
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #333;
  font-size: 12px;
}

.log-item:hover {
  background-color: #333;
}

.log-icon {
  margin-right: 8px;
  font-size: 14px;
  align-self: flex-start;
  margin-top: 2px;
}

.log-content {
  flex: 1;
}

.log-message {
  margin-bottom: 2px;
}

.log-details {
  color: #888;
  font-size: 11px;
}

.log-item.error {
  color: #ff7070;
}

.log-item.warning {
  color: #ffbb70;
}

.log-item.info {
  color: #70a9ff;
}

.no-logs {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #777;
  font-style: italic;
  font-size: 13px;
}
</style>
