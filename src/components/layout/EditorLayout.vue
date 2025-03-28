<template>
  <div class="editor-layout">
    <div class="toolbar">
      <div class="logo">Kr Editor</div>
      <div class="main-menu">
        <div 
          v-for="(item, index) in menuItems" 
          :key="index" 
          class="menu-item"
          @mouseover="showSubMenu(index)"
          @mouseleave="hideSubMenu(index)"
        >
          <div class="menu-item-title">{{ item.title }}</div>
          <div 
            v-if="item.content && isSubMenuVisible[index]" 
            class="menu-item-content"
            @mouseleave="hideSubMenu(index)"
          >
            <div 
              v-for="(subItem, subIndex) in item.content" 
              :key="subIndex" 
              class="menu-item"
              @click="handleMenuItemClick(subItem.action)"
            >
              {{ subItem.label }}
            </div>
          </div>
        </div>
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
              <div class="tabbed-panel">
                <div class="panel-tabs">
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'scene' }"
                    @click="currentTab = 'scene'"
                  >Scene</button>
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'preview' }"
                    @click="currentTab = 'preview'"
                  >Preview</button>
                </div>
                <div class="panel-content">
                  <ScenePanel v-if="currentTab === 'scene'" />
                  <PreviewPanel v-if="currentTab === 'preview'" />
                </div>
              </div>
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
import PreviewPanel from '../panels/PreviewPanel.vue';
import editorStore from '../../store/editorStore';
import { ref } from 'vue';

const currentTab = ref('scene');
const isSubMenuVisible = ref([]);

const menuItems = [
  {
    title: 'File',
    content: [
      { label: 'New Scene', action: () => editorStore.newScene() },
      { label: 'Open Scene', action: () => editorStore.openScene() },
      { label: 'Save Scene', action: () => editorStore.saveScene() },
      { label: 'Save Scene As', action: () => editorStore.saveSceneAs() }
    ]
  },
  { title: 'Edit' },
  { title: 'Assets' },
  { title: 'GameObject' },
  { title: 'Component' },
  { title: 'Window' },
  { title: 'Help' }
];

const showSubMenu = (index) => {
  isSubMenuVisible.value[index] = true;
};

const hideSubMenu = (index) => {
  isSubMenuVisible.value[index] = false;
};

const handleMenuItemClick = (action) => {
  if (typeof action === 'function') {
    action();
  }
};
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
  position: relative;
  cursor: pointer;
  padding: 5px;
}

.menu-item:hover {
  background-color: #555;
}

.menu-item-content {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #444;
  border: 1px solid #666;
  z-index: 1000;
  min-width: 150px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.menu-item-content .menu-item {
  padding: 5px 10px;
  width: 100%;
  display: block;
}

.menu-item-content .menu-item:hover {
  background-color: #5a5a5a;
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

:deep(.splitpanes__pane) {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
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

.tabbed-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  height: 30px;
  background-color: #3a3a3a;
  border-bottom: 1px solid #222;
  padding: 0 10px;
}

.tab-btn {
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  margin-right: 5px;
}

.tab-btn:hover {
  background-color: #4a4a4a;
}

.tab-btn.active {
  background-color: #4d78cc;
  color: white;
}

.panel-content {
  flex: 1;
  height: calc(100% - 30px);
  overflow: hidden;
  position: relative;
}
</style>
