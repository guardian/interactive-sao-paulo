import * as d3 from 'd3'
import * as TWEEN from 'tween.js'
import spTopo from '../server/sp_topo.json'
import mapData from '../assets/map_data.json'
import * as topojson from 'topojson'
import chroma from 'chroma-js'
import centroids from '../assets/favelas_centroids.json'

const cScale = chroma.scale('Blues').padding(0.05)
    //.mode('lch')
    .domain([20, 0])

//const popScale = chroma.scale('RdYlBu').domain([1.6, 0.4])

const popScale = chroma.scale(['#dcdcdc', '#f6f6f6', '#ff9b0b'])
    .mode('hcl').domain([0.4, 1, 1.2])

const $ = sel => document.querySelector(sel)
const $$ = sel => [].slice.apply(document.querySelectorAll(sel))

const saoPaulo = topojson.feature(spTopo, spTopo.objects.sao_paulo_2)

const numClasses = 6;

const getScale = domain => {

	return val => {

		const diff = domain[1] - domain[0]
		const cols = chroma.scale('Blues').colors(6)

		if(val <= domain[0]) {
			return cols[0] 
		} else if (val >= domain[1]) {
			return cols[5]
		} else if (val <= domain[0] + diff*0.25) {
			return cols[1]
		} else if (val <= domain[0] + diff*0.5) {
			return cols[2]
		} else if (val <= domain[0] + diff*0.75) {
			return cols[3]
		} else if (val <= domain[0] + diff) {
			return cols[4]
		}


		return chroma.scale('Blues').domain(domain).classes([domain[0], domain[0] + diff*0.25, domain[0] + diff*0.5, domain[0] + diff*0.75 ])(val).hex()

	}

}

console.log(getScale([60, 80])(55))

console.log(getScale([60, 80])(61))


console.log(getScale([60, 80])(79))


console.log(getScale([60, 80])(85))

console.log(chroma.scale('Blues').domain([60, 75]).classes(6))


const outline = topojson.merge(spTopo, [spTopo.objects.sao_paulo_2])

console.log(outline)

const str = "M1149.23,659.2819999999999L1443.429,659.3079999999999C1447.429,659.3079999999999,1451.189,660.8589999999999,1454.009,663.6909999999999M93.90000000000009,68.81299999999987H320.0640000000001C324.93700000000007,68.81299999999987,331.73800000000006,71.62599999999988,335.1830000000001,75.07499999999987L570.1150000000001,310.0949999999999C573.5560000000002,313.5419999999999,580.3530000000001,316.3599999999999,585.2280000000001,316.3599999999999L780.423,316.3719999999999C785.292,316.3719999999999,792.095,319.1899999999999,795.541,322.6359999999999L1125.92,653.0139999999999C1129.3700000000001,656.4559999999999,1136.16,659.2829999999999,1141.03,659.2829999999999L1443.429,659.3089999999999C1447.429,659.3089999999999,1451.189,660.8599999999999,1454.009,663.6919999999999L1532.269,741.9399999999999C1537.6200000000001,747.276,1544.709,750.2199999999999,1552.259,750.2199999999999H1702.009C1705.999,750.2199999999999,1709.769,751.7739999999999,1712.589,754.598C1715.4089999999999,757.4269999999999,1716.969,761.1819999999999,1716.969,765.18V838.483"

const testStr = 'M 100 50 H 300 L 400 150 H 600 L 650 200 V 450'

const parsePoints = str => {

	const re = /[A-Za-z]\s*([0-9]+.?[0-9]*,?)+/g

	const matches = str.match(re)

	let lastPoint = []

	const points = matches.map((m, i, arr) => {

		const coords = m.slice(1).replace(' ', '').split(/[, ]/)

		if(m[0] === 'L' || m[0] === 'M') {
			lastPoint = coords
		} else if (m[0] === 'C') {
			lastPoint = coords.slice(-2)
		} else if (m[0] === 'H') {
			lastPoint = [ coords[0], lastPoint[1] ]
		} else if (m[0] === 'V') {
			lastPoint = [ lastPoint[0], coords[0] ]
		}

		return lastPoint.map(str => Number(str))

	})

	return points

}	

const points = parsePoints(testStr)

const p1 = points[0]
const p2 = points[1]
const p3 = points[2]

const svgEl = $('.sp-commute-svg')
const svg = d3.select(svgEl)

const width = svgEl.clientWidth || svgEl.getBoundingClientRect().width
const height = svgEl.clientHeight || svgEl.getBoundingClientRect().height

const clipWidth = 60

const clipRect = svg
	.append('clipPath')
	.attr('id', 'sp-clip-rect')
	.append('rect')
	.attr('x', width/2 - clipWidth/2)
	.attr('y', 0)
	.attr('width', clipWidth)
	.attr('height', height)

const outermostG = svg.append('g')
	.attr('clip-path', 'url(#sp-clip-rect)')

const g = outermostG.append('g')

const translateG = g.append('g')
	.attr('transform', `translate(${-p1[0]}, ${-p1[1]})`)

const path = d3.line()

const metropolitan = translateG
	.append('path')
	//.datum(points)
	.attr('d', testStr)
	.attr('class', 'sp-line')


const first = translateG
	.append('circle')
	.attr('cx', points[0][0])
	.attr('cy', points[0][1])
	.attr('r', 4)
	.attr('class', 'sp-station')

const second = translateG
	.append('circle')
	.attr('cx', points[1][0])
	.attr('cy', points[1][1])
	.attr('r', 4)
	.attr('class', 'sp-station--sec')

const commuter = svg
	.append('circle')
	.attr('cx', width/2)
	.attr('cy', height/2)
	.attr('r', 6)
	.attr('class', 'sp-person')

const travelText = svg
	.append('text')
	.attr('x', width/2)
	.attr('y', 24)
	.text('1:13')
	.attr('class', 'sp-label--large')

const travelTextSub = svg
	.append('text')
	.attr('x', width/2)
	.attr('y', 44)
	.text('hours travelled')
	.attr('class', 'sp-label--small')

