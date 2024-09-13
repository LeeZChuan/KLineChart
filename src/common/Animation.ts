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

import type Nullable from './Nullable'  // 引入自定义类型 Nullable，表示可以为空的值
import { requestAnimationFrame } from './utils/compatible'  // 引入跨浏览器兼容的 requestAnimationFrame 方法
import { merge } from './utils/typeChecks'  // 引入用于合并对象属性的工具函数

// 定义动画帧回调函数类型，参数为帧时间
type AnimationDoFrameCallback = (frameTime: number) => void

// 定义动画选项的接口，包含动画的持续时间和迭代次数
interface AnimationOptions {
  duration: number   // 动画持续时间，单位为毫秒
  iterationCount: number  // 动画迭代次数
}

// Animation 类：负责管理动画的运行和控制
export default class Animation {
  // 动画选项，默认持续时间为 500ms，迭代次数为 1
  private readonly _options = { duration: 500, iterationCount: 1 }

  // 保存帧回调函数，使用 Nullable 类型表示可能为空
  private _doFrameCallback: Nullable<AnimationDoFrameCallback>

  // 当前迭代次数，初始为 0
  private _currentIterationCount = 0
  // 动画运行状态标志
  private _running = false

  // 用于记录动画开始时的时间
  private _time = 0

  // 构造函数，可以传入部分动画选项并合并到默认选项
  constructor (options?: Partial<AnimationOptions>) {
    merge(this._options, options)  // 合并用户传入的选项与默认选项
  }

  // 内部循环函数：用于控制动画的帧渲染
  _loop (): void {
    this._running = true  // 标记动画为运行中
    const step: (() => void) = () => {  // 定义每一帧执行的函数
      if (this._running) {  // 检查动画是否仍在运行
        const diffTime = new Date().getTime() - this._time  // 计算当前帧与动画开始时间的时间差
        if (diffTime < this._options.duration) {  // 如果当前帧时间小于动画持续时间
          this._doFrameCallback?.(diffTime)  // 调用帧回调函数并传入时间差
          requestAnimationFrame(step)  // 请求下一帧
        } else {
          this.stop()  // 动画到达时间终点，停止动画
          this._currentIterationCount++  // 增加迭代次数
          if (this._currentIterationCount < this._options.iterationCount) {  // 如果还未达到最大迭代次数
            this.start()  // 重新启动动画
          }
        }
      }
    }
    requestAnimationFrame(step)  // 启动第一帧
  }

  // 注册帧回调函数
  doFrame (callback: AnimationDoFrameCallback): this {
    this._doFrameCallback = callback  // 保存帧回调函数
    return this  // 返回 this 以便链式调用
  }

  // 设置动画持续时间
  setDuration (duration: number): this {
    this._options.duration = duration  // 更新动画持续时间
    return this  // 返回 this 以便链式调用
  }

  // 设置动画迭代次数
  setIterationCount (iterationCount: number): this {
    this._options.iterationCount = iterationCount  // 更新动画迭代次数
    return this  // 返回 this 以便链式调用
  }

  // 启动动画
  start (): void {
    if (!this._running) {  // 如果动画未在运行
      this._time = new Date().getTime()  // 记录动画开始的时间
      this._loop()  // 开始执行动画循环
    }
  }

  // 停止动画
  stop (): void {
    if (this._running) {  // 如果动画正在运行
      this._doFrameCallback?.(this._options.duration)  // 调用帧回调函数并传入动画持续时间，表示动画结束
    }
    this._running = false  // 标记动画为停止
  }
}