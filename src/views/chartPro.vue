
<template>
  <div id="container">
    <div id="k-line-chart" style="height:530px;width: 95vw;" />
  </div>
</template>
  
<script setup>
import { init, registerIndicator } from 'klinecharts'
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  const fruits = [
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌',
  '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
  '🍍', '🥥', '🥝', '🥭', '🥑', '🍏'
]

registerIndicator({
  name: 'Custom',
  figures: [
    { key: 'emoji' }
  ],
  calc: (kLineDataList) => {
    return kLineDataList.map(kLineData => ({ emoji: kLineData.close, text: fruits[Math.floor(Math.random() * 17)] }))
  },
  draw: ({
    ctx,
    barSpace,
    visibleRange,
    indicator,
    xAxis,
    yAxis
  }) => {
    const { from, to } = visibleRange

    ctx.font = barSpace.gapBar + 'px' + 'Helvetica Neue'
    ctx.textAlign = 'center'
    const result = indicator.result
    for (let i = from; i < to; i++) {
      const data = result[i]
      const x = xAxis.convertToPixel(i)
      const y = yAxis.convertToPixel(data.emoji)
      ctx.fillText(data.text, x, y)
    }
    return false
  }
})

function genData(timestamp = new Date().getTime(), length = 8000) {
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
    dataList.push({ timestamp, open, high, low, close, volume, turnover })

    basePrice = close
    timestamp += 60 * 1000
  }
  return dataList
}

const chart = init('k-line-chart')
console.log(chart,'chart');
console.log(genData(),'genData');
chart.applyNewData(genData())

let MainLineIndex='';
function setMainIndicator(name) {
  MainLineIndex=chart.createIndicator(name, true, { id: 'candle_pane',dragEnbaled:true });
}


function removeIndicator() {
  chart.removeIndicator(MainLineIndex)
}

let subIndicatorArr=[];
let subLineIndexArr=[];
function setSubIndicator(name) {
  console.log(name,'name');
  if(subIndicatorArr.indexOf(name)>-1){

  }else{
    const subLineIndex=chart.createIndicator(name,false);
    subLineIndexArr.push(subLineIndex)
    console.log(subLineIndex,'subLineIndex');
    subIndicatorArr.push(name);
  }
}

function removeSubIndicator() {
  subLineIndexArr.forEach(element => {
    chart.removeIndicator(element)
  });
  subIndicatorArr=[];
  subLineIndexArr=[];
}


// 以下仅仅是为了协助代码演示，在实际项目中根据情况进行调整。
// The following is only for the purpose of assisting in code demonstration, and adjustments will be made according to the actual situation in the project.
const container = document.getElementById('container')
const buttonContainer = document.createElement('div')
buttonContainer.className = 'button-container'

const mainIndicators = ['MA', 'BOLL', 'Custom','EMA','SAR']
const subIndicators = ['VOL', 'MACD', 'Custom']

const mainTitle = document.createElement('span')
mainTitle.innerText = '主图指标-Main indicator: '
buttonContainer.appendChild(mainTitle)
mainIndicators.forEach((name) => {
  const button = document.createElement('button')
  button.innerText = name
  button.addEventListener('click', () => { setMainIndicator(name) })
  buttonContainer.appendChild(button)
})

const removemainTitle = document.createElement('button')
removemainTitle.innerText = '移除-主图指标'
removemainTitle.addEventListener('click', () => { removeIndicator() })
buttonContainer.appendChild(removemainTitle)

const subTitle = document.createElement('span')
subTitle.style.paddingLeft = '16px'
subTitle.innerText = '副图指标-Sub indicator: '
buttonContainer.appendChild(subTitle)
subIndicators.forEach((name) => {
  const button = document.createElement('button')
  button.innerText = name
  button.addEventListener('click', () => { setSubIndicator(name) })
  buttonContainer.appendChild(button)
})
const removesubTitle = document.createElement('button')
removesubTitle.innerText = '移除-副图指标'
removesubTitle.addEventListener('click', () => { removeSubIndicator() })
buttonContainer.appendChild(removesubTitle)

container.appendChild(buttonContainer)
// document.getElementById('k-line-chart').style.backgroundColor = '#1b1b1f'
chart.setStyles('dark')
});

</script>

<style>
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
  