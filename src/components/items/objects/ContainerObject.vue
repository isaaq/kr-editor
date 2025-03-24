<template>
  <div class="container-object">
    <!-- 容器对象的具体内容 -->
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
.container-object {
  width: 100%;
  height: 100%;
  border: 1px dashed #666;
  border-radius: 4px;
  background-color: rgba(200, 200, 200, 0.1);
}
</style>