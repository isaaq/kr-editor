<template>
  <div 
    ref="gameObjectRef"
    class="hierarchy-item"
    :class="{ 
      'active': isActive, 
      'selected': isSelected, 
      'drop-target': isDropTarget,
      'drop-target-before': isDropTargetBefore,
      'drop-target-after': isDropTargetAfter
    }"
    :style="{ paddingLeft: `${depth * 16 + 8}px` }"
    draggable="true"
    @dragstart="handleDragStart($event, props.gameObject)"
    @dragover.prevent="handleDragOver($event, props.gameObject)"
    @dragleave="handleDragLeave($event, props.gameObject)"
    @drop.prevent="handleDrop($event, props.gameObject)"
    @dragend="handleDragEnd"
    @click="selectGameObject(props.gameObject.id, $event)"
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
    <div class="item-name">
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
import { computed, ref } from 'vue';
import editorStore from '../../store/editorStore';

// 创建对DOM元素的引用
const gameObjectRef = ref(null);

// 定义属性
const props = defineProps({
  gameObject: Object,
  depth: Number
});

// 计算属性：当前游戏对象是否被选中
const isActive = computed(() => {
  return editorStore.state.activeGameObject === props.gameObject.id;
});

// 计算属性：当前游戏对象是否在多选列表中
const isSelected = computed(() => {
  return editorStore.state.selectedGameObjects.includes(props.gameObject.id);
});

// 计算属性：当前游戏对象是否是拖拽放置目标
const isDropTarget = computed(() => {
  return editorStore.state.dragState.dropTarget?.id === props.gameObject.id && editorStore.state.dragState.dropPosition === 'inside';
});

const isDropTargetBefore = ref(false);
const isDropTargetAfter = ref(false);

// 方法：选择游戏对象
function selectGameObject(id, event) {
  // 检查是否按下了 Ctrl/Command 键或 Shift 键
  if (event) {
    const isMultiSelect = event.ctrlKey || event.metaKey;
    const isShiftSelect = event.shiftKey;
    
    if (isMultiSelect || isShiftSelect) {
      // 阻止事件冒泡，避免触发父级的点击事件
      event.stopPropagation();
    }
    
    // 调用 store 方法，传递多选标志
    editorStore.selectGameObject(id, isMultiSelect);
  } else {
    editorStore.selectGameObject(id);
  }
}

// 方法：切换展开状态
function toggleExpanded(id) {
  editorStore.toggleGameObjectExpanded(id);
}

// 拖拽相关方法
function handleDragStart(event, gameObject) {
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
  
  // 添加拖拽视觉效果
  setTimeout(() => {
    if (gameObjectRef.value) {
      gameObjectRef.value.classList.add('dragging');
    }
  }, 0);
}

function handleDragOver(event, gameObject) {
  event.dataTransfer.dropEffect = 'move';
  
  // 获取鼠标在元素上的位置
  const rect = event.currentTarget.getBoundingClientRect();
  const mouseY = event.clientY;
  const relativeY = mouseY - rect.top;
  const height = rect.height;
  
  // 清除所有目标状态
  isDropTargetBefore.value = false;
  isDropTargetAfter.value = false;
  
  // 根据鼠标位置判断放置区域
  if (relativeY < height * 0.25) {
    // 上四分之一区域 - 放置在对象上方
    isDropTargetBefore.value = true;
    editorStore.setDropTarget(gameObject, 'before');
  } else if (relativeY > height * 0.75) {
    // 下四分之一区域 - 放置在对象下方
    isDropTargetAfter.value = true;
    editorStore.setDropTarget(gameObject, 'after');
  } else {
    // 中间区域 - 放置在对象内部
    editorStore.setDropTarget(gameObject, 'inside');
  }
}

function handleDragLeave(event, gameObject) {
  // 清除本地状态
  isDropTargetBefore.value = false;
  isDropTargetAfter.value = false;
  
  // 如果当前游戏对象是放置目标，则取消放置目标
  if (editorStore.state.dragState.dropTarget?.id === gameObject.id) {
    editorStore.setDropTarget(null);
  }
}

function handleDrop(event, gameObject) {
  // 清除本地状态
  isDropTargetBefore.value = false;
  isDropTargetAfter.value = false;
  
  // 处理拖放事件
  editorStore.handleDrop();
}

function handleDragEnd() {
  // 清除本地状态
  isDropTargetBefore.value = false;
  isDropTargetAfter.value = false;
  
  // 结束拖拽
  editorStore.endDrag();
  
  // 移除拖拽视觉效果
  if (gameObjectRef.value) {
    gameObjectRef.value.classList.remove('dragging');
  }
  
  // 移除所有拖拽标记
  document.querySelectorAll('.drop-target').forEach(el => {
    el.classList.remove('drop-target');
  });
  document.querySelectorAll('.drop-target-before').forEach(el => {
    el.classList.remove('drop-target-before');
  });
  document.querySelectorAll('.drop-target-after').forEach(el => {
    el.classList.remove('drop-target-after');
  });
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

.hierarchy-item.selected:not(.active) {
  background-color: #3a5d8c;
  outline: 1px solid #4d78cc;
}

.hierarchy-item.drop-target {
  background-color: #2a5db0;
  outline: 2px dashed #6699ff;
}

.hierarchy-item.drop-before {
  border-top: 2px solid #6699ff;
}

.hierarchy-item.drop-after {
  border-bottom: 2px solid #6699ff;
}

.hierarchy-item.dragging {
  opacity: 0.5;
}

.hierarchy-item.drop-target-before {
  border-top: 2px solid #4d78cc;
}

.hierarchy-item.drop-target-after {
  border-bottom: 2px solid #4d78cc;
}

.hierarchy-item.selected:not(.active) {
  background-color: #3a5a8c;
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
  text-align: left;
}
</style>
