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

import type Nullable from '../common/Nullable'  // 引入可以为 null 或 undefined 的类型
import type Bounding from '../common/Bounding'  // 引入坐标轴的边界类型
import { isFunction, isString } from '../common/utils/typeChecks'  // 引入工具函数，用于类型检查
import AxisImp, { type AxisTemplate, type Axis, type AxisRange, type AxisTick } from './Axis'  // 引入坐标轴类和相关类型
import type DrawPane from '../pane/DrawPane'  // 引入绘图面板类型
import { TimeWeightConstants } from '../store/TimeScaleStore'  // 引入时间刻度常量
import { FormatDateType } from '../Options'  // 引入日期格式化类型

// XAxisTemplate 类型：提取了 AxisTemplate 中的部分属性，用于定义 X 轴模板
export type XAxisTemplate = Pick<AxisTemplate, 'name' | 'scrollZoomEnabled' | 'createTicks'>

// XAxis 接口：定义 X 轴的接口，继承了 Axis 和 AxisTemplate，同时提供了时间戳到像素转换的方法
export interface XAxis extends Axis, AxisTemplate {
  convertTimestampFromPixel: (pixel: number) => Nullable<number>  // 将像素转换为时间戳
  convertTimestampToPixel: (timestamp: number) => number  // 将时间戳转换为像素
}

// XAxisConstructor 类型：定义 X 轴的构造函数类型
export type XAxisConstructor = new (parent: DrawPane<Axis>) => XAxis

// XAxisImp 类：实现了 X 轴的行为，继承自 AxisImp，抽象类
export default abstract class XAxisImp extends AxisImp implements XAxis {
  constructor (parent: DrawPane<Axis>, xAxis: XAxisTemplate) {
    super(parent)  // 调用父类构造函数
    this.override(xAxis)  // 覆盖 X 轴的属性
  }

  // 覆盖 X 轴的属性，根据模板传入的参数更新当前 X 轴的属性
  override (xAxis: XAxisTemplate): void {
    const {
      name,
      scrollZoomEnabled,
      createTicks
    } = xAxis
    if (!isString(name)) {
      this.name = name
    }
    this.scrollZoomEnabled = scrollZoomEnabled ?? this.scrollZoomEnabled  // 更新是否支持滚动缩放
    this.createTicks = createTicks ?? this.createTicks  // 更新刻度生成函数
  }

  // 创建 X 轴的范围，实现了父类的抽象方法
  protected override createRangeImp (): AxisRange {
    const chartStore = this.getParent().getChart().getChartStore()  // 获取图表的 store
    const visibleDataRange = chartStore.getTimeScaleStore().getVisibleRange()  // 获取时间轴的可见范围
    const { from, to } = visibleDataRange
    const af = from
    const at = to - 1
    const diff = to - from
    // 返回坐标轴的范围
    return {
      from: af,
      to: at,
      range: diff,
      realFrom: af,
      realTo: at,
      realRange: diff,
      displayFrom: af,
      displayTo: at,
      displayRange: diff
    }
  }

  // 创建 X 轴的刻度，实现了父类的抽象方法
  protected override createTicksImp (): AxisTick[] {
    const chartStore = this.getParent().getChart().getChartStore()  // 获取图表的 store
    const timeScaleStore = chartStore.getTimeScaleStore()  // 获取时间刻度存储
    const formatDate = chartStore.getCustomApi().formatDate  // 获取自定义的日期格式化函数
    const timeTickList = timeScaleStore.getVisibleTimeTickList()  // 获取可见的时间刻度列表
    const dateTimeFormat = timeScaleStore.getDateTimeFormat()  // 获取时间刻度的日期格式
    // 生成刻度列表
    const ticks = timeTickList.map(({ dataIndex, weight, timestamp }) => {
      let text = ''
      // 根据权重来确定显示的日期格式
      switch (weight) {
        case TimeWeightConstants.Year: {
          text = formatDate(dateTimeFormat, timestamp, 'YYYY', FormatDateType.XAxis)
          break
        }
        case TimeWeightConstants.Month: {
          text = formatDate(dateTimeFormat, timestamp, 'YYYY-MM', FormatDateType.XAxis)
          break
        }
        case TimeWeightConstants.Day: {
          text = formatDate(dateTimeFormat, timestamp, 'MM-DD', FormatDateType.XAxis)
          break
        }
        case TimeWeightConstants.Hour:
        case TimeWeightConstants.Minute: {
          text = formatDate(dateTimeFormat, timestamp, 'HH:mm', FormatDateType.XAxis)
          break
        }
        default: {
          text = formatDate(dateTimeFormat, timestamp, 'HH:mm:ss', FormatDateType.XAxis)
          break
        }
      }
      return {
        coord: this.convertToPixel(dataIndex),  // 将数据索引转换为像素值
        text,  // 刻度文本
        value: timestamp  // 时间戳
      }
    })
    // 如果定义了自定义刻度生成函数，则使用该函数
    if (isFunction(this.createTicks)) {
      return this.createTicks({
        range: this.getRange(),
        bounding: this.getBounding(),
        defaultTicks: ticks
      })
    }
    return ticks
  }

