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

// 导入一些用于格式化和类型检查的实用函数
import { formatThousands, formatFoldDecimal } from '../../common/utils/format'
import { isNumber } from '../../common/utils/typeChecks'

// 导入 OverlayTemplate 类型，用于规范斐波那契线模板的结构
import { type OverlayTemplate } from '../../component/Overlay'

// 导入 LineAttrs 和 TextAttrs 类型，用于定义线条和文本的属性结构
import { type LineAttrs } from '../figure/line'
import { type TextAttrs } from '../figure/text'

// 定义斐波那契线的模板
const fibonacciLine: OverlayTemplate = {
  name: 'fibonacciLine', // 模板名称
  totalStep: 3, // 表示需要3个步骤，通常是用来绘制斐波那契线时需要标记的点数
  needDefaultPointFigure: true, // 是否需要默认的点图形
  needDefaultXAxisFigure: true, // 是否需要默认的 X 轴图形
  needDefaultYAxisFigure: true, // 是否需要默认的 Y 轴图形

  // 生成点图形的函数，接受绘图相关参数并返回绘制的图形
  createPointFigures: ({ coordinates, bounding, overlay, precision, thousandsSeparator, decimalFoldThreshold, yAxis }) => {
    const points = overlay.points // 获取斐波那契线的关键点（一般是两个点，起点和终点）

    // 确保至少有一个坐标点
    if (coordinates.length > 0) {
      // 根据 Y 轴是否是蜡烛图确定精度：价格精度或其他精度
      const currentPrecision = (yAxis?.isInCandle() ?? true) ? precision.price : precision.excludePriceVolumeMax

      // 初始化线条和文本数组
      const lines: LineAttrs[] = []
      const texts: TextAttrs[] = []
      
      const startX = 0 // 起始 X 轴坐标
      const endX = bounding.width // 终止 X 轴坐标（横跨整个图形宽度）

      // 确保有至少两个点，并且两个点的 value 都是有效数字
      if (coordinates.length > 1 && isNumber(points[0].value) && isNumber(points[1].value)) {
        // 斐波那契线的百分比数组，表示需要绘制的斐波那契回撤比例线
        const percents = [1, 0.786, 0.618, 0.5, 0.382, 0.236, 0]
        const yDif = coordinates[0].y - coordinates[1].y // 两点的 Y 轴差值
        const valueDif = points[0].value - points[1].value // 两点的 value 值差

        // 遍历每个百分比，生成对应的线条和文本
        percents.forEach(percent => {
          const y = coordinates[1].y + yDif * percent // 按比例计算当前斐波那契线的 Y 坐标
          const value = formatFoldDecimal(
            formatThousands(
              ((points[1].value ?? 0) + valueDif * percent).toFixed(currentPrecision), // 计算百分比对应的数值，并根据精度格式化
              thousandsSeparator // 添加千分位分隔符
            ), 
            decimalFoldThreshold // 控制小数点折叠的阈值
          )
          
          // 生成线条的起止坐标并推入 lines 数组
          lines.push({ coordinates: [{ x: startX, y }, { x: endX, y }] })
          
          // 生成对应的文本标签并推入 texts 数组
          texts.push({
            x: startX,
            y,
            text: `${value} (${(percent * 100).toFixed(1)}%)`, // 文本包括值和百分比
            baseline: 'bottom' // 文本对齐方式
          })
        })
      }

      // 返回需要绘制的图形，包含线条和文本
      return [
        {
          type: 'line', // 图形类型为线条
          attrs: lines // 线条的属性
        }, 
        {
          type: 'text', // 图形类型为文本
          isCheckEvent: false, // 文本不需要事件检测
          attrs: texts // 文本的属性
        }
      ]
    }
    
    // 如果坐标不足，返回空数组
    return []
  }
}

export default fibonacciLine // 导出模板
