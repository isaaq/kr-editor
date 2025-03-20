<script setup>
import EditorLayout from './components/layout/EditorLayout.vue'
</script>

<template>
  <EditorLayout />
</template>

<style>
:root {
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light dark;
  background-color: #2a2a2a;
  color: #e0e0e0;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #333;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
