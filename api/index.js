let axios = require('axios')
let createHandler = require('github-webhook-handler')
let r = require('./build.js')
let urls = {
	// TODO 测试地址
	dd: 'https://oapi.dingtalk.com/robot/send?access_token=35294d1e06cf2e20e87d274b7d65b8aaac9cd2c4212263bb2e32657f4acd04c8'
	// TODO 正式地址
	// dd:'https://oapi.dingtalk.com/robot/send?access_token=88febddb5af072227b7e0de1f6a88f43d7aaed872523244102172facf9442899'
}
// 用户白名单
const userWhiteList = ['490272692@qq.com', 'tianjiaxing2016@outlook.com']

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
			res.json({
				msg: '成功',
				body: req.body,
				query: req.query,
				cookies: req.cookies,
			});
		}
	}).catch(err => {
		if (res) {
			res.statusCode = 201
			res.json({
				msg: '请求错误',
				body: req.body,
				query: req.query,
				cookies: req.cookies,
			});
		}
	});
}

function run(req, res) {
	var handler = createHandler({
		path: '/push',
		secret: 'test'
	})

	handler(req, res, function(err) {
		if (err) {
			res.statusCode = 404
			console.log(err);
			res.end('error:' + err)
		} else {
			const body = req.body
			res.json({
				msg: '没有请求',
				body: req.body,
				query: req.query,
				cookies: req.cookies,
			});
			console.log(req.body);
			return

			console.log(body);
			// let pusher = body.pusher && body.pusher.email || ''
			// if (userWhiteList.indexOf(pusher) !== -1) {
			// 	// send(req, res, '### 本周 Github Closed Issues:\n\n')
			// 	main(req, res, body)
			// } else {
			// 	res.statusCode = 404
			// 	// res.end('error:' + pusher + '没有权限')
			// 	res.json({
			// 		msg: '没有权限',
			// 		body: req.body,
			// 		query: req.query,
			// 		cookies: req.cookies,
			// 	});
			// }
		}
	})
}

function main(req, res, body) {
	let commits = body.commits

	let commit = commits.find(v => {
		let message = v.message.split(' ')
		if (message[0] === 'publish') return true
		return false
	})
	// let message = 'publish v1.3.5'

	let message = ''
	if (commit) {
		message = commit.message
	} else {
		res.json({
			msg: '非 publish 提交 ，不发送信息',
			body: req.body,
			query: req.query,
			cookies: req.cookies,
		});
	}

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
			send(req, res, content)
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
