<template>
  <div class="inspector-panel">
    <div class="panel-header">
      <div class="panel-title">检查器</div>
      <div class="panel-actions">
        <button class="panel-btn">⋮</button>
      </div>
    </div>
    <div class="panel-content">
      <div v-if="selectedObject" class="object-header">
        <input type="text" :value="selectedObject.name" class="object-name-input" />
        <div class="object-type">{{ selectedObject.type }}</div>
      </div>
      
      <div v-if="!selectedObject" class="no-selection">
        <div class="no-selection-text">未选择游戏对象</div>
      </div>
      
      <template v-if="selectedObject">
        <!-- Transform Component -->
        <div class="component-section active">
          <div class="component-header">
            <div class="component-toggle">▼</div>
            <div class="component-title">Transform</div>
            <div class="component-actions">
              <button class="component-btn">⋮</button>
            </div>
          </div>
          <div class="component-body">
            <div class="property-row">
              <div class="property-label">位置</div>
              <div class="property-inputs">
                <input 
                  type="text" 
                  :value="selectedObject.position.x" 
                  @input="e => updateTransform('position', 'x', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.position.y" 
                  @input="e => updateTransform('position', 'y', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.position.z" 
                  @input="e => updateTransform('position', 'z', e.target.value)" 
                  class="property-input" 
                />
              </div>
            </div>
            <div class="property-row">
              <div class="property-label">旋转</div>
              <div class="property-inputs">
                <input 
                  type="text" 
                  :value="selectedObject.rotation.x" 
                  @input="e => updateTransform('rotation', 'x', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.rotation.y" 
                  @input="e => updateTransform('rotation', 'y', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.rotation.z" 
                  @input="e => updateTransform('rotation', 'z', e.target.value)" 
                  class="property-input" 
                />
              </div>
            </div>
            <div class="property-row">
              <div class="property-label">缩放</div>
              <div class="property-inputs">
                <input 
                  type="text" 
                  :value="selectedObject.scale.x" 
                  @input="e => updateTransform('scale', 'x', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.scale.y" 
                  @input="e => updateTransform('scale', 'y', e.target.value)" 
                  class="property-input" 
                />
                <input 
                  type="text" 
                  :value="selectedObject.scale.z" 
                  @input="e => updateTransform('scale', 'z', e.target.value)" 
                  class="property-input" 
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Other Components -->
        <div v-for="component in selectedObject.components.filter(c => c !== 'Transform')" :key="component" class="component-section">
          <div class="component-header">
            <div class="component-toggle">▼</div>
            <div class="component-title">{{ component }}</div>
            <div class="component-actions">
              <button class="component-btn">⋮</button>
            </div>
          </div>
          <div class="component-body">
            <!-- Component specific properties would go here -->
            <div v-if="component === 'MeshRenderer'" class="property-row">
              <div class="property-label">Cast Shadows</div>
              <div class="property-inputs">
                <select class="property-select">
                  <option>On</option>
                  <option>Off</option>
                  <option>Two Sided</option>
                  <option>Shadows Only</option>
                </select>
              </div>
            </div>
            <div v-if="component === 'MeshRenderer'" class="property-row">
              <div class="property-label">Materials</div>
              <div class="property-inputs">
                <div class="property-object-field">
                  <div class="object-field-preview"></div>
                  <div class="object-field-name">Default Material</div>
                  <button class="object-field-btn">⋯</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="add-component-btn" @click="showAddComponentMenu">添加组件</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import editorStore from '../../store/editorStore';

const selectedObject = computed(() => {
  const id = editorStore.state.activeGameObject;
  return id ? editorStore.state.gameObjects.find(obj => obj.id === id) : null;
});

const showComponentMenu = ref(false);
const availableComponents = ref([
  'MeshRenderer',
  'BoxCollider',
  'SphereCollider',
  'RigidBody',
  'AudioSource',
  'Light',
  'Camera',
  'Script'
]);

const updateTransform = (property, axis, value) => {
  if (!selectedObject.value) return;
  
  const transform = {};
  transform[property] = { ...selectedObject.value[property] };
  transform[property][axis] = parseFloat(value) || 0;
  
  editorStore.updateGameObjectTransform(selectedObject.value.id, transform);
};

const updateObjectName = (event) => {
  const newName = event.target.value.trim();
  if (newName && selectedObject.value) {
    editorStore.updateGameObjectName(selectedObject.value.id, newName);
  }
};

const showAddComponentMenu = () => {
  showComponentMenu.value = true;
  // 在真实应用中，这里会显示一个下拉菜单或弹出窗口
  editorStore.logToConsole('info', '点击了添加组件按钮', '这个功能将在下一个版本中实现');
};

const removeComponent = (index) => {
  if (selectedObject.value) {
    // 在真实应用中，这里会调用一个方法来移除组件
    editorStore.logToConsole('warning', '尝试移除组件', `移除组件将在下一个版本中实现`);  
  }
};
</script>

<style scoped>
.inspector-panel {
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
  font-size: 14px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-btn:hover {
  background-color: #4a4a4a;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

/* Object Header */
.object-header {
  background-color: #444;
  padding: 8px 5px;
  margin-bottom: 10px;
  border-radius: 3px;
  border: 1px solid #555;
}

.object-name-input {
  width: 100%;
  background-color: #333;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 4px 6px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.object-type {
  font-size: 11px;
  color: #aaa;
}

/* No Selection State */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #333;
  border-radius: 3px;
  margin-bottom: 10px;
}

.no-selection-text {
  color: #777;
  font-style: italic;
  font-size: 14px;
}

.component-section {
  background-color: #3a3a3a;
  border-radius: 3px;
  margin-bottom: 5px;
  border: 1px solid #444;
}

.component-section.active {
  background-color: #404040;
}

.component-header {
  display: flex;
  align-items: center;
  padding: 5px;
  background-color: #444;
  cursor: pointer;
}

.component-toggle {
  margin-right: 5px;
  font-size: 10px;
  color: #aaa;
}

.component-title {
  flex: 1;
  font-size: 13px;
  font-weight: bold;
}

.component-actions {
  display: flex;
}

.component-btn {
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-btn:hover {
  background-color: #555;
}

.component-body {
  padding: 5px;
}

.property-row {
  display: flex;
  margin-bottom: 3px;
  font-size: 12px;
}

.property-label {
  width: 80px;
  padding-top: 4px;
}

.property-inputs {
  flex: 1;
  display: flex;
  gap: 2px;
}

.property-input {
  flex: 1;
  background-color: #333;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 2px 4px;
  font-size: 12px;
  text-align: center;
}

.property-select {
  width: 100%;
  background-color: #333;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 2px 4px;
  font-size: 12px;
}

.property-object-field {
  display: flex;
  align-items: center;
  background-color: #333;
  border: 1px solid #555;
  padding: 2px;
  width: 100%;
}

.object-field-preview {
  width: 16px;
  height: 16px;
  background-color: #666;
  margin-right: 5px;
}

.object-field-name {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.object-field-btn {
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-component-btn {
  text-align: center;
  background-color: #444;
  border-radius: 3px;
  padding: 5px;
  margin-top: 5px;
  cursor: pointer;
  font-size: 12px;
}

.add-component-btn:hover {
  background-color: #555;
}
</style>
