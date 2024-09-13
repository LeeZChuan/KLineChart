/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getPixelRatio } from './utils/canvas'  // 获取设备的像素比率工具函数
import { createDom } from './utils/dom'  // 用于创建 DOM 元素的工具函数
import { isValid } from './utils/typeChecks'  // 验证对象是否有效的工具函数
import { requestAnimationFrame, DEFAULT_REQUEST_ID } from './utils/compatible'  // 跨浏览器兼容的 requestAnimationFrame 方法及默认动画请求 ID

// 定义一个类型 DrawListener，表示绘图回调函数，不接受参数
type DrawListener = () => void

// 检查设备是否支持 `devicePixelContentBoxSize` 特性，返回一个 Promise
async function isSupportedDevicePixelContentBox(): Promise<boolean> {
  return await new Promise((resolve: (val: boolean) => void) => {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {  // 通过 ResizeObserver 监控设备支持性
      resolve(entries.every(entry => 'devicePixelContentBoxSize' in entry))  // 检查 `devicePixelContentBoxSize` 是否存在
      ro.disconnect()  // 观察完毕后断开连接
    })
    ro.observe(document.body, { box: 'device-pixel-content-box' })  // 观察 `document.body`
  }).catch(() => false)  // 如果失败，返回 `false`
}

// Canvas 类：管理 canvas 元素的大小、像素比及绘图
export default class Canvas {
  private readonly _element: HTMLCanvasElement  // Canvas 元素
  private _resizeObserver: ResizeObserver  // ResizeObserver 实例，用于监控尺寸变化
  private _mediaQueryList: MediaQueryList  // 媒体查询列表，用于监控设备分辨率变化

  private readonly _ctx: CanvasRenderingContext2D  // Canvas 渲染上下文

  private readonly _listener: DrawListener  // 绘图回调函数

  private _supportedDevicePixelContentBox = false  // 标志设备是否支持 `devicePixelContentBoxSize`

  private _width = 0  // Canvas 元素的宽度
  private _height = 0  // Canvas 元素的高度

  private _pixelWidth = 0  // 实际像素宽度
  private _pixelHeight = 0  // 实际像素高度

  private _nextPixelWidth = 0  // 下一帧的像素宽度
  private _nextPixelHeight = 0  // 下一帧的像素高度

  private _requestAnimationId = DEFAULT_REQUEST_ID  // 当前的动画请求 ID

  // 媒体查询回调函数：更新像素宽高及重置像素比率
  private readonly _mediaQueryListener: () => void = () => {
    const pixelRatio = getPixelRatio(this._element)  // 获取设备的像素比
    this._nextPixelWidth = Math.round(this._element.clientWidth * pixelRatio)  // 计算下一个像素宽度
    this._nextPixelHeight = Math.round(this._element.clientHeight * pixelRatio)  // 计算下一个像素高度
    this._resetPixelRatio()  // 重置像素比率
  }

