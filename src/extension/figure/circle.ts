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
// 引入 Coordinate 类型，表示坐标
import type Coordinate from '../../common/Coordinate'
// 引入 PolygonStyle 类型、PolygonType（多边形类型）和 LineType（线条类型）的常量
import { type PolygonStyle, PolygonType, LineType } from '../../common/Styles'
// 引入 isString 函数，用于检查一个值是否为字符串
import { isString } from '../../common/utils/typeChecks'
// 引入 isTransparent 函数，用于检查颜色是否为透明色
import { isTransparent } from '../../common/utils/color'

// 引入 FigureTemplate 类型，表示图形模板
import { type FigureTemplate } from '../../component/Figure'

/**
 * 检查给定的坐标是否在圆形内
 * @param coordinate - 需要检测的坐标
 * @param attrs - 圆形的属性或多个圆形的属性数组
 * @returns boolean - 如果坐标在圆形内，返回 true，否则返回 false
 */
export function checkCoordinateOnCircle (coordinate: Coordinate, attrs: CircleAttrs | CircleAttrs[]): boolean {
  // 初始化一个空的圆形属性数组
  let circles: CircleAttrs[] = []
  // 将传入的属性合并为数组
  circles = circles.concat(attrs)

  // 遍历所有圆形
  for (let i = 0; i < circles.length; i++) {
    const { x, y, r } = circles[i]
    // 计算给定坐标点与圆心的距离平方
    const difX = coordinate.x - x
    const difY = coordinate.y - y
    // 使用勾股定理判断坐标点是否在圆形内，距离平方小于半径平方即为在圆内
    if (!(difX * difX + difY * difY > r * r)) {
      return true // 在圆内返回 true
    }
  }
  return false // 如果不在任何圆内，返回 false
}

/**
 * 在 Canvas 上绘制圆形
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 圆形的属性或多个圆形的属性数组
 * @param styles - 圆形的样式属性，部分字段是可选的
 */
export function drawCircle (ctx: CanvasRenderingContext2D, attrs: CircleAttrs | CircleAttrs[], styles: Partial<PolygonStyle>): void {
  // 初始化一个空的圆形属性数组
  let circles: CircleAttrs[] = []
  // 将传入的属性合并为数组
  circles = circles.concat(attrs)

  // 解构样式属性，设置默认值
  const {
    style = PolygonType.Fill, // 默认为填充类型
    color = 'currentColor', // 默认为当前颜色
    borderSize = 1, // 边框宽度默认为 1
    borderColor = 'currentColor', // 边框颜色默认为当前颜色
    borderStyle = LineType.Solid, // 边框样式默认为实线
    borderDashedValue = [2, 2] // 虚线默认值
  } = styles

  // 判断是否需要填充圆形（非透明颜色时填充）
  const solid = (style === PolygonType.Fill || styles.style === PolygonType.StrokeFill) && (!isString(color) || !isTransparent(color))
  
  // 如果需要填充圆形
  if (solid) {
    ctx.fillStyle = color // 设置填充颜色
    circles.forEach(({ x, y, r }) => {
      ctx.beginPath() // 开始新路径
      ctx.arc(x, y, r, 0, Math.PI * 2) // 绘制圆形路径
      ctx.closePath() // 结束路径
      ctx.fill() // 填充圆形
    })
  }

  // 如果需要绘制边框，并且边框大小大于 0 且边框颜色不是透明
  if ((style === PolygonType.Stroke || styles.style === PolygonType.StrokeFill) && borderSize > 0 && !isTransparent(borderColor)) {
    ctx.strokeStyle = borderColor // 设置边框颜色
    ctx.lineWidth = borderSize // 设置边框宽度
    // 根据边框样式设置是否为虚线
    if (borderStyle === LineType.Dashed) {
      ctx.setLineDash(borderDashedValue) // 设置虚线样式
    } else {
      ctx.setLineDash([]) // 设置实线
    }
    // 遍历所有圆形，绘制边框
    circles.forEach(({ x, y, r }) => {
      // 如果圆的半径大于边框大小，或者没有填充圆形，则绘制边框
      if (!solid || r > borderSize) {
        ctx.beginPath() // 开始新路径
        ctx.arc(x, y, r, 0, Math.PI * 2) // 绘制圆形路径
        ctx.closePath() // 结束路径
        ctx.stroke() // 描边（绘制边框）
      }
    })
  }
}

// 定义 CircleAttrs 接口，描述了圆形的属性，包括圆心坐标 (x, y) 和半径 (r)
export interface CircleAttrs {
  x: number // 圆心的 x 坐标
  y: number // 圆心的 y 坐标
  r: number // 圆的半径
}

// 定义一个圆形模板对象，包含圆形的名称、事件检测函数和绘制函数
const circle: FigureTemplate<CircleAttrs | CircleAttrs[], Partial<PolygonStyle>> = {
  name: 'circle', // 圆形的名称
  checkEventOn: checkCoordinateOnCircle, // 用于检测事件是否发生在圆上的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: CircleAttrs | CircleAttrs[], styles: Partial<PolygonStyle>) => {
    drawCircle(ctx, attrs, styles) // 调用 drawCircle 函数绘制圆形
  }
}

// 导出默认的圆形模板对象
export default circle