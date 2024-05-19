import { defineCustomElement } from 'vue'
import Plan from "../../src/components/Plan.vue"
import App from "./App.vue"

const pev = defineCustomElement(App)

customElements.define('pev-2',pev);

