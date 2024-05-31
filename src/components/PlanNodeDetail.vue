<script lang="ts" setup>
import { computed, inject, onBeforeMount, reactive, ref, watch } from "vue"
import type { Ref } from "vue"
import { directive as vTippy } from "vue-tippy"
import type { Node, IPlan, ViewOptions } from "../interfaces"
import { HelpService } from "../services/help-service"
import { formatNodeProp } from "../filters"
import { EstimateDirection, NodeProp } from "../enums"
import useNode from "../node"
import WorkersDetail from "../components/WorkersDetail.vue"
import MiscDetail from "../components/MiscDetail.vue"
import { PlanKey, ViewOptionsKey } from "../symbols"
import _ from "lodash"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import {
  faAlignJustify,
  faArrowDown,
  faArrowUp,
  faClock,
  faDollarSign,
  faExchangeAlt,
  faFilter,
  faInfoCircle,
  faUndo,
} from "@fortawesome/free-solid-svg-icons"
import {getTaskData} from "../../example/src/utils"

const viewOptions = inject(ViewOptionsKey) as ViewOptions

interface Props {
  node: Node
}
const props = defineProps<Props>()

const updateSize = inject<(node: Node) => null>("updateSize")

const node = reactive<Node>(props.node)
const plan = inject(PlanKey) as Ref<IPlan>
const nodeProps = ref<
  {
    key: keyof typeof NodeProp
    value: unknown
  }[]
>()

// UI flags
const activeTab = ref<string>("general")

const isHovering = ref<boolean>(false);

const helpService = new HelpService()
const getNodeTypeDescription = helpService.getNodeTypeDescription

const {
  costClass,
  durationClass,
  estimationClass,
  executionTimePercent,
  heapFetchesClass,
  plannerRowEstimateDirection,
  plannerRowEstimateValue,
  rowsRemoved,
  rowsRemovedClass,
  rowsRemovedPercentString,
  rowsRemovedProp,
  tilde,
} = useNode(plan, node, viewOptions)

onBeforeMount(() => {
  calculateProps()
})

const shouldShowPlannerEstimate = computed(() => {
  return (
    estimationClass.value &&
    plannerRowEstimateDirection.value !== EstimateDirection.none &&
    plannerRowEstimateValue.value
  )
})

// create an array of node propeties so that they can be displayed in the view
function calculateProps() {
  nodeProps.value = _.chain(node)
    .omit(NodeProp.PLANS)
    .omit(NodeProp.WORKERS)
    .map((value, key) => {
      return { key: key as keyof typeof NodeProp, value }
    })
    .value()
}

const shouldShowIoBuffers = computed((): boolean => {
  const properties: Array<keyof typeof NodeProp> = [
    "EXCLUSIVE_SHARED_HIT_BLOCKS",
    "EXCLUSIVE_SHARED_READ_BLOCKS",
    "EXCLUSIVE_SHARED_DIRTIED_BLOCKS",
    "EXCLUSIVE_SHARED_WRITTEN_BLOCKS",
    "EXCLUSIVE_TEMP_READ_BLOCKS",
    "EXCLUSIVE_TEMP_WRITTEN_BLOCKS",
    "EXCLUSIVE_LOCAL_HIT_BLOCKS",
    "EXCLUSIVE_LOCAL_READ_BLOCKS",
    "EXCLUSIVE_LOCAL_DIRTIED_BLOCKS",
    "EXCLUSIVE_LOCAL_WRITTEN_BLOCKS",
    "EXCLUSIVE_IO_READ_TIME",
    "EXCLUSIVE_IO_WRITE_TIME",
  ]
  const values = _.map(properties, (property) => {
    const value = node[NodeProp[property]]
    return _.isNaN(value) ? 0 : value
  })
  const sum = _.sum(values)
  return sum > 0
})

// returns the formatted prop
function formattedProp(propName: keyof typeof NodeProp) {
  const property = NodeProp[propName]
  const value = node[property]
  return formatNodeProp(property, value)
}

// task link click
function tasksClick(plan : any){
  console.log(getTaskData(plan[0],plan[1]));
  
}

//order by timeTaken
// function orderByTimeTaken(data:any){
//   return orderByDesc(data)
// }

watch(activeTab, () => {
  window.setTimeout(() => updateSize && updateSize(node), 1)
})


