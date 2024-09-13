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

import { CandleType } from '../common/Styles'  // 引入蜡烛图类型
import type Bounding from '../common/Bounding'  // 引入边界类型
import { isNumber, isString, isValid, merge } from '../common/utils/typeChecks'  // 引入类型检查工具函数
import { index10, getPrecision, nice, round } from '../common/utils/number'  // 引入数字处理函数
import { calcTextWidth } from '../common/utils/canvas'  // 引入计算文本宽度的工具函数
import { formatPrecision, formatThousands, formatFoldDecimal } from '../common/utils/format'  // 引入格式化工具函数

import AxisImp, {
  type AxisTemplate, type Axis, type AxisRange,
  type AxisTick, type AxisValueToValueCallback,
  type AxisMinSpanCallback, type AxisCreateRangeCallback,
  AxisPosition
} from './Axis'  // 引入坐标轴的相关接口和实现

import type DrawPane from '../pane/DrawPane'  // 引入绘图面板类型

import { PaneIdConstants } from '../pane/types'  // 引入面板ID常量

// YAxisTemplate 类型：定义 Y 轴模板
export type YAxisTemplate = AxisTemplate

// 定义默认的刻度数量
const TICK_COUNT = 8

// YAxis 接口：继承了 Axis 和 YAxisTemplate，并扩展了 Y 轴的相关方法
export interface YAxis extends Axis, YAxisTemplate {
  isFromZero: () => boolean  // 检查 Y 轴是否从 0 开始
  isInCandle: () => boolean  // 检查是否是蜡烛图 Y 轴
  convertToNicePixel: (value: number) => number  // 将值转换为调整后的像素坐标
}

// YAxisConstructor 类型：定义 Y 轴的构造函数类型
export type YAxisConstructor = new (parent: DrawPane<Axis>) => YAxis

// YAxisImp 类：实现 YAxis 接口，继承自 AxisImp
export default abstract class YAxisImp extends AxisImp implements YAxis {
  reverse = false  // 是否反转
  inside = false  // 是否在内部
  position = AxisPosition.Right  // Y 轴默认在右侧
  gap = {
    top: 0.2,
    bottom: 0.1
  }

  // Y 轴的范围创建回调，默认直接使用参数的 defaultRange
  createRange: AxisCreateRangeCallback = params => params.defaultRange
  minSpan: AxisMinSpanCallback = precision => index10(-precision)
  valueToRealValue: AxisValueToValueCallback = value => value
  realValueToDisplayValue: AxisValueToValueCallback = value => value
  displayValueToRealValue: AxisValueToValueCallback = value => value
  realValueToValue: AxisValueToValueCallback = value => value
  displayValueToText: (value: number, precision: number) => string = (value, precision) => formatPrecision(value, precision)

  // 构造函数：初始化 Y 轴的配置
  constructor(parent: DrawPane<Axis>, yAxis: YAxisTemplate) {
    super(parent)
    this.override(yAxis)
  }

  // override 方法：覆盖 Y 轴的属性
  override(yAxis: YAxisTemplate): void {
    const {
      name,
      position,
      reverse,
      inside,
      scrollZoomEnabled,
      gap,
      minSpan,
      displayValueToText,
      valueToRealValue,
      realValueToDisplayValue,
      displayValueToRealValue,
      realValueToValue,
      createRange,
      createTicks
    } = yAxis
    if (!isString(name)) {
      this.name = name
    }
    this.position = position ?? this.position
    this.reverse = reverse ?? this.reverse
    this.inside = inside ?? this.inside
    this.scrollZoomEnabled = scrollZoomEnabled ?? this.scrollZoomEnabled
    merge(this.gap, gap)
    this.displayValueToText = displayValueToText ?? this.displayValueToText
    this.minSpan = minSpan ?? this.minSpan
    this.valueToRealValue = valueToRealValue ?? this.valueToRealValue
    this.realValueToDisplayValue = realValueToDisplayValue ?? this.realValueToDisplayValue
    this.displayValueToRealValue = displayValueToRealValue ?? this.displayValueToRealValue
    this.realValueToValue = realValueToValue ?? this.realValueToValue
    this.createRange = createRange ?? this.createRange
    this.createTicks = createTicks ?? this.createTicks
  }

