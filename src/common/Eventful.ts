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

import { isValid } from './utils/typeChecks'  // 引入工具函数 isValid 用于验证回调函数是否有效

import { type EventName, type MouseTouchEvent, type MouseTouchEventCallback } from './SyntheticEvent'  
// 从 SyntheticEvent 模块中导入 EventName 和 MouseTouchEvent 类型以及 MouseTouchEventCallback 类型

// EventDispatcher 接口定义，要求实现 dispatchEvent 方法
export interface EventDispatcher {
  // dispatchEvent 方法：接收事件名称、事件对象以及可选参数，并返回布尔值
  dispatchEvent: (name: EventName, event: MouseTouchEvent, other?: number) => boolean
}

// Eventful 抽象类：实现了 EventDispatcher 接口，处理事件注册、分发和回调机制
export default abstract class Eventful implements EventDispatcher {
  // _children：保存子事件对象的数组
  private _children: Eventful[] = []

  // _callbacks：一个 Map 对象，保存事件名称与对应回调函数的映射
  private readonly _callbacks = new Map<EventName, MouseTouchEventCallback>()

  // registerEvent 方法：用于注册事件及其回调函数
  registerEvent (name: EventName, callback: MouseTouchEventCallback): this {
    this._callbacks.set(name, callback)  // 将事件名称和回调函数存入 _callbacks
    return this  // 返回 this 以支持链式调用
  }

  // onEvent 方法：根据事件名称触发回调函数
  onEvent (name: EventName, event: MouseTouchEvent, other?: number): boolean {
    const callback = this._callbacks.get(name)  // 根据事件名称获取回调函数
    if (isValid(callback) && this.checkEventOn(event)) {  // 如果回调有效且事件被触发
      return callback(event, other)  // 执行回调函数，传入事件对象和其他参数
    }
    return false  // 如果回调无效或事件未被触发，返回 false
  }

  // checkEventOn 方法：递归检查子事件对象是否已触发事件
  checkEventOn (event: MouseTouchEvent): boolean {
    for (const eventful of this._children) {  // 遍历所有子事件对象
      if (eventful.checkEventOn(event)) {  // 如果子事件对象触发了事件
        return true  // 返回 true，表示事件已被处理
      }
    }
    return false  // 如果没有子事件对象处理事件，返回 false
  }

  // dispatchEvent 方法：分发事件给子对象或处理自身事件
  dispatchEvent (name: EventName, event: MouseTouchEvent, other?: number): boolean {
    const start = this._children.length - 1  // 获取子事件对象的数量
    if (start > -1) {  // 如果存在子事件对象
      for (let i = start; i > -1; i--) {  // 从最后一个子对象开始向前遍历
        if (this._children[i].dispatchEvent(name, event, other)) {  // 递归调用子对象的 dispatchEvent 方法
          return true  // 如果子对象处理了事件，返回 true
        }
      }
    }
    return this.onEvent(name, event, other)  // 如果没有子对象处理事件，则调用自身的 onEvent 方法处理
  }

  // addChild 方法：为当前对象添加一个子事件对象
  addChild (eventful: Eventful): this {
    this._children.push(eventful)  // 将子事件对象添加到 _children 数组中
    return this  // 返回 this 以支持链式调用
  }

  // clear 方法：清空所有子事件对象
  clear (): void {
    this._children = []  // 将 _children 数组清空
  }
}