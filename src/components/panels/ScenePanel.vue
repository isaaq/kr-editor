<template>
  <div class="scene-panel">
    <div class="panel-header">
      <div class="panel-title">编辑区</div>
      <div class="panel-actions">
        <button class="panel-btn">移动端</button>
        <button class="panel-btn active">桌面端</button>
        <button class="panel-btn">⋮</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="scene-toolbar">
        <div class="scene-tools">
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'select' }" 
            title="选择工具 (V)"
            @click="editorStore.setActiveTool('select')"
          >
            <span>◉</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'move' }" 
            title="移动工具 (M)"
            @click="editorStore.setActiveTool('move')"
          >
            <span>↕</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'text' }" 
            title="文本工具 (T)"
            @click="editorStore.setActiveTool('text')"
          >
            <span>T</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'image' }" 
            title="图片工具 (I)"
            @click="editorStore.setActiveTool('image')"
          >
            <span>🖼</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'container' }" 
            title="容器工具 (C)"
            @click="editorStore.setActiveTool('container')"
          >
            <span>□</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'button' }" 
            title="按钮工具 (B)"
            @click="editorStore.setActiveTool('button')"
          >
            <span>⏺</span>
          </button>
        </div>
        <div class="scene-views">
          <button 
            class="view-btn" 
            :class="{ 'active': editorStore.state.viewMode === 'mobile' }" 
            title="移动端视图"
            @click="editorStore.setViewMode('mobile')"
          >
            <span>📱</span>
          </button>
          <button 
            class="view-btn" 
            :class="{ 'active': editorStore.state.viewMode === 'tablet' }" 
            title="平板视图"
            @click="editorStore.setViewMode('tablet')"
          >
            <span>📋</span>
          </button>
          <button 
            class="view-btn" 
            :class="{ 'active': editorStore.state.viewMode === 'desktop' }" 
            title="桌面视图"
            @click="editorStore.setViewMode('desktop')"
          >
            <span>🖥</span>
          </button>
        </div>
      </div>
      <div class="scene-viewport" ref="sceneViewport">
        <div class="grid-container">
          <!-- Grid lines would be rendered here -->
          
          <!-- 使用递归组件渲染场景对象层级 -->
          <scene-object-item
            v-for="obj in editorStore.getRootGameObjects()" 
            :key="obj.id"
            :game-object="obj"
            :depth="0"
            :is-dragging="isDragging"
            :dragged-object-id="draggedObject ? draggedObject.id : null"
            @start-drag="handleChildDrag"
          />
          
          <!-- 移除拖拽预览对象，改为直接拖拽移动 -->
          
          <div class="coordinates">
            <div class="coordinates-label">
              x: {{ isDragging ? currentPosition.x : mousePosition.x }}
              y: {{ isDragging ? currentPosition.y : mousePosition.y }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDraggable } from '@vueuse/core';
import editorStore from '../../store/editorStore';
import SceneObjectItem from '../items/SceneObjectItem.vue';

const sceneViewport = ref(null);
const mousePosition = ref({ x: 0, y: 0 });
const currentPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const draggedObject = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
const dragPreview = ref({
  visible: false,
  x: 0,
  y: 0,
  objectId: null,
  objectName: ''
});

const selectedObject = computed(() => {
  const id = editorStore.state.activeGameObject;
  return id ? editorStore.state.gameObjects.find(obj => obj.id === id) : null;
});

// 不再需要这个计算属性，因为我们现在使用 currentPosition 来跟踪位置

// 开始拖拽对象
const startDrag = (event, obj) => {
  // 只有在移动工具激活时才允许拖拽
  if (editorStore.state.activeTool !== 'move') {
    // 如果不是移动工具，只选中对象不拖拽
    editorStore.selectGameObject(obj.id, event.ctrlKey || event.metaKey);
    return;
  }
  
  // 设置当前拖拽的对象
  draggedObject.value = obj;
  isDragging.value = true;
  
  // 计算鼠标点击位置与对象位置的偏移量
  const rect = event.currentTarget.getBoundingClientRect();
  dragOffset.value = {
    x: event.clientX - obj.position.x,
    y: event.clientY - obj.position.y
  };
  
  // 直接拖拽模式，不需要预览
  
  // 添加鼠标移动和松开事件监听器
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  
  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
  
  // 在控制台显示正在移动的对象
  editorStore.addConsoleMessage('info', `开始移动对象: ${obj.name}`, '在编辑区中');
};

// 处理子组件发出的拖拽事件
const handleChildDrag = ({ event, object }) => {
  // 将事件传递给 startDrag 函数处理
  // startDrag 函数会检查当前工具是否为移动工具
  startDrag(event, object);
};

