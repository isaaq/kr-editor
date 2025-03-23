// 组件配置文件
// 定义不同组件类型的属性和UI配置

export default {
  // MeshRenderer 组件
  MeshRenderer: {
    properties: [
      {
        name: 'castShadows',
        label: '阴影投射',
        type: 'select',
        options: ['开启', '关闭', '双面', '仅阴影']
      },
      {
        name: 'material',
        label: '材质',
        type: 'object',
        objectType: 'Material',
        defaultValue: 'Default Material'
      }
    ]
  },
  
  // Camera 组件
  Camera: {
    properties: [
      {
        name: 'fieldOfView',
        label: '视野角度',
        type: 'number',
        min: 1,
        max: 179,
        defaultValue: 60
      },
      {
        name: 'clippingPlanes',
        label: '裁剪平面',
        type: 'vector2',
        defaultValue: { x: 0.1, y: 1000 }
      }
    ]
  },
  
  // Container 组件
  Container: {
    properties: [
      {
        name: 'layout',
        label: '布局方式',
        type: 'select',
        options: ['水平', '垂直', '网格', '自由'],
        defaultValue: '自由'
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'padding',
        label: '内边距',
        type: 'vector4',
        defaultValue: { x: 0, y: 0, z: 0, w: 0 }
      }
    ]
  },
  
  // Light 组件
  Light: {
    properties: [
      {
        name: 'type',
        label: '光源类型',
        type: 'select',
        options: ['方向光', '点光源', '聚光灯', '区域光'],
        defaultValue: '方向光'
      },
      {
        name: 'color',
        label: '光源颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'intensity',
        label: '强度',
        type: 'number',
        min: 0,
        max: 10,
        defaultValue: 1
      }
    ]
  },
  
  // 其他组件可以按照类似的方式添加...
  
  // 默认组件配置，用于未明确定义的组件类型
  default: {
    properties: [
      {
        name: 'enabled',
        label: '启用',
        type: 'boolean',
        defaultValue: true
      }
    ]
  }
};
