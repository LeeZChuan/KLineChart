
<template>
  <div id="container">
    <div id="k-line-chart" style="height:330px;width: 95vw;" />
  </div>
</template>
  
<script setup>
import { init, registerIndicator,registerOverlay } from 'klinecharts'
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {

function genData (timestamp = new Date().getTime(), length = 8000) {
  let basePrice = 5000
  timestamp = Math.floor(timestamp / 1000 / 60) * 60 * 1000 - length * 60 * 1000
  const dataList = []
  for (let i = 0; i < length; i++) {
    const prices = []
    for (let j = 0; j < 4; j++) {
      prices.push(basePrice + Math.random() * 60 - 30)
    }
    prices.sort()
    const open = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const high = +(prices[3].toFixed(2))
    const low = +(prices[0].toFixed(2))
    const close = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const volume = Math.round(Math.random() * 100) + 10
    const turnover = (open + high + low + close) / 4 * volume
    dataList.push({ timestamp, open, high,low, close, volume, turnover })

    basePrice = close
    timestamp += 60 * 1000
  }
  console.log(dataList,'dataList');
  return dataList
}

registerOverlay({
  name: 'circle',
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  totalStep: 3,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length === 2) {
      const xDis = Math.abs(coordinates[0].x - coordinates[1].x)
      const yDis = Math.abs(coordinates[0].y - coordinates[1].y)
      const radius = Math.sqrt(xDis * xDis + yDis * yDis)
      return {
        key: 'circle',
        type: 'circle',
        attrs: {
          ...coordinates[0],
          r: radius
        },
        styles: {
          style: 'stroke_fill'
        }
      }
    }
    return []
  }
})
// const option={
//   // 网格线
//   grid: {
//     show: true,
//     // 网格水平线
//     horizontal: {
//       show: true,
//       size: 1,
//       color: '#393939',
//       // 'solid'|'dash'
//       style: 'dash',
//       dashValue: [2, 2]
//     },
//    	// 网格垂直线
//     vertical: {
//       show: false,
//       size: 1,
//       color: '#393939',
//       // 'solid'|'dash'
//       style: 'dash',
//       dashValue: [2, 2]
//     }
//   },
//   // 蜡烛图
//   candle: {
//     // 蜡烛图上下间距，大于1为绝对值，大于0小余1则为比例
//     margin: {
//         top: 0.2,
//         bottom: 0.1,
//     },
//     // 蜡烛图类型
//     // 'candle_solid'|'candle_stroke'|'candle_up_stroke'|'candle_down_stroke'|'ohlc'|'area'
//     type: 'candle_solid',
//     // 蜡烛柱
//     bar: {
//         /**
//          * 上涨颜色
//          */
//         upColor: '#26A69A',
//         /**
//          * 下跌颜色
//          */
//         downColor: '#EF5350',
//         /**
//          * 无变化时颜色
//          */
//         noChangeColor: '#999999',
//     },
//     // 面积图
//     area: {
//         lineSize: 2,
//         lineColor: '#2196F3',
//         value: 'close',
//         backgroundColor: [
//         {
//             offset: 0,
//             color: 'rgba(33, 150, 243, 0.01)',
//         },
//         {
//             offset: 1,
//             color: 'rgba(33, 150, 243, 0.2)',
//         },
//         ],
//     },
//     priceMark: {
//         show: true,
//         // 最高价标记
//         high: {
//         show: true,
//         color: '#76808F',
//         textMargin: 5,
//         line: {
//             show: true,
//             style: 'dash',
//             dashValue: [4, 4],
//             size: 1,
//         },
//         text: {
//             show: true,
//             offset: 8,
//             size: 12,
//             paddingLeft: 2,
//             paddingTop: 2,
//             paddingRight: 2,
//             paddingBottom: 2,
//             color: '#FFFFFF',
//             family: 'Helvetica Neue',
//             weight: 'normal',
//             borderRadius: 2,
//             backgroundColor: '#888888',
//         },
//         },
//         // 最低价标记
//         low: {
//         show: true,
//         color: '#76808F',
//         textMargin: 5,
//         line: {
//             show: true,
//             style: 'dash',
//             dashValue: [4, 4],
//             size: 1,
//         },
//         text: {
//             show: true,
//             offset: -8,
//             size: 12,
//             paddingLeft: 2,
//             paddingTop: 2,
//             paddingRight: 2,
//             paddingBottom: 2,
//             color: '#FFFFFF',
//             family: 'Helvetica Neue',
//             weight: 'normal',
//             borderRadius: 2,
//             backgroundColor: '#888888',
//         },
//         },
//         // 昨收价标记（分时图用）
//         pre: {
//         show: true,
//         color: '#76808F',
//         textMargin: 5,
//         line: {
//             show: true,
//             style: 'dash',
//             dashValue: [4, 4],
//             size: 1,
//         },
//         text: {
//             show: true,
//             offset: -8,
//             size: 12,
//             paddingLeft: 2,
//             paddingTop: 2,
//             paddingRight: 2,
//             paddingBottom: 2,
//             color: '#FFFFFF',
//             family: 'Helvetica Neue',
//             weight: 'normal',
//             borderRadius: 2,
//             backgroundColor: '#888888',
//         },
//         },
//         // 最新价标记
//         last: {
//         show: true,
//         upColor: '#26A69A',
//         downColor: '#EF5350',
//         noChangeColor: '#888888',
//         line: {
//             show: true,
//             style: 'dash',
//             dashValue: [4, 4],
//             size: 1,
//         },
//         text: {
//             show: true,
//             size: 12,
//             paddingLeft: 2,
//             paddingTop: 2,
//             paddingRight: 2,
//             paddingBottom: 2,
//             color: '#FFFFFF',
//             family: 'Helvetica Neue',
//             weight: 'normal',
//             borderRadius: 2,
//         },
//         },
//     },
//     // 提示
//     tooltip: {
//         // 'always' | 'follow_cross' | 'none'
//         showRule: 'always',
//         // 'standard' | 'rect'
//         showType: 'standard',
//         values: '',
//         labels: ['时间: ', '开: ', '收: ', '高: ', '低: ', '成交量: '],
//         defaultValue: 'n/a',
//         rect: {
//         paddingLeft: 0,
//         paddingRight: 0,
//         paddingTop: 0,
//         paddingBottom: 6,
//         offsetLeft: 8,
//         offsetTop: 8,
//         offsetRight: 8,
//         borderRadius: 4,
//         borderSize: 1,
//         borderColor: '#F2F3F5',
//         backgroundColor: '#FEFEFE',
//         },
//         text: {
//         size: 12,
//         family: 'Helvetica Neue',
//         weight: 'normal',
//         color: '#76808F',
//         upColor: '#76808F',
//         downColor: '#76808F',
//         noChangeColor: '#76808F',
//         marginLeft: 8,
//         marginTop: 6,
//         marginRight: 8,
//         marginBottom: 0,
//         },
//     },
//   },
  
