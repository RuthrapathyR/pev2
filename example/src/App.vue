<script setup>
import Plan from "../../src/components/Plan.vue"
import {processData} from "./utils.ts"

const planData = [``, "", ""]
planData[0] = JSON.stringify(processData(JSON.parse(planData[0])));
window.setPlanData =planData;
</script>

<template>
    <plan
      v-if="planData[0]"
      :plan-source="planData[0]"
      :plan-query="planData[1]"
    />
</template>
