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

// 引入 Coordinate 类型，表示坐标点
import type Coordinate from '../../common/Coordinate'
// 引入 TextStyle 类型，用于表示文本样式
import { type TextStyle } from '../../common/Styles'

// 引入用于创建字体和计算文本宽度的工具函数
import { createFont, calcTextWidth } from '../../common/utils/canvas'

// 引入 FigureTemplate 类型，用于表示图形模板
import { type FigureTemplate } from '../../component/Figure'

// 引入 RectAttrs 类型和 drawRect 函数，用于矩形的绘制
import { type RectAttrs, drawRect } from './rect'

/**
 * 根据文本属性和样式，计算文本的矩形框大小和位置
 * @param attrs - 文本的属性
 * @param styles - 文本的样式
 * @returns RectAttrs - 包含文本矩形的坐标和大小
 */
export function getTextRect (attrs: TextAttrs, styles: Partial<TextStyle>): RectAttrs {
  // 从样式中提取文本的大小、填充、字体权重等信息
  const { size = 12, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0, weight = 'normal', family } = styles
  const { x, y, text, align = 'left', baseline = 'top', width: w, height: h } = attrs

  // 计算文本的宽度和高度
  const width = w ?? (paddingLeft + calcTextWidth(text, size, weight, family) + paddingRight)
  const height = h ?? (paddingTop + size + paddingBottom)

  // 计算文本的起始x坐标
  let startX: number
  switch (align) {
    case 'left':
    case 'start': {
      startX = x // 左对齐，x即为起始位置
      break
    }
    case 'right':
    case 'end': {
      startX = x - width // 右对齐，x需要减去文本宽度
      break
    }
    default: {
      startX = x - width / 2 // 居中对齐，x为文本中心，需减去一半的宽度
      break
    }
  }

  // 计算文本的起始y坐标
  let startY: number
  switch (baseline) {
    case 'top':
    case 'hanging': {
      startY = y // 顶部对齐，y即为起始位置
      break
    }
    case 'bottom':
    case 'ideographic':
    case 'alphabetic': {
      startY = y - height // 底部对齐，y需要减去文本高度
      break
    }
    default: {
      startY = y - height / 2 // 居中对齐，y为文本中心，需减去一半的高度
      break
    }
  }

  // 返回计算出的文本矩形框信息
  return { x: startX, y: startY, width, height }
}

/**
 * 检查给定的坐标是否在文本区域内
 * @param coordinate - 需要检查的坐标
 * @param attrs - 文本的属性或多个文本的属性数组
 * @param styles - 文本的样式
 * @returns boolean - 如果坐标在某个文本区域内，则返回 true，否则返回 false
 */
export function checkCoordinateOnText (coordinate: Coordinate, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>): boolean {
  let texts: TextAttrs[] = []
  texts = texts.concat(attrs)

  // 遍历每个文本，检查是否在其对应的矩形区域内
  for (let i = 0; i < texts.length; i++) {
    const { x, y, width, height } = getTextRect(texts[i], styles)
    if (
      coordinate.x >= x &&
      coordinate.x <= x + width &&
      coordinate.y >= y &&
      coordinate.y <= y + height
    ) {
      return true
    }
  }
  return false
}

/**
 * 在 Canvas 上绘制文本
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 文本的属性或多个文本的属性数组
 * @param styles - 文本的样式
 */
export function drawText (ctx: CanvasRenderingContext2D, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>): void {
  let texts: TextAttrs[] = []
  texts = texts.concat(attrs)

  // 解构样式属性，设置默认值
  const {
    color = 'currentColor',
    size = 12,
    family,
    weight,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0
  } = styles

  // 获取每个文本的矩形区域
  const rects = texts.map(text => getTextRect(text, styles))

  // 先绘制文本背景矩形
  drawRect(ctx, rects, { ...styles, color: styles.backgroundColor })

  // 设置文本对齐和基线
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = createFont(size, weight, family) // 创建字体样式
  ctx.fillStyle = color // 设置文本颜色

  // 绘制每个文本
  texts.forEach((text, index) => {
    const rect = rects[index]
    // 绘制文本内容，考虑文本的填充
    ctx.fillText(text.text, rect.x + paddingLeft, rect.y + paddingTop, rect.width - paddingLeft - paddingRight)
  })
}

/**
 * 定义 TextAttrs 接口，表示文本的属性
 * @interface
 */
export interface TextAttrs {
  x: number // 文本的 x 坐标
  y: number // 文本的 y 坐标
  text: string // 文本内容
  width?: number // 文本的宽度（可选）
  height?: number // 文本的高度（可选）
  align?: CanvasTextAlign // 文本的对齐方式（可选）
  baseline?: CanvasTextBaseline // 文本的基线（可选）
}

/**
 * 定义一个文本的模板对象，包含文本的名称、事件检测函数和绘制函数
 */
const text: FigureTemplate<TextAttrs | TextAttrs[], Partial<TextStyle>> = {
  name: 'text', // 文本的名称
  checkEventOn: checkCoordinateOnText, // 用于检测事件是否发生在文本上的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>) => {
    drawText(ctx, attrs, styles) // 调用 drawText 函数进行文本绘制
  }
}

// 导出文本模板对象
export default text