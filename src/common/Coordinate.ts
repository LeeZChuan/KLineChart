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

// Coordinate 接口：表示一个二维平面上的坐标点
export default interface Coordinate {
  x: number  // x 坐标
  y: number  // y 坐标
}

// getDistance 函数：用于计算两个坐标点之间的距离
export function getDistance (coordinate1: Coordinate, coordinate2: Coordinate): number {
  // 计算 x 坐标的差值
  const xDif = coordinate1.x - coordinate2.x
  // 计算 y 坐标的差值
  const yDif = coordinate1.y - coordinate2.y
  // 使用勾股定理计算两点间的欧几里得距离
  return Math.sqrt(xDif * xDif + yDif * yDif)
}