//   // 技术指标
//   technicalIndicator: {
//     margin: {
//       top: 0.2,
//       bottom: 0.1
//     },
//     bar: {
//       upColor: '#26A69A',
//       downColor: '#EF5350',
//       noChangeColor: '#888888'
//     },
//     line: {
//       size: 1,
//       colors: ['#FF9600', '#9D65C9', '#2196F3', '#E11D74', '#01C5C4']
//     },
//     circle: {
//       upColor: '#26A69A',
//       downColor: '#EF5350',
//       noChangeColor: '#888888'
//     },
//     // 最新值标记
//     lastValueMark: {
//       show: false,
//       text: {
//         show: false,
//         color: '#ffffff',
//         size: 12,
//         family: 'Helvetica Neue',
//         weight: 'normal',
//         paddingLeft: 3,
//         paddingTop: 2,
//         paddingRight: 3,
//         paddingBottom: 2,
//         borderRadius: 2
//       }
//     },
//     // 提示
//     tooltip: {
//       // 'always' | 'follow_cross' | 'none'
//       showRule: 'always',
//       // 'standard' | 'rect'
//       showType: 'standard',
//       showName: true,
//       showParams: true,
//       defaultValue: 'n/a',
//       text: {
//         size: 12,
//         family: 'Helvetica Neue',
//         weight: 'normal',
//         color: '#D9D9D9',
//         marginTop: 6,
//         marginRight: 8,
//         marginBottom: 0,
//         marginLeft: 8
//       }
//     }
//   },
//   // x轴
//   xAxis: {
//     show: true,
//     height: null,
//     // x轴线
//     axisLine: {
//       show: true,
//       color: '#888888',
//       size: 1
//     },
//     // x轴分割文字
//     tickText: {
//       show: true,
//       color: '#D9D9D9',
//       family: 'Helvetica Neue',
//       weight: 'normal',
//       size: 12,
//       paddingTop: 3,
//       paddingBottom: 6
//     },
//     // x轴分割线
//     tickLine: {
//       show: true,
//       size: 1,
//       length: 3,
//       color: '#888888'
//     }
//   },
//   // y轴
//   yAxis: {
//     show: true,
//     width: null,
//     // 'left' | 'right'
//     position: 'right',
//     // 'normal' | 'percentage' | 'log'
//     type: 'normal',
//     inside: false,
//     reverse: false,
//     // y轴线
//     axisLine: {
//       show: true,
//       color: '#888888',
//       size: 1
//     },
//     // y轴分割文字
//     tickText: {
//       show: true,
//       color: '#D9D9D9',
//       family: 'Helvetica Neue',
//       weight: 'normal',
//       size: 12,
//       paddingLeft: 3,
//       paddingRight: 6
//     },
//     // y轴分割线
//     tickLine: {
//       show: true,
//       size: 1,
//       length: 3,
//       color: '#888888'
//     }
//   },
//   // 图表之间的分割线
//   separator: {
//     size: 1,
//     color: '#888888',
//     fill: true,
//     activeBackgroundColor: 'rgba(230, 230, 230, .15)'
//   },
//   // 十字光标
//   crosshair: {
//     show: true,
//     // 十字光标水平线及文字
//     horizontal: {
//       show: true,
//       line: {
//         show: true,
//         // 'solid'|'dash'
//         style: 'dash',
//         dashValue: [4, 2],
//         size: 1,
//         color: '#888888'
//       },
//       text: {
//         show: true,
//         color: '#D9D9D9',
//         size: 12,
//         family: 'Helvetica Neue',
//         weight: 'normal',
//         paddingLeft: 2,
//         paddingRight: 2,
//         paddingTop: 2,
//         paddingBottom: 2,
//         borderSize: 1,
//         borderColor: '#505050',
//         borderRadius: 2,
//         backgroundColor: '#505050'
//       }
//     },
//     // 十字光标垂直线及文字
//     vertical: {
//       show: true,
//       line: {
//         show: true,
//         // 'solid'|'dash'
//         style: 'dash',
//         dashValue: [4, 2],
//         size: 1,
//         color: '#888888'
//       },
//       text: {
//         show: true,
//         color: '#D9D9D9',
//         size: 12,
//         family: 'Helvetica Neue',
//         weight: 'normal',
//         paddingLeft: 2,
//         paddingRight: 2,
//         paddingTop: 2,
//         paddingBottom: 2,
//         borderSize: 1,
//         borderColor: '#505050',
//         borderRadius: 2,
//         backgroundColor: '#505050'
//       }
//     }
//   },
//   // 图形
//   shape: {
//     // point: {
//     //   backgroundColor: '#2196F3',
//     //   borderColor: '#2196F3',
//     //   borderSize: 1,
//     //   radius: 4,
//     //   // activeBackgroundColor: '#2196F3',
//     //   // activeBorderColor: '#2196F3',
//     //   activeBorderSize: 1,
//     //   activeRadius: 6
//     // },
//     line: {
//       // 'solid'|'dash'
//       style: 'solid'
//       color: '#2196F3',
//       size: 1,
//       dashValue: [2, 2]
//     },
//     polygon: {
//       // 'stroke'|'fill'
//       style: 'stroke',
//       stroke: {
//         // 'solid'|'dash'
//         style: 'solid',
//         size: 1,
//         color: '#2196F3',
//         dashValue: [2, 2]
//       },
//       fill: {
//         color: 'rgba(33, 150, 243, 0.1)'
//       }
//     },
//     arc: {
//       // 'stroke'|'fill'
//       style: 'stroke',
//       stroke: {
//         // 'solid'|'dash'
//         style: 'solid',
//         size: 1,
//         color: '#2196F3',
//         dashValue: [2, 2]
//       },
//       fill: {
//         color: '#2196F3'
//       }
//     },
//     text: {
//       style: 'fill',
//       color: '#2196F3',
//       size: 12,
//       family: 'Helvetica Neue',
//       weight: 'normal',
//       offset: [0, 0]
//     }
//   },
//   annotation: {
//     // 'top' | 'bottom' | 'point'
//     position: 'top',
//     offset: [20, 0]
//     symbol: {
//       // 'diamond' | 'circle' | 'rect' | 'triangle' | 'custom' | 'none'
//       type: 'diamond',
//       size: 8,
//       color: '#2196F3',
//       activeSize: 10,
//       activeColor: '#FF9600'
//     }
//   },
//   tag: {
//     // 'top' | 'bottom' | 'point'
//     position: 'point',
//     offset: 0,
//     line: {
//       show: true,
//       style: LineStyle.DASH,
//       dashValue: [4, 2],
//       size: 1,
//       color: '#2196F3'
//     },
//     text: {
//       color: '#FFFFFF',
//       backgroundColor: '#2196F3',
//       size: 12,
//       family: 'Helvetica Neue',
//       weight: 'normal',
//       paddingLeft: 2,
//       paddingRight: 2,
//       paddingTop: 2,
//       paddingBottom: 2,
//       borderRadius: 2,
//       borderSize: 1,
//       borderColor: '#2196F3'
//     },
//     mark: {
//       offset: 0,
//       color: '#FFFFFF',
//       backgroundColor: '#2196F3',
//       size: 12,
//       family: 'Helvetica Neue',
//       weight: 'normal',
//       paddingLeft: 2,
//       paddingRight: 2,
//       paddingTop: 2,
//       paddingBottom: 2,
//       borderRadius: 2,
//       borderSize: 1,
//       borderColor: '#2196F3'
//     }
//   }
// };

