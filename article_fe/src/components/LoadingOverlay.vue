<script setup>
import { useLoadingStore } from '@/stores/loading.store'

const loadingStore = useLoadingStore()
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="loadingStore.isLoading" class="loading-overlay">
      <div class="spinner-container">
        <!-- Outer ring — rotates clockwise slowly -->
        <div class="ring ring-outer"></div>
        <!-- Middle ring — rotates counter-clockwise -->
        <div class="ring ring-middle"></div>
        <!-- Inner ring — rotates clockwise fast -->
        <div class="ring ring-inner"></div>
        <!-- Center pulse dot -->
        <div class="center-dot"></div>
        <!-- Orbiting dot -->
        <div class="orbit-track">
          <div class="orbit-dot"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
}

/* === RINGS === */
.ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
}

/* Outer ring */
.ring-outer {
  inset: 0;
  border-width: 3px;
  border-top-color: #6366f1;
  border-right-color: #6366f1;
  animation: spin-cw 2.4s linear infinite;
}

/* Middle ring */
.ring-middle {
  inset: 10px;
  border-width: 3px;
  border-top-color: #8b5cf6;
  border-left-color: #8b5cf6;
  animation: spin-ccw 1.6s linear infinite;
}

/* Inner ring */
.ring-inner {
  inset: 20px;
  border-width: 2.5px;
  border-bottom-color: #a78bfa;
  border-right-color: #a78bfa;
  animation: spin-cw 1s linear infinite;
}

/* === CENTER DOT === */
.center-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  animation: pulse 1.4s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
}

/* === ORBITING DOT === */
.orbit-track {
  position: absolute;
  inset: -8px;
  animation: spin-cw 3s linear infinite;
}

.orbit-dot {
  position: absolute;
  top: 50%;
  left: 0;
  width: 6px;
  height: 6px;
  margin-top: -3px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.7), 0 0 16px rgba(99, 102, 241, 0.3);
  animation: orbit-glow 1.5s ease-in-out infinite;
}

/* === KEYFRAMES === */
@keyframes spin-cw {
  to { transform: rotate(360deg); }
}
@keyframes spin-ccw {
  to { transform: rotate(-360deg); }
}
@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.6;
  }
}
@keyframes orbit-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.6);
  }
}

/* === TRANSITION === */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