  // createRangeImp 方法：根据可见数据范围和指标计算 Y 轴的范围
  protected override createRangeImp(): AxisRange {
    const parent = this.getParent()
    const chart = parent.getChart()
    const chartStore = chart.getChartStore()
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    let shouldOhlc = false
    let specifyMin = Number.MAX_SAFE_INTEGER
    let specifyMax = Number.MIN_SAFE_INTEGER
    let indicatorPrecision = Number.MAX_SAFE_INTEGER
    const indicators = chartStore.getIndicatorStore().getInstanceByPaneId(parent.getId())

    indicators.forEach(indicator => {
      if (!shouldOhlc) {
        shouldOhlc = indicator.shouldOhlc ?? false
      }
      indicatorPrecision = Math.min(indicatorPrecision, indicator.precision)
      if (isNumber(indicator.minValue)) {
        specifyMin = Math.min(specifyMin, indicator.minValue)
      }
      if (isNumber(indicator.maxValue)) {
        specifyMax = Math.max(specifyMax, indicator.maxValue)
      }
    })

    let precision = 4
    const inCandle = this.isInCandle()
    if (inCandle) {
      const { price: pricePrecision } = chartStore.getPrecision()
      precision = Math.min(indicatorPrecision, pricePrecision)
    } else {
      precision = indicatorPrecision !== Number.MAX_SAFE_INTEGER ? indicatorPrecision : precision
    }

    const visibleDataList = chartStore.getVisibleDataList()
    const candleStyles = chart.getStyles().candle
    const isArea = candleStyles.type === CandleType.Area
    const areaValueKey = candleStyles.area.value
    const shouldCompareHighLow = (inCandle && !isArea) || (!inCandle && shouldOhlc)

    visibleDataList.forEach(({ dataIndex, data }) => {
      if (isValid(data)) {
        if (shouldCompareHighLow) {
          min = Math.min(min, data.low)
          max = Math.max(max, data.high)
        }
        if (inCandle && isArea) {
          const value = data[areaValueKey]
          if (isNumber(value)) {
            min = Math.min(min, value)
            max = Math.max(max, value)
          }
        }
      }
      indicators.forEach(({ result, figures }) => {
        const data = result[dataIndex] ?? {}
        figures.forEach(figure => {
          const value = data[figure.key]
          if (isNumber(value)) {
            min = Math.min(min, value)
            max = Math.max(max, value)
          }
        })
      })
    })

    if (min !== Number.MAX_SAFE_INTEGER && max !== Number.MIN_SAFE_INTEGER) {
      min = Math.min(specifyMin, min)
      max = Math.max(specifyMax, max)
    } else {
      min = 0
      max = 10
    }

    const defaultDiff = max - min
    const defaultRange = {
      from: min,
      to: max,
      range: defaultDiff,
      realFrom: min,
      realTo: max,
      realRange: defaultDiff,
      displayFrom: min,
      displayTo: max,
      displayRange: defaultDiff
    }

    const range = this.createRange?.({
      kLineDataList: chartStore.getDataList(),
      visibleDataRange: chartStore.getTimeScaleStore().getVisibleRange(),
      indicators,
      defaultRange
    })
    let realFrom = range.realFrom
    let realTo = range.realTo
    let realRange = range.realRange
    const minSpan = this.minSpan(precision)

    if (realFrom === realTo || realRange < minSpan) {
      const minCheck = specifyMin === realFrom
      const maxCheck = specifyMax === realTo
      const halfTickCount = TICK_COUNT / 2
      realFrom = minCheck ? realFrom : (maxCheck ? realFrom - TICK_COUNT * minSpan : realFrom - halfTickCount * minSpan)
      realTo = maxCheck ? realTo : (minCheck ? realTo + TICK_COUNT * minSpan : realTo + halfTickCount * minSpan)
    }

    const height = this.getBounding().height
    const { top, bottom } = this.gap
    let topRate = top >= 1 ? top / height : top
    let bottomRate = bottom >= 1 ? bottom / height : bottom
    realRange = realTo - realFrom
    realFrom = realFrom - realRange * bottomRate
    realTo = realTo + realRange * topRate

    const from = this.realValueToValue(realFrom, { range })
    const to = this.realValueToValue(realTo, { range })
    const displayFrom = this.realValueToDisplayValue(realFrom, { range })
    const displayTo = this.realValueToDisplayValue(realTo, { range })
    return {
      from,
      to,
      range: to - from,
      realFrom,
      realTo,
      realRange: realTo - realFrom,
      displayFrom,
      displayTo,
      displayRange: displayTo - displayFrom
    }
  }