function handleClick(ele:any){
  if(ele.target.nextSibling.nextSibling.style.display === "block"){
    ele.target.nextSibling.nextSibling.style.display = "none";
  }else{
    ele.target.nextSibling.nextSibling.style.display = "block";
  }
  window.setTimeout(() => updateSize &&  updateSize(node), 1)  
}

function addHoverEffect(ele:any){
  ele.target.parentElement.classList.add("taskDetails");
}

function removeHoverEffect(ele:any){
  ele.target.parentElement.classList.remove("taskDetails");
}
</script>

<template>
  <div class="card-header border-top" v-if="node[NodeProp.CUSTOM_PLAN_PROVIDER] == NodeProp.DISTDB_CUSTOMSCAN && node[NodeProp.NODE_TYPE] === NodeProp.CUSTOM_SCAN || node[NodeProp.NODE_TYPE].startsWith(NodeProp.SUB_PLAN)">
    <ul class="nav nav-tabs card-header-tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'general' }"
          @click.prevent.stop="activeTab = 'general'"
          href=""
          >Tasks</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link text-nowrap"
          :class="{
            active: activeTab === 'workerTasks',            
          }"
          @click.prevent.stop="activeTab = 'workerTasks'"
          href=""
          >Worker Tasks</a
        >
      </li>
    </ul>
  </div>
  <div class="card-header border-top" v-else>
    <div
      v-if="getNodeTypeDescription(node[NodeProp.NODE_TYPE])"
      class="node-description"
    >
      <span class="node-type">{{ node[NodeProp.NODE_TYPE] }} Node</span>
      <span v-html="getNodeTypeDescription(node[NodeProp.NODE_TYPE])"></span>
    </div>
    <ul class="nav nav-tabs card-header-tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'general' }"
          @click.prevent.stop="activeTab = 'general'"
          href=""
          >General</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link text-nowrap"
          :class="{
            active: activeTab === 'iobuffer',
            disabled: !shouldShowIoBuffers,
          }"
          @click.prevent.stop="activeTab = 'iobuffer'"
          href=""
          >IO & Buffers</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{
            active: activeTab === 'output',
            disabled: !node[NodeProp.OUTPUT],
          }"
          @click.prevent.stop="activeTab = 'output'"
          href=""
          >Output</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{
            active: activeTab === 'workers',
            disabled: !(
              node[NodeProp.WORKERS_PLANNED] ||
              node[NodeProp.WORKERS_PLANNED_BY_GATHER]
            ),
          }"
          @click.prevent.stop="activeTab = 'workers'"
          href=""
          >Workers</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'misc' }"
          @click.prevent.stop="activeTab = 'misc'"
          href=""
          >Misc</a
        >
      </li>
    </ul>
  </div>
  <div class="card-body tab-content" v-if="node[NodeProp.CUSTOM_PLAN_PROVIDER] == NodeProp.DISTDB_CUSTOMSCAN && node[NodeProp.NODE_TYPE] === NodeProp.CUSTOM_SCAN || node[NodeProp.NODE_TYPE].startsWith(NodeProp.SUB_PLAN)"> 
    <div class="tab-pane" :class="{ 'show active': activeTab === 'general' }">  
      <table class="pl-3" v-if="node[NodeProp.DISTDB_QUERY] != undefined">
          <tr v-if="node[NodeProp.DISTDB_QUERY] != undefined" v-for="task in node[NodeProp.TASK_DESC_ORDER]" @click="tasksClick([node[NodeProp.NODE_TYPE],task[NodeProp.TASK_ID]])" style="cursor: pointer;"
            @mouseover="(ele)=>{addHoverEffect(ele)}"
            @mouseout="(ele)=>{removeHoverEffect(ele)}"
           >
            <td>
              &#x2022
            </td>
            <td style="text-align: right;">
              {{ (task as any)[NodeProp.TASK_ID] }}
            </td>
            <td>
              &nbsp;{{ '---->'}}&nbsp;
            </td>
            <td>
              {{(task as any)[NodeProp.TOTAL_TIME]}}ms
            </td>
          </tr>
      </table>
    </div>
    <div class="tab-pane" :class="{ 'show active': activeTab === 'workerTasks' }">
      <ul>
          <li v-if="node[NodeProp.DISTDB_QUERY] != undefined" v-for="task in Object.keys(node[NodeProp.TASK_PER_WORKER])">
            <a @click.prevent.stop="(ele)=>handleClick(ele)">{{ task }}</a>
            <div style="margin: 0px 0px 0px 10px;display: none;">
              <table>
                <tr v-for="perTask in node[NodeProp.TASK_PER_WORKER][task]"
                @mouseover="(ele)=>{addHoverEffect(ele)}"
                @mouseout="(ele)=>{removeHoverEffect(ele)}"
                @click="tasksClick([node[NodeProp.NODE_TYPE],perTask[NodeProp.TASK_ID]])"
            >
                  <td style="font-size: 10px;">
                    &#9702;
                  </td>
                  <td style="text-align: right;">
                    {{ perTask[NodeProp.TASK_ID]}}
                  </td>
                  <td>
                    &nbsp;{{ '---->'}}&nbsp;
                  </td>
                  <td>
                    {{perTask[NodeProp.TOTAL_TIME]}}ms
                  </td>
                </tr>
              </table>
            </div>
          </li>
      </ul>
    </div>
  </div>
  <div class="card-body tab-content" v-else>
    <div class="tab-pane" :class="{ 'show active': activeTab === 'general' }">
      <!-- general -->
      <div v-if="plan.isAnalyze">
        <FontAwesomeIcon
          fixed-width
          :icon="faClock"
          class="text-muted"
        ></FontAwesomeIcon>
        <b>Timing:</b>
        <span
          class="p-0 px-1 rounded alert"
          :class="durationClass"
          v-html="formattedProp('EXCLUSIVE_DURATION')"
        ></span>
        <template v-if="executionTimePercent !== Infinity">
          |
          <strong>{{ executionTimePercent }}</strong
          ><span class="text-muted">%</span>
        </template>
      </div>
      <div>
        <FontAwesomeIcon
          fixed-width
          :icon="faAlignJustify"
          class="text-muted"
        ></FontAwesomeIcon>
        <b>Rows:</b>
        <span class="px-1">{{
          tilde + formattedProp("ACTUAL_ROWS_REVISED")
        }}</span>
        <span class="text-muted" v-if="node[NodeProp.PLAN_ROWS]"
          >(Planned: {{ tilde + formattedProp("PLAN_ROWS_REVISED") }})</span
        >
        <span
          v-if="
            plannerRowEstimateDirection !== EstimateDirection.none &&
            shouldShowPlannerEstimate
          "
        >
          |
          <span v-if="plannerRowEstimateDirection === EstimateDirection.over"
            ><FontAwesomeIcon :icon="faArrowUp"></FontAwesomeIcon> over</span
          >
          <span v-if="plannerRowEstimateDirection === EstimateDirection.under"
            ><FontAwesomeIcon :icon="faArrowDown"></FontAwesomeIcon> under</span
          >
          estimated
          <span v-if="plannerRowEstimateValue != Infinity">
            by
            <span
              class="p-0 px-1 alert"
              :class="estimationClass"
              v-html="formattedProp('PLANNER_ESTIMATE_FACTOR')"
            ></span>
          </span>
        </span>
      </div>
      <div v-if="rowsRemoved">
        <FontAwesomeIcon
          fixed-width
          :icon="faFilter"
          class="text-muted"
        ></FontAwesomeIcon>
        <b> {{ NodeProp[rowsRemovedProp] }}: </b>
        <span>
          <span class="px-1">{{ tilde + formattedProp(rowsRemovedProp) }}</span
          >|
          <span class="p-0 px-1 alert" :class="rowsRemovedClass"
            >{{ rowsRemovedPercentString }}%</span
          >
        </span>
      </div>
      <div v-if="node[NodeProp.HEAP_FETCHES]">
        <FontAwesomeIcon
          fixed-width
          :icon="faExchangeAlt"
          class="text-muted"
        ></FontAwesomeIcon>
        <b>Heap Fetches:</b>
        <span
          class="p-0 px-1 rounded alert"
          :class="heapFetchesClass"
          v-html="formattedProp('HEAP_FETCHES')"
        ></span>
        <FontAwesomeIcon
          :icon="faInfoCircle"
          fixed-width
          class="text-muted"
          v-if="heapFetchesClass"
          v-tippy="{
            arrow: true,
            content:
              'Visibility map may be out-of-date. Consider using VACUUM or change autovacuum settings.',
          }"
        ></FontAwesomeIcon>
      </div>
      <div v-if="node[NodeProp.EXCLUSIVE_COST]">
        <FontAwesomeIcon
          fixed-width
          :icon="faDollarSign"
          class="text-muted"
        ></FontAwesomeIcon>
        <b>Cost:</b>
        <span class="p-0 px-1 me-1 alert" :class="costClass">{{
          formattedProp("EXCLUSIVE_COST")
        }}</span>
        <span class="text-muted"
          >(Total: {{ formattedProp("TOTAL_COST") }})</span
        >
      </div>
      <div v-if="node[NodeProp.ACTUAL_LOOPS] > 1">
        <FontAwesomeIcon
          fixed-width
          :icon="faUndo"
          class="text-muted"
        ></FontAwesomeIcon>
        <b>Loops:</b>
        <span class="px-1">{{ formattedProp("ACTUAL_LOOPS") }} </span>
      </div>
      <!-- general tab -->
    </div>
    <div class="tab-pane" :class="{ 'show active': activeTab === 'iobuffer' }">
      <!-- iobuffer tab -->
      <dl
        v-if="
          node[NodeProp.EXCLUSIVE_IO_READ_TIME] ||
          node[NodeProp.EXCLUSIVE_IO_WRITE_TIME]
        "
        class="mb-2 list-inline"
      >
        <dt class="list-inline-item align-top">
          <b> I/O Timings: </b>
        </dt>
        <dd class="list-inline-item">
          <span v-if="node[NodeProp.EXCLUSIVE_IO_READ_TIME]" class="ms-2">
            <b>Read:&nbsp;</b>
            {{ formattedProp("EXCLUSIVE_IO_READ_TIME") }}
            <small>~{{ formattedProp("AVERAGE_IO_READ_TIME") }}</small>
          </span>
          <br />
          <span v-if="node[NodeProp.EXCLUSIVE_IO_WRITE_TIME]" class="ms-2">
            <b>Write:&nbsp;</b>
            {{ formattedProp("EXCLUSIVE_IO_WRITE_TIME") }}
            <small>~{{ formattedProp("AVERAGE_IO_WRITE_TIME") }}</small>
          </span>
        </dd>
      </dl>
      <b> Blocks: </b>
      <table class="table table-sm">
        <tr>
          <td></td>
          <th class="text-end" width="25%">Hit</th>
          <th class="text-end" width="25%">Read</th>
          <th class="text-end" width="25%">Dirtied</th>
          <th class="text-end" width="25%">Written</th>
        </tr>
        <tr>
          <th>Shared</th>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_SHARED_HIT_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_SHARED_READ_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_SHARED_DIRTIED_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_SHARED_WRITTEN_BLOCKS') || '-'"
          ></td>
        </tr>
        <tr>
          <th>Temp</th>
          <td class="text-end bg-hatched"></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_TEMP_READ_BLOCKS') || '-'"
          ></td>
          <td class="text-end bg-hatched"></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_TEMP_WRITTEN_BLOCKS') || '-'"
          ></td>
        </tr>
        <tr>
          <th>Local</th>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_LOCAL_HIT_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_LOCAL_READ_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_LOCAL_DIRTIED_BLOCKS') || '-'"
          ></td>
          <td
            class="text-end"
            v-html="formattedProp('EXCLUSIVE_LOCAL_WRITTEN_BLOCKS') || '-'"
          ></td>
        </tr>
      </table>
      <div
        v-if="node[NodeProp.WAL_RECORDS] || node[NodeProp.WAL_BYTES]"
        class="mb-2"
      >
        <b>
          <span class="more-info" v-tippy="'Write-Ahead Logging'">WAL</span>:
        </b>
        {{ formattedProp("WAL_RECORDS") }} records
        <small>({{ formattedProp("WAL_BYTES") }})</small>
        <span v-if="node[NodeProp.WAL_FPI]">
          -
          <span class="more-info" v-tippy="'WAL Full Page Images'">FPI</span>:
          {{ formattedProp("WAL_FPI") }}
        </span>
      </div>
      <!-- iobuffer tab -->
    </div>
    <div
      class="tab-pane overflow-auto font-monospace"
      :class="{ 'show active': activeTab === 'output' }"
      v-html="formattedProp('OUTPUT')"
      style="max-height: 200px"
      @mousewheel.stop
    ></div>
    <div
      class="tab-pane"
      :class="{ 'show active': activeTab === 'workers' }"
      v-if="
        node[NodeProp.WORKERS_PLANNED] ||
        node[NodeProp.WORKERS_PLANNED_BY_GATHER]
      "
    >
      <!-- workers tab -->
      <workers-detail :node="node" />
    </div>
    <div class="tab-pane" :class="{ 'show active': activeTab === 'misc' }">
      <!-- misc tab -->
      <misc-detail :node="node" />
    </div>
  </div>
</template>