const alpha = Math.atan((p1[0] - p2[0])/(p1[1] - p2[1]))
const rotation = alpha/Math.PI*180

const startStr = `translate(${-p1[0]}, ${-p1[1]})`

const endStr = `translate(${-p2[0]}, ${-p2[1]})`

g.attr('transform', `translate(${width/2}, ${height/2}) rotate(${-rotation})`)

const getTranslate = i => {


	return `translate(${-points[i][0]}, ${-points[i][1]})`

}

const getRotate = i => {

	const alpha = Math.atan((points[i+1][0] - points[i+2][0])/(points[i+1][1] - points[i+2][1]))
	const rotation = alpha/Math.PI*180

	return `translate(${width/2}, ${height/2}) rotate(${rotation})`

}

const promise1 = new Promise((resolve, reject) => {

	const transition = translateG
		.transition()
		.duration(12000)
		.attr('transform', endStr)
		.on('end', () => resolve())

})

const promise2 = promise1.then(() => {

	return new Promise((resolve, reject) => {

		const transition = translateG
			.transition()
			.duration(12000)
			.attr('transform', getTranslate(2))

		const transition2 = g
			.transition()
			.duration(4000)
			.attr('transform', getRotate(2))

	})

})

const drawMap = (index, meta, buildings) => {

	const container = d3.select($('.sp-container'))

	const map = container
		.append('svg')
		.attr('class', 'sp-map')

	const mapEl = map.node()

	const width = mapEl.clientWidth || mapEl.getBoundingClientRect().width
	const height = mapEl.clientHeight || mapEl.getBoundingClientRect().height

	map
		.attr('width', width)
		.attr('height', height)

	const proj = d3.geoMercator()
		.fitExtent([[0, 80], [width, height - 80]], saoPaulo)

	const path = d3.geoPath()
		.projection(proj)

	const sp = map
		.selectAll('.sp-distrito')
		.data(saoPaulo.features)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('class', 'sp-distrito')
		.attr('fill', f => {

			//return '#333'

			const d = Number(mapData[f.properties.NOME_DIST][index])

			return getScale(meta.domain)(d)

			//return cScale.domain(meta.domain.slice()).classes(numClasses)(Number(mapData[f.properties.NOME_DIST][index]))

		})
		.attr('data-id', f => f.properties.NOME_DIST)

	const outlinePath = map
		.datum(outline)
		.append('path')
		.attr('d', path)
		.attr('class', 'sp-outline')

	map.append('text')

		.attr('x', 0)
		.attr('y', 30)
		.text(meta.name)
		.attr('class', 'sp-map__title')

	const key = map
		.append('g')

	// const favelas = map
	// 	.selectAll('.sp-fav')
	// 	.data(centroids.features.map(f => f.geometry.coordinates))
	// 	.enter()
	// 	.append('circle')
	// 	.attr('cx', d => proj([Number(d[0]), Number(d[1]) ])[0] )
	// 	.attr('cy', d => proj([Number(d[0]), Number(d[1]) ])[1] )
	// 	.attr('r', 1.5)
	// 	.attr('class', 'sp-fav')

	// const dots = map
	// 	.selectAll('.sp-building')
	// 	.data(buildings)
	// 	.enter()
	// 	.append('circle')
	// 	.attr('cx', d => proj([Number(d[2]), Number(d[1]) ])[0] )
	// 	.attr('cy', d => proj([Number(d[2]), Number(d[1]) ])[1] )
	// 	.attr('r', 1.5)
	// 	.attr('class', 'sp-building')

	const rects = key
		.selectAll('.sp-key__rect')
		.data(Array(numClasses).fill().map((d, i) => i))
		.enter()
		.append('rect')
		.attr('x', (d, i) => i*40)
		.attr('y', 62)
		.attr('width', 40)
		.attr('height', 16)
		.attr('class', 'sp-key__rect')
		.attr('fill', (d, i) => cScale.domain(meta.domain)(meta.domain[0] + i*(meta.domain[1] - meta.domain[0] )/numClasses))

	const r1 = key
		.append('text')
		.attr('x', 0)
		.attr('y', 56)
		.text(meta.words[0])
		.attr('class', 'sp-key__word')

	const r2 = key
		.append('text')
		.attr('x', 240)
		.attr('y', 56)
		.text(meta.words[1])
		.attr('class', 'sp-key__word sp-key__word--right')

}

const meta = [

	{
		'name' : 'Road traffic deaths',
		'domain' : [0, 15],
		'words' : ['fewer', 'more']
	},
		{
		'name' : 'Youth homicide rate',
		'domain' : [0, 70],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Homicide rate',
		'domain' : [0, 20],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Road \'greenness\'',
		'domain' : [0, 15000],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Respiratory diseases mortality',
		'domain' : [0, 20],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Average income',
		'domain' : [2000, 4000],
		'words' : ['lower', 'higher']
	},
		{
		'name' : '% living in favelas',
		'domain' : [5, 25],
		'words' : ['fewer', 'more']
	},
		{
		'name' : 'Demanda atendida em creches (?)',
		'domain' : [70, 110],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Teenage pregnancy rate',
		'domain' : [5, 20],
		'words' : ['lower', 'higher']
	},
		{
		'name' : 'Life expectancy',
		'domain' : [60, 75],
		'words' : ['lower', 'higher']
	}, {
		'name' : 'Jobs per inhabitant',
		'domain' : [0.5, 2],
		'words' : ['fewer', 'more']
	}, {
		'name' : 'Population change',
		'domain' : [0.8, 1.2],
		'words' : ['decrease', 'increase']
	},{
		'name' : 'Jobs growth',
		'domain' : [1, 3],
		'words' : ['small increase', 'large increase']
	}

]

