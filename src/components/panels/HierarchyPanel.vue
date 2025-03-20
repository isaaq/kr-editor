<template>
  <div class="hierarchy-panel">
    <div class="panel-header">
      <div class="panel-title">层级结构</div>
      <div class="panel-actions">
        <button class="panel-btn" @click="addNewGameObject">+</button>
        <button class="panel-btn">⋮</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="搜索..." />
      </div>
      <div class="hierarchy-list">
        <div class="hierarchy-item scene-item">
          <div class="item-icon">◆</div>
          <div class="item-name">SampleScene</div>
        </div>
        
        <!-- 递归渲染树形结构 -->
        <template v-if="!searchQuery">
          <game-object-item 
            v-for="obj in rootGameObjects" 
            :key="obj.id" 
            :game-object="obj" 
            :depth="0"
          />
        </template>
        
        <!-- 搜索结果平铺显示 -->
        <template v-else>
          <div 
            v-for="obj in filteredGameObjects()" 
            :key="obj.id"
            class="hierarchy-item"
            :class="{ 'active': editorStore.state.activeGameObject === obj.id }"
            @click="selectGameObject(obj.id)"
          >
            <div class="item-icon">◆</div>
            <div class="item-name">{{ obj.name }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import editorStore from '../../store/editorStore';
import GameObjectItem from '../items/GameObjectItem.vue';

const searchQuery = ref('');

// 获取根级游戏对象
const rootGameObjects = computed(() => {
  return editorStore.getRootGameObjects();
});

// 递归搜索所有游戏对象（包括子对象）
const filteredGameObjects = () => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return [];
  
  const results = [];
  
  const searchInObjects = (objects) => {
    for (const obj of objects) {
      if (obj.name.toLowerCase().includes(query)) {
        results.push(obj);
      }
      if (obj.children && obj.children.length > 0) {
        searchInObjects(obj.children);
      }
    }
  };
  
  searchInObjects(editorStore.state.gameObjects);
  return results;
};

const selectGameObject = (id) => {
  editorStore.selectGameObject(id);
};

const toggleExpanded = (id) => {
  editorStore.toggleGameObjectExpanded(id);
};

const addNewGameObject = () => {
  // 添加新的游戏对象
  const newId = Math.max(...editorStore.state.gameObjects.map(obj => obj.id)) + 1;
  const newGameObject = {
    id: newId,
    name: '新游戏对象',
    type: 'GameObject',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    components: ['Transform'],
    parentId: null,
    isExpanded: true,
    children: []
  };
  
  editorStore.state.gameObjects.push(newGameObject);
  editorStore.selectGameObject(newId);
  editorStore.addConsoleMessage('info', `创建了新游戏对象: ${newGameObject.name}`, 'at Editor.CreateGameObject()');
};
</script>

<!-- 游戏对象项组件 -->
<script>
import { defineComponent } from 'vue';
import editorStore from '../../store/editorStore';

export default defineComponent({
  name: 'GameObjectItem',
  props: {
    gameObject: Object,
    depth: Number
  },
  methods: {
    selectGameObject(id) {
      editorStore.selectGameObject(id);
    },
    toggleExpanded(id) {
      editorStore.toggleGameObjectExpanded(id);
    }
  }
});
</script>

<style scoped>
.hierarchy-panel {
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

.search-bar {
  margin-bottom: 10px;
}

.search-bar input {
  width: 100%;
  background-color: #444;
  border: 1px solid #555;
  color: #e0e0e0;
  padding: 5px;
  font-size: 12px;
}

.hierarchy-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

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

.scene-item {
  font-weight: bold;
  margin-bottom: 5px;
  border-bottom: 1px solid #444;
  padding-bottom: 8px;
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
}
</style>