const chart = init('k-line-chart')
// chart.setStyles(option);
console.log(chart,'chart');
console.log(chart.getStyles());
// chart.setStyles({
//   candle: {
//     type: 'area',
//   },
// });
chart.applyNewData(genData())

let currentNameArray=[];
function createOverlay (name) {
  const id=chart.createOverlay(name);
  console.log(id,'idididid');
  currentNameArray.push(id);
}

function removeOverlay() {
  console.log(currentNameArray,'currentNameArray');
  console.log('移除覆盖物');
  currentNameArray.forEach(element => {
    console.log(element,'element');
    chart.removeOverlay(element)
  });
  currentNameArray=[];
}

function setTheme (theme) {
  chart.setStyles(theme)
  if (theme === 'light') {
    document.getElementById('k-line-chart').style.backgroundColor = '#ffffff'
  } else if (theme === 'dark') {
    document.getElementById('k-line-chart').style.backgroundColor = '#1b1b1f'
  }
}


// 以下仅仅是为了协助代码演示，在实际项目中根据情况进行调整。
// The following is only for the purpose of assisting in code demonstration, and adjustments will be made according to the actual situation in the project.
const container = document.getElementById('container')
const buttonContainer = document.createElement('div')
buttonContainer.className = 'button-container'
// rayLine, segment, straightLine, priceLine, priceChannelLine, parallelStraightLine, fibonacciLine, simpleAnnotation, simpleTag
const items = [
{ key: 'light', text: '浅色-Light',num:1 },
  { key: 'dark', text: '深色-Dark',num:1 },
  { key: 'priceLine', text: '价格线(内置)-Price line(built-in)',num:2 },
  { key: 'circle', text: '圆(自定义)-Circle(custom)',num:2 },
  {key:'horizontalRayLine',text:'横向两点线条-单向延长线',num:2},
  {key:'horizontalSegment',text:'横向两点线条-无延长线',num:2},
  {key:'horizontalStraightLine',text:'横向两点线条-双向延长线',num:2},
  {key:'verticalRayLine',text:'纵向两点线条-双向延长线',num:2},
  {key:'verticalSegment',text:'纵向两点线条-无延长线',num:2},
  {key:'verticalStraightLine',text:'纵向两点线条-双向延长线',num:2},
  {key:'rayLine',text:'斜线-有延长线',num:2},
  {key:'segment',text:'斜线-无延长线',num:2},
  {key:'straightLine',text:'斜线-双向延长线',num:2},
  {key:'priceLine',text:'价格线',num:2},
  {key:'priceChannelLine',text:'价格区间线-三区',num:2},
  {key:'parallelStraightLine',text:'价格区间线-二区',num:2},
  {key:'fibonacciLine',text:'价格区间线-2',num:2},
  {key:'simpleAnnotation',text:'价格标记点-2',num:2},
  {key:'simpleTag',text:'价格基准线',num:2},
  {key:'remove',text:'移除覆盖物',num:3},
]
items.forEach(({ key, text,num }) => {
  const button = document.createElement('button')
  button.innerText = text
  if(num===1){
    button.addEventListener('click', () => { setTheme(key) })
  }else if(num===2){
    button.addEventListener('click', () => { createOverlay(key) })
  }else{
    button.addEventListener('click', () => { removeOverlay() })
    
  }
  buttonContainer.appendChild(button)
})
container.appendChild(buttonContainer)
})

</script>

<style scoped>
#container{
  width: 100%;
  height:100%;
}
.button-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 22px;
  color: black;
}

.button-container button {
  padding: 2px 6px;
  background-color: #1677FF;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  outline: none;
  border: none;
}
</style>
  