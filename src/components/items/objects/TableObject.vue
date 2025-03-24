<template>
  <div class="table-object">
    <div class="table-header"></div>
    <div class="table-row" v-for="i in 3" :key="i"></div>
  </div>
</template>

<script setup>
defineProps({
  gameObject: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.table-object {
  width: 100%;
  height: 100%;
  border: 1px solid #999;
  border-radius: 4px;
  background-color: #fff;
}

.table-header {
  height: 24px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.table-row {
  height: 32px;
  border-bottom: 1px solid #eee;
}

.table-row:last-child {
  border-bottom: none;
}
</style>