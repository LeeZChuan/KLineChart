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

import type Coordinate from './Coordinate'  // 引入 Coordinate 接口，用于表示二维坐标
import { type KLineData } from './Data'     // 引入 KLineData 类型，用于表示 K 线图数据

// Crosshair 接口：扩展了 Coordinate 接口，表示十字光标的属性
export default interface Crosshair extends Partial<Coordinate> {
  paneId?: string        // paneId：表示十字光标所属的图表面板 ID
  realX?: number         // realX：实际的 X 坐标
  kLineData?: KLineData  // kLineData：当前十字光标位置对应的 K 线数据
  dataIndex?: number     // dataIndex：K 线数据的索引
  realDataIndex?: number // realDataIndex：实际的数据索引
}