  // 构造函数：接受样式和绘图回调函数作为参数
  constructor(style: Partial<CSSStyleDeclaration>, listener: DrawListener) {
    this._listener = listener  // 记录传入的绘图回调函数
    this._element = createDom('canvas', style)  // 创建一个 canvas 元素并应用样式
    this._ctx = this._element.getContext('2d', { willReadFrequently: true })!  // 获取 Canvas 2D 渲染上下文

    // 检查设备是否支持 `devicePixelContentBoxSize`
    isSupportedDevicePixelContentBox().then(result => {
      this._supportedDevicePixelContentBox = result  // 更新支持性标志
      if (result) {
        // 如果设备支持，设置 ResizeObserver 来监听 canvas 尺寸变化
        this._resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
          const entry = entries.find((entry: ResizeObserverEntry) => entry.target === this._element)  // 找到对应的 canvas 条目
          const size = entry?.devicePixelContentBoxSize?.[0]  // 获取像素内容盒大小
          if (isValid(size)) {  // 如果有效
            this._nextPixelWidth = size.inlineSize  // 更新下一帧像素宽度
            this._nextPixelHeight = size.blockSize  // 更新下一帧像素高度
            if (this._pixelWidth !== this._nextPixelWidth || this._pixelHeight !== this._nextPixelHeight) {  // 如果像素尺寸变化
              this._resetPixelRatio()  // 重置像素比率
            }
          }
        })
        this._resizeObserver.observe(this._element, { box: 'device-pixel-content-box' })  // 开始观察 canvas 元素
      } else {
        // 如果不支持 `devicePixelContentBoxSize`，使用媒体查询监听分辨率变化
        this._mediaQueryList = window.matchMedia(`(resolution: ${getPixelRatio(this._element)}dppx)`)
        this._mediaQueryList.addListener(this._mediaQueryListener)  // 监听分辨率变化
      }
    }).catch(_ => false)  // 捕获异常并返回 false
  }

  // 私有方法：重置 canvas 的像素比率和尺寸
  private _resetPixelRatio(): void {
    this._executeListener(() => {
      const width = this._element.clientWidth  // 获取 canvas 的实际宽度
      const height = this._element.clientHeight  // 获取 canvas 的实际高度
      const horizontalPixelRatio = this._nextPixelWidth / width  // 计算水平像素比
      const verticalPixelRatio = this._nextPixelHeight / height  // 计算垂直像素比
      this._width = width  // 更新实际宽度
      this._height = height  // 更新实际高度
      this._pixelWidth = this._nextPixelWidth  // 更新实际像素宽度
      this._pixelHeight = this._nextPixelHeight  // 更新实际像素高度
      this._element.width = this._nextPixelWidth  // 设置 canvas 元素的像素宽度
      this._element.height = this._nextPixelHeight  // 设置 canvas 元素的像素高度
      this._ctx.scale(horizontalPixelRatio, verticalPixelRatio)  // 按像素比缩放上下文
    })
  }

  // 私有方法：执行绘图监听函数
  private _executeListener(fn?: () => void): void {
    if (this._requestAnimationId === DEFAULT_REQUEST_ID) {  // 如果当前没有正在进行的动画
      this._requestAnimationId = requestAnimationFrame(() => {  // 请求下一帧动画
        this._ctx.clearRect(0, 0, this._width, this._height)  // 清除 canvas 内容
        fn?.()  // 执行传入的回调函数
        this._listener()  // 调用绘图监听函数
        this._requestAnimationId = DEFAULT_REQUEST_ID  // 重置动画请求 ID
      })
    }
  }

  // 更新 canvas 的尺寸
  update(w: number, h: number): void {
    if (this._width !== w || this._height !== h) {  // 如果尺寸发生变化
      this._element.style.width = `${w}px`  // 设置 canvas 元素的新宽度
      this._element.style.height = `${h}px`  // 设置 canvas 元素的新高度
      if (!this._supportedDevicePixelContentBox) {  // 如果不支持 `devicePixelContentBoxSize`
        const pixelRatio = getPixelRatio(this._element)  // 获取设备像素比
        this._nextPixelWidth = Math.round(w * pixelRatio)  // 计算新的像素宽度
        this._nextPixelHeight = Math.round(h * pixelRatio)  // 计算新的像素高度
        this._resetPixelRatio()  // 重置像素比率
      }
    } else {
      this._executeListener()  // 尺寸未变化，直接执行监听器
    }
  }

  // 获取 canvas DOM 元素
  getElement(): HTMLCanvasElement {
    return this._element
  }

  // 获取 canvas 渲染上下文
  getContext(): CanvasRenderingContext2D {
    return this._ctx
  }

  // 销毁方法：停止对 canvas 尺寸和分辨率变化的监听
  destroy(): void {
    // 如果 _resizeObserver 已经存在，取消对 canvas 元素的观察
    this._resizeObserver?.unobserve(this._element)

    // 如果 _mediaQueryList 已经存在，移除媒体查询监听器
    this._mediaQueryList?.removeListener(this._mediaQueryListener)
  }
}