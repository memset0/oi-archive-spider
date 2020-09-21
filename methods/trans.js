const fs = require('fs');
const lodash = require('lodash');

const utils = require('../utils')

class Trans {
	async list() {
		const source = utils.readJsonFile(utils.path(`./${this.root}/problemlist.json`));
		return source.map(prob => {
			const data = utils.readJsonFile(utils.path(`./${this.root}/${prob.pid}/main.json`));
			return {
				title: prob.title,
				id: prob.pid,
				link: data.url,
			}
		})
	}

	async problem(problem) {
		let data = utils.readJsonFile(utils.path(`./${this.root}/${problem.id}/main.json`));
		let text = fs.readFileSync(utils.path(`./${this.root}/${problem.id}/description.md`)).toString();

		let rsp = {
			title: problem.title,
			time_limit: data.time,
			memory_limit: data.memory,
			url: data.url,
			statement: [],
		};

		text = '\n' + text + '\n';
		const title = ['', ...(text.match(/\n# [^\n]+\n/g) || [])];
		const content = text.split(/\n# [^\n]+\n/g);
		for (let i = 0; i < Math.min(title.length, content.length); i++) {
			if (!lodash.trim(content[i])) continue;
			rsp.statement.push({
				title: lodash.trim(title[i]).slice(2),
				format: data.description_type,
				require: ['katex'],
				content: content[i],
			});
		}

		return rsp;
	}

	constructor(root) {
		this.root = root
	}
}

module.exports = Trans