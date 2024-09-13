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

import { isValid, merge } from './utils/typeChecks'  // 引入两个工具函数：isValid 用于验证对象有效性，merge 用于合并对象

// Bounding 接口定义，用于表示边界框信息
export default interface Bounding {
  width: number       // 边界框的宽度
  height: number      // 边界框的高度
  left: number        // 边界框的左边距
  right: number       // 边界框的右边距
  top: number         // 边界框的上边距
  bottom: number      // 边界框的下边距
}

// createDefaultBounding 函数：用于创建默认的边界框对象
export function createDefaultBounding (bounding?: Partial<Bounding>): Bounding {
  // 定义一个默认的边界框对象，所有值初始化为 0
  const defaultBounding: Bounding = {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }

  // 如果传入的 bounding 对象是有效的，则合并它与默认边界框
  if (isValid(bounding)) {
    merge(defaultBounding, bounding)
  }

  // 返回合并后的边界框对象
  return defaultBounding
}