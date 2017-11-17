const requireUncached = require('require-uncached');

import mainTemplate from './src/templates/main.html!text'
import rp from "request-promise"
import 'svelte/ssr/register'

export async function render() {

    return `<svg class='sp-commute-svg'></svg>

    <div class='sp-container'></div>`;
}