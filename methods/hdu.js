const cheerio = require('cheerio')
const superagent = require('superagent-charset')(require('superagent'))

const utils = require('../utils')

class HDU {
	async list() {
		let problemlist = []
		let page = 1
		while (true) {
			const url = utils.url.concat(this.root, `/listproblem.php?vol=${page}`)
			const res = await this.agent.get(url).charset('gbk')
			const $ = cheerio.load(res.text)
			const source = $('.table_text tbody script').html();
			for (let cmd of source.match(/p\([^,]+?,[^,]+?,[^,]+?,[^,]+?,[^,]+?,[^,]+?\)/g)) {
				const { id, title } = cmd.match(/p\([^,]+?,(?<id>[^,]+?),[^,]+?,"(?<title>[^,]+?)",[^,]+?,[^,]+?\)/).groups
				problemlist.push({
					id, title,
					link: utils.url.concat(this.root, `/showproblem.php?pid=${id}`)
				})
			}
			let maxpage = parseInt($($('.footer_link font a:last-child').get(0)).text())
			if ((++page) > maxpage) break
		}
		return problemlist
	}

	async problem(problem) {
		const url = utils.url.concat(this.root, `/showproblem.php?pid=${problem.id}`)
		const res = await this.agent.get(url).charset('gbk')
		const $ = cheerio.load(res.text)
		const $panel_title = $('.panel_title')
		const $panel_content = $('.panel_content')
		const info = $('table font').text()

		let rsp = {
			title: problem.title,
			time_limit: parseInt(info.match(/Time Limit: \d+\/(\d+) MS/)[1]),
			memory_limit: parseInt(info.match(/Memory Limit: \d+\/(\d+) K/)[1]) / 1024,
			operation: {
				submit: utils.url.concat(this.root, `/submit.php?pid=${problem.id}`),
				submissions: utils.url.concat(this.root, `/status.php?first=&pid=${problem.id}&user=&lang=0&status=0`),
				statistics: utils.url.concat(this.root, `/statistic.php?pid=${problem.id}`),
				discussion: utils.url.concat(this.root, `/discuss/problem/list.php?problemid=${problem.id}`),
			},
			statement: [],
		}
		for (let i = 0; i < Math.min($panel_title.length, $panel_content.length); i++) {
			const title = $panel_title.eq(i).html().trim()
			const content = $panel_content.eq(i).html()
			if (!Object.keys(this.panel).includes(title)) {
				console.log(title)
				continue
			}
			rsp.statement.push({
				title,
				content,
				type: this.panel[title].type,
				format: this.panel[title].format || 'html',
				require: ['katex'],
			})
		}
		return rsp
	}

	constructor(root) {
		this.root = root
		this.agent = {
			get(url) {
				console.log('[hdu]', 'agent.get', url)
				return superagent.get(url)
			}
		}
		this.panel = {
			'Problem Description': { type: 'description' },
			Input: { type: 'input_format' },
			Output: { type: 'output_format' },
			'Sample Input': { type: 'example' },
			'Sample Output': { type: 'example' },
			Author: { type: 'source' },
			Source: { type: 'source' },
		}
	}
}

module.exports = HDU

if (require.main == module) (async function () {// for test
	const spider = new HDU('http://acm.hdu.edu.cn')
	const list = (await spider.list()).slice(0, 1)
	console.log(list)
	for (const problem of list) {
		console.log(await spider.problem(problem))
	}
})()