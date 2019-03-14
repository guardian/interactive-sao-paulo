const requireUncached = require('require-uncached');

import mainTemplate from './src/templates/main.html!text'
import rp from "request-promise"
import 'svelte/ssr/register'
import * as d3 from 'd3'
import * as topojson from 'topojson'
import world from "world-atlas/world/110m.json"
import { JSDOM } from 'jsdom' 


const renderGlobe = () => {

	const width = 300
	const height = 150

	const dom = new JSDOM(`<svg class='globe' width='${width}' height='${height}'></svg>`)
	const svg = d3.select(dom.window.document.querySelector('svg'))

	const fc = topojson.feature(world, world.objects.countries)

	const mesh = topojson.mesh(world, world.objects.countries, (a, b) => { return a !== b; })

	console.log(mesh)

	const proj = d3.geoOrthographic()
		.fitExtent([[0, -150], [width, 150]], fc)
		.rotate([65, -15])
		//.rotate([65])

	const path = d3.geoPath().projection(proj)

	const g = svg.append('g')

	const water = g
		.append('path')
		.datum({ type : 'Sphere' })
		.attr('d', path)
		.attr('class', 'globe-ocean')

	const countries = g
		.selectAll('.globe-country')
		.data(fc.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', 'globe-country')

	const theMesh = g
		.append('path')
		.datum(mesh)
		.attr('d', path)
		.attr('class', 'globe-mesh')

	const globeCircle = g
		.append('path')
		.datum({ type : 'Sphere' })
		.attr('d', path)
		.attr('class', 'globe-bounds')


	return dom.window.document.querySelector('svg').outerHTML

}

export async function render() {

    return `<svg class='sp-commute-svg'></svg>

    <div class='sp-container'></div>


    ${renderGlobe()}`;
}