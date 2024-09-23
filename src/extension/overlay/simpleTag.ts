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

// 导入工具函数 formatPrecision，用于根据给定的精度格式化数字
import { formatPrecision } from '../../common/utils/format'

// 导入 OverlayTemplate 类型，用于定义覆盖图的模板结构
import { type OverlayTemplate } from '../../component/Overlay'

// 导入一些类型检查的工具函数
import { isFunction, isNumber, isValid } from '../../common/utils/typeChecks'

// 导入线条样式类型 LineType
import { LineType } from '../../common/Styles'

// 定义一个名为 simpleTag 的 OverlayTemplate 覆盖图模板对象
const simpleTag: OverlayTemplate = {
  // 覆盖图的名称
  name: 'simpleTag',
  
  // 定义该覆盖图所需的步骤总数，2 表示它需要两个步骤完成
  totalStep: 2,
  
  // 定义样式，包括线条样式，这里使用虚线样式 (Dashed)
  styles: {
    line: { style: LineType.Dashed }  // LineType.Dashed 表示线条为虚线
  },
  
  // createPointFigures 是一个方法，用于创建图形点的绘制对象
  createPointFigures: ({ bounding, coordinates }) => {
    // 返回一个图形对象，表示一条线
    return {
      // 图形类型为线条
      type: 'line',
      // 线条的属性
      attrs: {
        // 定义线条的坐标，使用 y 坐标固定在第一个坐标的 y 值上
        coordinates: [
          { x: 0, y: coordinates[0].y },  // 起点坐标，x 为 0
          { x: bounding.width, y: coordinates[0].y }  // 终点坐标，x 为边界宽度，保持 y 不变
        ]
      },
      // 忽略事件，表明这条线条不响应用户的事件（例如点击）
      ignoreEvent: true
    }
  },
  
  // createYAxisFigures 是另一个方法，用于创建覆盖图中的 Y 轴相关的图形
  createYAxisFigures: ({ overlay, coordinates, bounding, yAxis, precision }) => {
    // 检查 y 轴是否从零开始，默认为 false（从零开始）
    const isFromZero = yAxis?.isFromZero() ?? false
    
    // 定义文本的对齐方式和 x 坐标
    let textAlign: CanvasTextAlign
    let x: number

    // 如果 y 轴从零开始，则文本左对齐，x 坐标为 0
    if (isFromZero) {
      textAlign = 'left'
      x = 0
    } 
    // 否则，文本右对齐，x 坐标为边界宽度
    else {
      textAlign = 'right'
      x = bounding.width
    }

    // 初始化文本变量
    let text

    // 检查 overlay 的扩展数据 extendData 是否有效
    if (isValid(overlay.extendData)) {
      // 如果 extendData 不是函数，则直接使用其值作为文本
      if (!isFunction(overlay.extendData)) {
        text = overlay.extendData ?? ''
      } 
      // 如果 extendData 是函数，则调用该函数获取文本内容
      else {
        text = overlay.extendData(overlay)
      }
    }

    // 如果前面的文本无效，并且 overlay 的点值是数字，则格式化数值为文本
    if (!isValid(text) && isNumber(overlay.points[0].value)) {
      text = formatPrecision(overlay.points[0].value, precision.price)  // 格式化价格精度
    }

    // 返回一个图形对象，表示 Y 轴上的文本
    return { 
      type: 'text',  // 图形类型为文本
      attrs: { 
        x,  // 文本的 x 坐标（根据 y 轴从零开始与否确定）
        y: coordinates[0].y,  // 文本的 y 坐标与第一个坐标的 y 值一致
        text: text ?? '',  // 如果没有文本则设置为空字符串
        align: textAlign,  // 文本对齐方式
        baseline: 'middle'  // 文本基线为居中
      } 
    }
  }
}

// 导出 simpleTag 模板，供其他模块使用
export default simpleTag
