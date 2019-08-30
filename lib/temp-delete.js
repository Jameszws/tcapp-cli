const fs = require('fs');
const path = require('path');
const { prompt } = require('inquirer'); 
const tplPath = path.resolve(__dirname, '../template.json');
const tplJson = require(tplPath);

const questions = [
	{
		type: 'input',
		name: 'name',
		message: '要删除哪一个模板',
		validate: function(val) {
			if (tplJson[val]) {
				return true;
			} else if (!val) {
				return '名称不为空'
			} else if (!tplJson[val]){
				return '模板不存在';
			}		
		}
	}
];

module.exports = function() {
	prompt(questions).then(function(data) {
		delete tplJson[data.name];

		fs.writeFile(tplPath, JSON.stringify(tplJson), 'utf-8', function(err, data) {
			if (err) {
				console.log('模板删除失败');
			}else{
                console.log('模板删除成功');
            }
		});
	});
};