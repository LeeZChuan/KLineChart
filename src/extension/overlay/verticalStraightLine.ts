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

// 定义一个名为 verticalStraightLine 的覆盖图模板对象，用于绘制垂直的直线
const verticalStraightLine: OverlayTemplate = {
  // 覆盖图的名称
  name: 'verticalStraightLine',

  // 定义该覆盖图所需的步骤总数，2 表示它需要两个步骤完成
  totalStep: 2,

  // 标记是否需要默认的点图形，设置为 true
  needDefaultPointFigure: true,

  // 标记是否需要默认的 X 轴图形，设置为 true
  needDefaultXAxisFigure: true,

  // 标记是否需要默认的 Y 轴图形，设置为 true
  needDefaultYAxisFigure: true,

  // createPointFigures 是一个方法，用于根据提供的坐标创建垂直直线的图形对象
  createPointFigures: ({ coordinates, bounding }) => {
    // 返回一个图形对象数组，表示一条垂直的直线
    return [
      {
        type: 'line', // 图形类型为线条
        attrs: {
          // 线条的坐标：从图表顶部 (y: 0) 到图表底部 (y: bounding.height)，x 坐标为第一个点的 x 值
          coordinates: [
            {
              x: coordinates[0].x, // 起点的 x 坐标为第一个点的 x 值
              y: 0 // 起点的 y 坐标为 0，即图表顶部
            }, 
            {
              x: coordinates[0].x, // 终点的 x 坐标与起点相同，表示垂直线
              y: bounding.height // 终点的 y 坐标为图表的高度，即图表底部
            }
          ]
        }
      }
    ]
  }
}

// 导出 verticalStraightLine 模板，供其他模块使用
export default verticalStraightLine
