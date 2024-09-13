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

import type VisibleRange from '../common/VisibleRange'  // 引入可见范围类型
import type DrawPane from '../pane/DrawPane'            // 引入绘图面板类型
import type Bounding from '../common/Bounding'          // 引入边界类型
import { type KLineData } from '../common/Data'         // 引入 K 线数据类型
import { type Indicator } from './Indicator'            // 引入指标类型

// AxisTick 接口：定义坐标轴上的刻度信息
export interface AxisTick {
  coord: number       // 坐标值
  value: number | string  // 显示的值，可以是数字或字符串
  text: string        // 显示的文本
}

// AxisRange 接口：继承自 VisibleRange，增加一些坐标轴范围相关的属性
export interface AxisRange extends VisibleRange {
  readonly range: number          // 坐标轴的实际范围
  readonly realRange: number      // 坐标轴的真实范围
  readonly displayFrom: number    // 显示的起始位置
  readonly displayTo: number      // 显示的结束位置
  readonly displayRange: number   // 显示的范围
}

// AxisGap 接口：定义坐标轴的上下边距
export interface AxisGap {
  top?: number
  bottom?: number
}

// AxisPosition 枚举：定义坐标轴的位置（左侧或右侧）
export enum AxisPosition {
  Left = 'left',
  Right = 'right'
}

// AxisValueToValueParams 接口：用于值转换时的参数
export interface AxisValueToValueParams {
  range: AxisRange  // 当前的坐标轴范围
}

// AxisValueToValueCallback 类型：用于定义值与值之间的转换回调
export type AxisValueToValueCallback = (value: number, params: AxisValueToValueParams) => number

// AxisCreateRangeParams 接口：创建坐标轴范围时的参数
export interface AxisCreateRangeParams {
  kLineDataList: KLineData[]   // K 线数据列表
  indicators: Indicator[]      // 指标列表
  visibleDataRange: VisibleRange  // 可见的数据范围
  defaultRange: AxisRange      // 默认的坐标轴范围
}

// AxisCreateRangeCallback 类型：定义创建坐标轴范围的回调函数
export type AxisCreateRangeCallback = (params: AxisCreateRangeParams) => AxisRange

// AxisCreateTicksParams 接口：创建刻度时的参数
export interface AxisCreateTicksParams {
  range: AxisRange   // 当前的坐标轴范围
  bounding: Bounding // 坐标轴的边界信息
  defaultTicks: AxisTick[]  // 默认的刻度列表
}

// AxisCreateTicksCallback 类型：定义创建刻度的回调函数
export type AxisCreateTicksCallback = (params: AxisCreateTicksParams) => AxisTick[]

// AxisMinSpanCallback 类型：定义获取最小刻度跨度的回调函数
export type AxisMinSpanCallback = (precision: number) => number

// Axis 接口：表示坐标轴对象
export interface Axis {
  override: (axis: AxisTemplate) => void  // 覆盖坐标轴的配置
  getTicks: () => AxisTick[]              // 获取坐标轴的刻度
  getRange: () => AxisRange               // 获取当前坐标轴的范围
  getAutoSize: () => number               // 获取自动计算的大小
  convertToPixel: (value: number) => number  // 将值转换为像素坐标
  convertFromPixel: (px: number) => number   // 将像素坐标转换为值
}

// AxisTemplate 接口：定义坐标轴的模板配置
export interface AxisTemplate {
  name: string                         // 坐标轴的名称
  reverse?: boolean                    // 是否反转坐标轴
  inside?: boolean                     // 是否在内部绘制
  position?: AxisPosition              // 坐标轴的位置（左或右）
  scrollZoomEnabled?: boolean          // 是否启用滚动缩放
  gap?: AxisGap                        // 坐标轴的上下边距
  valueToRealValue?: AxisValueToValueCallback   // 实际值到真实值的转换回调
  realValueToDisplayValue?: AxisValueToValueCallback  // 真实值到显示值的转换回调
  displayValueToRealValue?: AxisValueToValueCallback  // 显示值到真实值的转换回调
  realValueToValue?: AxisValueToValueCallback        // 真实值到实际值的转换回调
  displayValueToText?: (value: number, precision: number) => string  // 显示值到文本的转换函数
  minSpan?: AxisMinSpanCallback       // 最小刻度跨度的回调函数
  createRange?: AxisCreateRangeCallback   // 创建坐标轴范围的回调函数
  createTicks?: AxisCreateTicksCallback   // 创建坐标轴刻度的回调函数
}

