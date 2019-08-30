const fs = require('fs');
const chalk = require('chalk');
const tplJson = require(`${__dirname}/../template.json`);

module.exports = function() {
	Object.keys(tplJson).forEach((item) => {
		let tplData = tplJson[item];
		console.log('  ' + 
			chalk.yellow('★') + 
			'  ' + chalk.yellow(tplData.name) + 
			' - ' + tplData.description + 
            ' - ' + chalk.red(`模板安装包 ${tplData.repo}`)
        );
	})
}

