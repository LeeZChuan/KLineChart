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

// 导入类型 KLineData，用于表示K线数据的结构
import { type KLineData } from '../../common/Data'
// 导入IndicatorTemplate类型和IndicatorSeries枚举，用于定义指标模板
import { type IndicatorTemplate, IndicatorSeries } from '../../component/Indicator'

// 定义一个接口 Avp，表示平均价格的结构，包含一个可选的 avp 属性
interface Avp {
  avp?: number // 平均价格（可能不存在）
}

/**
 * averagePrice 是一个计算股票或其他资产的成交均价（AVP: Average Volume Price）的指标。
 */
const averagePrice: IndicatorTemplate<Avp> = {
  name: 'AVP', // 指标的全称
  shortName: 'AVP', // 指标的简写名，用于图表上显示
  series: IndicatorSeries.Price, // 表示这个指标属于价格系列，适用于价格图表
  precision: 2, // 小数点后保留两位，表示计算结果的精度
  figures: [
    { 
      key: 'avp', // 使用 'avp' 作为数据关键字
      title: 'AVP: ', // 图表上显示的标题
      type: 'line' // 这个指标将在图表上以线条的形式显示
    }
  ],
  
  // calc 是用于计算平均成交价格的函数，接受一个 KLineData 数组作为输入
  calc: (dataList: KLineData[]) => {
    let totalTurnover = 0 // 用于累计总成交金额
    let totalVolume = 0 // 用于累计总成交量

    // 遍历数据列表，逐步计算每个数据点的平均价格
    return dataList.map((kLineData: KLineData) => {
      const avp: Avp = {} // 创建一个新的 Avp 对象用于存储每条数据的平均价格

      // 取出当前K线数据的成交金额和成交量，若为空则赋值为0
      const turnover = kLineData?.turnover ?? 0 // 当前数据点的成交金额
      const volume = kLineData?.volume ?? 0 // 当前数据点的成交量

      // 累加到总成交金额和总成交量
      totalTurnover += turnover
      totalVolume += volume

      // 如果累计的总成交量不为零，则计算平均成交价格
      if (totalVolume !== 0) {
        avp.avp = totalTurnover / totalVolume // 平均成交价格为总成交金额除以总成交量
      }

      // 返回当前计算出的 avp 对象
      return avp
    })
  }
}

export default averagePrice // 导出 averagePrice 模块供其他地方使用