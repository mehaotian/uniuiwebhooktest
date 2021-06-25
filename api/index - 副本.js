let http = require('http')
var createHandler = require('github-webhook-handler')

module.exports = (req, res) => {
	const { name = 'api' } = req.query
	var handler = createHandler({
		path: '/push',
		secret: 'root'
	})
	
	handler(req, res, function(err) {
		res.statusCode = 404
		res.end('no such location' + err)
	})
	
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

	// http.createServer(function(req, res) {
	// 	console.log('启动成功')
	// 	// res.end('success')
	// 	handler(req, res, function(err) {
	// 		res.statusCode = 404
	// 		res.end('no such location' + err)
	// 	})
	// }).listen(8080)

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
		console.log('Received an issue event for %s action=%s: #%d %s',
			event.payload.repository.name,
			event.payload.action,
			event.payload.issue.number,
			event.payload.issue.title);
	})
}
