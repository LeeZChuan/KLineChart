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

// 从 '../../component/Overlay' 模块中导入 OverlayTemplate 类型，用于定义覆盖图的模板
import { type OverlayTemplate } from '../../component/Overlay'

// 定义一个名为 verticalRayLine 的覆盖图模板对象，用于绘制垂直射线
const verticalRayLine: OverlayTemplate = {
  // 覆盖图的名称
  name: 'verticalRayLine',

  // 定义该覆盖图所需的步骤总数，3 表示它需要三个步骤完成
  totalStep: 3,

  // 标记是否需要默认的点图形，设置为 true
  needDefaultPointFigure: true,

  // 标记是否需要默认的 X 轴图形，设置为 true
  needDefaultXAxisFigure: true,

  // 标记是否需要默认的 Y 轴图形，设置为 true
  needDefaultYAxisFigure: true,

  // createPointFigures 是一个方法，用于根据提供的坐标创建垂直射线的图形对象
  createPointFigures: ({ coordinates, bounding }) => {
    // 如果提供的坐标数量为两个（即起点和终点），可以绘制一条射线
    if (coordinates.length === 2) {
      // 初始化一个坐标对象，x 坐标为第一个点的 x 值，y 坐标为 0（图表顶部）
      const coordinate = { x: coordinates[0].x, y: 0 }

      // 如果第一个点的 y 坐标小于第二个点的 y 坐标，表示射线向下延伸
      if (coordinates[0].y < coordinates[1].y) {
        // 将 y 坐标设置为图表的高度，表示从第一个点延伸到图表底部
        coordinate.y = bounding.height
      }

      // 返回一个图形对象，表示从第一个点到计算出的 y 位置的垂直射线
      return [
        {
          type: 'line', // 图形类型为线条
          attrs: { coordinates: [coordinates[0], coordinate] } // 线条从第一个坐标延伸到计算的坐标
        }
      ]
    }

    // 如果坐标数量不足两个，返回空数组，表示不绘制任何图形
    return []
  },

  // performEventPressedMove 是一个方法，用于处理用户按下鼠标并拖动的操作
  performEventPressedMove: ({ points, performPoint }) => {
    // 更新第一个点的时间戳和数据索引，使其与用户当前拖动的点一致
    points[0].timestamp = performPoint.timestamp
    points[0].dataIndex = performPoint.dataIndex

    // 同时更新第二个点的时间戳和数据索引，以便在用户拖动时，线条的另一端保持同步
    points[1].timestamp = performPoint.timestamp
    points[1].dataIndex = performPoint.dataIndex
  },

  // performEventMoveForDrawing 是一个方法，用于在绘图时处理用户的移动操作
  performEventMoveForDrawing: ({ currentStep, points, performPoint }) => {
    // 如果当前是第二步（即用户在绘制时移动鼠标）
    if (currentStep === 2) {
      // 更新第一个点的时间戳和数据索引，保持与用户的移动位置同步
      points[0].timestamp = performPoint.timestamp
      points[0].dataIndex = performPoint.dataIndex
    }
  }
}

// 导出 verticalRayLine 模板，供其他模块使用
export default verticalRayLine

