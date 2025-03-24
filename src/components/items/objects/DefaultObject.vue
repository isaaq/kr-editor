<template>
  <div class="default-object">
    <!-- 默认对象的具体内容 -->
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
.default-object {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #333;
}
</style>