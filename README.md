
<h1 align="center">ZnzKlineChart</h1>

<p align="center">💹📈 基于 html5 canvas 构建的轻量级金融图表。</p>



<img src="https://cdn.nlark.com/yuque/0/2023/png/8403091/1684399506365-assets/web-upload/044fe897-168c-4fbb-a485-87a8ef61c04a.png" />

## ✨ 特性
+ 📦 **开箱即用：** 简单快速集成，基本零成本上手。
+ 🚀 **轻量流畅：** 零依赖，Gzip压缩下仅40k。
+ 💪 **功能强大：** 内置多种指标和画线模型。
+ 🎨 **高可扩展：** 丰富的样式配置和API，功能扩展随心所欲。
+ 📱 **移动端：** 支持移动端，一个图表，搞定多端。
+ 🛡 **Typescript开发：** 提供完整的类型定义文件。


## 📦 安装
### 使用 npm


## 📄 文档
### 在线文档


### 本地浏览
在根目录下执行命令，需要 [Node.js](https://nodejs.org) 环境。
```bash
# 安装依赖
npm install

# 启动文档服务
npm run docs:dev
```
启动成功后，在浏览器中打开 http://localhost:8888。


## 🛠️ 本地构建
在根目录下执行命令，需要 [Node.js](https://nodejs.org) 环境。
```bash
# 安装依赖
npm install

# 打包文件
npm run build
```
构建好的文件在`dist`文件夹。

## 🔗 链接
+ [在线预览]()

## 代码结构
```
KLineChart
│
├── build  # 存放最终发布的代码的存放位置
│ 
│ 
├── node_modules：#npm 加载的项目依赖模块,（整个项目需要的依赖资源）
│ 
├── src：#这里是我们开发的主要目录，里面包含了几个目录及文件：
│   ├── common  # 这里面有utils工具文件夹，还有k线所需要的基础类
│   ├── component # k线所需要的组件，Axis轴坐标、Indicator指标、Figure图形、xy轴等等
│   ├── extension # k线扩展元素、包含国际化、布局、整体样式等等
│   ├── pane # 
│   ├── store # k线事件封装：动作事件、图标事件、指标事件、布局事件、时间轴事件、x轴事件
│   ├── view # k线视图文件夹
│   ├── widget # 
│   ├── Chart.ts # 图表抽象基础类
│   ├── Event.ts # 图表事件抽象基础类
│   ├── index.ts # 项目入口
│   └── Options.ts 图表类型配置定义
│
│
│
│
└── README.md # 此说明文件
```