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
		name: 'type',
		message: '选择仓库类型：\n 【1：gitlab】 \n 【2：github】\n?',
		validate: function(val) {
			if (!val) {
				return '仓库类型不能为空'
			}
			return true;
		}
	},
	{
		type: 'input',
		name: 'repo',
		message: '仓储地址格式：\n【1、gitlab格式：git@git.17usoft.com:xxx/xxx.git】\n【2、github格式：github:用户名/项目名，例如：github:username/projectname】\n',
		validate: function(val) {
			if (!val) {
				return '仓储地址不为空'
			}
			return true;
		}
	},
	{
		type: 'input',
		name: 'branch',
		message: '默认安装分支',
		validate: function(val) {
			if (!val) {
				return '分支不能为空'
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
		tplJson[data.name]['branch'] = data.branch;
		switch(data.type.toString()){
			case "1": tplJson[data.name]['type'] = "gitlab"; break;
			case "gitlab": tplJson[data.name]['type'] = "gitlab"; break;
			case "2": tplJson[data.name]['type'] = "github"; break;
			case "github": tplJson[data.name]['type'] = "github"; break;
		}
		fs.writeFile(tplPath, JSON.stringify(tplJson), 'utf-8', function(err, data) {
			if (err) {
				console.log('模板添加失败');
			} else{
                console.log('模板添加成功');
            }
		});
	});
};