  // 获取 X 轴的自动大小
  override getAutoSize (): number {
    const styles = this.getParent().getChart().getStyles()  // 获取样式
    const xAxisStyles = styles.xAxis  // 获取 X 轴的样式
    const height = xAxisStyles.size  // 获取 X 轴的高度
    if (height !== 'auto') {
      return height
    }
    // 计算 X 轴的高度，包括刻度线、刻度文本等
    const crosshairStyles = styles.crosshair
    let xAxisHeight = 0
    if (xAxisStyles.show) {
      if (xAxisStyles.axisLine.show) {
        xAxisHeight += xAxisStyles.axisLine.size
      }
      if (xAxisStyles.tickLine.show) {
        xAxisHeight += xAxisStyles.tickLine.length
      }
      if (xAxisStyles.tickText.show) {
        xAxisHeight += (xAxisStyles.tickText.marginStart + xAxisStyles.tickText.marginEnd + xAxisStyles.tickText.size)
      }
    }
    // 计算十字光标的文本高度
    let crosshairVerticalTextHeight = 0
    if (
      crosshairStyles.show &&
      crosshairStyles.vertical.show &&
      crosshairStyles.vertical.text.show
    ) {
      crosshairVerticalTextHeight += (
        crosshairStyles.vertical.text.paddingTop +
        crosshairStyles.vertical.text.paddingBottom +
        crosshairStyles.vertical.text.borderSize * 2 +
        crosshairStyles.vertical.text.size
      )
    }
    // 返回 X 轴和十字光标中较大的高度
    return Math.max(xAxisHeight, crosshairVerticalTextHeight)
  }

  // 获取 X 轴的边界
  protected override getBounding (): Bounding {
    return this.getParent().getMainWidget().getBounding()
  }

  // 将像素转换为时间戳
  convertTimestampFromPixel (pixel: number): Nullable<number> {
    const timeScaleStore = this.getParent().getChart().getChartStore().getTimeScaleStore()
    const dataIndex = timeScaleStore.coordinateToDataIndex(pixel)  // 将像素坐标转换为数据索引
    return timeScaleStore.dataIndexToTimestamp(dataIndex)  // 将数据索引转换为时间戳
  }

  // 将时间戳转换为像素
  convertTimestampToPixel (timestamp: number): number {
    const timeScaleStore = this.getParent().getChart().getChartStore().getTimeScaleStore()
    const dataIndex = timeScaleStore.timestampToDataIndex(timestamp)  // 将时间戳转换为数据索引
    return timeScaleStore.dataIndexToCoordinate(dataIndex)  // 将数据索引转换为像素
  }

  // 将像素坐标转换为数据索引
  convertFromPixel (pixel: number): number {
    return this.getParent().getChart().getChartStore().getTimeScaleStore().coordinateToDataIndex(pixel)
  }

  // 将数据索引转换为像素坐标
  convertToPixel (value: number): number {
    return this.getParent().getChart().getChartStore().getTimeScaleStore().dataIndexToCoordinate(value)
  }

  // 静态方法 extend：用于扩展 X 轴的类
  static extend (template: XAxisTemplate): XAxisConstructor {
    class Custom extends XAxisImp {
      constructor (parent: DrawPane<Axis>) {
        super(parent, template)  // 调用父类构造函数
      }
    }
    return Custom
  }
}
