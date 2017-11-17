import sync from 'csv-parse/lib/sync'
import fs from 'fs'



const data = sync(fs.readFileSync('./src/server/data.csv'))
const fc = JSON.parse(fs.readFileSync('./src/server/sao_paulo.json'))

const tidied = data.slice(1)
	.map(row => {

		return [ row[0], row[1], row[4], row[7], row[10],
		row[13], row[16], row[19], row[22], row[25], row[28], row[31], row[34], row[37] ]

	})

const diac = str => {
    var diacritics = [
        [/[\300-\306]/g, 'A'],
        [/[\340-\346]/g, 'a'],
        [/[\310-\313]/g, 'E'],
        [/[\350-\353]/g, 'e'],
        [/[\314-\317]/g, 'I'],
        [/[\354-\357]/g, 'i'],
        [/[\322-\330]/g, 'O'],
        [/[\362-\370]/g, 'o'],
        [/[\331-\334]/g, 'U'],
        [/[\371-\374]/g, 'u'],
        [/[\321]/g, 'N'],
        [/[\361]/g, 'n'],
        [/[\307]/g, 'C'],
        [/[\347]/g, 'c'],
    ];
    var s = str;
    for (var i = 0; i < diacritics.length; i++) {
        s = s.replace(diacritics[i][0], diacritics[i][1]);
    }
    return s;

}

let out = {}

fc.features.forEach(f => {

	const name = f.properties.NOME_DIST
	const simplified = f.properties.NOME_DIST.replace(/\s/g, '')
		.toLowerCase()
			.replace('jd', 'jardim')
			.replace('cid', 'cidade')

	const m = tidied.find(row => {
		const a = diac(row[0].replace(/\s/g, '')
		.toLowerCase())
		return a === simplified

	})

	Object.assign(out, { [ name ] : m })

})

fs.writeFileSync('./src/assets/map_data.json', JSON.stringify(out))