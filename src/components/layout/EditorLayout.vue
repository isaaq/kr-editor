<template>
  <div class="editor-layout">
    <div class="toolbar">
      <div class="logo">Unity-Like Editor</div>
      <div class="main-menu">
        <div class="menu-item">File</div>
        <div class="menu-item">Edit</div>
        <div class="menu-item">Assets</div>
        <div class="menu-item">GameObject</div>
        <div class="menu-item">Component</div>
        <div class="menu-item">Window</div>
        <div class="menu-item">Help</div>
      </div>
      <div class="toolbar-actions">
        <button 
          class="toolbar-btn" 
          :class="{ 'active': editorStore.state.isPlaying }" 
          @click="editorStore.togglePlay()"
        >
          {{ editorStore.state.isPlaying ? '停止' : '播放' }}
        </button>
        <button 
          class="toolbar-btn" 
          :class="{ 'disabled': !editorStore.state.isPlaying }"
        >暂停</button>
      </div>
    </div>
    
    <div class="main-content">
      <Splitpanes class="default-theme" horizontal>
        <Pane :size="75">
          <Splitpanes>
            <Pane :size="20" min-size="10">
              <HierarchyPanel />
            </Pane>
            <Pane :size="60" min-size="30">
              <ScenePanel />
            </Pane>
            <Pane :size="20" min-size="10">
              <InspectorPanel />
            </Pane>
          </Splitpanes>
        </Pane>
        <Pane :size="25" min-size="10">
          <ProjectConsolePanel />
        </Pane>
      </Splitpanes>
    </div>
    
    <div class="status-bar">
      <div class="status-item">Ready</div>
      <div class="status-item">FPS: 60</div>
    </div>
  </div>
</template>

<script setup>
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import HierarchyPanel from '../panels/HierarchyPanel.vue';
import ScenePanel from '../panels/ScenePanel.vue';
import InspectorPanel from '../panels/InspectorPanel.vue';
import ProjectConsolePanel from '../panels/ProjectConsolePanel.vue';
import editorStore from '../../store/editorStore';
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 100%;
  background-color: #333;
  color: #e0e0e0;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.toolbar {
  display: flex;
  height: 40px;
  background-color: #444;
  border-bottom: 1px solid #222;
  align-items: center;
  padding: 0 10px;
}

.logo {
  font-weight: bold;
  padding-right: 20px;
}

.main-menu {
  display: flex;
  gap: 15px;
}

.menu-item {
  cursor: pointer;
  padding: 5px;
}

.menu-item:hover {
  background-color: #555;
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  gap: 5px;
}

.toolbar-btn {
  background-color: #4a4a4a;
  border: 1px solid #666;
  color: #e0e0e0;
  padding: 3px 10px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background-color: #5a5a5a;
}

.toolbar-btn.active {
  background-color: #cc4d4d;
  border-color: #ff6666;
}

.toolbar-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  overflow: hidden;
  width: 100%;
  display: flex;
}

:deep(.splitpanes) {
  width: 100%;
  height: 100%;
  display: flex;
}

.status-bar {
  height: 25px;
  background-color: #444;
  border-top: 1px solid #222;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
}

.status-item {
  margin-right: 15px;
}

:deep(.splitpanes__pane) {
  background-color: #2a2a2a;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

:deep(.splitpanes__splitter) {
  background-color: #444;
  position: relative;
}

:deep(.splitpanes__splitter:before) {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: #666;
  opacity: 0;
  z-index: 1;
}

:deep(.splitpanes__splitter:hover:before) {
  opacity: 1;
}

:deep(.splitpanes--horizontal > .splitpanes__splitter:before) {
  left: 0;
  right: 0;
  height: 3px;
  top: calc(50% - 1px);
}

:deep(.splitpanes--vertical > .splitpanes__splitter:before) {
  top: 0;
  bottom: 0;
  width: 3px;
  left: calc(50% - 1px);
}
</style>
