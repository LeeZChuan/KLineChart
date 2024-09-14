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
// 引入 RectStyle、PolygonType 和 LineType 类型，用于表示矩形样式和线条样式
import { type RectStyle, PolygonType, LineType } from '../../common/Styles'
// 引入 isTransparent 函数，用于判断颜色是否透明
import { isTransparent } from '../../common/utils/color'
// 引入 isString 函数，用于检查值是否为字符串
import { isString } from '../../common/utils/typeChecks'

// 引入 FigureTemplate 和 DEVIATION，用于定义图形模板和允许的偏差
import { type FigureTemplate, DEVIATION } from '../../component/Figure'

/**
 * 检查给定的坐标是否在矩形内
 * @param coordinate - 需要检查的坐标
 * @param attrs - 矩形的属性或多个矩形的属性数组
 * @returns boolean - 如果坐标在某个矩形内，则返回 true，否则返回 false
 */
export function checkCoordinateOnRect (coordinate: Coordinate, attrs: RectAttrs | RectAttrs[]): boolean {
  let rects: RectAttrs[] = []
  rects = rects.concat(attrs) // 将矩形属性转为数组

  // 遍历所有矩形
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    let x = rect.x
    let width = rect.width

    // 处理宽度小于允许误差的情况
    if (width < DEVIATION * 2) {
      x -= DEVIATION
      width = DEVIATION * 2
    }

    let y = rect.y
    let height = rect.height

    // 处理高度小于允许误差的情况
    if (height < DEVIATION * 2) {
      y -= DEVIATION
      height = DEVIATION * 2
    }

    // 检查坐标是否在矩形的范围内
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
 * 在 Canvas 上绘制矩形
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 矩形的属性或多个矩形的属性数组
 * @param styles - 矩形的样式属性，部分字段是可选的
 */
export function drawRect (ctx: CanvasRenderingContext2D, attrs: RectAttrs | RectAttrs[], styles: Partial<RectStyle>): void {
  let rects: RectAttrs[] = []
  rects = rects.concat(attrs) // 将矩形属性转为数组

  // 解构样式属性，设置默认值
  const {
    style = PolygonType.Fill, // 默认为填充类型
    color = 'transparent', // 填充颜色默认为透明
    borderSize = 1, // 边框宽度默认为 1
    borderColor = 'transparent', // 边框颜色默认为透明
    borderStyle = LineType.Solid, // 边框样式默认为实线
    borderRadius: r = 0, // 边框圆角半径默认为 0
    borderDashedValue = [2, 2] // 虚线默认值
  } = styles

  // 检查是否可以使用 `roundRect` 方法绘制圆角矩形，如果不支持，则使用 `rect`
  const draw = ctx.roundRect ?? ctx.rect

  // 检查是否需要填充矩形（非透明颜色时填充）
  const solid = (style === PolygonType.Fill || styles.style === PolygonType.StrokeFill) && (!isString(color) || !isTransparent(color))
  
  if (solid) {
    ctx.fillStyle = color // 设置填充颜色
    rects.forEach(({ x, y, width: w, height: h }) => {
      ctx.beginPath() // 开始新路径
      draw.call(ctx, x, y, w, h, r) // 绘制矩形
      ctx.closePath() // 关闭路径
      ctx.fill() // 填充矩形
    })
  }

  // 如果样式要求绘制边框
  if ((style === PolygonType.Stroke || styles.style === PolygonType.StrokeFill) && borderSize > 0 && !isTransparent(borderColor)) {
    ctx.strokeStyle = borderColor // 设置边框颜色
    ctx.fillStyle = borderColor
    ctx.lineWidth = borderSize // 设置边框宽度

    // 检查边框是否为虚线
    if (borderStyle === LineType.Dashed) {
      ctx.setLineDash(borderDashedValue) // 设置虚线样式
    } else {
      ctx.setLineDash([]) // 设置实线
    }

    // 修正奇数边框宽度的渲染偏移
    const correction = borderSize % 2 === 1 ? 0.5 : 0
    const doubleCorrection = Math.round(correction * 2)

    // 绘制每个矩形的边框
    rects.forEach(({ x, y, width: w, height: h }) => {
      // 如果矩形的宽度和高度都大于边框宽度的两倍，则绘制边框
      if (w > borderSize * 2 && h > borderSize * 2) {
        ctx.beginPath() // 开始新路径
        draw.call(ctx, x + correction, y + correction, w - doubleCorrection, h - doubleCorrection, r) // 绘制矩形边框
        ctx.closePath() // 关闭路径
        ctx.stroke() // 描边
      } else {
        // 如果矩形太小而不适合描边，直接绘制填充色
        if (!solid) {
          ctx.fillRect(x, y, w, h) // 直接填充矩形
        }
      }
    })
  }
}

/**
 * 定义 RectAttrs 接口，表示矩形的属性
 * @interface
 */
export interface RectAttrs {
  x: number // 矩形左上角的 x 坐标
  y: number // 矩形左上角的 y 坐标
  width: number // 矩形的宽度
  height: number // 矩形的高度
}

/**
 * 定义一个矩形的模板对象，包含矩形的名称、事件检测函数和绘制函数
 */
const rect: FigureTemplate<RectAttrs | RectAttrs[], Partial<RectStyle>> = {
  name: 'rect', // 矩形的名称
  checkEventOn: checkCoordinateOnRect, // 检测事件是否发生在矩形上的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: RectAttrs | RectAttrs[], styles: Partial<RectStyle>) => {
    drawRect(ctx, attrs, styles) // 调用 drawRect 函数进行矩形绘制
  }
}

// 导出矩形模板对象
export default rect