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
          
          <!-- 动态生成场景对象 -->
          <div 
            v-for="obj in editorStore.getRootGameObjects()" 
            :key="obj.id"
            class="scene-object original-object" 
            :class="{ 
              'active': editorStore.state.activeGameObject === obj.id,
              'being-dragged': isDragging && draggedObject && draggedObject.id === obj.id
            }"
            :style="{
              left: `${obj.position.x}px`, 
              top: `${obj.position.y}px`,
              transform: `scale(${obj.scale.x}, ${obj.scale.y}) rotate(${obj.rotation.z}deg)`
            }"
            @click="editorStore.selectGameObject(obj.id, $event.ctrlKey || $event.metaKey)"
            @mousedown="startDrag($event, obj)"
          >
            <div class="object-gizmo">+</div>
            <div class="object-label">{{ obj.name }}</div>
          </div>
          
          <!-- 拖拽预览对象 -->
          <div 
            v-if="dragPreview.visible" 
            class="scene-object drag-preview" 
            :style="{
              left: `${dragPreview.x}px`, 
              top: `${dragPreview.y}px`
            }"
          >
            <div class="object-gizmo">+</div>
            <div class="object-label">{{ dragPreview.objectName }}</div>
          </div>
          
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
  // 设置当前拖拽的对象
  draggedObject.value = obj;
  isDragging.value = true;
  
  // 计算鼠标点击位置与对象位置的偏移量
  const rect = event.currentTarget.getBoundingClientRect();
  dragOffset.value = {
    x: event.clientX - obj.position.x,
    y: event.clientY - obj.position.y
  };
  
  // 显示拖拽预览
  dragPreview.value = {
    visible: true,
    x: obj.position.x,
    y: obj.position.y,
    objectId: obj.id,
    objectName: obj.name
  };
  
  // 添加鼠标移动和松开事件监听器
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  
  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
};

// 拖拽过程中更新对象位置
const onDrag = (event) => {
  if (!isDragging.value || !draggedObject.value || !sceneViewport.value) return;
  
  const rect = sceneViewport.value.getBoundingClientRect();
  
  // 计算新位置（以左上角为原点）
  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;
  
  // 确保对象不会被拖出视口
  const clampedX = Math.max(0, Math.min(rect.width - 50, newX));
  const clampedY = Math.max(0, Math.min(rect.height - 50, newY));
  
  // 更新拖拽预览位置
  dragPreview.value.x = Math.round(clampedX);
  dragPreview.value.y = Math.round(clampedY);
  
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
  if (draggedObject.value && dragPreview.value.visible) {
    // 更新对象到预览位置
    draggedObject.value.position.x = dragPreview.value.x;
    draggedObject.value.position.y = dragPreview.value.y;
    
    // 保存最终位置到编辑器状态
    editorStore.updateGameObjectTransform(draggedObject.value.id, {
      position: { 
        x: dragPreview.value.x,
        y: dragPreview.value.y,
        z: draggedObject.value.position.z
      }
    });
  }
  
  // 隐藏拖拽预览
  dragPreview.value.visible = false;
  
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
