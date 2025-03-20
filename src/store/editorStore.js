import { reactive, readonly } from 'vue';

// Define the initial state
const state = reactive({
  activeGameObject: null,
  activeAsset: null,
  gameObjects: [
    {
      id: 1,
      name: 'Main Camera',
      type: 'Camera',
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
      name: 'Directional Light',
      type: 'Light',
      position: { x: 0, y: 3, z: 0 },
      rotation: { x: 50, y: -30, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      components: ['Transform', 'Light'],
      parentId: null,
      isExpanded: true,
      children: []
    },
    {
      id: 3,
      name: 'Game Object',
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
    dragType: null, // 'gameObject' 或 'asset'
    dropTarget: null
  },
  // Hierarchy panel state
  expandedFolders: ['Assets', 'Scenes']
});

// Define actions to modify the state
const actions = {
  selectGameObject(id) {
    state.activeGameObject = id;
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
  startDrag(item, type) {
    state.dragState.isDragging = true;
    state.dragState.draggedItem = item;
    state.dragState.dragType = type;
    state.dragState.dropTarget = null;
  },
  
  setDropTarget(target) {
    state.dragState.dropTarget = target;
  },
  
  endDrag() {
    // 如果有有效的放置目标，则执行放置操作
    if (state.dragState.dropTarget && state.dragState.draggedItem) {
      this.handleDrop();
    }
    
    // 重置拖拽状态
    state.dragState.isDragging = false;
    state.dragState.draggedItem = null;
    state.dragState.dragType = null;
    state.dragState.dropTarget = null;
  },
  
  handleDrop() {
    const { draggedItem, dragType, dropTarget } = state.dragState;
    
    if (dragType === 'asset') {
      // 处理资产拖拽
      console.log('资产拖拽:', draggedItem.name, '->', dropTarget.name);
      this.addConsoleMessage('info', `拖拽资产: ${draggedItem.name} -> ${dropTarget.name}`, `在项目面板中`);
      
      // 移动资产
      this.moveAsset(draggedItem.id, dropTarget.id);
    } else if (dragType === 'gameObject') {
      // 处理游戏对象拖拽
      console.log('游戏对象拖拽:', draggedItem.name, '->', dropTarget.name);
      this.addConsoleMessage('info', `拖拽游戏对象: ${draggedItem.name} -> ${dropTarget.name}`, `在层级面板中`);
      
      // 移动游戏对象
      this.moveGameObject(draggedItem.id, dropTarget.id);
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
  moveGameObject(gameObjectId, newParentId) {
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
    
    // 更新父级引用
    gameObjectToMove.parentId = newParentId;
    
    // 添加到新的父级或根级
    if (newParent) {
      // 添加到新的父级
      if (!newParent.children) {
        newParent.children = [];
      }
      newParent.children.push(gameObjectToMove);
      
      // 确保新父级展开
      newParent.isExpanded = true;
      
      this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到 ${newParent.name} 下`, `在层级面板中`);
    } else {
      // 添加到根级
      state.gameObjects.push(gameObjectToMove);
      this.addConsoleMessage('info', `已将 ${gameObjectToMove.name} 移动到根级`, `在层级面板中`);
    }
  }
};

// Create the store
const editorStore = {
  state: readonly(state),
  ...actions
};

export default editorStore;