  /**
   * 是否是蜡烛图轴
   * @return {boolean}
   */
  isInCandle(): boolean {
    return this.getParent().getId() === PaneIdConstants.CANDLE
  }

  /**
   * 是否从y轴0开始
   * @return {boolean}
   */
  isFromZero(): boolean {
    return (
      (this.position === AxisPosition.Left && this.inside) ||
      (this.position === AxisPosition.Right && !this.inside)
    )
  }

  protected override createTicksImp(): AxisTick[] {
    const range = this.getRange()  // 获取当前坐标轴的范围
    const { displayFrom, displayTo, displayRange } = range  // 解构范围的起点、终点和显示范围
    const ticks: AxisTick[] = []  // 用于存储生成的刻度

    // 如果显示范围大于等于 0，开始计算刻度
    if (displayRange >= 0) {
      const interval = nice(displayRange / TICK_COUNT)  // 通过 nice 函数计算适合的刻度间隔
      const precision = getPrecision(interval)  // 获取刻度间隔的精度

      // 计算第一个和最后一个刻度
      const first = round(Math.ceil(displayFrom / interval) * interval, precision)  // 向上取整第一个刻度
      const last = round(Math.floor(displayTo / interval) * interval, precision)  // 向下取整最后一个刻度
      let n = 0
      let f = first

      // 如果间隔不为 0，则生成刻度
      if (interval !== 0) {
        while (f <= last) {
          const v = f.toFixed(precision)  // 将数值格式化为指定精度
          ticks[n] = { text: v, coord: 0, value: v }  // 添加刻度，初始坐标为 0
          ++n
          f += interval  // 递增下一个刻度
        }
      }
    }

    // 获取当前 Y 轴的父级面板
    const pane = this.getParent()
    const height = pane.getYAxisWidget()?.getBounding().height ?? 0  // 获取 Y 轴的高度
    const chartStore = pane.getChart().getChartStore()  // 获取图表的存储
    const customApi = chartStore.getCustomApi()  // 获取自定义 API

    const optimalTicks: AxisTick[] = []  // 用于存储优化后的刻度
    const indicators = chartStore.getIndicatorStore().getInstanceByPaneId(pane.getId())  // 获取该面板的指标实例
    const thousandsSeparator = chartStore.getThousandsSeparator()  // 获取千分位分隔符
    const decimalFoldThreshold = chartStore.getDecimalFoldThreshold()  // 获取小数折叠阈值

    // 初始化精度和是否格式化大数字的标志
    let precision = 0
    let shouldFormatBigNumber = false

    // 判断是否在蜡烛图中，并设定精度
    if (this.isInCandle()) {
      precision = chartStore.getPrecision().price  // 设置为价格的精度
    } else {
      // 遍历指标，获取最大精度和是否需要格式化大数字
      indicators.forEach(indicator => {
        precision = Math.max(precision, indicator.precision)
        if (!shouldFormatBigNumber) {
          shouldFormatBigNumber = indicator.shouldFormatBigNumber
        }
      })
    }

    const textHeight = chartStore.getStyles().xAxis.tickText.size  // 获取 X 轴刻度文本的高度
    let validY: number  // 用于存储有效的 Y 坐标

    // 遍历生成的刻度，进一步处理格式化和坐标计算
    ticks.forEach(({ value }) => {
      let v = this.displayValueToText(+value, precision)  // 格式化显示值
      const y = this.convertToPixel(  // 计算该刻度在 Y 轴上的像素位置
        this.realValueToValue(
          this.displayValueToRealValue(+value, { range }),
          { range }
        )
      )

      // 如果需要格式化大数字，则调用自定义 API 进行处理
      if (shouldFormatBigNumber) {
        v = customApi.formatBigNumber(value)
      }

      // 使用千分位和小数折叠格式化数字
      v = formatFoldDecimal(formatThousands(v, thousandsSeparator), decimalFoldThreshold)

      // 检查 Y 坐标是否有效，确保刻度文本不会重叠
      const validYNumber = isNumber(validY)
      if (
        y > textHeight &&  // 保证刻度文本不会超过顶部
        y < height - textHeight &&  // 保证刻度文本不会超过底部
        ((validYNumber && (Math.abs(validY - y) > textHeight * 2)) || !validYNumber)) {  // 保证刻度文本不会重叠
        optimalTicks.push({ text: v, coord: y, value })  // 将有效刻度添加到优化后的刻度列表
        validY = y  // 更新当前有效的 Y 坐标
      }
    })

    return optimalTicks  // 返回优化后的刻度列表
  }

