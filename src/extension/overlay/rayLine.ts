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

// 从 '../../common/Coordinate' 模块导入 Coordinate 类型，用于表示坐标点
import type Coordinate from '../../common/Coordinate'

// 从 '../../common/Bounding' 模块导入 Bounding 类型，用于表示边界信息
import type Bounding from '../../common/Bounding'

// 从 '../../component/Overlay' 模块导入 OverlayTemplate 类型，用于定义覆盖层的模板结构
import { type OverlayTemplate } from '../../component/Overlay'

// 从 '../figure/line' 模块导入 getLinearYFromCoordinates 函数和 LineAttrs 类型
import { getLinearYFromCoordinates, type LineAttrs } from '../figure/line'

/**
 * 生成射线线条的属性
 *
 * @param {Coordinate[]} coordinates - 坐标点数组，至少包含两个点
 * @param {Bounding} bounding - 边界信息，包含宽度和高度等属性
 * @returns {LineAttrs | LineAttrs[]} 返回一个 LineAttrs 对象或 LineAttrs 对象数组，描述线条的属性
 */
export function getRayLine (coordinates: Coordinate[], bounding: Bounding): LineAttrs | LineAttrs[] {
  // 检查坐标点数组是否包含至少两个点
  if (coordinates.length > 1) {
    let coordinate: Coordinate

    // 检查前两个坐标点是否具有相同的 x 值且 y 值不同，表示垂直线
    if (coordinates[0].x === coordinates[1].x && coordinates[0].y !== coordinates[1].y) {
      if (coordinates[0].y < coordinates[1].y) {
        // 如果第一个点的 y 值小于第二个点，射线向下延伸到边界的底部
        coordinate = {
          x: coordinates[0].x,
          y: bounding.height
        }
      } else {
        // 如果第一个点的 y 值大于第二个点，射线向上延伸到边界的顶部
        coordinate = {
          x: coordinates[0].x,
          y: 0
        }
      }
    } 
    // 如果第一个点的 x 值大于第二个点的 x 值，射线向左延伸
    else if (coordinates[0].x > coordinates[1].x) {
      coordinate = {
        x: 0,
        // 计算在 x=0 处的 y 坐标，使线条延伸到边界左侧
        y: getLinearYFromCoordinates(coordinates[0], coordinates[1], { x: 0, y: coordinates[0].y })
      }
    } 
    // 否则，射线向右延伸
    else {
      coordinate = {
        x: bounding.width,
        // 计算在 x=bounding.width 处的 y 坐标，使线条延伸到边界右侧
        y: getLinearYFromCoordinates(coordinates[0], coordinates[1], { x: bounding.width, y: coordinates[0].y })
      }
    }

    // 返回一个 LineAttrs 对象，包含起点和计算出的终点坐标
    return { coordinates: [coordinates[0], coordinate] }
  }

  // 如果坐标点数组不足两个点，返回空数组
  return []
}

// 定义一个名为 'rayLine' 的覆盖层模板，类型为 OverlayTemplate
const rayLine: OverlayTemplate = {
  // 覆盖层的名称，标识该覆盖层为 'rayLine'
  name: 'rayLine',

  // 定义覆盖层的总步骤数，可能用于动画或逐步渲染
  totalStep: 3,

  // 指示是否需要默认的点图形
  needDefaultPointFigure: true,

  // 指示是否需要默认的 X 轴图形
  needDefaultXAxisFigure: true,

  // 指示是否需要默认的 Y 轴图形
  needDefaultYAxisFigure: true,

  /**
   * 创建覆盖层的图形元素。
   *
   * @param {Object} params - 创建图形所需的参数
   * @param {Coordinate[]} params.coordinates - 图形的坐标数组
   * @param {Bounding} params.bounding - 图形的边界信息，包含宽度等属性
   * @returns {Array} 返回一个包含图形元素的数组
   */
  createPointFigures: ({ coordinates, bounding }) => {
    return [
      {
        // 定义一个线条图形
        type: 'line',
        // 使用 getRayLine 函数生成线条的属性，包括起点和终点坐标
        attrs: getRayLine(coordinates, bounding)
      }
    ]
  }
}

// 导出 rayLine 模板作为默认导出，使其可以在其他模块中被引用
export default rayLine

