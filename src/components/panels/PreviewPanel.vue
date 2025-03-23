<template>
  <div class="preview-panel">
    <div class="preview-header">
      <div class="preview-title">预览</div>
      <div class="preview-actions">
        <button class="preview-btn" @click="toggleFullscreen">全屏</button>
      </div>
    </div>
    <div class="preview-content">
      <div class="preview-scene">
        <!-- 这里将显示场景预览 -->
        <div class="preview-placeholder">
          <div class="preview-message">
            预览面板
            <br>
            这里将显示场景的预览
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // 这里可以添加全屏切换的逻辑
};
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
}

.preview-btn:hover {
  background-color: #4a4a4a;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.preview-scene {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  position: relative;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.preview-message {
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
</style>
