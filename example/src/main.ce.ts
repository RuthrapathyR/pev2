import "bootstrap"
import "bootstrap/dist/css/bootstrap.css"
import { defineCustomElement } from "vue"
import App from "./App.ce.vue"

// declare global {
//   interface Window {
//     setPlanData: () => void
//   }
// }

const PlanDisplayer = defineCustomElement(App)

customElements.define("plan-displayer", PlanDisplayer)
