<script setup>
import { defineProps,ref,watch} from "vue"
import Plan from "../../src/components/Plan.vue"
import {processData,setPlanSource} from "./utils.ts"

const props = defineProps({
  plan: {
    type: String,
    default: ''
  },
  query:{
    type:String,
    default:''
  }
})
setPlanSource(props.plan);
props.plan = `${JSON.stringify(processData(JSON.parse(props.plan)))}`
</script>
<style src="./style.css"></style>
<template>
    <plan
      v-if="props.plan"
      :plan-source="props.plan"
      :plan-query="props.query"
    />
</template>
