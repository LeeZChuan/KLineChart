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

// BarSpace 接口定义，用于表示柱状图或类似结构中的间距信息
export default interface BarSpace {
  bar: number          // 完整的柱状图宽度
  halfBar: number      // 柱状图宽度的一半
  gapBar: number       // 相邻柱状图之间的间距
  halfGapBar: number   // 间距的一半
}