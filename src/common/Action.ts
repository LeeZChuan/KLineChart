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

import { isFunction } from './utils/typeChecks'  // 引入用于判断是否是函数的工具方法

export type ActionCallback = (data?: any) => void  // 定义回调函数的类型，参数可以是任意类型的数据

// 定义一组枚举值，表示各种不同的动作类型
export enum ActionType {
  OnDataReady = 'onDataReady',                   // 数据准备就绪时的回调
  OnZoom = 'onZoom',                             // 缩放动作时的回调
  OnScroll = 'onScroll',                         // 滚动时的回调
  OnVisibleRangeChange = 'onVisibleRangeChange', // 可视范围变化时的回调
  OnTooltipIconClick = 'onTooltipIconClick',     // 工具提示图标点击时的回调
  OnCrosshairChange = 'onCrosshairChange',       // 光标十字线变化时的回调
  OnCandleBarClick = 'onCandleBarClick',         // K线柱点击时的回调
  OnPaneDrag = 'onPaneDrag'                      // 面板拖动时的回调
}

// Delegate 类：管理订阅回调事件的类
export default class Delegate {
  private _callbacks: ActionCallback[] = []  // 私有变量，存储所有的回调函数

  // 订阅方法：用于注册一个新的回调函数
  subscribe (callback: ActionCallback): void {
    const index = this._callbacks.indexOf(callback) ?? -1  // 查找当前回调是否已存在
    if (index < 0) {  // 如果不存在，则添加
      this._callbacks.push(callback)
    }
  }

  // 取消订阅方法：用于取消一个回调函数的注册
  unsubscribe (callback?: ActionCallback): void {
    if (isFunction(callback)) {  // 如果提供了一个有效的回调函数
      const index = this._callbacks.indexOf(callback) ?? -1  // 查找回调函数在数组中的索引
      if (index > -1) {  // 如果找到，则删除该回调函数
        this._callbacks.splice(index, 1)
      }
    } else {  // 如果没有提供具体的回调函数，则清空所有回调
      this._callbacks = []
    }
  }

  // 执行方法：触发所有已订阅的回调函数，传入数据作为参数
  execute (data?: any): void {
    this._callbacks.forEach(callback => {  // 遍历所有回调函数
      callback(data)  // 执行每一个回调并传入数据
    })
  }

  // 判断是否为空方法：检查是否有任何回调函数订阅
  isEmpty (): boolean {
    return this._callbacks.length === 0  // 如果回调函数数组为空，则返回 true
  }
}