// AxisCreate 类型：从 AxisTemplate 中省略某些特定的属性，用于简化配置
export type AxisCreate = Omit<AxisTemplate, 'displayValueToText' | 'valueToRealValue' | 'realValueToDisplayValue' | 'displayValueToRealValue' | 'realValueToValue' | 'minSpan'>

// getDefaultAxisRange 函数：获取默认的 AxisRange 对象，所有范围值初始化为 0
function getDefaultAxisRange (): AxisRange {
  return {
    from: 0,
    to: 0,
    range: 0,
    realFrom: 0,
    realTo: 0,
    realRange: 0,
    displayFrom: 0,
    displayTo: 0,
    displayRange: 0
  }
}

// AxisImp 抽象类：实现了 Axis 接口，管理坐标轴的功能和状态
export default abstract class AxisImp implements Axis {
  name: string  // 坐标轴的名称
  scrollZoomEnabled = true  // 是否启用滚动缩放，默认启用
  createTicks: AxisCreateTicksCallback  // 创建刻度的回调函数

  private readonly _parent: DrawPane<Axis>  // 关联的父面板对象
  private _range = getDefaultAxisRange()    // 当前坐标轴的范围
  private _prevRange = getDefaultAxisRange()  // 上一次的坐标轴范围
  private _ticks: AxisTick[] = []           // 当前的刻度列表
  private _autoCalcTickFlag = true          // 是否自动计算刻度的标志

  // 构造函数：接受一个父面板对象作为参数
  constructor (parent: DrawPane<Axis>) {
    this._parent = parent
  }

  // 获取父面板对象
  getParent (): DrawPane<Axis> { 
    return this._parent 
  }

  // buildTicks 方法：构建刻度，如果需要强制重建则传入 force 参数
  buildTicks (force: boolean): boolean {
    if (this._autoCalcTickFlag) {
      this._range = this.createRangeImp()  // 自动计算范围
    }
    if (this._prevRange.from !== this._range.from || this._prevRange.to !== this._range.to || force) {
      this._prevRange = this._range  // 更新前一个范围
      this._ticks = this.createTicksImp()  // 重新生成刻度
      return true  // 返回 true 表示刻度已更新
    }
    return false  // 返回 false 表示刻度未发生变化
  }

  // 获取当前的刻度
  getTicks (): AxisTick[] {
    return this._ticks
  }

  // 设置坐标轴的范围，禁用自动计算刻度
  setRange (range: AxisRange): void {
    this._autoCalcTickFlag = false  // 禁用自动计算
    this._range = range             // 设置新的范围
  }

  // 获取当前的范围
  getRange (): AxisRange { 
    return this._range 
  }

  // 设置是否自动计算刻度的标志
  setAutoCalcTickFlag (flag: boolean): void {
    this._autoCalcTickFlag = flag
  }

  // 获取当前是否自动计算刻度
  getAutoCalcTickFlag (): boolean { 
    return this._autoCalcTickFlag 
  }

  // 抽象方法，子类需要实现创建范围的逻辑
  protected abstract createRangeImp (): AxisRange

  // 抽象方法，子类需要实现创建刻度的逻辑
  protected abstract createTicksImp (): AxisTick[]

  // 抽象方法，子类需要实现获取边界的逻辑
protected abstract getBounding (): Bounding

// 抽象方法，子类需要实现覆盖坐标轴模板的逻辑
abstract override (axis: AxisTemplate): void

// 抽象方法，子类需要实现自动计算坐标轴的大小
abstract getAutoSize (): number

// 抽象方法，将数值转换为像素值
abstract convertToPixel (value: number): number

// 抽象方法，将像素值转换为实际的坐标轴值
abstract convertFromPixel (px: number): number
}