<script setup>
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useConfirm } from "@/composables/useConfirm";

const { state, onCancel, onConfirm } = useConfirm();

// optional: simpan handler async terakhir
let currentAction = null;

function handleConfirm() {
  return onConfirm(currentAction);
}

// expose setter action via provide/inject? bisa, tapi simplest: set di tempat pemanggil lewat composable (lihat contoh)
</script>

<template>
    <router-view />
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
    @confirm="handleConfirm"
  />
</template>
