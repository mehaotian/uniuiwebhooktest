let http = require('http')
let axios = require('axios')
var createHandler = require('github-webhook-handler')

function run_cmd(cmd, args, callback) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = "";

	child.stdout.on('data', function(buffer) {
		resp += buffer.toString();
	});
	child.stdout.on('end', function() {
		callback(resp)
	});
}

function r(req, res) {
	let url =
		'https://oapi.dingtalk.com/robot/send?access_token=35294d1e06cf2e20e87d274b7d65b8aaac9cd2c4212263bb2e32657f4acd04c8'
	axios({
		method: 'post',
		url: url,
		data: {
			msgtype: "markdown",
			markdown: {
				title: "uni-ui 本周工作",
				text: `test`
			}
		}
	}).then(() => {
		res.end('success:' + JSON.stringify(req.body, null, 2))
	}).catch(err => {
		res.statusCode = 201
		res.end('success:' + err)
	});
}
const password = 'root'
module.exports = (req, res) => {
	var handler = createHandler({
		path: '/push',
		secret: 'root'
	})

	handler(req, res, function(err) {
		if (err) {
			res.statusCode = 404
			res.end('success:' + err)
		} else {
			r(req, res)
		}
	})
}
