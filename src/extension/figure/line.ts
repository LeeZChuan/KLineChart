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
// 引入 Nullable 类型，表示可能为 null 的值
import type Nullable from '../../common/Nullable'
// 引入 Coordinate 类型，表示坐标点
import type Coordinate from '../../common/Coordinate'
// 引入 SmoothLineStyle 类型和 LineType 常量，用于表示线条样式
import { type SmoothLineStyle, LineType } from '../../common/Styles'

// 引入 FigureTemplate 和 DEVIATION（允许的偏差）
import { type FigureTemplate, DEVIATION } from '../../component/Figure'
// 引入 isNumber 函数，用于检查一个值是否是数字
import { isNumber } from '../../common/utils/typeChecks'

/**
 * 检查给定的坐标是否在一条线段上
 * @param coordinate - 要检查的坐标
 * @param attrs - 线段的属性或多个线段属性的数组
 * @returns boolean - 如果坐标在某条线段上，则返回 true，否则返回 false
 */
export function checkCoordinateOnLine (coordinate: Coordinate, attrs: LineAttrs | LineAttrs[]): boolean {
  let lines: LineAttrs[] = []
  lines = lines.concat(attrs)

  // 遍历所有线段
  for (let i = 0; i < lines.length; i++) {
    const { coordinates } = lines[i]
    if (coordinates.length > 1) {
      // 遍历每一条线段
      for (let i = 1; i < coordinates.length; i++) {
        const prevCoordinate = coordinates[i - 1]
        const currentCoordinate = coordinates[i]

        // 处理垂直线的情况
        if (prevCoordinate.x === currentCoordinate.x) {
          if (
            Math.abs(prevCoordinate.y - coordinate.y) + Math.abs(currentCoordinate.y - coordinate.y) - Math.abs(prevCoordinate.y - currentCoordinate.y) < DEVIATION + DEVIATION &&
            Math.abs(coordinate.x - prevCoordinate.x) < DEVIATION
          ) {
            return true
          }
        } else {
          // 处理非垂直线的情况，计算直线斜率和截距
          const kb = getLinearSlopeIntercept(prevCoordinate, currentCoordinate)!
          const y = getLinearYFromSlopeIntercept(kb, coordinate)
          const yDif = Math.abs(y - coordinate.y)
          if (
            Math.abs(prevCoordinate.x - coordinate.x) + Math.abs(currentCoordinate.x - coordinate.x) - Math.abs(prevCoordinate.x - currentCoordinate.x) < DEVIATION + DEVIATION &&
            yDif * yDif / (kb[0] * kb[0] + 1) < DEVIATION * DEVIATION
          ) {
            return true
          }
        }
      }
    }
  }
  return false
}

/**
 * 根据斜率和截距计算直线上的y值
 * @param kb - 斜率和截距
 * @param coordinate - 给定的坐标点
 * @returns number - 对应x值的y坐标
 */
export function getLinearYFromSlopeIntercept (kb: Nullable<number[]>, coordinate: Coordinate): number {
  if (kb !== null) {
    return coordinate.x * kb[0] + kb[1] // y = kx + b
  }
  return coordinate.y // 垂直线的情况
}

/**
 * 通过两点计算给定点在一次函数上的y值
 * @param coordinate1 - 第一个点
 * @param coordinate2 - 第二个点
 * @param targetCoordinate - 目标坐标点
 * @returns number - 对应x值的y坐标
 */
export function getLinearYFromCoordinates (coordinate1: Coordinate, coordinate2: Coordinate, targetCoordinate: Coordinate): number {
  const kb = getLinearSlopeIntercept(coordinate1, coordinate2)
  return getLinearYFromSlopeIntercept(kb, targetCoordinate)
}

/**
 * 根据两点的坐标计算一次函数的斜率和截距
 * @param coordinate1 - 第一个点
 * @param coordinate2 - 第二个点
 * @returns Nullable<number[]> - 返回斜率和截距的数组或 null（垂直线的情况）
 */
export function getLinearSlopeIntercept (coordinate1: Coordinate, coordinate2: Coordinate): Nullable<number[]> {
  const difX = coordinate1.x - coordinate2.x
  if (difX !== 0) {
    const k = (coordinate1.y - coordinate2.y) / difX
    const b = coordinate1.y - k * coordinate1.x
    return [k, b] // 返回斜率和截距
  }
  return null // 垂直线的情况
}

/**
 * 绘制线条，支持平滑线条
 * @param ctx - Canvas 渲染上下文
 * @param coordinates - 线条的坐标数组
 * @param smooth - 是否平滑
 */
