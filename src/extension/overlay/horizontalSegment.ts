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
// 导入用于定义 OverlayTemplate 的类型
import { type OverlayTemplate } from '../../component/Overlay'

// 导入线条属性的类型定义
import { type LineAttrs } from '../figure/line'

// 定义水平线段的模板
const horizontalSegment: OverlayTemplate = {
  name: 'horizontalSegment', // 模板名称
  totalStep: 3, // 绘制线段的步骤，通常需要3步操作（如点选两个端点）

  // 是否需要默认的点、X轴、Y轴图形
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  // 用于创建图形的函数，接收图形的坐标并返回绘制的线条
  createPointFigures: ({ coordinates }) => {
    const lines: LineAttrs[] = [] // 初始化线条数组

    // 当且仅当坐标点有两个时，才绘制线段
    if (coordinates.length === 2) {
      lines.push({ coordinates }) // 将两个坐标点作为线段的起点和终点
    }

    // 返回需要绘制的线条图形
    return [
      {
        type: 'line', // 图形类型为线条
        attrs: lines // 线条的坐标属性
      }
    ]
  },

  // 处理按下并拖动的事件
  performEventPressedMove: ({ points, performPoint }) => {
    // 当用户拖动时，更新线段的两个端点的 `value` 值，使得线段保持水平
    points[0].value = performPoint.value
    points[1].value = performPoint.value
  },

  // 在绘制线段时响应移动事件
  performEventMoveForDrawing: ({ currentStep, points, performPoint }) => {
    if (currentStep === 2) { // 当处于绘制的第二步时
      points[0].value = performPoint.value // 更新第一个点的 value，保持水平
    }
  }
}

export default horizontalSegment // 导出模板