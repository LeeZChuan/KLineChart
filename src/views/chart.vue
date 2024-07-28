

<template>
  <div id="container">
    <div id="k-line-chart" style="height:800px;width: 95vw;" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { init, dispose } from 'klinecharts'
import data from './data.json'


onMounted(() => {
  // 初始化图表
  const chart = init('k-line-chart')
  console.log(data, 'data');
  const newData = data.results.map((s) => ({
    timestamp: s.t,
    open: s.o,
    high: s.h,
    low: s.l,
    close: s.c,
    volume: s.v,
    turnover: s.vw
  }))
  console.log(newData, 'newData');

  // 为图表添加数据
  chart.applyNewData(newData);
})

onUnmounted(() => {
  // 销毁图表
  dispose('chart')
})
</script>

<style scoped>
#container{
  width: 100%;
  height:100%;
}
</style>
  
