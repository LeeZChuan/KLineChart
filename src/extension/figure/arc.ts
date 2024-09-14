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

// 引入了 Coordinate 类型，用于表示坐标点
import type Coordinate from '../../common/Coordinate'
// 引入 getDistance 函数，用于计算坐标之间的距离
import { getDistance } from '../../common/Coordinate'
// 引入了线条样式的类型和线条类型常量
import { type LineStyle, LineType } from '../../common/Styles'

// 引入 FigureTemplate 类型和偏差常量 DEVIATION，用于表示允许的误差范围
import { type FigureTemplate, DEVIATION } from '../../component/Figure'

// 引入了 CircleAttrs 类型，用于表示圆的属性
import { type CircleAttrs } from './circle'

/**
 * 检查给定的坐标是否在弧线（Arc）上
 * @param coordinate - 需要检测的坐标
 * @param attrs - 弧线的属性或多个弧线的属性数组
 * @returns boolean - 如果坐标在弧线上的话，返回 true，否则返回 false
 */
export function checkCoordinateOnArc (coordinate: Coordinate, attrs: ArcAttrs | ArcAttrs[]): boolean {
  // 初始化一个空的弧线属性数组
  let arcs: ArcAttrs[] = []
  // 将传入的属性转换为数组形式并合并
  arcs = arcs.concat(attrs)

  // 遍历所有的弧线
  for (let i = 0; i < arcs.length; i++) {
    const arc = arcs[i]
    // 判断点与弧线的距离与半径的差值是否小于允许的误差范围
    if (Math.abs(getDistance(coordinate, arc) - arc.r) < DEVIATION) {
      const { r, startAngle, endAngle } = arc

      // 计算弧线起点的坐标
      const startCoordinateX = r * Math.cos(startAngle) + arc.x
      const startCoordinateY = r * Math.sin(startAngle) + arc.y
      // 计算弧线终点的坐标
      const endCoordinateX = r * Math.cos(endAngle) + arc.x
      const endCoordinateY = r * Math.sin(endAngle) + arc.y

      // 判断坐标是否在弧线起点和终点之间的范围内
      if (
        coordinate.x <= Math.max(startCoordinateX, endCoordinateX) + DEVIATION &&
        coordinate.x >= Math.min(startCoordinateX, endCoordinateX) - DEVIATION &&
        coordinate.y <= Math.max(startCoordinateY, endCoordinateY) + DEVIATION &&
        coordinate.y >= Math.min(startCoordinateY, endCoordinateY) - DEVIATION
      ) {
        // 如果满足条件，返回 true，表示坐标在弧线上
        return true
      }
    }
  }

  // 如果遍历完所有弧线都不满足条件，返回 false
  return false
}

/**
 * 在 Canvas 上绘制弧线
 * @param ctx - Canvas 渲染上下文
 * @param attrs - 弧线的属性或多个弧线的属性数组
 * @param styles - 线条的样式属性，部分字段是可选的
 */
export function drawArc (ctx: CanvasRenderingContext2D, attrs: ArcAttrs | ArcAttrs[], styles: Partial<LineStyle>): void {
  // 初始化一个空的弧线属性数组
  let arcs: ArcAttrs[] = []
  // 将传入的属性转换为数组形式并合并
  arcs = arcs.concat(attrs)

  // 解构样式属性，设置默认值
  const { style = LineType.Solid, size = 1, color = 'currentColor', dashedValue = [2, 2] } = styles

  // 设置线条宽度
  ctx.lineWidth = size
  // 设置线条颜色
  ctx.strokeStyle = color

  // 根据线条样式设置虚线或实线
  if (style === LineType.Dashed) {
    // 设置虚线样式
    ctx.setLineDash(dashedValue)
  } else {
    // 设置实线（无虚线）
    ctx.setLineDash([])
  }

  // 遍历所有的弧线属性，绘制每一条弧线
  arcs.forEach(({ x, y, r, startAngle, endAngle }) => {
    ctx.beginPath() // 开始新路径
    ctx.arc(x, y, r, startAngle, endAngle) // 绘制弧线
    ctx.stroke() // 描边（绘制线条）
    ctx.closePath() // 结束路径
  })
}

// 定义 ArcAttrs 接口，继承自 CircleAttrs，增加了弧线特有的起始角度和结束角度
export interface ArcAttrs extends CircleAttrs {
  startAngle: number
  endAngle: number
}

// 定义一个弧线模板对象，包含弧线的名称、事件检测函数和绘制函数
const arc: FigureTemplate<ArcAttrs | ArcAttrs[], Partial<LineStyle>> = {
  name: 'arc', // 弧线的名称
  checkEventOn: checkCoordinateOnArc, // 用于检测事件的函数
  draw: (ctx: CanvasRenderingContext2D, attrs: ArcAttrs | ArcAttrs[], styles: Partial<LineStyle>) => {
    // 调用 drawArc 函数绘制弧线
    drawArc(ctx, attrs, styles)
  }
}

// 导出默认的弧线模板对象
export default arc
