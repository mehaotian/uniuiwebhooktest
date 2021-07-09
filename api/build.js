let axios = require('axios')
let issueUrl = 'https://api.github.com/repos/dcloudio/uni-ui/issues'
let releaseUrl = 'https://raw.githubusercontent.com/dcloudio/uni-ui/master/uni_modules/uni-ui/changelog.md'

function getIssues(url, data) {
	return axios({
		method: 'get',
		url: issueUrl,
		params: {
			state: 'closed',
			per_page: 100,
			since: getWeek(),
			sort: 'closed'
		}
	})
}



function getRlease() {
	return axios({
		method: 'get',
		url: releaseUrl,
	})
}

function getWeek() {
	var time = (new Date).getTime() - 7 * 24 * 60 * 60 * 1000;
	var tragetTime = new Date(time);
	var month = tragetTime.getMonth();
	var day = tragetTime.getDate();
	tragetTime = tragetTime.getFullYear() + "-" + (tragetTime.getMonth() > 9 ? (tragetTime.getMonth() + 1) : "0" + (
		tragetTime.getMonth() + 1)) + "-" + (tragetTime.getDate() > 9 ? (tragetTime.getDate()) : "0" + (tragetTime
		.getDate()));
	console.log(tragetTime, '这是一周前日期，格式为2010-01-01')
	return tragetTime + ' 00:00:00';
}

module.exports = {
	getIssues,
	getRlease
}