const buildingsStr = `
[['110896','-23.551483','-46.569756','Figueira','3','182','0'],['110318','-23.542732','-46.577461','Platina 220','3','175','0'],['1537','-23.542189','-46.635406','Mirante do Vale','1','170','0'],['1527','-23.545502','-46.643539','Edificio Italia','1','165','0'],['708','-23.545820','-46.634106','Edifício Altino Arantes','1','161','0'],['95237','-23.607624','-46.696007','Florida Penthouses A','1','158','0'],['1528','-23.610323','-46.696663','CENU Torre Norte','1','157','0'],['84663','-23.599558','-46.698124','Parque Cidade Jardim','1','157','0'],['42959','-23.554970','-46.564541','Josephine Baker','1','150','0'],['52366','-23.626827','-46.702389','EZ Towers - Tower A','1','150','0'],['15497','-23.627413','-46.701931','EZ Towers - Tower B','1','150','0'],['1662','-23.565487','-46.702393','Birmann 21','1','149','0'],['7888','-23.593845','-46.690468','e-Tower','1','148','0'],['73208','-23.608677','-46.694561','Eco Berrini','1','146','0'],['1556','-23.617140','-46.698975','Itaú Fidelité Marginal Pinheiros','1','145','0'],['95236','-23.607042','-46.696129','Florida Penthouses B','1','144','0'],['1667','-23.545088','-46.634888','Edifício do Banco do Brasil','1','143','0'],['33153','-23.616827','-46.701984','TEK Nações Unidas','1','143','0'],['10983','-23.597237','-46.664345','Inhambú','1','141','0'],['10988','-23.597595','-46.663956','Canário','1','141','0'],['11082','-23.573378','-46.697655','Eldorado Business Tower','1','140','0'],['4837','-23.623775','-46.702190','WTorre Morumbi','1','140','0'],['1526','-23.546602','-46.644367','Edificio Copan','1','140','0'],['14589','-23.591944','-46.688622','São Paulo Corporate Tower B','1','139','0'],['84673','-23.601686','-46.698154','Capital Building','1','139','0'],['1555','-23.605658','-46.696072','Plaza Centenário','1','139','0'],['423','-23.597988','-46.690434','Berrini 1','1','139','0'],['2232','-23.591539','-46.687763','São Paulo Corporate Tower A','1','139','0'],['11084','-23.603991','-46.694878','Mandarim','1','136','0'],['82358','-23.640013','-46.722149','Brookfield Towers - Torre Sigma','2','136','0'],['82359','-23.640589','-46.722805','Brookfield Towers - Torre Alpha','2','136','0'],['64441','-23.591022','-46.690926','Torre São Paulo I','1','136','0'],['84674','-23.601749','-46.699306','Continental Tower','1','135','0'],['1669','-23.547827','-46.636051','Moreira Salles','1','133','0'],['1720','-23.546305','-46.645588','Ipiranga 165','1','130','0'],['3866','-23.545706','-46.636219','Grande Sao Paulo','1','129','0'],['4278','-23.546274','-46.636524','Mercantil Finasa','1','129','0'],['17099','-23.563562','-46.653011','Matarazzo','1','125','0'],['11033','-23.558470','-46.656822','Ciragan','1','125','0'],['11036','-23.556158','-46.668194','Instituto do Câncer de São Paulo Octavio Frias de Oliveira','1','125','0'],['3225','-23.608627','-46.697067','World Trade Center','1','124','0'],['9513','-23.615587','-46.680473','Mirante','1','123','0'],['6345','-23.615547','-46.681095','Panorama','1','123','0'],['70504','-23.616024','-46.680721','Horizonte','1','123','0'],['27857','-23.657036','-46.689499','Casa Grande Bloco C','1','122','0'],['36198','-23.656338','-46.688484','Plátano','1','122','0'],['27852','-23.656906','-46.690113','Jacaranda','1','122','0'],['27854','-23.655815','-46.690414','Casa Grande Bloco A','1','122','0'],['27853','-23.656332','-46.690361','Casa Grande Bloco B','1','122','0'],['27856','-23.655176','-46.690483','Casa Grande Bloco D','1','122','0'],['27851','-23.656725','-46.688988','Paineiras','1','122','0'],['73211','-23.591255','-46.689648','Cipriani Hotel & Residences','1','121','0'],['26070','-23.565477','-46.668949','LEssence Jardins','1','120','0'],['27862','-23.622833','-46.701504','RochaVerá Plaza Torre C','1','120','0'],['1548','-23.611109','-46.696663','CENU Torre Leste','1','120','0'],['26073','-23.633039','-46.734505','Vert','1','120','0'],['26074','-23.633432','-46.734543','Olive','1','120','0'],['26075','-23.632519','-46.734001','Blue','1','120','0'],['26072','-23.632675','-46.734371','Rouge','1','120','0'],['8561','-23.493238','-46.852791','Crystal Tower','1','120','0'],['1578','-23.609921','-46.697330','CENU Torre Oeste','1','120','0'],['86636','-23.587368','-46.679489','Infinity Tower','1','118','0'],['18666','-23.601746','-46.698708','Park Tower','1','117','0'],['11085','-23.582947','-46.691036','Villa Europa','1','117','0'],['95060','-23.625565','-46.675030','Particolare Torre B','1','115','0'],['95059','-23.625874','-46.674580','Particolare Torre A','1','115','0'],['49769','-23.541519','-46.642200','Edifício Andraus','1','114','0'],['10878','-23.634377','-46.724617','Open House Loft Panamby','1','114','0'],['84677','-23.628454','-46.722553','Leeds Hall','1','114','0'],['10998','-23.628469','-46.722561','Edificio Porto Alegre','1','114','0'],['58943','-23.561056','-46.694443','Instituto Tomie Ohtake & Torre Faria Lima','1','112','0'],['4138','-23.546946','-46.636810','Conde de Prates','1','111','0'],['11075','-23.599739','-46.669659','The Blue Loft','1','111','0'],['13258','-23.600180','-46.687885','The View','1','111','0'],['10904','-23.545158','-46.637505','Edifício CBI Esplanada','1','110','0'],['8038','-23.602690','-46.661903','Contemporary Tower','1','110','0'],['1639','-23.560263','-46.655964','Blue Tree Towers Paulista','1','110','0'],['1551','-23.558867','-46.662315','Renaissance São Paulo Hotel','1','110','0'],['95105','-23.628620','-46.721523','Ville Burle Marx','1','110','0'],['4241','-23.545532','-46.635235','Predio Martinelli','1','110','0'],['61442','-23.533190','-46.677834','Reserva Verde','1','108','0'],['63909','-23.583937','-46.675625','Brascan Century Staybridge Suites','1','108','0'],['84678','-23.591175','-46.682121','International Plaza II','1','108','0'],['11039','-23.632095','-46.705444','Edificio Granja Julieta','1','107','0'],['104877','-23.559399','-46.659454','Barão De Itatiaia Galeria 2001','1','107','0'],['11028','-23.571657','-46.633495','Edificio Tiradentes','1','107','0'],['104874','-23.566380','-46.649830','Theobaldo De Nigris - Senai','1','107','0'],['65561','-23.554014','-46.632240','Edifício Conde de Sarzedas','1','106','0'],['95061','-23.618595','-46.680965','Camarotte','1','105','0'],['63109','-23.585255','-46.681004','Lindenberg Iguatemi','1','105','0'],['95062','-23.626646','-46.684860','Matizes','1','105','0'],['95063','-23.626949','-46.685249','Nuances','1','105','0'],['102690','-23.558249','-46.660625','Banco do Brasil','1','105','0'],['84679','-23.560083','-46.698891','Sao Paulo Fashion Hall','1','103','0'],['11067','-23.558226','-46.659359','Sede I & II CESP','1','102','0'],['11072','-23.576740','-46.686676','Plaza Iguatemi Business Center','1','102','0'],['11001','-23.562243','-46.677319','Edificio General Osório','1','102','0'],['109305','-23.611832','-46.695782','E.Office Berrini','1','101','0'],['1580','-23.556696','-46.661198','Edificio São Luis Gonzaga','1','101','0'],['10943','-23.580669','-46.684212','Edifício Dacon','1','100','0'],['10959','-23.622797','-46.696362','Blue Tree Towers Morumbi','1','100','0'],['108992','-23.561405','-46.652885','Torre Rosewood','2','100','0'],['80002','-23.562389','-46.655991','Conde Andrea Matarazzo','1','100','0'],['73212','-23.611725','-46.697128','CENU IV','1','100','0'],['10952','-23.559105','-46.660378','Conjunto Nacional','1','100','0'],['95816','-23.553434','-46.653412','Paulista Home Resort Torre C','1','100','0'],['95815','-23.553307','-46.653812','Paulista Home Resort Torre B','1','100','0'],['95106','-23.635443','-46.729710','Majuy','1','100','0'],['95814','-23.553795','-46.653969','Paulista Home Resort Torre A','1','100','0'],['10948','-23.569510','-46.691246','Edifício Faria Lima','1','100','0'],['10967','-23.550116','-46.630161','Palácio Clóvis Ribeiro','1','100','0'],['96480','-23.625217','-46.675549','Torre Paineira','1','100','0'],['95822','-23.549059','-46.653206','Tribunal Regional do Trabalho da 2ª Região','1','100','0'],['96178','-23.625786','-46.706944','Acqualife Torre A','1','100','0'],['96179','-23.626213','-46.706867','Acqualife Torre B','1','100','0'],['96479','-23.625156','-46.676144','Torre Figueira','1','100','0'],['91805','-23.535679','-46.661472','Sheynna Tower','1','100','0'],['10874','-23.566610','-46.686398','Torre 2000','1','100','0'],['96473','-23.569157','-46.635578','Alameda das Flores','1','100','0'],['95823','-23.553329','-46.662346','Angélica Trade Center','1','100','0'],['10949','-23.563757','-46.654442','Edifício Luiz Eulálio Bueno Vidigal Filho','1','99','0'],['11080','-23.587872','-46.680367','Edifício New Century','1','99','0'],['11018','-23.547810','-46.636848','Othon Palace','1','98','0'],['10885','-23.581118','-46.678638','Comfort Jardim Europa','1','98','0'],['10911','-23.571598','-46.646351','Golden Tulip Paulista Plaza Hotel','1','98','0'],['8255','-23.602802','-46.694748','Magenta','1','97','0'],['45273','-23.602665','-46.695221','Cyan','1','97','0'],['15415','-23.602921','-46.694283','Rubine','1','97','0'],['14809','-23.609879','-46.692875','Moongate','1','97','0'],['102689','-23.558046','-46.660942','Caesar Business Hotel Paulista','1','97','0'],['20537','-23.608841','-46.692108','Britannia Bay','1','97','0'],['96396','-23.537462','-46.628559','Edificio Garagem @ Rua da Cantareira','1','96','0'],['5826','-23.569874','-46.693047','Edifício Faria Lima Premium','1','96','0'],['84681','-23.594204','-46.687916','Orion','1','96','0'],['84682','-23.594278','-46.688370','Hydrus','1','96','0'],['10946','-23.563343','-46.654907','Paulista I','1','95','0'],['96481','-23.622662','-46.673359','Barão de Campo Belo','1','95','0'],['96180','-23.628010','-46.708935','Olimpic Torre A','1','95','0'],['96181','-23.628036','-46.708443','Olimpic Torre B','1','95','0'],['96399','-23.539606','-46.630032','Bolsa de Cereais do Estado de São Paulo','1','95','0'],['102700','-23.573393','-46.634575','Lion DOr','1','95','0'],['104878','-23.558538','-46.659241','Brasil Seguros','1','95','0'],['10951','-23.572271','-46.698730','Unibanco Building','1','94','0'],['10944','-23.562866','-46.653984','Edifício Eluma','1','94','0'],['1553','-23.558186','-46.659649','Safra Headquarters','1','94','0'],['102701','-23.570862','-46.641743','Santa Luiza Workcenter','1','93','0'],['15115','-23.609612','-46.692554','Seabreeze','1','93','0'],['102697','-23.564449','-46.669495','Hotel Fasano','1','93','0'],['10900','-23.564941','-46.653179','Citicorp Center','1','93','0'],['1742','-23.609167','-46.692200','Lagoon Bay','1','93','0'],['95138','-23.483583','-46.630283','Vitale','1','93','0'],['11055','-23.578348','-46.649593','Ana Luíza','1','91','0'],['96279','-23.657263','-46.693382','Visage','1','90','0'],['96214','-23.668316','-46.675694','Reserva Marajoara Park Bloco C','1','90','0'],['96213','-23.668535','-46.675980','Reserva Marajoara Park Bloco B','1','90','0'],['96212','-23.668762','-46.676262','Reserva Marajoara Park Bloco A','1','90','0'],['96475','-23.564396','-46.639599','Paulicéia','1','90','0'],['96200','-23.654823','-46.694641','Grand Phoenix','1','90','0'],['96274','-23.665644','-46.695435','Iepê Golf Condominium Torre 3','1','90','0'],['95817','-23.553858','-46.656796','Long Stay Bela Cintra','1','90','0'],['95818','-23.545406','-46.652569','Olympic Higienópolis','1','90','0'],['96476','-23.572420','-46.637096','Aspen','1','90','0'],['96182','-23.646717','-46.702885','Vivre Torre A','1','90','0'],['95820','-23.549488','-46.660381','Coral Bay','1','90','0'],['95821','-23.547825','-46.660290','Golden Tower','1','90','0'],['96272','-23.666174','-46.694828','Iepê Golf Condominium Torre 1','1','90','0'],['96273','-23.665945','-46.695160','Iepê Golf Condominium Torre 2','1','90','0'],['95819','-23.543222','-46.658722','Place de LÉtoile','1','90','0'],['96277','-23.665249','-46.696808','Iepê Golf Condominium Torre 6','1','90','0'],['96407','-23.552923','-46.633930','Fórum João Mendes Jr','1','90','0'],['96275','-23.665928','-46.696320','Iepê Golf Condominium Torre 4','1','90','0'],['95107','-23.635630','-46.731419','Agrias','1','90','0'],['95108','-23.636646','-46.732052','Parides','1','90','0'],['95109','-23.638376','-46.730911','Domaine du Soleil','1','90','0'],['95127','-23.576159','-46.656193','Rugendas','1','90','0'],['95129','-23.605854','-46.660934','Ornato','1','90','0'],['95805','-23.534035','-46.692814','Well','1','90','0'],['95806','-23.538576','-46.692577','Spazio di Vivere','1','90','0'],['96474','-23.564758','-46.639759','Metrópole','1','90','0'],['96276','-23.665541','-46.696476','Iepê Golf Condominium Torre 5','1','90','0'],['11054','-23.566671','-46.653015','Transamérica Flat International Plaza','1','90','0'],['10955','-23.591127','-46.680740','Blue Tree Towers Faria Lima','1','89','0'],['95126','-23.595821','-46.667641','Wonder','1','88','0'],['95125','-23.596098','-46.667377','Window','1','88','0'],['95124','-23.596289','-46.667767','Wharehouse','1','88','0'],['10892','-23.607964','-46.696724','Edifício Nestlé','1','88','0'],['11071','-23.566269','-46.651833','Edifício Comendador Yerchanik Kissajikian','1','88','0'],['113825','-23.556980','-46.660149','Condomínio Edifício Anita','1','88','0'],['11064','-23.570280','-46.663616','Edifício Jardim América','1','88','0'],['95825','-23.557533','-46.660248','Central Park','1','88','0'],['102692','-23.559389','-46.667454','Jardim América','1','88','0'],['59252','-23.572739','-46.639732','UNIP Campus Paraíso A','1','87','0'],['95132','-23.606184','-46.657890','Chateau de Blois','1','87','0'],['96280','-23.656971','-46.691013','Flora Viva','1','87','0'],['95140','-23.500137','-46.621681','Brasília Small Town Flat Service','1','87','0'],['104875','-23.563150','-46.653629','Asahi Bank Of Tokyo','1','87','0'],['96172','-23.646824','-46.701626','Vincetori Condominium I','1','87','0'],['95131','-23.580788','-46.651028','Ibirapuera Park View','1','87','0'],['96173','-23.647030','-46.701256','Vincetori Condominium II','1','87','0'],['10906','-23.582426','-46.650330','Mercure Grand Hotel São Paulo Ibirapuera','1','86','0'],['58860','-23.569706','-46.647091','Edifício Santa Catarina','1','86','0'],['10954','-23.601654','-46.694134','Blue Tree Towers Berrini','1','86','0'],['95130','-23.595491','-46.671108','Walk Vila Nova','1','86','0'],['64350','-23.579987','-46.649284','Edifício Sede IBM','1','86','0'],['102693','-23.558701','-46.659019','Barão do Amparo','1','86','0'],['96186','-23.633718','-46.714146','The Square','1','85','0'],['95064','-23.614529','-46.673275','Torre Atlântico','1','85','0'],['95809','-23.537624','-46.676407','Etoile','1','85','0'],['95808','-23.528872','-46.685886','Solar dos Canelhas','1','85','0'],['95065','-23.614765','-46.673607','Torre Pacífico','1','85','0'],['95807','-23.535543','-46.683491','Mansao Ravello','1','85','0'],['95810','-23.532015','-46.668396','Reserve Du Parc','1','85','0'],['10950','-23.565992','-46.652184','Torre Paulista','1','85','0'],['63590','-23.558878','-46.657593','Cetenco Plaza Torre Norte','1','85','0'],['10957','-23.559566','-46.657848','Cetenco Plaza Torre Sul','1','85','0'],['10886','-23.616413','-46.698494','Grand Hyatt São Paulo','1','84','0'],['63628','-23.568180','-46.647644','Pedro Biagi','1','84','0'],['10927','-23.569529','-46.691277','Edifício Parque Iguatemi','1','84','0'],['95139','-23.483545','-46.630718','Paradiso','1','84','0'],['95141','-23.493891','-46.628368','Mansão Francisca Júlia','1','84','0'],['95128','-23.576101','-46.656479','Brasil Pitoresco B','1','84','0'],['69883','-23.549522','-46.640869','Edifício Joelma','1','84','0'],['96283','-23.679430','-46.692570','Viva Torre B','1','84','0'],['96282','-23.679831','-46.692188','Viva Torre A','1','84','0'],['63910','-23.584396','-46.675148','Brascan Century Offices','1','84','0'],['10875','-23.570736','-46.693260','The Empire State Faria Lima Hotel & Convention','1','84','0'],['96269','-23.663832','-46.684986','Lumina Noblesse Torre A','1','84','0'],['96184','-23.625092','-46.695881','Passeio','1','84','0'],['102696','-23.559202','-46.656002','West Side','1','84','0'],['96270','-23.663870','-46.684547','Lumina Noblesse Torre B','1','84','0'],['102695','-23.558853','-46.655895','East Side','1','84','0'],['96271','-23.663637','-46.684170','Lumina Noblesse Torre C','1','84','0'],['72899','-23.584805','-46.682652','Icon Faria Lima','1','82','0'],['95142','-23.490513','-46.630230','Bios Santana','1','81','0'],['96285','-23.678749','-46.691711','Viva Torre D','1','81','0'],['95143','-23.491739','-46.629089','Astoria','1','81','0'],['96193','-23.655638','-46.693768','Villa Natura Bloco B','1','81','0'],['96192','-23.655478','-46.693245','Villa Natura Bloco A','1','81','0'],['96195','-23.654684','-46.693977','Villa Natura Bloco D','1','81','0'],['96194','-23.655218','-46.693951','Villa Natura Bloco C','1','81','0'],['96284','-23.679260','-46.691830','Viva Torre C','1','81','0'],['95144','-23.490660','-46.630783','Ouro Verde','1','81','0'],['95145','-23.485188','-46.624310','Torre São Paulo','1','81','0'],['108673','-23.563284','-46.651154','Maksoud Plaza','1','80','0'],['64908','-23.595942','-46.684715','Continental Sq. Faria Lima - Flat Caesar Business / Hotel Caesar Park','1','80','0'],['11078','-23.564474','-46.652283','Edificio Comendador Alberto Bonfiglioli','1','80','0'],['108672','-23.564022','-46.656025','Tivoli Sao Paulo Mofarrej','1','80','0'],['95121','-23.635166','-46.726185','Espaço Brisa','1','80','0'],['95827','-23.548601','-46.661457','Paradiso','1','80','0'],['95824','-23.543892','-46.663151','Transamerica Flat Higienópolis','1','80','0'],['95225','-23.606743','-46.695122','NYC Berrini','1','80','0'],['96401','-23.539656','-46.633492','Estacionamento Shopping 25 de Março','1','80','0'],['96421','-23.548851','-46.634697','Triângulo','1','80','0'],['96422','-23.551771','-46.636265','Palácio Mauá','1','80','0'],['96423','-23.548281','-46.634220','Azevedo e Villares','1','80','0'],['96477','-23.562260','-46.629814','Piazza della Fontana','1','80','0'],['95811','-23.537857','-46.679985','Mansão Charlie Parker','1','80','0'],['95812','-23.539919','-46.672962','Marrion Luxury Edition','1','80','0'],['95813','-23.530678','-46.690102','Lumière','1','80','0'],['95122','-23.635277','-46.726734','Espaço Terral','1','80','0'],['95123','-23.634567','-46.725910','Espaço Mistral','1','80','0'],['63611','-23.567936','-46.646030','Delta Plaza','1','80','0'],['10928','-23.564699','-46.651875','Edifício Sede Sudameris','1','79','0'],['10880','-23.628120','-46.664017','Quality Hotel & Suites Congonhas Airport','1','79','0'],['11057','-23.610003','-46.693821','Terra Brasilis','1','79','0'],['10958','-23.559847','-46.657368','Banco Central do Brasil','1','79','0'],['10871','-23.595600','-46.687603','Edifício Atrium VI','1','79','0'],['63625','-23.571545','-46.645638','Parque Cultural Paulista','1','79','0'],['95119','-23.638557','-46.729980','Portis Thamyris','1','79','0'],['95120','-23.637310','-46.732250','Jazz Duet','1','79','0'],['95111','-23.635359','-46.730289','Double View','1','79','0'],['95118','-23.638357','-46.729427','Amadryas','1','79','0'],['95117','-23.637724','-46.729450','Strelitzia','1','79','0'],['95110','-23.636051','-46.728931','Mirabilis','1','79','0'],['95116','-23.638245','-46.731415','Palazzo Panamby','1','79','0'],['95115','-23.637890','-46.731995','Cypris','1','79','0'],['95112','-23.635412','-46.729015','Anthurium','1','79','0'],['95113','-23.636135','-46.731823','Doppio Spazio','1','79','0'],['95114','-23.638529','-46.730503','Hibiscus','1','79','0'],['95153','-23.503241','-46.717026','Felicitá','1','78','0'],['95151','-23.479750','-46.644520','Vivere','1','78','0'],['95154','-23.503584','-46.717239','Libertá','1','78','0'],['95149','-23.480108','-46.644833','Cristal','1','78','0'],['95152','-23.503904','-46.717018','Eternitá','1','78','0'],['95150','-23.479504','-46.644096','Felice','1','78','0'],['95146','-23.485209','-46.624741','Torre Cantareira','1','78','0'],['95147','-23.494329','-46.624409','Mundo Apto Santana','1','78','0'],['95148','-23.480591','-46.644886','Esperanza','1','78','0'],['95155','-23.503819','-46.717674','Modernitá','1','78','0'],['95156','-23.504190','-46.717506','Prosperitá','1','78','0'],['96201','-23.656586','-46.698700','Manacá','1','78','0'],['96286','-23.656359','-46.690907','MO.R.E','1','78','0'],['96185','-23.632565','-46.704632','Scott Joplin','1','78','0'],['104879','-23.563639','-46.646629','Embratel','1','78','0'],['95157','-23.504156','-46.717937','Qualitá','1','78','0'],['10889','-23.595669','-46.683971','Continental Square Faria Lima - Continental Office Tower','1','77','0'],['10942','-23.568485','-46.647221','Edifício Nassib Mofarrej','1','77','0'],['65508','-23.604591','-46.693905','Centro Empresarial e Cultural João Domingues de Araújo','1','77','0'],['11063','-23.566156','-46.667072','Edifício Largo do Ouvidor','1','77','0'],['65507','-23.609924','-46.694244','Berrini 1511','1','76','0'],['69882','-23.622421','-46.699009','Centro Profissional Morumbi Shopping','1','76','0'],['11086','-23.630238','-46.707890','Birmann 12','1','75','0'],['10905','-23.630699','-46.707790','Birmann 11','1','75','0'],['104914','-23.525579','-46.677139','Centro Empresarial Água Branca - Nova York','1','75','0'],['104911','-23.525606','-46.676659','Centro Empresarial Água Branca - Milano','1','75','0'],['104913','-23.525703','-46.675556','Centro Empresarial Água Branca - Torino','1','75','0'],['104912','-23.525654','-46.676098','Centro Empresarial Água Branca - Los Angeles','1','75','0'],['95831','-23.542543','-46.651604','Itamarati','1','75','0'],['95830','-23.544975','-46.656445','Authentique Higienópolis','1','75','0'],['96204','-23.656191','-46.699024','Laranjeiras','1','75','0'],['96403','-23.554863','-46.635201','Regente Feijó A','1','75','0'],['95826','-23.551041','-46.647354','Grand Hotel CadOro','1','75','0'],['96174','-23.640072','-46.714397','Conto','1','75','0'],['96176','-23.640514','-46.714546','Rima','1','75','0'],['96177','-23.639601','-46.715263','Verso','1','75','0'],['64359','-23.623489','-46.700508','RochaVerá Plaza Torre A','1','75','0'],['64358','-23.622669','-46.700676','RochaVerá Plaza Torre B','1','75','0'],['96198','-23.641609','-46.710167','Cennario','1','75','0'],['96202','-23.656107','-46.698181','Amarylis','1','75','0'],['96203','-23.655222','-46.695473','Gardenia','1','75','0'],['10912','-23.571844','-46.639591','Sebrae Tower','1','75','0'],['96175','-23.639664','-46.714699','Prosa','1','75','0'],['96281','-23.657532','-46.691147','Terra Brasilis','1','75','0'],['102698','-23.558445','-46.655697','Le Crillon','1','75','0'],['10945','-23.601051','-46.692108','Edifício Berrini 500','1','75','0'],['14786','-23.586569','-46.681946','Pátio Victor Malzoni','1','74','0'],['63626','-23.573580','-46.641876','Paulista Plaza','1','73','0'],['96209','-23.654539','-46.695007','Ipe','1','72','0'],['96289','-23.661776','-46.691097','Ilhas do Mediterrâneo Torre C','1','72','0'],['96190','-23.627460','-46.696342','Palais Des Sports Bloco A','1','72','0'],['96191','-23.626923','-46.696568','Palais des Sports Bloco B','1','72','0'],['96208','-23.656357','-46.697571','Acácias','1','72','0'],['96183','-23.646473','-46.702503','Vivre Torre B','1','72','0'],['65560','-23.602154','-46.692410','Edifício Ronaldo Sampaio Ferreira','1','72','0'],['96207','-23.655649','-46.698448','Primavera','1','72','0'],['96206','-23.654819','-46.695583','Bouganville','1','72','0'],['96288','-23.661934','-46.691921','Ilhas do Mediterrâneo Torre B','1','72','0'],['96287','-23.661663','-46.691784','Ilhas do Mediterrâneo Torre A','1','72','0'],['96290','-23.662069','-46.691250','Ilhas do Mediterrâneo Torre D','1','72','0'],['96210','-23.655640','-46.697281','Flamboyant','1','72','0'],['96211','-23.655865','-46.696751','Paineiras','1','72','0'],['95134','-23.592342','-46.671684','Ritz Vila Nova Bloco B','1','72','0'],['95133','-23.592093','-46.671776','Ritz Vila Nova Bloco A','1','72','0'],['10901','-23.576057','-46.687275','Os Bandeirantes','1','71','0'],['10921','-23.621653','-46.699425','Market Place Tower I','1','70','0'],['10920','-23.622280','-46.699905','Market Place Tower II','1','70','0'],['10966','-23.584909','-46.672112','Juscelino Kubitschek','1','70','0'],['10961','-23.560230','-46.659256','Edifício Parque Cultural Paulista','1','70','0'],['61695','-23.561865','-46.655594','MASP VIVO','4','70','0'],['59431','-23.534929','-46.684010','Villa Reale','1','70','0'],['95828','-23.544653','-46.655647','Domaine de Belle Vue','1','70','0'],['95829','-23.547516','-46.657757','La Maison','1','70','0'],['96478','-23.572397','-46.634892','Casaredo','1','70','0'],['98932','-23.587614','-46.684013','Vitra','1','70','0'],['96424','-23.545589','-46.633774','Santander Banespa','1','70','0'],['102703','-23.573484','-46.635303','Granville','1','69','0'],['102704','-23.575178','-46.633011','Le Parc','1','68','0'],['102705','-23.575607','-46.625584','Santa Lúcia','1','68','0'],['102702','-23.570345','-46.633900','Meire','1','68','0'],['10924','-23.587179','-46.675240','JK Financial Center','1','68','0'],['10953','-23.557140','-46.660667','Banco Panamericano','1','67','0'],['10962','-23.600920','-46.692673','River Park','1','67','0'],['63624','-23.570030','-46.648640','Maria Santos','1','67','0'],['11062','-23.589138','-46.675617','Juscelino Plaza','1','67','0'],['11053','-23.566175','-46.665142','Hotel Emiliano','1','66','0'],['96196','-23.628769','-46.692780','Adágio','1','66','0'],['10934','-23.565699','-46.660309','Edifício George V Jardins','1','64','0'],['10965','-23.568794','-46.692730','Faria Lima 1188','1','64','0'],['10932','-23.593779','-46.686153','Atrium','1','64','0'],['11052','-23.547638','-46.637505','Edificio Ermelino Matarazzo','1','64','0'],['73210','-23.569170','-46.701359','WT Nações Unidas','1','64','0'],['64010','-23.633865','-46.641956','Torre Eudoro Vilela','1','63','0'],['63113','-23.571039','-46.653801','Duetto Jardins','1','63','0'],['102691','-23.557709','-46.661285','Três Marias','1','62','0'],['10931','-23.594809','-46.684948','Edifício Atrium V','1','61','0'],['10930','-23.593113','-46.686653','Atrium 4','1','60','0'],['96426','-23.549641','-46.629230','Guarani','1','60','0'],['11060','-23.581188','-46.679527','Office Tower Itaim','1','60','0'],['63600','-23.562271','-46.654312','Sede Banco Real ABN AMRO','1','60','0'],['96425','-23.537540','-46.644283','Hotel Comodoro','1','60','0'],['109375','-23.516619','-46.639019','Anhembi Holiday Inn','1','59','0'],['65912','-23.623659','-46.696823','Morumbi Office Tower','1','59','0'],['10870','-23.584282','-46.676113','Bandeira Tower','1','59','0'],['11061','-23.602423','-46.693569','Edifício Attílio Tinelli','1','59','0'],['104876','-23.562227','-46.654964','Bradesco Prime','1','59','0'],['96404','-23.554867','-46.635021','Regente Feijó B','1','57','0'],['11073','-23.594719','-46.684502','Loft Office São Paulo I','1','56','0'],['69814','-23.590153','-46.681969','Birmann 31','1','56','0'],['63620','-23.568567','-46.648342','Kyoei Paulista','1','56','0'],['104883','-23.537512','-46.606438','Solomon Temple','1','55','0'],['10963','-23.601580','-46.691860','Berrini 550','1','54','0'],['10917','-23.646065','-46.724907','Birmann 20','1','54','0'],['10933','-23.571041','-46.699532','Center Plaza Pinheiros','1','53','0'],['63616','-23.559235','-46.658184','FUNCEF Center','1','53','0'],['63618','-23.574389','-46.645954','ISO','1','53','0'],['63912','-23.584311','-46.674778','Brascan Century Corporate','1','53','0'],['10914','-23.653936','-46.716446','Birmann 9','1','53','0'],['69811','-23.582033','-46.684792','HSBC Tower - LArche','1','52','0'],['63621','-23.572418','-46.651814','Les Ateliers','1','51','0'],['63630','-23.573977','-46.646168','Prize Hall Office Center','1','51','0'],['109893','-23.546635','-46.638752','Prédio Alexandre Mackenzie','1','50','0'],['59722','-23.535915','-46.685925','Edifício Dome','1','49','0'],['63623','-23.567547','-46.648453','Torre Luíz Simões Lopes','1','49','0'],['10929','-23.593458','-46.686378','Edifício Atrium II','1','49','0'],['10964','-23.586258','-46.674107','JK Tower','1','49','0'],['63631','-23.567684','-46.648270','Torre Jorge Flores','1','49','0'],['11081','-23.594809','-46.672150','Vila Nova Building','1','48','0'],['102694','-23.557142','-46.662094','Ibis Paulista','1','48','0'],['10939','-23.649815','-46.723125','Hoechst Headquarters','1','47','0'],['11079','-23.549994','-46.660088','Edifício Comercial Exclusive','1','46','0'],['63608','-23.573992','-46.646412','Albatroz','1','46','0'],['63615','-23.573301','-46.645943','First Class Offices','1','46','0'],['63619','-23.568939','-46.646477','José Martins Borges','1','46','0'],['10926','-23.579035','-46.675781','Edifício Barros Loureiro','1','45','0'],['63622','-23.577032','-46.642914','Majestic Offices','1','43','0'],['10916','-23.631145','-46.708378','Birmann 10','1','42','0'],['63693','-23.572426','-46.642265','Paulista Park','1','42','0'],['63695','-23.572281','-46.650059','Saint Mary Office Center','1','42','0'],['63612','-23.570314','-46.646141','Dom Pedro I de Alcântara','1','42','0'],['69812','-23.588516','-46.682503','Faria Lima Square','1','42','0'],['63629','-23.567499','-46.648724','Regina','1','40','0'],['10915','-23.627636','-46.710686','Birmann 8','1','39','0'],['104887','-23.650368','-46.729897','CENESP A','1','39','0'],['104888','-23.648800','-46.730717','CENESP C','1','39','0'],['104889','-23.648298','-46.729649','CENESP D','1','39','0'],['104892','-23.649832','-46.730850','CENESP B','1','39','0'],['104891','-23.648731','-46.728844','CENESP E','1','39','0'],['104890','-23.649807','-46.728958','CENESP F','1','39','0'],['63613','-23.570436','-46.646851','Equifax','1','35','0'],['95229','-23.600878','-46.694576','Edifício Igarassu','1','93','0']]

`

const highRises = JSON.parse(buildingsStr.replace(/'/g, '"'))

d3.range(1, 12).forEach(n => {

	if(true) { drawMap(n, meta[n-1], highRises) }
	//if([7,9, 10, 11].includes(n)) { drawMap(n, meta[n-1], highRises) }

})

// var items = $('.sp-container').childNodes;
// var itemsArr = [];
// for (var i in items) {
//     if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
//         itemsArr.push(items[i]);
//     }
// }

// console.log(itemsArr)

// $('.sp-container').appendChild(itemsArr[1]);
// $('.sp-container').appendChild(itemsArr[2]);
// $('.sp-container').appendChild(itemsArr[3]);
// $('.sp-container').appendChild(itemsArr[0]);