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

// 从 '../../common/utils/typeChecks' 模块导入类型检查函数
import { isFunction, isValid } from '../../common/utils/typeChecks'

// 从 '../../common/Styles' 模块导入 LineType 枚举，用于定义线条的样式类型
import { LineType } from '../../common/Styles'

/**
 * 定义一个名为 'simpleAnnotation' 的覆盖层模板，类型为 OverlayTemplate
 *
 * 该模板用于在图表上绘制一个简单的注释，包括一条虚线、一头箭头和文本标签。
 */
const simpleAnnotation: OverlayTemplate = {
  // 覆盖层的名称，标识该覆盖层为 'simpleAnnotation'
  name: 'simpleAnnotation',

  // 定义覆盖层的总步骤数，可能用于动画或逐步渲染
  totalStep: 2,

  // 定义覆盖层的样式
  styles: {
    // 定义线条的样式，使用虚线（Dashed）
    line: { style: LineType.Dashed }
  },

  /**
   * 创建覆盖层的图形元素。
   *
   * @param {Object} params - 创建图形所需的参数
   * @param {Object} params.overlay - 覆盖层的配置信息，包含扩展数据等
   * @param {Coordinate[]} params.coordinates - 图形的坐标数组
   * @returns {Array} 返回一个包含图形元素的数组
   */
  createPointFigures: ({ overlay, coordinates }) => {
    let text: string | undefined

    // 检查 overlay.extendData 是否为有效值
    if (isValid(overlay.extendData)) {
      if (!isFunction(overlay.extendData)) {
        // 如果 extendData 不是函数，则直接赋值给 text
        text = overlay.extendData ?? ''
      } else {
        // 如果 extendData 是函数，则调用该函数并将 overlay 作为参数传入
        text = overlay.extendData(overlay)
      }
    }

    // 获取起始点的 x 坐标
    const startX = coordinates[0].x

    // 获取起始点的 y 坐标，并向上偏移 6 个单位，作为线条的起点 y 坐标
    const startY = coordinates[0].y - 6

    // 计算线条的终点 y 坐标，向上延伸 50 个单位
    const lineEndY = startY - 50

    // 计算箭头的顶点 y 坐标，在线条终点基础上再向上偏移 5 个单位
    const arrowEndY = lineEndY - 5

    // 返回包含三个图形元素的数组：线条、箭头和文本
    return [
      {
        // 定义一条线条图形
        type: 'line',
        attrs: {
          // 线条的坐标为起点和终点，形成一条垂直线
          coordinates: [
            { x: startX, y: startY },
            { x: startX, y: lineEndY }
          ]
        },
        // 设置为忽略事件，例如鼠标点击等，不触发事件
        ignoreEvent: true
      },
      {
        // 定义一个多边形图形，表示箭头
        type: 'polygon',
        attrs: {
          // 多边形的坐标为箭头的三个顶点，形成一个向上的箭头
          coordinates: [
            { x: startX, y: lineEndY },          // 箭头的尖端
            { x: startX - 4, y: arrowEndY },     // 左侧基点
            { x: startX + 4, y: arrowEndY }      // 右侧基点
          ]
        },
        // 设置为忽略事件
        ignoreEvent: true
      },
      {
        // 定义一个文本图形，用于显示注释文本
        type: 'text',
        attrs: {
          // 文本的 x 坐标与起点的 x 坐标一致，水平居中
          x: startX,
          // 文本的 y 坐标为箭头顶点的 y 坐标
          y: arrowEndY,
          // 文本内容，如果 text 未定义则使用空字符串
          text: text ?? '',
          // 文本对齐方式设置为居中
          align: 'center',
          // 文本基线对齐方式设置为 'bottom'，即文本的基线在 y 坐标位置
          baseline: 'bottom'
        },
        // 设置为忽略事件
        ignoreEvent: true
      }
    ]
  }
}

// 导出 simpleAnnotation 模板作为默认导出，使其可以在其他模块中被引用
export default simpleAnnotation
