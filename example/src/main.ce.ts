import { defineCustomElement } from 'vue'
import pev2 from './pev2.ce.vue';

const pev = defineCustomElement(pev2)

customElements.define('pev',pev);