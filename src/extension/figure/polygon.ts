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
// 引入 PolygonStyle、PolygonType 和 LineType 类型，用于表示多边形样式
import { type PolygonStyle, PolygonType, LineType } from '../../common/Styles'
// 引入 isString 函数，用于判断一个值是否为字符串
import { isString } from '../../common/utils/typeChecks'
// 引入 isTransparent 函数，用于检查颜色是否透明
import { isTransparent } from '../../common/utils/color'

// 引入 FigureTemplate 类型，用于表示图形模板
import { type FigureTemplate } from '../../component/Figure'

/**
 * 检查给定的坐标是否在多边形内
 * @param coordinate - 要检查的坐标
 * @param attrs - 多边形的属性或多个多边形的属性数组
 * @returns boolean - 如果坐标在某个多边形内，则返回 true，否则返回 false
 */
export function checkCoordinateOnPolygon (coordinate: Coordinate, attrs: PolygonAttrs | PolygonAttrs[]): boolean {
  let polygons: PolygonAttrs[] = []
  polygons = polygons.concat(attrs)

  // 遍历每个多边形
  for (let i = 0; i < polygons.length; i++) {
    let on = false
    const { coordinates } = polygons[i]
    
    // 使用射线法判断点是否在多边形内
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      // 判断当前边与射线是否相交
      if (
        (coordinates[i].y > coordinate.y) !== (coordinates[j].y > coordinate.y) &&
        (coordinate.x < (coordinates[j].x - coordinates[i].x) * (coordinate.y - coordinates[i].y) / (coordinates[j].y - coordinates[i].y) + coordinates[i].x)
      ) {
        on = !on
      }
    }
    
    // 如果点在多边形内，则返回 true
    if (on) {
      return true
    }
  }

  // 如果遍历完所有多边形后仍未找到，则返回 false
  return false
}

/**
 * 在 Canvas 上绘制多边形
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 多边形的属性或多个多边形的属性数组
 * @param styles - 多边形的样式，部分字段是可选的
 */
export function drawPolygon (ctx: CanvasRenderingContext2D, attrs: PolygonAttrs | PolygonAttrs[], styles: Partial<PolygonStyle>): void {
  let polygons: PolygonAttrs[] = []
  polygons = polygons.concat(attrs)

  // 解构样式属性，设置默认值
  const {
    style = PolygonType.Fill, // 默认为填充类型
    color = 'currentColor', // 填充颜色默认为当前颜色
    borderSize = 1, // 边框宽度默认为 1
    borderColor = 'currentColor', // 边框颜色默认为当前颜色
    borderStyle = LineType.Solid, // 边框样式默认为实线
    borderDashedValue = [2, 2] // 虚线默认值
  } = styles

  // 判断是否需要填充多边形
  if (
    (style === PolygonType.Fill || styles.style === PolygonType.StrokeFill) &&
    (!isString(color) || !isTransparent(color))
  ) {
    ctx.fillStyle = color // 设置填充颜色

    // 遍历所有多边形并进行填充
    polygons.forEach(({ coordinates }) => {
      ctx.beginPath() // 开始新路径
      ctx.moveTo(coordinates[0].x, coordinates[0].y) // 移动到第一个点
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y) // 连接到下一个点
      }
      ctx.closePath() // 闭合路径
      ctx.fill() // 填充多边形
    })
  }

  // 判断是否需要绘制多边形的边框
  if ((style === PolygonType.Stroke || styles.style === PolygonType.StrokeFill) && borderSize > 0 && !isTransparent(borderColor)) {
    ctx.strokeStyle = borderColor // 设置边框颜色
    ctx.lineWidth = borderSize // 设置边框宽度

    // 判断是否需要虚线边框
    if (borderStyle === LineType.Dashed) {
      ctx.setLineDash(borderDashedValue) // 设置虚线样式
    } else {
      ctx.setLineDash([]) // 设置实线
    }

    // 遍历所有多边形并绘制边框
    polygons.forEach(({ coordinates }) => {
      ctx.beginPath() // 开始新路径
      ctx.moveTo(coordinates[0].x, coordinates[0].y) // 移动到第一个点
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y) // 连接到下一个点
      }
      ctx.closePath() // 闭合路径
      ctx.stroke() // 描边多边形
    })
  }
}

/**
 * 定义 PolygonAttrs 接口，表示多边形的属性
 * @interface
 */
export interface PolygonAttrs {
  coordinates: Coordinate[] // 多边形的坐标数组
}

/**
 * 定义一个多边形的模板对象，包含多边形的名称、事件检测函数和绘制函数
 */
const polygon: FigureTemplate<PolygonAttrs | PolygonAttrs[], Partial<PolygonStyle>> = {
  name: 'polygon', // 多边形的名称
  checkEventOn: checkCoordinateOnPolygon, // 检测事件是否发生在多边形上的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: PolygonAttrs | PolygonAttrs[], styles: Partial<PolygonStyle>) => {
    drawPolygon(ctx, attrs, styles) // 调用 drawPolygon 函数进行多边形绘制
  }
}

// 导出多边形模板对象
export default polygon
