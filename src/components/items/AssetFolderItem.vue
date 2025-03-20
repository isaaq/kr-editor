<template>
  <div 
    class="folder-item"
    :class="{ active: isActive, 'drop-target': isDropTarget }"
    :style="{ paddingLeft: viewMode === 'list' ? `${props.depth * 16 + 8}px` : '8px' }"
    @click.stop="selectAsset(props.asset.id)"
    @dblclick.stop="handleDoubleClick(props.asset)"
    draggable="true"
    @dragstart="handleDragStart($event, props.asset)"
    @dragover.prevent="handleDragOver($event, props.asset)"
    @dragleave="handleDragLeave($event, props.asset)"
    @drop.prevent="handleDrop($event, props.asset)"
    @dragend="handleDragEnd"
  >
    <div 
      class="expand-icon" 
      v-if="props.asset.type === 'folder' && props.asset.children && props.asset.children.length > 0"
      @click.stop="toggleAssetExpanded(props.asset.id)"
    >
      {{ props.asset.isExpanded ? '▼' : '▶' }}
    </div>
    <div class="expand-placeholder" v-else></div>
    <div class="folder-icon">{{ getAssetIcon(props.asset.type) }}</div>
    <div class="folder-name">{{ props.asset.name }}</div>
  </div>
  
  <!-- 递归渲染子资产 -->
  <template v-if="props.asset.isExpanded && props.asset.children && props.asset.children.length > 0">
    <asset-folder-item 
      v-for="child in props.asset.children" 
      :key="child.id" 
      :asset="child" 
      :depth="props.depth + 1"
    />
  </template>
</template>

<script setup>
import { inject, computed } from 'vue';
import editorStore from '../../store/editorStore';

// 定义属性
const props = defineProps({
  asset: Object,
  depth: Number
});

// 注入 viewMode
const viewMode = inject('viewMode');

// 检查当前资产是否被选中
const isActive = computed(() => {
  return editorStore.state.activeAsset === props.asset.id;
});

// 拖拽相关状态
const isDropTarget = computed(() => {
  return editorStore.state.dragState.dropTarget?.id === props.asset.id;
});

// 选择资产
function selectAsset(id) {
  editorStore.selectAsset(id);
}

// 切换资产展开状态
function toggleAssetExpanded(id) {
  editorStore.toggleAssetExpanded(id);
}

// 获取资产图标
function getAssetIcon(type) {
  switch (type) {
    case 'folder': return '📁';
    case 'texture': return '🖼️';
    case 'script': return '📄';
    case 'model': return '📦';
    case 'prefab': return '🎮';
    default: return '📄';
  }
}

// 处理双击事件
function handleDoubleClick(asset) {
  if (asset.type === 'folder') {
    // 如果是文件夹，则切换展开/折叠状态
    toggleAssetExpanded(asset.id);
  } else {
    // 如果是资产文件，则打开资产
    openAsset(asset);
  }
}

// 打开资产
function openAsset(asset) {
  // 根据资产类型执行不同的打开操作
  console.log('打开资产:', asset.name, asset.type);
  editorStore.addConsoleMessage('info', `打开资产: ${asset.name}`, `类型: ${asset.type}`);
}

// 拖拽相关方法
function handleDragStart(event, asset) {
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', asset.id);
  event.dataTransfer.effectAllowed = 'move';
  
  // 在 store 中记录拖拽状态
  editorStore.startDrag(asset, 'asset');
}

function handleDragOver(event, asset) {
  // 只允许拖拽到文件夹
  if (asset.type === 'folder') {
    event.dataTransfer.dropEffect = 'move';
    editorStore.setDropTarget(asset);
  }
}

function handleDragLeave(event, asset) {
  // 如果当前资产是放置目标，则取消放置目标
  if (editorStore.state.dragState.dropTarget?.id === asset.id) {
    editorStore.setDropTarget(null);
  }
}

function handleDrop(event, asset) {
  // 如果不是文件夹，则不允许放置
  if (asset.type !== 'folder') return;
  
  // 获取拖拽的资产 ID
  const draggedAssetId = event.dataTransfer.getData('text/plain');
  
  // 如果放置目标就是拖拽的资产，或者放置目标是拖拽资产的子资产，则不允许放置
  if (draggedAssetId === asset.id.toString()) return;
  
  // 设置放置目标
  editorStore.setDropTarget(asset);
}

function handleDragEnd() {
  // 结束拖拽
  editorStore.endDrag();
}
</script>

<style scoped>
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

.folder-item.drop-target {
  background-color: #2a5db0;
  color: white;
  outline: 2px dashed #6699ff;
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
</style>
