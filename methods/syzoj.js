const cheerio = require('cheerio');
const superagent = require('superagent');

const utils = require('../utils');

class LibreOJ {
	async list() {
		let url = utils.url.concat(this.root, '/problems');
		let problemlist = [];
		while (url) {
			console.log(url);
			const res = await superagent.get(url);
			let $ = cheerio.load(res.text);
			$('.main.container table tbody tr').each((_, element) => {
				let ch = $(element).children('td');
				let problem = {
					id: $(ch[0]).text(),
					title: $(ch[1]).children('a:first-child').text().trim(),
					link: utils.url.concat(this.root, $(ch[1]).children('a:first-child').attr('href')),
				};
				problemlist.push(problem);
			});
			url = utils.url.concat(this.root, $('.pagination a:last-child').attr('href'));
		}
		return problemlist;
	}

	async problem(problem) {
		const url = utils.url.concat(this.root, `/problem/${problem.id}/export`);
		console.log(url);
		const res = await superagent.get(url);
		const src = JSON.parse(res.text).obj;
		let rsp = {
			title: src.title,
			time_limit: src.time_limit,
			memory_limit: src.memory_limit,
			tags: src.tags,
			operation: {
				submit: utils.url.concat(this.root, `/problem/${problem.id}#submit_code`),
				submissions: utils.url.concat(this.root, `/submissions?problem_id=${problem.id}`),
				statistics: utils.url.concat(this.root, `/problem/${problem.id}/statistics/fastest`),
				testdata: utils.url.concat(this.root, `/problem/${problem.id}/testdata`),
				discussion: utils.url.concat(this.root, `/discussion/problem/${problem.id}`),
			},
			statement: [],
		};
		if (src.description) {
			rsp.statement.push({
				title: '题目描述',
				type: 'description',
				format: 'markdown',
				require: ['katex'],
				content: src.description,
			});
		}
		if (src.input_format) {
			rsp.statement.push({
				title: '输入格式',
				type: 'input_format',
				format: 'markdown',
				require: ['katex'],
				content: src.input_format,
			});
		}
		if (src.output_format) {
			rsp.statement.push({
				title: '输出格式',
				type: 'output_format',
				format: 'markdown',
				require: ['katex'],
				content: src.output_format,
			});
		}
		if (src.example) {
			rsp.statement.push({
				title: '样例',
				type: 'example',
				format: 'markdown',
				require: ['katex'],
				content: src.example,
			});
		}
		if (src.limit_and_hint) {
			rsp.statement.push({
				title: '数据范围与提示',
				type: 'limit_and_hint',
				format: 'markdown',
				require: ['katex'],
				content: src.limit_and_hint,
			});
		}
		return rsp;
	}

	constructor(root) {
		this.root = root;
	}
};

module.exports = LibreOJ;

if (require.main == module) (async function () {// for test
	const spider = new LibreOJ('https://loj.ac');
	const list = (await spider.list()).slice(0, 10);
	console.log(list);
	for (const problem of list) {
		console.log(await spider.problem(problem));
	}
})();