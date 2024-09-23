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

// 引入类型 OverlayTemplate 以定义图形模板类型
import { type OverlayTemplate } from '../../component/Overlay'

// 引入用于获取平行线的方法 getParallelLines
import { getParallelLines } from './parallelStraightLine'

// 定义 priceChannelLine 对象，该对象是一个覆盖模板
const priceChannelLine: OverlayTemplate = {
  // 图形的名称为 'priceChannelLine'
  name: 'priceChannelLine',
  // 绘制该图形需要的步骤数为 4
  totalStep: 4,
  // 标识是否需要默认的点图形，设置为 true 表示需要
  needDefaultPointFigure: true,
  // 标识是否需要默认的 X 轴图形，设置为 true 表示需要
  needDefaultXAxisFigure: true,
  // 标识是否需要默认的 Y 轴图形，设置为 true 表示需要
  needDefaultYAxisFigure: true,
  
  // 定义一个用于创建点图形的方法
  // coordinates 是坐标数组，bounding 是边界框
  createPointFigures: ({ coordinates, bounding }) => {
    return [
      {
        // 图形类型为 'line'，表示绘制线条
        type: 'line',
        // 通过 getParallelLines 函数获取线条的属性
        attrs: getParallelLines(coordinates, bounding, 1)  // 参数 1 表示获取的平行线
      }
    ]
  }
}

// 导出 priceChannelLine 模块，方便其他地方使用
export default priceChannelLine