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
// 导入 KLineData 类型，用于表示K线数据的结构
import { type KLineData } from '../../common/Data'
// 导入 IndicatorStyle 和 PolygonType，用于表示指标样式和图形类型
import { type IndicatorStyle, PolygonType } from '../../common/Styles'
// 导入 formatValue 函数，用于格式化数值
import { formatValue } from '../../common/utils/format'

// 导入 Indicator, IndicatorTemplate 和 IndicatorFigureStylesCallbackData 类型，
// 用于定义指标模板和回调函数的数据类型
import { type Indicator, type IndicatorTemplate, type IndicatorFigureStylesCallbackData } from '../../component/Indicator'

// 定义一个接口 Ao，用于表示Awesome Oscillator（AO）的数据结构
interface Ao {
  ao?: number // AO值，可能为空
}

/**
 * awesomeOscillator 是计算Awesome Oscillator (AO) 指标的模板
 * AO是一种用于量化市场动量的指标，通过计算两段移动平均线之间的差值来确定市场的方向。
 */
const awesomeOscillator: IndicatorTemplate<Ao> = {
  name: 'AO', // 指标名称
  shortName: 'AO', // 指标简称，用于图表显示
  calcParams: [5, 34], // 计算参数，使用5和34作为短期和长期的周期

  // 定义图形的样式和显示方式
  figures: [{
    key: 'ao', // 图形的关键字
    title: 'AO: ', // 图表上显示的标题
    type: 'bar', // AO将以柱状图的形式显示
    baseValue: 0, // 基准值为0，柱状图以上为正，以下为负

    // styles 函数，用于根据数据动态设置柱状图的颜色和样式
    styles: (data: IndicatorFigureStylesCallbackData<Ao>, indicator: Indicator<Ao>, defaultStyles: IndicatorStyle) => {
      const { prev, current } = data // 从回调数据中获取前一个和当前的数据点
      const prevAo = prev.indicatorData?.ao ?? Number.MIN_SAFE_INTEGER // 取前一个数据点的AO值，若不存在则为最小安全值
      const currentAo = current.indicatorData?.ao ?? Number.MIN_SAFE_INTEGER // 取当前数据点的AO值，若不存在则为最小安全值
      
      let color: string // 用于存储柱状图的颜色
      // 根据当前的AO值与前一个AO值的比较，决定颜色的变化
      if (currentAo > prevAo) {
        // 如果当前AO值大于前一个AO值，使用上涨颜色
        color = formatValue(indicator.styles, 'bars[0].upColor', (defaultStyles.bars)[0].upColor) as string
      } else {
        // 如果当前AO值小于或等于前一个AO值，使用下跌颜色
        color = formatValue(indicator.styles, 'bars[0].downColor', (defaultStyles.bars)[0].downColor) as string
      }

      // 根据AO值的变化，决定柱状图是实心（填充）还是空心（描边）
      const style = currentAo > prevAo ? PolygonType.Stroke : PolygonType.Fill
      return { color, style, borderColor: color } // 返回样式对象，包括颜色、样式和边框颜色
    }
  }],

  // calc 函数，用于根据K线数据计算AO值
  calc: (dataList: KLineData[], indicator: Indicator<Ao>) => {
    const params = indicator.calcParams // 取出计算参数，分别为短期和长期周期
    const maxPeriod = Math.max(params[0] as number, params[1] as number) // 计算出最大周期，作为数据计算的起始点
    let shortSum = 0 // 短期移动平均线的总和
    let longSum = 0 // 长期移动平均线的总和
    let short = 0 // 短期移动平均值
    let long = 0 // 长期移动平均值

    // 遍历数据列表，为每个数据点计算AO值
    return dataList.map((kLineData: KLineData, i: number) => {
      const ao: Ao = {} // 创建一个新的AO对象
      const middle = (kLineData.low + kLineData.high) / 2 // 计算当前K线数据的中间价（最高价与最低价的平均值）

      // 将中间价加入短期和长期的总和中
      shortSum += middle
      longSum += middle

      // 当数据点大于等于短期周期时，计算短期移动平均线
      if (i >= params[0] - 1) {
        short = shortSum / params[0] // 短期移动平均值
        const agoKLineData = dataList[i - (params[0] - 1)] // 找到超出短期周期的数据点
        shortSum -= ((agoKLineData.low + agoKLineData.high) / 2) // 从短期总和中减去该数据点的中间价
      }

      // 当数据点大于等于长期周期时，计算长期移动平均线
      if (i >= params[1] - 1) {
        long = longSum / params[1] // 长期移动平均值
        const agoKLineData = dataList[i - (params[1] - 1)] // 找到超出长期周期的数据点
        longSum -= ((agoKLineData.low + agoKLineData.high) / 2) // 从长期总和中减去该数据点的中间价
      }

      // 当数据点大于等于最大周期时，计算AO值（短期均值减去长期均值）
      if (i >= maxPeriod - 1) {
        ao.ao = short - long // AO值为短期均值与长期均值的差值
      }

      return ao // 返回计算出的AO对象
    })
  }
}

export default awesomeOscillator // 导出awesomeOscillator模块，供其他地方使用
