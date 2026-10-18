<script setup lang="ts">
const ui = useUiStore()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.type" role="status" @click="ui.dismiss(t.id)">
        <Icon :name="t.type === 'error' ? 'alert' : 'check'" />
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
