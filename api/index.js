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

function r() {
	let url =
		'https://oapi.dingtalk.com/robot/send?access_token=35294d1e06cf2e20e87d274b7d65b8aaac9cd2c4212263bb2e32657f4acd04c8'
	axios({
		method: 'post',
		url: url,
		data: {
			msgtype: "markdown",
			markdown: {
				title: " uni-ui 本周工作",
				text: `test`
			}
		}
	});
}

const password = 'root'
module.exports = (req, res) => {
	// if(req.headers['x-gitee-token'] === password) {
	//   console.log('密码正确 开始拉取代码');
	//   run_cmd('npm run build:release',{
	// 	  cwd: './'
	//   })
	//   res.statusCode = 200;
	//   res.end(JSON.stringify(req.body,null,2));
	// } else {
	//   res.statusCode = 200;
	//   res.end('???');
	// }

	var handler = createHandler({
		path: '/push',
		secret: 'root'
	})

	handler(req, res, function(err) {
		res.statusCode = 404
		res.end('no such location' + JSON.stringify(req.body,null,2))
	})

	handler.on('error', function(err) {
		console.error('Error:', err.message);
	})

	handler.on('push', function(event) {
		switch (event.payload.repository.name)
		{
			case 'githubHook':
				//this push event is from my persional github account, as SAP github.tool's github hook do not work, so I use this one to test push event
				console.log("reveive a push event from githubHook");
				run_cmd('sh', ['./webshop.sh'], function(text) {
					console.log(text)
				});
				break;
			case 'frontend-web':
				//push event from frontend-web
				console.log("reveive a push event from frontend-web");
				run_cmd('sh', ['./webshop.sh'], function(text) {
					console.log(text)
				});
				break;
			case 'backend-ms':
				//push event from backenf-ms
				console.log("reveive a push event from backend-ms");
				run_cmd('sh', ['./backend_ms.sh'], function(text) {
					console.log(text)
				});
				break;
		}
	})

	handler.on('issues', function(event) {
		r()
		// console.log('Received an issue event for %s action=%s: #%d %s',
		// 	event.payload.repository.name,
		// 	event.payload.action,
		// 	event.payload.issue.number,
		// 	event.payload.issue.title);
	})
}
