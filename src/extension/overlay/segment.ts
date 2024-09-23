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

// 从 '../../component/Overlay' 模块导入 OverlayTemplate 类型，用于定义覆盖层的模板结构
import { type OverlayTemplate } from '../../component/Overlay'

/**
 * 定义一个名为 'segment' 的覆盖层模板，类型为 OverlayTemplate
 *
 * 该模板用于在图表上绘制一条线段，连接两个指定的坐标点。
 */
const segment: OverlayTemplate = {
  // 覆盖层的名称，标识该覆盖层为 'segment'
  name: 'segment',

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
   * @returns {Array} 返回一个包含图形元素的数组
   */
  createPointFigures: ({ coordinates }) => {
    // 检查坐标点数组是否正好包含两个点
    if (coordinates.length === 2) {
      return [
        {
          // 定义一个线条图形
          type: 'line',
          attrs: {
            // 线条的坐标为传入的两个点，形成一条连接这两个点的线段
            coordinates
          }
        }
      ]
    }

    // 如果坐标点数组不等于两个点，返回空数组，不绘制任何图形
    return []
  }
}

// 导出 segment 模板作为默认导出，使其可以在其他模块中被引用
export default segment
