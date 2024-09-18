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

// 导入实用函数和类型
import { isValid } from '../../common/utils/typeChecks' // 导入 isValid 函数，用于检查值是否有效
import { type OverlayTemplate } from '../../component/Overlay' // 导入 OverlayTemplate 类型，用于定义模板的结构

// 定义水平射线模板
const horizontalRayLine: OverlayTemplate = {
  name: 'horizontalRayLine', // 模板名称
  totalStep: 3, // 该绘制过程需要 3 步（通常是点击和拖动操作）

  // 指定是否需要默认的点、X 轴和 Y 轴的图形
  needDefaultPointFigure: true, 
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  // 用于生成点的图形（如线条）的函数
  createPointFigures: ({ coordinates, bounding }) => {
    // 初始化水平射线的终点坐标，起点是第一个坐标点，y值固定
    const coordinate = { x: 0, y: coordinates[0].y } // 默认起点是 (0, y)
    
    // 检查第二个坐标点是否有效，且第一个点的 x 值小于第二个点的 x 值
    if (isValid(coordinates[1]) && coordinates[0].x < coordinates[1].x) {
      coordinate.x = bounding.width // 如果满足条件，终点的 x 坐标为图表宽度，线条向右延伸
    }
    
    // 返回需要绘制的线条
    return [
      {
        type: 'line', // 绘制的图形类型为线条
        attrs: { coordinates: [coordinates[0], coordinate] } // 定义线条的起止坐标，起点是 coordinates[0]，终点是根据条件决定的 coordinate
      }
    ]
  },

  // 处理按下事件的移动（用于更新点的位置）
  performEventPressedMove: ({ points, performPoint }) => {
    points[0].value = performPoint.value // 更新第一个点的值
    points[1].value = performPoint.value // 更新第二个点的值，使得射线保持水平
  },

  // 在绘制过程中的移动事件处理
  performEventMoveForDrawing: ({ currentStep, points, performPoint }) => {
    if (currentStep === 2) { // 检查当前是否处于绘制的第二步
      points[0].value = performPoint.value // 更新第一个点的值，保持射线的 Y 轴位置
    }
  }
}

export default horizontalRayLine // 导出水平射线模板