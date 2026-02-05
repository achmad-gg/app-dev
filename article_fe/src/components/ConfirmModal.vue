<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
        @click.self="onCancel"
        role="dialog"
        aria-modal="true"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all">
          <!-- Header -->
          <div class="flex items-start gap-4 p-6 pb-4">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              :class="iconClasses"
            >
              <svg
                v-if="variant === 'danger'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <svg
                v-else-if="variant === 'primary'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <!-- Title & Message -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900 leading-tight">
                {{ title }}
              </h3>
              <p v-if="message" class="mt-1.5 text-sm text-gray-600 leading-relaxed">
                {{ message }}
              </p>
            </div>
          </div>

          <!-- Body Slot -->
          <div v-if="$slots.default" class="px-6 pb-4">
            <slot />
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="onCancel"
            >
              {{ cancelText }}
            </button>

            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="confirmBtnClasses"
              :disabled="loading"
              @click="onConfirm"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ loading ? loadingText : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },

  variant: {
    type: String,
    default: 'neutral', // neutral | primary | danger
    validator: (v) => ['neutral', 'primary', 'danger'].includes(v),
  },

  confirmText: { type: String, default: 'Ya, lanjutkan' },
  cancelText: { type: String, default: 'Batal' },

  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Memproses...' },

  closeOnEsc: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const iconClasses = computed(() => {
  if (props.variant === 'danger') {
    return 'bg-red-50 text-red-600'
  }
  if (props.variant === 'primary') {
    return 'bg-blue-50 text-blue-600'
  }
  return 'bg-gray-100 text-gray-700'
})

const confirmBtnClasses = computed(() => {
  if (props.variant === 'danger') {
    return 'bg-red-600 text-white hover:bg-red-700'
  }
  if (props.variant === 'primary') {
    return 'bg-blue-600 text-white hover:bg-blue-700'
  }
  return 'bg-gray-900 text-white hover:bg-gray-800'
})

function close() {
  emit('update:modelValue', false)
}

function onCancel() {
  if (!props.closeOnBackdrop && props.modelValue) return
  emit('cancel')
  close()
}

function onConfirm() {
  emit('confirm')
}

function onKeydown(e) {
  if (!props.modelValue) return
  if (!props.closeOnEsc) return
  if (e.key === 'Escape') onCancel()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-active .transform,
.fade-leave-active .transform {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .transform {
  transform: scale(0.95);
  opacity: 0;
}

.fade-leave-to .transform {
  transform: scale(0.95);
  opacity: 0;
}
</style>
