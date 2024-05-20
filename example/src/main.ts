import { createApp } from "vue"
import "bootstrap"
import "bootstrap/dist/css/bootstrap.css"

import App from "./App.vue"
import Plan from "../../src/components/Plan.vue"

createApp(App).mount("#app")

declare global {
  interface Window {
    setPlanData: () => void
  }
}