// 拖拽过程中直接更新对象位置
const onDrag = (event) => {
  // 确保当前工具是移动工具且正在拖拽
  if (!isDragging.value || !draggedObject.value || !sceneViewport.value || editorStore.state.activeTool !== 'move') return;
  
  const rect = sceneViewport.value.getBoundingClientRect();
  
  // 计算新位置（以左上角为原点）
  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;
  
  // 确保对象不会被拖出视口
  const clampedX = Math.max(0, Math.min(rect.width - 50, newX));
  const clampedY = Math.max(0, Math.min(rect.height - 50, newY));
  
  // 记录移动前的位置
  const oldX = draggedObject.value.position.x;
  const oldY = draggedObject.value.position.y;
  
  // 计算位置变化量
  const deltaX = Math.round(clampedX) - oldX;
  const deltaY = Math.round(clampedY) - oldY;
  
  // 直接更新对象位置
  draggedObject.value.position.x = Math.round(clampedX);
  draggedObject.value.position.y = Math.round(clampedY);
  
  // 当父对象移动时，子对象的相对位置应保持不变
  // 子对象的位置已经在 SceneObjectItem.vue 中正确计算
  // 这里不需要更新子对象的位置
  
  // 更新对象位置坐标显示
  currentPosition.value = {
    x: Math.round(clampedX),
    y: Math.round(clampedY)
  };
  
  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
};

// 停止拖拽
const stopDrag = (event) => {
  if (draggedObject.value) {
    // 保存最终位置到编辑器状态
    editorStore.updateGameObjectTransform(draggedObject.value.id, {
      position: { 
        x: draggedObject.value.position.x,
        y: draggedObject.value.position.y,
        z: draggedObject.value.position.z
      }
    });
    
    // 在控制台显示移动结果
    editorStore.addConsoleMessage('info', `对象移动到了 x: ${Math.round(draggedObject.value.position.x)}, y: ${Math.round(draggedObject.value.position.y)}`, '在编辑区中');
  }
  
  isDragging.value = false;
  draggedObject.value = null;
  
  // 移除事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  // 阻止事件冒泡和默认行为
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
};

onMounted(() => {
  // 添加鼠标移动事件监听
  if (sceneViewport.value) {
    sceneViewport.value.addEventListener('mousemove', (e) => {
      const rect = sceneViewport.value.getBoundingClientRect();
      mousePosition.value = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
      };
    });
  }
});
</script>

<style scoped>
.scene-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #2a2a2a;
  color: #e0e0e0;
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
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
}

.panel-btn:hover {
  background-color: #4a4a4a;
}

.panel-btn.active {
  background-color: #4d78cc;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scene-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  background-color: #333;
  border-bottom: 1px solid #222;
}

.scene-tools, .scene-views {
  display: flex;
  gap: 2px;
}

.tool-btn, .view-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
}

.tool-btn:hover, .view-btn:hover {
  background-color: #555;
}

.tool-btn.active {
  background-color: #4d78cc;
  border-color: #6699ff;
}

.scene-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #232323;
}

.grid-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(80, 80, 80, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(80, 80, 80, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.scene-object {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: move;
  z-index: 1;
  min-width: 40px;
  min-height: 40px;
  padding: 5px;
  border-radius: 3px;
}

.scene-object.original-object {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background-color: rgba(60, 60, 60, 0.3);
}

.scene-object.original-object.being-dragged {
  opacity: 0.5;
  border: 1px dotted rgba(255, 255, 255, 0.3);
}

.scene-object.active {
  border: 2px solid #4d78cc;
  background-color: rgba(77, 120, 204, 0.1);
  z-index: 2;
}

.scene-object.drag-preview {
  border: 2px dashed #4d78cc;
  background-color: rgba(77, 120, 204, 0.3);
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  from { box-shadow: 0 0 5px rgba(77, 120, 204, 0.5); }
  to { box-shadow: 0 0 15px rgba(77, 120, 204, 0.8); }
}

.object-gizmo {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.object-label {
  font-size: 10px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  pointer-events: none;
}

.coordinates {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
  z-index: 10;
}

.coordinates-label {
  color: #fff;
  font-family: monospace;
}

.axis-indicator {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 5px;
}

.axis {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  border-radius: 50%;
}

.axis.x {
  background-color: rgba(255, 0, 0, 0.7);
}

.axis.y {
  background-color: rgba(0, 255, 0, 0.7);
}

.axis.z {
  background-color: rgba(0, 100, 255, 0.7);
}
</style>