  override getAutoSize(): number {
    const pane = this.getParent()  // 获取当前 Y 轴所属的面板
    const chart = pane.getChart()  // 获取图表对象
    const styles = chart.getStyles()  // 获取图表的样式
    const yAxisStyles = styles.yAxis  // 获取 Y 轴的样式
    const width = yAxisStyles.size  // 获取 Y 轴的宽度配置

    // 如果 Y 轴的宽度不是 'auto'，直接返回配置的宽度
    if (width !== 'auto') {
      return width
    }

    const chartStore = chart.getChartStore()  // 获取图表的存储对象
    const customApi = chartStore.getCustomApi()  // 获取自定义 API
    let yAxisWidth = 0  // 初始化 Y 轴的宽度

    // 如果 Y 轴需要显示
    if (yAxisStyles.show) {
      // 如果需要显示 Y 轴的轴线，则将轴线的宽度加到 Y 轴宽度上
      if (yAxisStyles.axisLine.show) {
        yAxisWidth += yAxisStyles.axisLine.size
      }

      // 如果需要显示刻度线，则将刻度线的长度加到 Y 轴宽度上
      if (yAxisStyles.tickLine.show) {
        yAxisWidth += yAxisStyles.tickLine.length
      }

      // 如果需要显示刻度文本，则计算刻度文本的宽度并累加到 Y 轴宽度上
      if (yAxisStyles.tickText.show) {
        let textWidth = 0  // 初始化刻度文本的宽度
        // 遍历所有刻度，计算文本宽度，并取最大值
        this.getTicks().forEach(tick => {
          textWidth = Math.max(
            textWidth,
            calcTextWidth(tick.text, yAxisStyles.tickText.size, yAxisStyles.tickText.weight, yAxisStyles.tickText.family)
          )
        })

        // 将刻度文本的左右边距和文本宽度加到 Y 轴的宽度上
        yAxisWidth += (yAxisStyles.tickText.marginStart + yAxisStyles.tickText.marginEnd + textWidth)
      }
    }

    // 获取十字光标的样式
    const crosshairStyles = styles.crosshair
    let crosshairVerticalTextWidth = 0  // 初始化十字光标文本的宽度

    // 如果十字光标需要显示，并且水平线和水平线文本都需要显示
    if (
      crosshairStyles.show &&
      crosshairStyles.horizontal.show &&
      crosshairStyles.horizontal.text.show
    ) {
      const indicators = chartStore.getIndicatorStore().getInstanceByPaneId(pane.getId())  // 获取当前面板的指标
      let indicatorPrecision = 0  // 初始化指标的精度
      let shouldFormatBigNumber = false  // 初始化是否格式化大数字的标志

      // 遍历所有指标，获取最大精度并确定是否需要格式化大数字
      indicators.forEach(indicator => {
        indicatorPrecision = Math.max(indicator.precision, indicatorPrecision)
        if (!shouldFormatBigNumber) {
          shouldFormatBigNumber = indicator.shouldFormatBigNumber
        }
      })

      // 初始化精度
      let precision = 2
      if (this.isInCandle()) {
        // 如果是蜡烛图，使用价格精度
        const { price: pricePrecision } = chartStore.getPrecision()
        const lastValueMarkStyles = styles.indicator.lastValueMark
        if (lastValueMarkStyles.show && lastValueMarkStyles.text.show) {
          precision = Math.max(indicatorPrecision, pricePrecision)
        } else {
          precision = pricePrecision
        }
      } else {
        // 否则使用指标的精度
        precision = indicatorPrecision
      }

      // 获取当前范围的显示最大值并格式化
      let valueText = formatPrecision(this.getRange().displayTo, precision)
      if (shouldFormatBigNumber) {
        valueText = customApi.formatBigNumber(valueText)
      }
      valueText = formatFoldDecimal(valueText, chartStore.getDecimalFoldThreshold())

      // 计算十字光标文本的宽度，包括文本本身、边距、内边距和边框大小
      crosshairVerticalTextWidth += (
        crosshairStyles.horizontal.text.paddingLeft +
        crosshairStyles.horizontal.text.paddingRight +
        crosshairStyles.horizontal.text.borderSize * 2 +
        calcTextWidth(
          valueText,
          crosshairStyles.horizontal.text.size,
          crosshairStyles.horizontal.text.weight,
          crosshairStyles.horizontal.text.family
        )
      )
    }

    // 返回 Y 轴宽度和十字光标文本宽度中的最大值，确保宽度足够显示所有内容
    return Math.max(yAxisWidth, crosshairVerticalTextWidth)
  }

