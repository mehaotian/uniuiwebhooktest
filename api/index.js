let axios = require('axios')
let createHandler = require('github-webhook-handler')
let r = require('./build.js')
let urls = {
	dd: 'https://oapi.dingtalk.com/robot/send?access_token=35294d1e06cf2e20e87d274b7d65b8aaac9cd2c4212263bb2e32657f4acd04c8'
}



const password = 'root'

function send(req, res, body) {
	axios({
		method: 'post',
		url: urls.dd,
		data: {
			msgtype: "markdown",
			markdown: {
				title: "uni-ui 本周工作",
				text: body
			}
		}
	}).then(() => {
		if (res) {
			res.end('success:' + JSON.stringify(req.body, null, 2))
		}
	}).catch(err => {
		if (res) {
			res.statusCode = 201
			res.end('success:' + err)
		}
	});
}

function run(req, res) {
	var handler = createHandler({
		path: '/push',
		secret: 'root'
	})

	handler(req, res, function(err) {
		if (err) {
			res.statusCode = 404
			res.end('success:' + err)
		} else {
			send(req, res, '### 本周 Github Closed Issues:\n\n')
		}
	})
}

function main() {

	let message = 'publish v1.3.5'
	r.getIssues().then(res => {
		let data = res.data
		let content = '### 本周 Github Closed Issues:\n\n'
		console.log(data);
		data.forEach(v => {
			content += `> - [uni-ui] Issue closed: [#${v.number} ${v.title}](${v.html_url})\n`
		})
		console.log(content);

		r.getRlease().then(res => {
			// console.log(res.data);
			let release = res.data
			message = message.split(' ')
			if (message[0] === 'publish') {
				let logContent = readChangelog(release)
				if (logContent.version === message[1]) {
					logContent.log = logContent.log.split('\n')
					console.log(logContent.log);
					let releaseMessage = '\n\n### 本周 uni-ui release 详情::\n\n'
					logContent.log.forEach(v => {
						releaseMessage += `> ${v}\n`
					})
					content += releaseMessage
				}
			}
			send(null, null, content)
		}).catch(err => {
			console.log(err);
		})
	})
}

function readVersions(str) {
	const versionRE = /##\s+([0-9\.]+).*/g
	const curVersionMatch = versionRE.exec(str)
	if (!curVersionMatch) {
		return []
	}
	const curVersion = {
		version: curVersionMatch[1].trim(),
		line: curVersionMatch[0],
	}
	const lastVersionMatch = versionRE.exec(str)
	if (!lastVersionMatch) {
		return [curVersion]
	}
	return [
		curVersion,
		{
			version: lastVersionMatch[1].trim(),
			line: lastVersionMatch[0],
		},
	]
}

function readChangelog(md) {
	const [curVersion, lastVersion] = readVersions(md)
	if (!curVersion) {
		return {
			version: '',
			log: '',
			loc: {
				start: 0,
				end: 0
			}
		}
	}
	const start = md.indexOf(curVersion.line)
	const curVersionIndex = start + curVersion.line.length
	const end = lastVersion ? md.indexOf(lastVersion.line) : md.length
	return {
		version: 'v' + curVersion.version,
		log: md.substring(curVersionIndex, end).trim(),
		loc: {
			start,
			end,
		},
	}
}


module.exports = run


// function r(req, res) {
// 	let url =
// 		'https://oapi.dingtalk.com/robot/send?access_token=35294d1e06cf2e20e87d274b7d65b8aaac9cd2c4212263bb2e32657f4acd04c8'
// 	axios({
// 		method: 'post',
// 		url: url,
// 		data: {
// 			msgtype: "markdown",
// 			markdown: {
// 				title: "uni-ui 本周工作",
// 				text: `test`
// 			}
// 		}
// 	}).then(() => {
// 		res.end('success:' + JSON.stringify(req.body, null, 2))
// 	}).catch(err => {
// 		res.statusCode = 201
// 		res.end('success:' + err)
// 	});
// }