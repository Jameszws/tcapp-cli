const fs = require('fs');
const path = require('path');
const { prompt } = require('inquirer'); 
const tplPath = path.resolve(__dirname, '../template.json');
const tplJson = require(tplPath);

const questions = [
	{
		type: 'input',
		name: 'name',
		message: '模板名称',
		validate: function(val) {
			if (!val) {
				return '模板名称不为空'
			}
			return true;
		}
	},
	{
		type: 'input',
		name: 'description',
		message: '模板描述',
		validate: function(val) {
			if (!val) {
				return '模板描述不为空'
			}
            return true;
		}
	},
	{
		type: 'input',
		name: 'repo',
		message: '仓储地址【格式：github:用户名/项目名，例如：github:Jameszws/mkt-app】',
		validate: function(val) {
			if (!val) {
				return '仓储地址不为空'
			} 
			return true;
		}
	}
];

module.exports = function() {
	prompt(questions).then(function(data) {
		tplJson[data.name] = {};
		tplJson[data.name]['name'] = data.name;
		tplJson[data.name]['description'] = data.description;
		tplJson[data.name]['repo'] = data.repo;

		fs.writeFile(tplPath, JSON.stringify(tplJson), 'utf-8', function(err, data) {
			if (err) {
				console.log('模板添加失败');
			} else{
                console.log('模板添加成功');
            }
		});
	});
};