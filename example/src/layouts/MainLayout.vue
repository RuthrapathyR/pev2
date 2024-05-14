<script lang="ts" setup>
import VLink from "../components/VLink.vue"

interface Props {
  title?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="d-flex flex-column vh-100">
    <slot></slot>
  </div>
</template>
