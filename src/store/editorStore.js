import { reactive, readonly } from 'vue';

// Define the initial state
const state = reactive({
  activeGameObject: null,
  selectedGameObjects: [], // 多选游戏对象
  activeAsset: null,
  gameObjects: [
    {
      id: 1,
      name: 'Page',
      type: 'Page',
      position: { x: 0, y: 0, z: -10 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      components: ['Transform', 'Camera'],
      parentId: null,
      isExpanded: true,
      children: []
    },
    {
      id: 2,
      name: '容器1',
      type: 'Container',
      position: { x: 0, y: 3, z: 0 },
      rotation: { x: 50, y: -30, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      components: ['Transform', 'Container'],
      parentId: null,
      isExpanded: true,
      children: []
    },
    {
      id: 3,
      name: '对象1',
      type: 'GameObject',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      components: ['Transform', 'MeshRenderer'],
      parentId: null,
      isExpanded: true,
      children: [
        {
          id: 4,
          name: 'Child Object 1',
          type: 'GameObject',
          position: { x: 1, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 0.5, y: 0.5, z: 0.5 },
          components: ['Transform', 'MeshRenderer'],
          parentId: 3,
          isExpanded: true,
          children: [
            {
              id: 6,
              name: 'Grandchild Object',
              type: 'GameObject',
              position: { x: 0, y: 1, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.3, y: 0.3, z: 0.3 },
              components: ['Transform', 'MeshRenderer'],
              parentId: 4,
              isExpanded: true,
              children: []
            }
          ]
        },
        {
          id: 5,
          name: 'Child Object 2',
          type: 'GameObject',
          position: { x: -1, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 0.5, y: 0.5, z: 0.5 },
          components: ['Transform', 'MeshRenderer'],
          parentId: 3,
          isExpanded: true,
          children: []
        }
      ]
    }
  ],
  consoleMessages: [
    { type: 'error', message: 'NullReferenceException: Object reference not set to an instance of an object', details: 'at Game.Update() (at Assets/Scripts/Game.js:42)' },
    { type: 'warning', message: 'Missing reference in GameObject "Player"', details: 'at Assets/Prefabs/Player.prefab' },
    { type: 'info', message: 'Game started', details: 'at Game.Start() (at Assets/Scripts/Game.js:15)' }
  ],
  assets: [
    { id: 1, name: 'Assets', type: 'folder', isExpanded: true, parentId: null },
    { id: 2, name: 'Textures', type: 'folder', isExpanded: true, parentId: 1 },
    { id: 3, name: 'Texture1.png', type: 'texture', parentId: 2 },
    { id: 4, name: 'Texture2.png', type: 'texture', parentId: 2 },
    { id: 5, name: 'Scripts', type: 'folder', isExpanded: true, parentId: 1 },
    { id: 6, name: 'Script.js', type: 'script', parentId: 5 },
    { id: 7, name: 'Models', type: 'folder', isExpanded: true, parentId: 1 },
    { id: 8, name: 'Model.fbx', type: 'model', parentId: 7 },
    { id: 9, name: 'Prefabs', type: 'folder', isExpanded: true, parentId: 1 },
    { id: 10, name: 'Prefab.prefab', type: 'prefab', parentId: 9 }
  ],
  // Editor state
  isPlaying: false,
  activeTool: 'move',
  selectedAssets: [],
  viewMode: '3D',
  // 拖拽相关状态
  dragState: {
    isDragging: false,
    draggedItem: null,
    draggedItems: [], // 多选拖拽
    dragType: null, // 'gameObject' 或 'asset'
    dropTarget: null,
    dropPosition: null // 'before', 'after', 'inside'
  },
  // Hierarchy panel state
  expandedFolders: ['Assets', 'Scenes']
});

// Define actions to modify the state
const actions = {
  selectGameObject(id, isMultiSelect = false) {
    if (!isMultiSelect) {
      // 单选模式
      state.activeGameObject = id;
      state.selectedGameObjects = id ? [id] : [];
    } else {
      // 多选模式
      state.activeGameObject = id;
      
      // 如果已经在选中列表中，则移除
      const index = state.selectedGameObjects.indexOf(id);
      if (index !== -1) {
        state.selectedGameObjects.splice(index, 1);
        // 如果移除后还有选中的对象，则将第一个设为激活对象
        if (state.selectedGameObjects.length > 0) {
          state.activeGameObject = state.selectedGameObjects[0];
        } else {
          state.activeGameObject = null;
        }
      } else {
        // 否则添加到选中列表
        state.selectedGameObjects.push(id);
      }
    }
  },
  
  // 获取所有选中的游戏对象
  getSelectedGameObjects() {
    return state.selectedGameObjects.map(id => {
      return this.findGameObjectById(id);
    }).filter(obj => obj !== null);
  },
  
  // 清除所有选中
  clearSelection() {
    state.activeGameObject = null;
    state.selectedGameObjects = [];
  },
  
  // 全选游戏对象
  selectAllGameObjects() {
    // 获取所有游戏对象的ID
    const allIds = [];
    
    const collectIds = (objects) => {
      for (const obj of objects) {
        allIds.push(obj.id);
        
        if (obj.children && obj.children.length > 0) {
          collectIds(obj.children);
        }
      }
    };
    
    collectIds(state.gameObjects);
    
    // 全部选中
    state.selectedGameObjects = [...allIds];
    
    // 设置最后一个为活动对象
    if (allIds.length > 0) {
      state.activeGameObject = allIds[allIds.length - 1];
    }
    
    return allIds.length;
  },
  
  // 删除选中的所有游戏对象
  deleteSelectedGameObjects() {
    const selectedIds = [...state.selectedGameObjects];
    let count = 0;
    
    // 从后往前删除，避免索引变化问题
    for (let i = selectedIds.length - 1; i >= 0; i--) {
      const id = selectedIds[i];
      this.removeGameObject(id);
      count++;
    }
    
    // 清空选择
    state.selectedGameObjects = [];
    state.activeGameObject = null;
    
    return count;
  },
  
  // 根据ID查找游戏对象
  findGameObjectById(id) {
    let result = null;
    
    const findInObjects = (objects) => {
      for (const obj of objects) {
        if (obj.id === id) {
          result = obj;
          return true;
        }
        
        if (obj.children && obj.children.length > 0) {
          if (findInObjects(obj.children)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    findInObjects(state.gameObjects);
    return result;
  },
  updateGameObjectTransform(id, transform) {
    const obj = state.gameObjects.find(obj => obj.id === id);
    if (obj) {
      Object.assign(obj.position, transform.position || {});
      Object.assign(obj.rotation, transform.rotation || {});
      Object.assign(obj.scale, transform.scale || {});
    }
  },
  updateGameObjectName(id, name) {
    const obj = state.gameObjects.find(obj => obj.id === id);
    if (obj) {
      obj.name = name;
    }
  },
  addGameObjectComponent(id, componentType) {
    const obj = state.gameObjects.find(obj => obj.id === id);
    if (obj && !obj.components.includes(componentType)) {
      obj.components.push(componentType);
      this.addConsoleMessage('info', `Added ${componentType} to ${obj.name}`, `at Editor.AddComponent()`);
    }
  },
  removeGameObjectComponent(id, componentType) {
    const obj = state.gameObjects.find(obj => obj.id === id);
    if (obj && componentType !== 'Transform') { // 不允许移除 Transform 组件
      const index = obj.components.indexOf(componentType);
      if (index !== -1) {
        obj.components.splice(index, 1);
        this.addConsoleMessage('info', `Removed ${componentType} from ${obj.name}`, `at Editor.RemoveComponent()`);
      }
    }
  },
  addGameObject(gameObject) {
    // 为新对象生成一个 ID
    const newId = Math.max(...state.gameObjects.map(obj => obj.id)) + 1;
    const newGameObject = {
      id: newId,
      name: gameObject.name || 'New Game Object',
      type: gameObject.type || 'GameObject',
      position: gameObject.position || { x: 0, y: 0, z: 0 },
      rotation: gameObject.rotation || { x: 0, y: 0, z: 0 },
      scale: gameObject.scale || { x: 1, y: 1, z: 1 },
      components: ['Transform', ...(gameObject.components || [])]
    };
    state.gameObjects.push(newGameObject);
    this.addConsoleMessage('info', `Created new ${newGameObject.type}: ${newGameObject.name}`, `at Editor.CreateGameObject()`);
    return newId;
  },
  removeGameObject(id) {
    const index = state.gameObjects.findIndex(obj => obj.id === id);
    if (index !== -1) {
      const obj = state.gameObjects[index];
      state.gameObjects.splice(index, 1);
      if (state.activeGameObject === id) {
        state.activeGameObject = null;
      }
      this.addConsoleMessage('info', `Deleted ${obj.name}`, `at Editor.DeleteGameObject()`);
    }
  },
  logToConsole(type, message, details) {
    this.addConsoleMessage(type, message, details);
  },
  addConsoleMessage(type, message, details) {
    state.consoleMessages.unshift({ type, message, details });
  },
  clearConsole() {
    state.consoleMessages = [];
  },
  togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      this.addConsoleMessage('info', '游戏开始运行', 'at Editor.Play()');
    } else {
      this.addConsoleMessage('info', '游戏停止运行', 'at Editor.Stop()');
    }
  },
  setActiveTool(tool) {
    state.activeTool = tool;
    this.addConsoleMessage('info', `选择了 ${tool} 工具`, 'at Editor.SelectTool()');
  },
  toggleViewMode() {
    state.viewMode = state.viewMode === '3D' ? '2D' : '3D';
    this.addConsoleMessage('info', `切换到 ${state.viewMode} 视图模式`, 'at Editor.ToggleViewMode()');
  },
  
  // 树形结构相关方法
  toggleGameObjectExpanded(id) {
    const findAndToggle = (objects) => {
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].id === id) {
          objects[i].isExpanded = !objects[i].isExpanded;
          return true;
        }
        if (objects[i].children && objects[i].children.length > 0) {
          if (findAndToggle(objects[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndToggle(state.gameObjects);
  },
  
  toggleAssetExpanded(id) {
    // 在平铺结构中直接查找并切换资产的展开状态
    const asset = state.assets.find(a => a.id === id);
    if (asset) {
      asset.isExpanded = !asset.isExpanded;
    }
  },
  
  // 获取顶层游戏对象（没有父级的对象）
  getRootGameObjects() {
    return state.gameObjects.filter(obj => obj.parentId === null);
  },
  
  // 获取所有选中的游戏对象
  getSelectedGameObjects() {
    return state.selectedGameObjects.map(id => {
      return this.findGameObjectById(id);
    }).filter(obj => obj !== null);
  },
  
  // 选择所有游戏对象
  selectAllGameObjects() {
    const allObjects = [];
    
    const collectObjects = (objects) => {
      for (const obj of objects) {
        allObjects.push(obj.id);
        
        if (obj.children && obj.children.length > 0) {
          collectObjects(obj.children);
        }
      }
    };
    
    collectObjects(state.gameObjects);
    
    if (allObjects.length > 0) {
      state.activeGameObject = allObjects[0];
      state.selectedGameObjects = allObjects;
    }
  },
  
  // 删除选中的所有游戏对象
  deleteSelectedGameObjects() {
    const selectedIds = [...state.selectedGameObjects]; // 创建副本，因为在循环中会修改原数组
    
    for (const id of selectedIds) {
      this.removeGameObject(id);
    }
    
    // 清除选择
    this.clearSelection();
  },
  
  // 获取顶层资产（没有父级的资产）
  getRootAssets() {
    return state.assets.filter(asset => asset.parentId === null);
  },
  
  // 选择资产
  selectAsset(id) {
    state.activeAsset = id;
    // 如果选择了资产，则取消选择游戏对象
    if (id !== null) {
      state.activeGameObject = null;
    }
  },
  
  // 获取选中的资产
  getSelectedAsset() {
    if (!state.activeAsset) return null;
    
    // 在平铺结构中直接查找选中的资产
    return state.assets.find(asset => asset.id === state.activeAsset) || null;
  },
  
  // 拖拽相关方法
  startDrag(item, type, items = []) {
    state.dragState.isDragging = true;
    state.dragState.draggedItem = item;
    state.dragState.draggedItems = items.length > 0 ? items : [item]; // 支持多选拖拽
    state.dragState.dragType = type;
    state.dragState.dropTarget = null;
    state.dragState.dropPosition = null;
    
    // 显示拖拽开始提示
    const itemCount = items.length;
    const itemName = item.name;
    if (itemCount > 1) {
      this.addConsoleMessage('info', `开始拖拽 ${itemName} 和其他 ${itemCount - 1} 个对象`, '拖拽操作');
    } else {
      this.addConsoleMessage('info', `开始拖拽 ${itemName}`, '拖拽操作');
    }
  },
  
  setDropTarget(target, position = 'inside') {
    state.dragState.dropTarget = target;
    state.dragState.dropPosition = position;
  },
  
  endDrag() {
    // 如果有有效的放置目标，则执行放置操作
    if (state.dragState.dropTarget && state.dragState.draggedItems.length > 0) {
      this.handleDrop();
    }
    
    // 重置拖拽状态
    state.dragState.isDragging = false;
    state.dragState.draggedItem = null;
    state.dragState.draggedItems = [];
    state.dragState.dragType = null;
    state.dragState.dropTarget = null;
    state.dragState.dropPosition = null;
  },
  
  handleDrop() {
    const { draggedItems, dragType, dropTarget, dropPosition } = state.dragState;
    
    if (!dropTarget || !draggedItems.length) return;
    
    // 检查是否尝试将对象拖拽到自身或其子对象中
    const isInvalidDrop = draggedItems.some(item => {
      // 不能拖拽到自身
      if (item.id === dropTarget.id) return true;
      
      // 不能拖拽到自己的子对象中
      if (dragType === 'gameObject') {
        // 检查目标是否是拖拽对象的子对象
        const isChild = (parent, childId) => {
          if (!parent.children) return false;
          
          for (const child of parent.children) {
            if (child.id === childId) return true;
            if (isChild(child, childId)) return true;
          }
          
          return false;
        };
        
        return isChild(item, dropTarget.id);
      }
      
      return false;
    });
    
    if (isInvalidDrop) {
      this.addConsoleMessage('error', '无法将对象拖拽到自身或其子对象中', '拖拽操作失败');
      return;
    }
    
    if (dragType === 'asset') {
      // 处理资产拖拽
      const mainItem = draggedItems[0];
      console.log('资产拖拽:', mainItem.name, '->', dropTarget.name);
      this.addConsoleMessage('info', `拖拽资产: ${mainItem.name}${draggedItems.length > 1 ? ` 和其他 ${draggedItems.length - 1} 个资产` : ''} -> ${dropTarget.name}`, `在项目面板中`);
      
      // 移动资产
      for (const item of draggedItems) {
        this.moveAsset(item.id, dropTarget.id);
      }
    } else if (dragType === 'gameObject') {
      // 处理游戏对象拖拽
      const mainItem = draggedItems[0];
      const positionText = dropPosition === 'inside' ? '内部' : (dropPosition === 'before' ? '前面' : '后面');
      console.log('游戏对象拖拽:', mainItem.name, '->', dropTarget.name, '位置:', positionText);
      this.addConsoleMessage('info', `拖拽游戏对象: ${mainItem.name}${draggedItems.length > 1 ? ` 和其他 ${draggedItems.length - 1} 个对象` : ''} -> ${dropTarget.name} 的${positionText}`, `在层级面板中`);
      
      // 移动游戏对象 - 从后往前处理，以保持相对顺序
      for (let i = draggedItems.length - 1; i >= 0; i--) {
        const item = draggedItems[i];
        this.moveGameObject(item.id, dropTarget.id, null, dropPosition);
      }
    }
  },
  
  // 移动资产到新的父级
  moveAsset(assetId, newParentId) {
    // 首先找到要移动的资产及其当前父级
    let assetToMove = null;
    let currentParent = null;
    let currentParentChildren = null;
    
    const findAsset = (assets, parent = null) => {
      for (let i = 0; i < assets.length; i++) {
        if (assets[i].id === assetId) {
          assetToMove = assets[i];
          currentParent = parent;
          currentParentChildren = assets;
          return true;
        }
        if (assets[i].children && assets[i].children.length > 0) {
          if (findAsset(assets[i].children, assets[i])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAsset(state.assets);
    
    if (!assetToMove) {
      console.error('找不到要移动的资产:', assetId);
      return;
    }
    
    // 找到新的父级
    let newParent = null;
    
    const findNewParent = (assets) => {
      for (let i = 0; i < assets.length; i++) {
        if (assets[i].id === newParentId) {
          newParent = assets[i];
          return true;
        }
        if (assets[i].children && assets[i].children.length > 0) {
          if (findNewParent(assets[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findNewParent(state.assets);
    
    if (!newParent) {
      console.error('找不到新的父级:', newParentId);
      return;
    }
    
    // 检查是否试图将资产移动到其子资产中
    const isMovingToChild = (parent, childId) => {
      if (parent.id === childId) return true;
      
      for (const child of parent.children || []) {
        if (isMovingToChild(child, childId)) return true;
      }
      
      return false;
    };
    
    if (isMovingToChild(assetToMove, newParentId)) {
      console.error('不能将资产移动到其子资产中');
      this.addConsoleMessage('error', `不能将 ${assetToMove.name} 移动到其子资产中`, `操作失败`);
      return;
    }
    
    // 从当前父级中移除
    const index = currentParentChildren.findIndex(a => a.id === assetId);
    if (index !== -1) {
      currentParentChildren.splice(index, 1);
    }
    
    // 更新父级引用
    assetToMove.parentId = newParentId;
    
    // 添加到新的父级
    if (!newParent.children) {
      newParent.children = [];
    }
    newParent.children.push(assetToMove);
    
    // 确保新父级展开
    newParent.isExpanded = true;
    
    this.addConsoleMessage('info', `已将 ${assetToMove.name} 移动到 ${newParent.name}`, `在项目面板中`);
  },
  
  // 移动游戏对象到新的父级
  // position 参数可以是：'inside'（放在内部）, 'before'（放在前面）, 'after'（放在后面）
  moveGameObject(gameObjectId, newParentId, siblingId = null, position = 'inside') {
    // 首先找到要移动的游戏对象及其当前父级
    let gameObjectToMove = null;
    let currentParent = null;
    let currentParentChildren = null;
    
    const findGameObject = (gameObjects, parent = null) => {
      for (let i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].id === gameObjectId) {
          gameObjectToMove = gameObjects[i];
          currentParent = parent;
          currentParentChildren = gameObjects;
          return true;
        }
        if (gameObjects[i].children && gameObjects[i].children.length > 0) {
          if (findGameObject(gameObjects[i].children, gameObjects[i])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findGameObject(state.gameObjects);
    
    if (!gameObjectToMove) {
      console.error('找不到要移动的游戏对象:', gameObjectId);
      return;
    }
    
    // 找到新的父级
    let newParent = null;
    
    const findNewParent = (gameObjects) => {
      for (let i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].id === newParentId) {
          newParent = gameObjects[i];
          return true;
        }
        if (gameObjects[i].children && gameObjects[i].children.length > 0) {
          if (findNewParent(gameObjects[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // 如果新父级为 null，则表示移动到根级
    if (newParentId === null) {
      newParent = null;
    } else {
      findNewParent(state.gameObjects);
      
      if (!newParent) {
        console.error('找不到新的父级:', newParentId);
        return;
      }
    }
    
    // 检查是否试图将游戏对象移动到其子对象中
    const isMovingToChild = (parent, childId) => {
      if (parent.id === childId) return true;
      
      for (const child of parent.children || []) {
        if (isMovingToChild(child, childId)) return true;
      }
      
      return false;
    };
    
    if (newParent && isMovingToChild(gameObjectToMove, newParentId)) {
      console.error('不能将游戏对象移动到其子对象中');
      this.addConsoleMessage('error', `不能将 ${gameObjectToMove.name} 移动到其子对象中`, `操作失败`);
      return;
    }
    
    // 从当前父级中移除
    const index = currentParentChildren.findIndex(g => g.id === gameObjectId);
    if (index !== -1) {
      currentParentChildren.splice(index, 1);
    }
    
    // 根据 position 参数确定放置位置
    if (position === 'inside' || !position) {
      // 放在内部（默认行为）
      // 更新父级引用
      gameObjectToMove.parentId = newParentId;
      
      if (newParent) {
        // 添加到新的父级
        if (!newParent.children) {
          newParent.children = [];
        }
        newParent.children.push(gameObjectToMove);
        
        // 确保新父级展开
        newParent.isExpanded = true;
        
        this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到 ${newParent.name} 内部`, `在层级面板中`);
      } else {
        // 添加到根级
        state.gameObjects.push(gameObjectToMove);
        this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到根级`, `在层级面板中`);
      }
    } else if (position === 'before' || position === 'after') {
      // 放在目标对象的前面或后面
      let targetArray;
      let targetIndex;
      let targetParentId;
      
      if (newParent === null) {
        // 目标是根级对象
        targetArray = state.gameObjects;
        targetIndex = targetArray.findIndex(go => go.id === newParentId);
        targetParentId = null;
      } else {
        // 目标是某个父级的子对象
        targetArray = newParent.children || [];
        targetIndex = targetArray.findIndex(go => go.id === newParentId);
        targetParentId = newParent.id;
      }
      
      if (targetIndex !== -1) {
        // 确定插入位置
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        
        // 更新游戏对象的父级
        gameObjectToMove.parentId = targetParentId;
        
        // 插入到指定位置
        targetArray.splice(insertIndex, 0, gameObjectToMove);
        
        const positionText = position === 'before' ? '前面' : '后面';
        const targetName = newParent === null ? '根级对象' : newParent.name;
        this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到 ${targetName} 的${positionText}`, `在层级面板中`);
      } else {
        // 如果找不到目标位置，就添加到父级的末尾
        gameObjectToMove.parentId = newParentId;
        
        if (newParent) {
          if (!newParent.children) {
            newParent.children = [];
          }
          newParent.children.push(gameObjectToMove);
          newParent.isExpanded = true;
          this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到 ${newParent.name} 内部`, `在层级面板中`);
        } else {
          state.gameObjects.push(gameObjectToMove);
          this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到根级`, `在层级面板中`);
        }
      }
    }
  }
};

// Create the store
const editorStore = {
  state: readonly(state),
  ...actions
};

export default editorStore;
