/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type Coordinate from '../common/Coordinate'  // 引入二维坐标类型
import Eventful from '../common/Eventful'            // 引入支持事件处理的基类
import { type MouseTouchEvent } from '../common/SyntheticEvent'  // 引入鼠标或触摸事件类型

// 定义一个偏差常量，通常用于点击检测时的误差范围
export const DEVIATION = 2

// Figure 接口：定义图形的基本结构和行为
export interface Figure<A = any, S = any> {
  name: string  // 图形的名称
  attrs: A     // 图形的属性
  styles: S    // 图形的样式
  draw: (ctx: CanvasRenderingContext2D, attrs: A, styles: S) => void  // 绘制图形的方法
  checkEventOn: (coordinate: Coordinate, attrs: A, styles: S) => boolean  // 检查事件是否在图形上
}

// FigureTemplate 类型：提取 Figure 接口中的部分属性，用于定义模板
export type FigureTemplate<A = any, S = any> = Pick<Figure<A, S>, 'name' | 'draw' | 'checkEventOn'>

// FigureCreate 类型：用于创建图形对象的模板，包含 `name`、`attrs` 和 `styles`
export type FigureCreate<A = any, S = any> = Pick<Figure<A, S>, 'name' | 'attrs' | 'styles'>

// FigureInnerConstructor 类型：内部构造函数类型，创建 FigureImp 对象
export type FigureInnerConstructor<A = any, S = any> = new (figure: FigureCreate<A, S>) => FigureImp<A, S>

// FigureConstructor 类型：图形构造函数类型，提供绘制方法
export type FigureConstructor<A = any, S = any> = new (figure: FigureCreate<A, S>) => ({ draw: (ctx: CanvasRenderingContext2D) => void })

// FigureImp 类：实现了 Figure 接口的大部分功能，同时继承了 Eventful 支持事件的功能
export default abstract class FigureImp<A = any, S = any> extends Eventful implements Omit<Figure<A, S>, 'name' | 'draw' | 'checkEventOn'> {
  attrs: A  // 图形的属性
  styles: S  // 图形的样式

  // 构造函数：初始化图形的属性和样式
  constructor (figure: FigureCreate) {
    super()  // 调用父类 Eventful 的构造函数
    this.attrs = figure.attrs  // 初始化属性
    this.styles = figure.styles  // 初始化样式
  }

  // 检查事件是否发生在图形上
  checkEventOn (event: MouseTouchEvent): boolean {
    return this.checkEventOnImp(event, this.attrs, this.styles)  // 调用子类实现的具体检查逻辑
  }

  // 设置图形的属性
  setAttrs (attrs: A): this {
    this.attrs = attrs  // 更新属性
    return this  // 返回当前对象，支持链式调用
  }

  // 设置图形的样式
  setStyles (styles: S): this {
    this.styles = styles  // 更新样式
    return this  // 返回当前对象，支持链式调用
  }

  // 绘制图形
  draw (ctx: CanvasRenderingContext2D): void {
    this.drawImp(ctx, this.attrs, this.styles)  // 调用子类实现的具体绘制逻辑
  }

  // 抽象方法：子类必须实现检查事件是否在图形上的逻辑
  abstract checkEventOnImp (event: MouseTouchEvent, attrs: A, styles: S): boolean

  // 抽象方法：子类必须实现绘制图形的逻辑
  abstract drawImp (ctx: CanvasRenderingContext2D, attrs: A, styles: S): void

  // 静态方法 extend：用于创建新的自定义图形类，继承了 FigureImp 并实现 `checkEventOnImp` 和 `drawImp`
  static extend<A, S> (figure: FigureTemplate<A, S>): new (figure: FigureCreate) => FigureImp<A, S> {
    class Custom extends FigureImp<A, S> {
      // 实现检查事件是否在图形上的逻辑
      checkEventOnImp (coordinate: Coordinate, attrs: A, styles: S): boolean {
        return figure.checkEventOn(coordinate, attrs, styles)  // 使用传入的 `checkEventOn` 方法
      }

      // 实现绘制图形的逻辑
      drawImp (ctx: CanvasRenderingContext2D, attrs: A, styles: S): void {
        figure.draw(ctx, attrs, styles)  // 使用传入的 `draw` 方法
      }
    }
    return Custom  // 返回新的自定义类
  }
}