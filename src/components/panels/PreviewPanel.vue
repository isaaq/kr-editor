<template>
  <div class="preview-panel">
    <div class="preview-header">
      <div class="preview-title">预览</div>
      <div class="preview-actions">
        <button 
          class="preview-btn" 
          :class="{ 'active': editorStore.state.viewMode === 'mobile' }"
          @click="editorStore.setViewMode('mobile')"
        >
          📱
        </button>
        <button 
          class="preview-btn" 
          :class="{ 'active': editorStore.state.viewMode === 'tablet' }"
          @click="editorStore.setViewMode('tablet')"
        >
          📋
        </button>
        <button 
          class="preview-btn" 
          :class="{ 'active': editorStore.state.viewMode === 'desktop' }"
          @click="editorStore.setViewMode('desktop')"
        >
          🖥
        </button>
        <button class="preview-btn" @click="toggleFullscreen">
          <span v-if="isFullscreen">⬇️</span>
          <span v-else>⬆️</span>
        </button>
      </div>
    </div>
    <div class="preview-content">
      <div 
        class="preview-device" 
        :class="{
          'mobile': editorStore.state.viewMode === 'mobile',
          'tablet': editorStore.state.viewMode === 'tablet',
          'desktop': editorStore.state.viewMode === 'desktop'
        }"
      >
        <div class="device-frame">
          <div class="device-screen">
            <!-- 这里将显示页面预览 -->
            <div class="page-preview">
              <div v-if="editorStore.getRootGameObjects().length === 0" class="empty-preview">
                暂无内容可预览
              </div>
              <div v-else class="preview-content-container">
                <!-- 这里将根据编辑器中的内容生成预览 -->
                <div class="preview-element" v-for="obj in editorStore.getRootGameObjects()" :key="obj.id">
                  <div class="element-label">{{ obj.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import editorStore from '../../store/editorStore';

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // 这里可以添加全屏切换的逻辑
};

// 计算当前设备类型的尺寸
// 可以根据实际需求调整这些尺寸
const deviceDimensions = computed(() => {
  switch (editorStore.state.viewMode) {
    case 'mobile':
      return { width: 375, height: 667 };
    case 'tablet':
      return { width: 768, height: 1024 };
    case 'desktop':
    default:
      return { width: 1280, height: 800 };
  }
});
</script>

<style scoped>
.preview-panel {
  height: 100%;
  background-color: #2a2a2a;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 30px;
  background-color: #3a3a3a;
  border-bottom: 1px solid #222;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.preview-title {
  font-weight: bold;
  font-size: 14px;
}

.preview-actions {
  margin-left: auto;
  display: flex;
  gap: 5px;
}

.preview-btn {
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 3px;
}

.preview-btn:hover {
  background-color: #4a4a4a;
}

.preview-btn.active {
  background-color: #4d78cc;
  color: white;
}

.preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #1a1a1a;
}

.preview-device {
  position: relative;
  transition: all 0.3s ease;
  margin: auto;
}

.preview-device.mobile {
  width: 375px;
  height: 667px;
  max-height: 90%;
}

.preview-device.tablet {
  width: 768px;
  height: 1024px;
  max-height: 90%;
}

.preview-device.desktop {
  width: 1280px;
  height: 800px;
  max-width: 90%;
  max-height: 90%;
}

.device-frame {
  width: 100%;
  height: 100%;
  border: 2px solid #444;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.device-screen {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: white;
  color: #333;
}

.page-preview {
  min-height: 100%;
  position: relative;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.preview-content-container {
  padding: 10px;
}

.preview-element {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.element-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}
</style>
