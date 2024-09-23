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

// 从 '../../common/utils/format' 模块导入格式化函数，用于格式化数字
import { formatThousands, formatFoldDecimal } from '../../common/utils/format'

// 定义一个名为 'priceLine' 的覆盖层模板，类型为 OverlayTemplate
const priceLine: OverlayTemplate = {
  // 覆盖层的名称，标识该覆盖层为 'priceLine'
  name: 'priceLine',

  // 定义覆盖层的总步骤数，可能用于动画或逐步渲染
  totalStep: 2,

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
   * @param {Array} params.coordinates - 图形的坐标数组
   * @param {Object} params.bounding - 图形的边界信息，包含宽度等属性
   * @param {number} params.precision - 数值的精度信息
   * @param {Object} params.overlay - 覆盖层的配置信息，包含点数据等
   * @param {string} params.thousandsSeparator - 千位分隔符
   * @param {number} params.decimalFoldThreshold - 小数折叠的阈值
   * @param {Object} params.yAxis - Y 轴的配置信息，可能包含是否在蜡烛图中显示等
   * @returns {Array} 返回一个包含图形元素的数组
   */
  createPointFigures: ({
    coordinates,
    bounding,
    precision,
    overlay,
    thousandsSeparator,
    decimalFoldThreshold,
    yAxis
  }) => {
    // 从覆盖层的第一个点中获取 value 值，默认值为 0
    const { value = 0 } = overlay.points[0]

    // 根据 Y 轴是否在蜡烛图中显示，决定当前的数值精度
    const currentPrecision = (yAxis?.isInCandle() ?? true)
      ? precision.price
      : precision.excludePriceVolumeMax

    // 返回一个包含两个图形元素的数组：一条线和一个文本标签
    return [
      {
        // 定义一个线条图形
        type: 'line',
        attrs: {
          // 线条的起点为第一个坐标，终点的 x 值为边界的宽度，y 值与起点相同
          coordinates: [
            coordinates[0],
            { x: bounding.width, y: coordinates[0].y }
          ]
        }
      },
      {
        // 定义一个文本图形
        type: 'text',
        // 设置为忽略事件，例如鼠标点击等，不触发事件
        ignoreEvent: true,
        attrs: {
          // 文本的 x 坐标，与起点的 x 坐标一致
          x: coordinates[0].x,
          // 文本的 y 坐标，与起点的 y 坐标一致
          y: coordinates[0].y,
          // 文本内容：首先将 value 按当前精度格式化为字符串，然后添加千位分隔符，
          // 最后根据小数折叠阈值进行折叠处理
          text: formatFoldDecimal(
            formatThousands(value.toFixed(currentPrecision), thousandsSeparator),
            decimalFoldThreshold
          ),
          // 文本基线对齐方式设置为 'bottom'，即文本的基线在 y 坐标位置
          baseline: 'bottom'
        }
      }
    ]
  }
}

// 导出 priceLine 模板作为默认导出，使其可以在其他模块中被引用
export default priceLine