export function lineTo (ctx: CanvasRenderingContext2D, coordinates: Coordinate[], smooth: number | boolean): void {
  const length = coordinates.length
  const smoothParam = isNumber(smooth) ? (smooth > 0 && smooth < 1 ? smooth : 0) : (smooth ? 0.5 : 0)
  
  // 如果启用平滑，并且点的数量大于 2
  if ((smoothParam > 0) && length > 2) {
    let cpx0 = coordinates[0].x
    let cpy0 = coordinates[0].y
    for (let i = 1; i < length - 1; i++) {
      const prevCoordinate = coordinates[i - 1]
      const coordinate = coordinates[i]
      const nextCoordinate = coordinates[i + 1]
      
      // 计算段的长度和比率，处理平滑度
      const dx01 = coordinate.x - prevCoordinate.x
      const dy01 = coordinate.y - prevCoordinate.y
      const dx12 = nextCoordinate.x - coordinate.x
      const dy12 = nextCoordinate.y - coordinate.y
      let dx02 = nextCoordinate.x - prevCoordinate.x
      let dy02 = nextCoordinate.y - prevCoordinate.y
      const prevSegmentLength = Math.sqrt(dx01 * dx01 + dy01 * dy01)
      const nextSegmentLength = Math.sqrt(dx12 * dx12 + dy12 * dy12)
      const segmentLengthRatio = nextSegmentLength / (nextSegmentLength + prevSegmentLength)

      let nextCpx = coordinate.x + dx02 * smoothParam * segmentLengthRatio
      let nextCpy = coordinate.y + dy02 * smoothParam * segmentLengthRatio

      // 防止控制点超出范围
      nextCpx = Math.min(nextCpx, Math.max(nextCoordinate.x, coordinate.x))
      nextCpy = Math.min(nextCpy, Math.max(nextCoordinate.y, coordinate.y))
      nextCpx = Math.max(nextCpx, Math.min(nextCoordinate.x, coordinate.x))
      nextCpy = Math.max(nextCpy, Math.min(nextCoordinate.y, coordinate.y))

      dx02 = nextCpx - coordinate.x
      dy02 = nextCpy - coordinate.y

      let cpx1 = coordinate.x - dx02 * prevSegmentLength / nextSegmentLength
      let cpy1 = coordinate.y - dy02 * prevSegmentLength / nextSegmentLength

      // 防止控制点超出范围
      cpx1 = Math.min(cpx1, Math.max(prevCoordinate.x, coordinate.x))
      cpy1 = Math.min(cpy1, Math.max(prevCoordinate.y, coordinate.y))
      cpx1 = Math.max(cpx1, Math.min(prevCoordinate.x, coordinate.x))
      cpy1 = Math.max(cpy1, Math.min(prevCoordinate.y, coordinate.y))
      dx02 = coordinate.x - cpx1
      dy02 = coordinate.y - cpy1
      nextCpx = coordinate.x + dx02 * nextSegmentLength / prevSegmentLength
      nextCpy = coordinate.y + dy02 * nextSegmentLength / prevSegmentLength

      ctx.bezierCurveTo(cpx0, cpy0, cpx1, cpy1, coordinate.x, coordinate.y)

      cpx0 = nextCpx
      cpy0 = nextCpy
    }
    const lastCoordinate = coordinates[length - 1]
    ctx.bezierCurveTo(cpx0, cpy0, lastCoordinate.x, lastCoordinate.y, lastCoordinate.x, lastCoordinate.y)
  } else {
    // 不平滑的情况下直接绘制线段
    for (let i = 1; i < length; i++) {
      ctx.lineTo(coordinates[i].x, coordinates[i].y)
    }
  }
}

/**
 * 在 Canvas 上绘制线条
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 线条的属性或多个线条的属性数组
 * @param styles - 线条的样式
 */
export function drawLine (ctx: CanvasRenderingContext2D, attrs: LineAttrs | LineAttrs[], styles: Partial<SmoothLineStyle>): void {
  let lines: LineAttrs[] = []
  lines = lines.concat(attrs)
  
  // 解构样式属性，设置默认值
  const { style = LineType.Solid, smooth = false, size = 1, color = 'currentColor', dashedValue = [2, 2] } = styles
  ctx.lineWidth = size
  ctx.strokeStyle = color
  if (style === LineType.Dashed) {
    ctx.setLineDash(dashedValue)
  } else {
    ctx.setLineDash([])
  }
  
  const correction = size % 2 === 1 ? 0.5 : 0
  // 遍历每一条线段并进行绘制
  lines.forEach(({ coordinates }) => {
    // 处理仅有两个点的特殊情况
    if (coordinates.length > 1) {
      // 如果线段仅包含两个点，且是垂直线或水平线
      if (
        coordinates.length === 2 &&
        (
          coordinates[0].x === coordinates[1].x || // 垂直线
          coordinates[0].y === coordinates[1].y    // 水平线
        )
      ) {
        ctx.beginPath() // 开始新路径
        // 如果是垂直线
        if (coordinates[0].x === coordinates[1].x) {
          ctx.moveTo(coordinates[0].x + correction, coordinates[0].y)
          ctx.lineTo(coordinates[1].x + correction, coordinates[1].y)
        } else { // 如果是水平线
          ctx.moveTo(coordinates[0].x, coordinates[0].y + correction)
          ctx.lineTo(coordinates[1].x, coordinates[1].y + correction)
        }
        ctx.stroke() // 绘制线条
        ctx.closePath() // 结束路径
      } else { // 对非垂直或水平的线段进行绘制
        ctx.save() // 保存当前的绘制状态
        if (size % 2 === 1) {
          ctx.translate(0.5, 0.5) // 如果线宽为奇数，平移0.5像素，避免模糊
        }
        ctx.beginPath() // 开始新路径
        ctx.moveTo(coordinates[0].x, coordinates[0].y) // 移动到第一个点
        lineTo(ctx, coordinates, smooth) // 绘制线段，考虑平滑度
        ctx.stroke() // 描边
        ctx.closePath() // 结束路径
        ctx.restore() // 恢复之前保存的绘制状态
      }
    }
  })
}

/**
 * 定义 LineAttrs 接口，表示线条的属性
 * @interface
 */
export interface LineAttrs {
  coordinates: Coordinate[] // 线条的坐标数组
}

/**
 * 定义一个线条的模板对象，包含线条的名称、事件检测函数和绘制函数
 */
const line: FigureTemplate<LineAttrs | LineAttrs[], Partial<SmoothLineStyle>> = {
  name: 'line', // 线条的名称
  checkEventOn: checkCoordinateOnLine, // 检测事件是否发生在线条上的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: LineAttrs | LineAttrs[], styles: Partial<SmoothLineStyle>) => {
    drawLine(ctx, attrs, styles) // 调用 drawLine 函数进行线条绘制
  }
}

// 导出线条模板对象
export default line
