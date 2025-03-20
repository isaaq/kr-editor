<template>
  <div 
    class="hierarchy-item"
    :class="{ 'active': isActive, 'drop-target': isDropTarget }"
    :style="{ paddingLeft: `${depth * 16 + 8}px` }"
    draggable="true"
    @dragstart="handleDragStart($event, props.gameObject)"
    @dragover.prevent="handleDragOver($event, props.gameObject)"
    @dragleave="handleDragLeave($event, props.gameObject)"
    @drop.prevent="handleDrop($event, props.gameObject)"
    @dragend="handleDragEnd"
  >
    <div 
      class="expand-icon" 
      v-if="props.gameObject.children && props.gameObject.children.length > 0"
      @click.stop="toggleExpanded(props.gameObject.id)"
    >
      {{ props.gameObject.isExpanded ? '▼' : '▶' }}
    </div>
    <div class="expand-placeholder" v-else></div>
    <div class="item-icon">◆</div>
    <div class="item-name" @click="selectGameObject(props.gameObject.id)">
      {{ props.gameObject.name }}
    </div>
  </div>
  
  <!-- 递归渲染子对象 -->
  <template v-if="props.gameObject.isExpanded && props.gameObject.children && props.gameObject.children.length > 0">
    <game-object-item 
      v-for="child in props.gameObject.children" 
      :key="child.id" 
      :game-object="child" 
      :depth="props.depth + 1"
    />
  </template>
</template>

<script setup>
import { computed } from 'vue';
import editorStore from '../../store/editorStore';

// 定义属性
const props = defineProps({
  gameObject: Object,
  depth: Number
});

// 计算属性：当前游戏对象是否被选中
const isActive = computed(() => {
  return editorStore.state.activeGameObject === props.gameObject.id;
});

// 计算属性：当前游戏对象是否是拖拽放置目标
const isDropTarget = computed(() => {
  return editorStore.state.dragState.dropTarget?.id === props.gameObject.id;
});

// 方法：选择游戏对象
function selectGameObject(id) {
  editorStore.selectGameObject(id);
}

// 方法：切换展开状态
function toggleExpanded(id) {
  editorStore.toggleGameObjectExpanded(id);
}

// 拖拽相关方法
function handleDragStart(event, gameObject) {
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', gameObject.id);
  event.dataTransfer.effectAllowed = 'move';
  
  // 在 store 中记录拖拽状态
  editorStore.startDrag(gameObject, 'gameObject');
}

function handleDragOver(event, gameObject) {
  event.dataTransfer.dropEffect = 'move';
  editorStore.setDropTarget(gameObject);
}

function handleDragLeave(event, gameObject) {
  // 如果当前游戏对象是放置目标，则取消放置目标
  if (editorStore.state.dragState.dropTarget?.id === gameObject.id) {
    editorStore.setDropTarget(null);
  }
}

function handleDrop(event, gameObject) {
  // 获取拖拽的游戏对象 ID
  const draggedGameObjectId = event.dataTransfer.getData('text/plain');
  
  // 如果放置目标就是拖拽的游戏对象，或者放置目标是拖拽游戏对象的子对象，则不允许放置
  if (draggedGameObjectId === gameObject.id.toString()) return;
  
  // 设置放置目标
  editorStore.setDropTarget(gameObject);
}

function handleDragEnd() {
  // 结束拖拽
  editorStore.endDrag();
}
</script>

<style scoped>
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
}

.hierarchy-item.drop-target {
  background-color: #2a5db0;
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
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