  protected override getBounding(): Bounding {
    return this.getParent().getYAxisWidget()!.getBounding()
  }

  // 将像素值转换为实际坐标轴上的数值
  convertFromPixel(pixel: number): number {
    // 获取 Y 轴的高度
    const height = this.getBounding().height

    // 获取当前坐标轴的范围
    const range = this.getRange()
    const { realFrom, realRange } = range  // 获取范围的起点和范围大小

    // 根据是否反转 Y 轴来计算像素比例
    const rate = this.reverse ? pixel / height : 1 - pixel / height

    // 根据比例计算出坐标轴上的实际数值
    const realValue = rate * realRange + realFrom

    // 将真实数值转换为显示数值，并返回
    return this.realValueToValue(realValue, { range })
  }

  // 将实际坐标轴上的数值转换为像素值
  convertToPixel(value: number): number {
    // 获取当前坐标轴的范围
    const range = this.getRange()

    // 将数值转换为真实数值
    const realValue = this.valueToRealValue(value, { range })

    // 获取 Y 轴的高度
    const height = this.getParent().getYAxisWidget()?.getBounding().height ?? 0

    // 计算数值在坐标轴中的位置比例
    const { realFrom, realRange } = range
    const rate = (realValue - realFrom) / realRange

    // 如果 Y 轴是反转的，则直接按比例计算像素值，否则计算反转的像素值
    return this.reverse ? Math.round(rate * height) : Math.round((1 - rate) * height)
  }

  // 将数值转换为 "理想的" 像素值，避免像素值太靠近顶部或底部
  convertToNicePixel(value: number): number {
    // 获取 Y 轴的高度
    const height = this.getParent().getYAxisWidget()?.getBounding().height ?? 0

    // 将数值转换为像素值
    const pixel = this.convertToPixel(value)

    // 确保像素值不会太靠近顶部或底部，使用 5% 到 98% 的范围进行限制
    return Math.round(Math.max(height * 0.05, Math.min(pixel, height * 0.98)))
  }

  static extend(template: YAxisTemplate): YAxisConstructor {
    class Custom extends YAxisImp {
      constructor(parent: DrawPane<Axis>) {
        super(parent, template)
      }
    }
    return Custom
  }
}
