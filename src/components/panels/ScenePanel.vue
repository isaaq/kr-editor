<template>
  <div class="scene-panel">
    <div class="panel-header">
      <div class="panel-title">Scene</div>
      <div class="panel-actions">
        <button class="panel-btn">2D</button>
        <button class="panel-btn active">3D</button>
        <button class="panel-btn">⋮</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="scene-toolbar">
        <div class="scene-tools">
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'move' }" 
            title="移动工具 (W)"
            @click="editorStore.setActiveTool('move')"
          >
            <span>↕</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'rotate' }" 
            title="旋转工具 (E)"
            @click="editorStore.setActiveTool('rotate')"
          >
            <span>⟳</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'scale' }" 
            title="缩放工具 (R)"
            @click="editorStore.setActiveTool('scale')"
          >
            <span>⤢</span>
          </button>
          <button 
            class="tool-btn" 
            :class="{ 'active': editorStore.state.activeTool === 'rect' }" 
            title="矩形工具 (T)"
            @click="editorStore.setActiveTool('rect')"
          >
            <span>□</span>
          </button>
        </div>
        <div class="scene-views">
          <button class="view-btn" title="顶视图">
            <span>T</span>
          </button>
          <button class="view-btn" title="前视图">
            <span>F</span>
          </button>
          <button class="view-btn" title="侧视图">
            <span>S</span>
          </button>
          <button 
            class="view-btn" 
            :class="{ 'active': editorStore.state.viewMode === '2D' }" 
            title="切换2D/3D视图"
            @click="editorStore.toggleViewMode()"
          >
            <span>{{ editorStore.state.viewMode }}</span>
          </button>
        </div>
      </div>
      <div class="scene-viewport" ref="sceneViewport">
        <div class="grid-container">
          <!-- Grid lines would be rendered here -->
          <div class="scene-object" ref="gameObject" style="left: 50%; top: 50%;">
            <div class="object-gizmo">+</div>
            <div class="object-label">GameObject</div>
          </div>
          <div class="axis-indicator">
            <div class="axis x">X</div>
            <div class="axis y">Y</div>
            <div class="axis z">Z</div>
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
const gameObject = ref(null);

const selectedObject = computed(() => {
  const id = editorStore.state.activeGameObject;
  return id ? editorStore.state.gameObjects.find(obj => obj.id === id) : null;
});

onMounted(() => {
  if (gameObject.value && sceneViewport.value) {
    const { style } = useDraggable(gameObject, {
      containerElement: sceneViewport,
      initialValue: { x: 0, y: 0 },
      preventDefault: true,
      stopPropagation: true,
      onMove: () => {
        // 在现实应用中，我们可以在这里更新对象的位置
        if (selectedObject.value) {
          // 处理拖拽更新逻辑
        }
      }
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
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: move;
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
