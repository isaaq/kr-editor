<template>
  <div 
    class="scene-object" 
    :class="{ 
      'active': editorStore.state.activeGameObject === gameObject.id,
      'being-dragged': isDragging && draggedObjectId === gameObject.id
    }"
    :style="{
      left: `${getAbsolutePosition().x}px`, 
      top: `${getAbsolutePosition().y}px`,
      transform: `scale(${gameObject.scale.x}, ${gameObject.scale.y}) rotate(${gameObject.rotation.z}deg)`,
      zIndex: depth
    }"
    @click="editorStore.selectGameObject(gameObject.id, $event.ctrlKey || $event.metaKey)"
    @mousedown="handleMouseDown($event, gameObject)"
  >
    <div class="object-content" :class="gameObject.type.toLowerCase()">
      <!-- 根据对象类型渲染不同的内容 -->
      <div v-if="gameObject.type === 'Container'" class="container-object"></div>
      <div v-else-if="gameObject.type === 'Table'" class="table-object">
        <div class="table-header"></div>
        <div class="table-row" v-for="i in 3" :key="i"></div>
      </div>
      <div v-else class="default-object"></div>
      
      <div class="object-gizmo">+</div>
      <div class="object-label">{{ gameObject.name }}</div>
    </div>
    
    <!-- 递归渲染子对象 -->
    <scene-object-item
      v-for="child in gameObject.children"
      :key="child.id"
      :game-object="child"
      :depth="depth + 1"
      :parent-position="getAbsolutePosition()"
      :is-dragging="isDragging"
      :dragged-object-id="draggedObjectId"
      @start-drag="$emit('start-drag', $event)"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import editorStore from '../../store/editorStore';

const props = defineProps({
  gameObject: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  parentPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  draggedObjectId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['start-drag']);

// 计算对象的绝对位置（考虑父对象的位置）
const getAbsolutePosition = () => {
  // 根对象直接使用自己的位置
  return {
    x: props.gameObject.position.x,
    y: props.gameObject.position.y
  };
};

// 处理鼠标按下事件
const handleMouseDown = (event, obj) => {
  // 只有在移动工具激活时才允许拖拽
  if (editorStore.state.activeTool === 'move') {
    emit('start-drag', { event, object: obj });
  } else {
    // 其他工具模式下只选中对象，不拖拽
    editorStore.selectGameObject(obj.id, event.ctrlKey || event.metaKey);
  }
  
  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
};
</script>

<style scoped>
.scene-object {
  position: absolute;
  min-width: 50px;
  min-height: 50px;
  cursor: pointer;
  user-select: none;
}

.object-content {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px dashed #666;
  background-color: rgba(80, 80, 80, 0.2);
  border-radius: 4px;
}

.object-content.container {
  background-color: rgba(100, 100, 180, 0.2);
  min-width: 100px;
  min-height: 100px;
}

.object-content.table {
  background-color: rgba(100, 180, 100, 0.2);
  min-width: 150px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.table-header {
  height: 30px;
  background-color: rgba(80, 150, 80, 0.3);
  border-bottom: 1px solid #666;
}

.table-row {
  height: 25px;
  border-bottom: 1px solid #888;
  background-color: rgba(200, 200, 200, 0.1);
}

.object-gizmo {
  position: absolute;
  top: -15px;
  left: -15px;
  width: 15px;
  height: 15px;
  background-color: #4a90e2;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.object-label {
  position: absolute;
  top: -25px;
  left: 5px;
  font-size: 12px;
  color: #e0e0e0;
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 5px;
  border-radius: 2px;
}

.scene-object.active > .object-content {
  border: 2px solid #4a90e2;
}

.scene-object.being-dragged > .object-content {
  opacity: 0.7;
}

.default-object {
  width: 100%;
  height: 100%;
  min-width: 50px;
  min-height: 50px;
}
</style>
