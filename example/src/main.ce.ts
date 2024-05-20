import "bootstrap"
import "bootstrap/dist/css/bootstrap.css"
import { defineCustomElement } from "vue"
import App from "./App.ce.vue"

declare global {
  interface Window {
    setPlanData: () => void
  }
}

const SimpleSample = defineCustomElement(App)

customElements.define("simple-sample", SimpleSample)
