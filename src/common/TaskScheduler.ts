/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { requestIdleCallback, cancelIdleCallback, DEFAULT_REQUEST_ID } from './utils/compatible'
// 引入浏览器的 requestIdleCallback 和 cancelIdleCallback 以及默认请求 ID

// Task 接口定义：表示一个任务对象，包含任务的 id 和处理函数 handler
interface Task {
  id: string  // 任务的唯一标识
  handler: () => void  // 任务的执行函数
}

// generateTaskId 函数：通过传入的参数生成一个唯一的任务 ID
export function generateTaskId (...params: string[]): string {
  return params.join('_')  // 将参数数组用下划线拼接成字符串
}

// TaskScheduler 类：用于管理和调度任务的类
export default class TaskScheduler {
  private readonly _tasks: Task[]  // 存储任务的数组
  private _requestIdleCallbackId = DEFAULT_REQUEST_ID  // 保存当前的 requestIdleCallback 的 ID

  // 构造函数：可以接受初始任务数组，并立即开始调度任务
  constructor (tasks?: Task[]) {
    this._tasks = tasks ?? []  // 如果传入了任务数组，则使用它，否则初始化为空数组
    this._operateTasks()  // 立即开始调度任务
  }

  // 私有方法 _operateTasks：调度任务执行，fn 可选，用于在处理任务前执行的函数
  private _operateTasks (fn?: () => void): void {
    if (this._requestIdleCallbackId !== DEFAULT_REQUEST_ID) {
      // 如果已经有一个正在进行的 requestIdleCallback，先取消它
      cancelIdleCallback(this._requestIdleCallbackId)
      this._requestIdleCallbackId = DEFAULT_REQUEST_ID  // 重置 ID
    }

    fn?.()  // 如果传入了回调函数，执行它

    // 请求新的 idle 回调，用于执行任务
    this._requestIdleCallbackId = requestIdleCallback(deadline => { 
      this._runTasks(deadline)  // 执行任务
    })
  }

  // 私有方法 _runTasks：在浏览器空闲时执行任务，参数 deadline 是空闲时间的时间对象
  private _runTasks (deadline: IdleDeadline): void {
    // 当有剩余的时间并且任务队列不为空时，执行任务
    while (deadline.timeRemaining() > 0 && this._tasks.length > 0) {
      const task = this._tasks.shift()  // 从任务队列中取出第一个任务
      task?.handler()  // 执行任务的处理函数
    }

    // 如果还有未完成的任务，继续请求 idle 回调
    if (this._tasks.length > 0) {
      this._requestIdleCallbackId = requestIdleCallback(deadline => { 
        this._runTasks(deadline)  // 继续执行剩余任务
      })
    }
  }

  // addTask 方法：添加任务到调度器
  addTask (task: Task): this {
    this._operateTasks(() => {
      const index = this._tasks.findIndex(t => t.id === task.id)  // 查找任务是否已经存在
      if (index > -1) {
        this._tasks[index] = task  // 如果任务存在，替换它
      } else {
        this._tasks.push(task)  // 否则将新任务添加到队列
      }
    })
    return this  // 支持链式调用
  }

  // removeTask 方法：从调度器中移除任务
  removeTask (id: string): this {
    this._operateTasks(() => {
      const index = this._tasks.findIndex(t => t.id === id)  // 查找任务的索引
      if (index > -1) {
        this._tasks.splice(index, 1)  // 如果找到任务，则将其移除
      }
    })
    return this  // 支持链式调用
  }
}