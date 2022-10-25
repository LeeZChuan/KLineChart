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

import DrawWidget from './DrawWidget'

import XAxis from '../componentl/XAxis'

import XAxisView from '../viewv/XAxisView'
import CrosshairVerticalLabelView from '../viewv/CrosshairVerticalLabelView'

export default class XAxisWidget extends DrawWidget<XAxis> {
  private readonly _xAxisView = new XAxisView(this)
  private readonly _crosshairVerticalLabelView = new CrosshairVerticalLabelView(this)

  protected updateMain (ctx: CanvasRenderingContext2D): void {
    this._xAxisView.draw(ctx)
  }

  protected updateOverlay (ctx: CanvasRenderingContext2D): void {
    this._crosshairVerticalLabelView.draw(ctx)
  }
}
