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

import Coordinate from '../common/Coordinate'

import { VisibleData } from '../store/ChartStore'
import { BarSpace } from '../store/TimeScaleStore'
import { CandleHighLowPriceMarkStyle } from '../store/styles'

import ChildrenView from './ChildrenView'

import { formatPrecision } from '../utils/format'

export default class CandleHighLowPriceView extends ChildrenView {
  protected drawImp (ctx: CanvasRenderingContext2D): void {
    const widget = this.getWidget()
    const pane = widget.getPane()
    const chartStore = pane.getChart().getChartStore()
    const priceMarkStyles = chartStore.getStyleOptions().candle.priceMark
    const highPriceMarkStyles = priceMarkStyles.high
    const lowPriceMarkStyles = priceMarkStyles.low
    const show = Boolean(priceMarkStyles.show)
    const showHigh = Boolean(highPriceMarkStyles.show)
    const showLow = Boolean(lowPriceMarkStyles.show)
    if (show && (showHigh || showLow)) {
      const precision = chartStore.getPrecision()
      const yAxis = pane.getAxisComponent()
      let high = Number.MIN_SAFE_INTEGER
      let highX = 0
      let low = Number.MAX_SAFE_INTEGER
      let lowX = 0
      this.eachChildren((data: VisibleData, barSpace: BarSpace, i: number) => {
        const { data: kLineData, x } = data
        if (high < kLineData.high) {
          high = kLineData.high
          highX = x
        }
        if (low > kLineData.low) {
          low = kLineData.low
          lowX = x
        }
      })
      const highY = yAxis.convertToPixel(high)
      const lowY = yAxis.convertToPixel(low)
      if (showHigh && high !== Number.MIN_SAFE_INTEGER) {
        this._drawMark(
          ctx,
          formatPrecision(high, precision.price),
          { x: highX, y: highY },
          highY < lowY ? [-2, -5] : [2, 5],
          highPriceMarkStyles
        )
      }
      if (showLow && low !== Number.MAX_SAFE_INTEGER) {
        this._drawMark(
          ctx,
          formatPrecision(low, precision.price),
          { x: lowX, y: lowX },
          highY < lowY ? [2, 5] : [-2, -5],
          lowPriceMarkStyles
        )
      }
    }
  }

  private _drawMark (
    ctx: CanvasRenderingContext2D,
    text: string,
    coordinate: Coordinate,
    offsets: number[],
    styles: Required<CandleHighLowPriceMarkStyle>
  ): void {
    const startX = coordinate.x
    const startY = coordinate.y + offsets[0]
    this.createFigure('line', {
      coordinates: [
        { x: startX - 2, y: startY + offsets[0] },
        { x: startX, y: startY },
        { x: startX + 2, y: startY + offsets[0] }
      ],
      styles: {
        style: 'solid',
        color: styles.color,
        size: 1,
        dashedValue: []
      }
    })?.draw(ctx)

    // 绘制竖线
    const y = startY + offsets[1]
    this.createFigure('line', {
      coordinates: [
        { x: startX, y: startY },
        { x: startX, y },
        { x: startX + 5, y }
      ],
      styles: {
        style: 'solid',
        color: styles.color,
        size: 1,
        dashedValue: []
      }
    })?.draw(ctx)

    this.createFigure('text', {
      x: startX + 5 + styles.textOffset,
      y,
      text,
      styles: {
        style: 'fill',
        color: styles.color,
        size: styles.textSize,
        family: styles.textWeight,
        weight: styles.textWeight,
        align: 'left',
        baseline: 'middle'
      }
    })?.draw(ctx)
  }
}
