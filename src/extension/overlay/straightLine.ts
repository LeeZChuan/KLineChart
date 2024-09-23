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
// 从 '../figure/line' 模块中导入 getLinearYFromCoordinates 函数，用于根据两个点计算直线的 Y 坐标
import { getLinearYFromCoordinates } from '../figure/line'

// 导入 OverlayTemplate 类型，用于定义覆盖图的模板
import { type OverlayTemplate } from '../../component/Overlay'

// 定义一个名为 straightLine 的覆盖图模板对象
const straightLine: OverlayTemplate = {
  // 覆盖图的名称
  name: 'straightLine',

  // 定义该覆盖图所需的步骤总数，3 表示它需要三个步骤完成
  totalStep: 3,

  // 标记是否需要默认的点图形，设置为 true
  needDefaultPointFigure: true,

  // 标记是否需要默认的 X 轴图形，设置为 true
  needDefaultXAxisFigure: true,

  // 标记是否需要默认的 Y 轴图形，设置为 true
  needDefaultYAxisFigure: true,

  // createPointFigures 是一个方法，用于创建图形点的绘制对象
  createPointFigures: ({ coordinates, bounding }) => {
    // 如果提供的坐标点数量为两个（即可以绘制一条直线）
    if (coordinates.length === 2) {
      // 如果两个坐标点的 x 值相同，表示这是一条垂直线
      if (coordinates[0].x === coordinates[1].x) {
        // 返回一个垂直线的图形对象，从图表顶部（y = 0）到底部（y = bounding.height）
        return [
          {
            type: 'line', // 图形类型为线条
            attrs: {
              coordinates: [
                {
                  x: coordinates[0].x, // 垂直线的 x 坐标固定为第一个点的 x 值
                  y: 0 // 起始点的 y 坐标为 0（即图表顶部）
                }, 
                {
                  x: coordinates[0].x, // 终点的 x 坐标同样为第一个点的 x 值
                  y: bounding.height // 终点的 y 坐标为图表的高度（即图表底部）
                }
              ]
            }
          }
        ]
      }

      // 如果两个点的 x 值不相同，则绘制一条斜线
      return [
        {
          type: 'line', // 图形类型为线条
          attrs: {
            coordinates: [
              {
                x: 0, // 线条从图表的最左侧开始（x = 0）
                // 使用 getLinearYFromCoordinates 函数计算该点在直线上的 y 坐标
                y: getLinearYFromCoordinates(coordinates[0], coordinates[1], { x: 0, y: coordinates[0].y })
              }, 
              {
                x: bounding.width, // 线条的终点在图表的最右侧（x = bounding.width）
                // 计算终点的 y 坐标，使用 getLinearYFromCoordinates 函数
                y: getLinearYFromCoordinates(coordinates[0], coordinates[1], { x: bounding.width, y: coordinates[0].y })
              }
            ]
          }
        }
      ]
    }

    // 如果坐标点数不足两个，返回一个空数组，表示不绘制任何图形
    return []
  }
}

// 导出 straightLine 模板，供其他模块使用
export default straightLine
