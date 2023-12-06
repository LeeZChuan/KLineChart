<template>
  
  <div class="wrapper">
        <p>
          <RouterLink to="/Chart">普通k线图</RouterLink>
        </p>
        <p>
          <RouterLink to="/highChart">带主副图指标的k线图</RouterLink>
        </p>
        <p>
          <RouterLink to="/ChartMark">可标记的k线图</RouterLink>
        </p>
    </div>
</template>


<script setup>
import { onMounted, onUnmounted } from 'vue'
import { init, dispose } from 'klinecharts'
</script>