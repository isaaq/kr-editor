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
            <!-- 动态渲染组件属性 -->
            <template v-for="(property, index) in getComponentProperties(component)" :key="index">
              <div class="property-row">
                <div class="property-label">{{ property.label }}</div>
                <div class="property-inputs">
                  <!-- 根据属性类型渲染不同的输入控件 -->
                  
                  <!-- 文本输入 -->
                  <input v-if="property.type === 'text'" 
                    type="text" 
                    :value="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @input="e => updateComponentProperty(component, property.name, e.target.value)" 
                    class="property-input" />
                  
                  <!-- 数字输入 -->
                  <input v-else-if="property.type === 'number'" 
                    type="number" 
                    :min="property.min" 
                    :max="property.max" 
                    :value="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @input="e => updateComponentProperty(component, property.name, parseFloat(e.target.value))" 
                    class="property-input" />
                  
                  <!-- 布尔值 (复选框) -->
                  <input v-else-if="property.type === 'boolean'" 
                    type="checkbox" 
                    :checked="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @change="e => updateComponentProperty(component, property.name, e.target.checked)" 
                    class="property-checkbox" />
                  
                  <!-- 下拉选择 -->
                  <select v-else-if="property.type === 'select'" 
                    :value="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @change="e => updateComponentProperty(component, property.name, e.target.value)" 
                    class="property-select">
                    <option v-for="option in property.options" :key="option" :value="option">{{ option }}</option>
                  </select>
                  
                  <!-- 颜色选择器 -->
                  <input v-else-if="property.type === 'color'" 
                    type="color" 
                    :value="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @input="e => updateComponentProperty(component, property.name, e.target.value)" 
                    class="property-color" />
                  
                  <!-- 向量2输入 (x, y) -->
                  <div v-else-if="property.type === 'vector2'" class="vector-inputs">
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).x" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'x', parseFloat(e.target.value))" 
                      class="property-input" />
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).y" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'y', parseFloat(e.target.value))" 
                      class="property-input" />
                  </div>
                  
                  <!-- 向量4输入 (x, y, z, w) -->
                  <div v-else-if="property.type === 'vector4'" class="vector-inputs">
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).x" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'x', parseFloat(e.target.value))" 
                      class="property-input" />
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).y" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'y', parseFloat(e.target.value))" 
                      class="property-input" />
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).z" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'z', parseFloat(e.target.value))" 
                      class="property-input" />
                    <input type="number" 
                      :value="getComponentPropertyValue(component, property.name, property.defaultValue).w" 
                      @input="e => updateComponentVectorProperty(component, property.name, 'w', parseFloat(e.target.value))" 
                      class="property-input" />
                  </div>
                  
                  <!-- 对象引用 -->
                  <div v-else-if="property.type === 'object'" class="property-object-field">
                    <div class="object-field-preview"></div>
                    <div class="object-field-name">{{ getComponentPropertyValue(component, property.name, property.defaultValue) }}</div>
                    <button class="object-field-btn" @click="selectObjectReference(component, property.name, property.objectType)">⋯</button>
                  </div>
                  
                  <!-- 默认情况：文本输入 -->
                  <input v-else 
                    type="text" 
                    :value="getComponentPropertyValue(component, property.name, property.defaultValue)" 
                    @input="e => updateComponentProperty(component, property.name, e.target.value)" 
                    class="property-input" />
                </div>
              </div>
            </template>
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
import componentConfig from '../../config/componentConfig';

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

// 获取组件的属性配置
const getComponentProperties = (componentType) => {
  // 如果组件类型存在于配置中，返回其属性，否则返回默认配置
  return (componentConfig[componentType] || componentConfig.default).properties;
};

// 获取组件属性的值
const getComponentPropertyValue = (componentType, propertyName, defaultValue) => {
  if (!selectedObject.value) return defaultValue;
  
  // 检查组件数据是否存在
  if (!selectedObject.value.componentData) {
    selectedObject.value.componentData = {};
  }
  
  // 检查特定组件的数据是否存在
  if (!selectedObject.value.componentData[componentType]) {
    selectedObject.value.componentData[componentType] = {};
  }
  
  // 返回属性值，如果不存在则返回默认值
  return selectedObject.value.componentData[componentType][propertyName] !== undefined
    ? selectedObject.value.componentData[componentType][propertyName]
    : defaultValue;
};

// 更新组件属性
const updateComponentProperty = (componentType, propertyName, value) => {
  if (!selectedObject.value) return;
  
  // 确保组件数据存在
  if (!selectedObject.value.componentData) {
    selectedObject.value.componentData = {};
  }
  
  // 确保特定组件的数据存在
  if (!selectedObject.value.componentData[componentType]) {
    selectedObject.value.componentData[componentType] = {};
  }
  
  // 更新属性值
  selectedObject.value.componentData[componentType][propertyName] = value;
  
  // 在实际应用中，这里应该调用 editorStore 中的方法来更新组件数据
  // 例如：editorStore.updateComponentProperty(selectedObject.value.id, componentType, propertyName, value);
  
  // 临时记录到控制台
  editorStore.addConsoleMessage('info', `更新了 ${componentType} 组件的 ${propertyName} 属性为 ${value}`, '在检查器中');
};

// 更新向量类型的组件属性
const updateComponentVectorProperty = (componentType, propertyName, axis, value) => {
  if (!selectedObject.value) return;
  
  // 确保组件数据存在
  if (!selectedObject.value.componentData) {
    selectedObject.value.componentData = {};
  }
  
  // 确保特定组件的数据存在
  if (!selectedObject.value.componentData[componentType]) {
    selectedObject.value.componentData[componentType] = {};
  }
  
  // 确保向量属性存在
  if (!selectedObject.value.componentData[componentType][propertyName]) {
    // 根据轴的数量创建适当的向量对象
    if (axis === 'w') {
      selectedObject.value.componentData[componentType][propertyName] = { x: 0, y: 0, z: 0, w: 0 };
    } else if (axis === 'z') {
      selectedObject.value.componentData[componentType][propertyName] = { x: 0, y: 0, z: 0 };
    } else {
      selectedObject.value.componentData[componentType][propertyName] = { x: 0, y: 0 };
    }
  }
  
  // 更新特定轴的值
  selectedObject.value.componentData[componentType][propertyName][axis] = value;
  
  // 在实际应用中，这里应该调用 editorStore 中的方法来更新组件数据
  // 例如：editorStore.updateComponentVectorProperty(selectedObject.value.id, componentType, propertyName, axis, value);
  
  // 临时记录到控制台
  editorStore.addConsoleMessage('info', `更新了 ${componentType} 组件的 ${propertyName}.${axis} 属性为 ${value}`, '在检查器中');
};

// 选择对象引用
const selectObjectReference = (componentType, propertyName, objectType) => {
  // 在实际应用中，这里应该打开一个对象选择器
  editorStore.addConsoleMessage('info', `尝试为 ${componentType} 组件的 ${propertyName} 属性选择 ${objectType} 类型的对象`, '在检查器中');
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
  width: 60px;
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
  height: 20px;
  width: 100%;
}

.property-select {
  width: 100%;
  background-color: #333;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 2px 4px;
  font-size: 12px;
  height: 20px;
  
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

.vector-inputs {
  display: flex;
  gap: 2px;
}
</style>
