<script setup>
import { defineProps,ref,watch} from "vue"
import Plan from "../../src/components/Plan.vue"
import {processData,setPlanSource} from "./utils.ts"

const props = defineProps({
  data: {
    type: String,
    default: ''
  }
})
const planRef = ref('');

watch(() => props.data, (newValue) => {
  console.log(newValue)
})
setPlanSource(props.data);
planRef.value = `${JSON.stringify(processData(JSON.parse(props.data)))}`
</script>
<style src="./style.css"></style>
<template>
    <plan
      v-if="{planRef}"
      :plan-source="{planRef}"
      :plan-query="query"
    />
</template>
