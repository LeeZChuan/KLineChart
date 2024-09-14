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

// 引入 FigureImp 类，FigureTemplate、FigureConstructor、FigureInnerConstructor 类型
import FigureImp, { type FigureTemplate, type FigureConstructor, type FigureInnerConstructor } from '../../component/Figure'

// 引入各种图形模块，包括圆形、直线、多边形、矩形、文本和弧线
import circle from './circle'
import line from './line'
import polygon from './polygon'
import rect from './rect'
import text from './text'
import arc from './arc'

// 创建一个空的对象，用于存储所有注册的图形构造函数
const figures: Record<string, FigureInnerConstructor> = {}

// 定义一个扩展数组，包含所有的图形模块
const extensions = [circle, line, polygon, rect, text, arc]

// 遍历每个图形模块，将其扩展为 `FigureImp` 并存储在 `figures` 对象中
extensions.forEach((figure: FigureTemplate) => {
  figures[figure.name] = FigureImp.extend(figure)
})

/**
 * 获取所有支持的图形名称
 * @returns string[] - 返回支持的图形名称数组
 */
function getSupportedFigures (): string[] {
  return Object.keys(figures) // 返回 `figures` 对象的所有键（即图形名称）
}

/**
 * 注册一个新的图形
 * @param figure - 要注册的图形模板
 */
function registerFigure<A = any, S = any> (figure: FigureTemplate<A, S>): void {
  // 将传入的图形扩展为 `FigureImp` 并存储到 `figures` 对象中
  figures[figure.name] = FigureImp.extend(figure)
}

/**
 * 根据图形名称获取内部图形构造类
 * @param name - 图形名称
 * @returns Nullable<FigureInnerConstructor> - 返回图形构造类或 null
 */
function getInnerFigureClass<A = any, S = any> (name: string): Nullable<FigureInnerConstructor<A, S>> {
  return figures[name] ?? null // 如果 `figures` 中有对应名称的图形类，返回它，否则返回 null
}

/**
 * 根据图形名称获取图形构造类
 * @param name - 图形名称
 * @returns Nullable<FigureConstructor> - 返回图形构造类或 null
 */
function getFigureClass<A = any, S = any> (name: string): Nullable<FigureConstructor<A, S>> {
  return figures[name] ?? null // 类似于 `getInnerFigureClass`，返回构造类或 null
}

// 导出函数，用于外部模块使用
export { getSupportedFigures, getFigureClass, getInnerFigureClass, registerFigure }