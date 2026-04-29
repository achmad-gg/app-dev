<script setup>
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useConfirm } from "@/composables/useConfirm";

const { state, onCancel, onConfirm } = useConfirm();
</script>

<template>
  <router-view />
  <LoadingOverlay />
  <ConfirmModal
    v-model="state.open"
    :title="state.title"
    :message="state.message"
    :variant="state.variant"
    :confirm-text="state.confirmText"
    :cancel-text="state.cancelText"
    :loading="state.loading"
    :loading-text="state.loadingText"
    @cancel="onCancel"
    @confirm="onConfirm"
  />
</template>
