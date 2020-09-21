const fs = require('fs')
const path = require('path')
const process = require('process')

module.exports = {
	path(dir) {
		return path.join(process.env.OIARCHIVE_PATH, dir);
	},

	readJsonFile(dir) {
		return JSON.parse(fs.readFileSync(dir).toString());
	},
	writeJsonFile(dir, json) {
		return fs.writeFileSync(dir, JSON.stringify(json));
	},

	url: {
		concat(root, uri) {
			if (!uri) return null;
			if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
			if (root.endsWith('/')) root = root.slice(0, -1);
			if (uri.startsWith('/')) uri = uri.slice(1);
			return root + '/' + uri;
		}
	},
};