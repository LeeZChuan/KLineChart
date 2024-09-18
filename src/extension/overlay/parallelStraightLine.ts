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

import type Coordinate from '../../common/Coordinate'
import type Bounding from '../../common/Bounding'

import { type OverlayTemplate } from '../../component/Overlay'

import { type LineAttrs, getLinearSlopeIntercept } from '../figure/line'

/**
 * 获取平行线
 * @param coordinates
 * @param bounding
 * @param extendParallelLineCount
 * @returns {Array}
 */
// 定义并导出一个名为 `getParallelLines` 的函数，用于根据输入的坐标和边界生成多条平行线
export function getParallelLines(
  coordinates: Coordinate[],  // 传入的坐标数组，用于确定平行线的起点和方向
  bounding: Bounding,         // 图表的边界信息，决定直线绘制的范围
  extendParallelLineCount?: number // 可选参数，指定需要扩展多少条平行线
): LineAttrs[] {
  const count = extendParallelLineCount ?? 0 // 如果未指定平行线数量，默认值为 0
  const lines: LineAttrs[] = [] // 用于存储生成的线条
  if (coordinates.length > 1) {
    // 判断是否垂直线（x 坐标相同）
    if (coordinates[0].x === coordinates[1].x) {
      const startY = 0 // 垂直线的起点 Y 坐标
      const endY = bounding.height // 垂直线的终点 Y 坐标（到边界高度）
      
      // 绘制第一个垂直线
      lines.push({ coordinates: [{ x: coordinates[0].x, y: startY }, { x: coordinates[0].x, y: endY }] })
      
      // 如果有第三个点，绘制另一条平行的垂直线
      if (coordinates.length > 2) {
        lines.push({ coordinates: [{ x: coordinates[2].x, y: startY }, { x: coordinates[2].x, y: endY }] })
        const distance = coordinates[0].x - coordinates[2].x // 计算两条线的 x 轴距离
        // 绘制额外的平行线，根据需要的数量生成
        for (let i = 0; i < count; i++) {
          const d = distance * (i + 1)
          lines.push({ coordinates: [{ x: coordinates[0].x + d, y: startY }, { x: coordinates[0].x + d, y: endY }] })
        }
      }
    } else {
      // 如果线段不是垂直线，则计算其斜率和截距
      const startX = 0
      const endX = bounding.width // 水平线的 x 轴范围
      const kb = getLinearSlopeIntercept(coordinates[0], coordinates[1])! // 计算直线的斜率和截距
      const k = kb[0] // 斜率
      const b = kb[1] // 截距
      
      // 绘制第一条倾斜线
      lines.push({ coordinates: [{ x: startX, y: startX * k + b }, { x: endX, y: endX * k + b }] })
      
      // 如果有第三个点，绘制平行的倾斜线
      if (coordinates.length > 2) {
        const b1 = coordinates[2].y - k * coordinates[2].x // 根据第三个点重新计算截距
        lines.push({ coordinates: [{ x: startX, y: startX * k + b1 }, { x: endX, y: endX * k + b1 }] })
        const distance = b - b1 // 计算两条线的截距差
        // 绘制额外的平行线
        for (let i = 0; i < count; i++) {
          const b2 = b + distance * (i + 1)
          lines.push({ coordinates: [{ x: startX, y: startX * k + b2 }, { x: endX, y: endX * k + b2 }] })
        }
      }
    }
  }
  return lines // 返回所有生成的线条
}

// 定义并导出 `parallelStraightLine` 模板
const parallelStraightLine: OverlayTemplate = {
  name: 'parallelStraightLine', // 模板名称
  totalStep: 4, // 绘制步骤数，通常需要 4 步
  needDefaultPointFigure: true, // 是否需要默认的点图形
  needDefaultXAxisFigure: true, // 是否需要默认的 X 轴图形
  needDefaultYAxisFigure: true, // 是否需要默认的 Y 轴图形
  
  // 用于生成绘制图形的函数
  createPointFigures: ({ coordinates, bounding }) => {
    return [
      {
        type: 'line', // 绘制类型为线条
        attrs: getParallelLines(coordinates, bounding) // 调用 `getParallelLines` 生成线条
      }
    ]
  }
}

export default parallelStraightLine // 导出 `parallelStraightLine` 模板
