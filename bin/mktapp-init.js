#!/usr/bin/env node

const program = require('commander');
const symbols = require('log-symbols');
const download = require('download-git-repo');
const fs = require('fs');
const handlebars = require('handlebars');
const chalk = require('chalk');
const path = require('path');
const exec = require('child_process').exec;
const ora = require('ora');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const Metalsmith = require('metalsmith')
const tplPath = path.resolve(__dirname, '../template.json');
const tplJson = require(tplPath);

var cli = {

	init:function(){
		this.initProgram();
		if(program.args.length < 2){
			return program.help();
		}
		const template = program.args[0];
		const dir = program.args[1];
		if(!this.checkArgs(template,dir)){
			return;
		}
		this.initPrompt(dir,template);
		//this.downLoadTemplate(template,dir);
	},

	initProgram:function(){
		program.usage('<template-name> [project-name]');
		program.on('--help', function () {
			console.log('  Examples:')
			console.log()
			console.log(chalk.yellow('    # 使用npm模板创建'))
			console.log('    $ mktapp init <template-name> <my-project>')
			console.log('    $ mktapp init webApp <my-project>')
			console.log()
		});
		program.parse(process.argv);
	},

	/**
	 * 检查参数
	 */
	checkArgs:function(template,dir){
		if (!tplJson[template]) {
			console.log(chalk.red(`template.json里没有${template}的模板信息，请添加！`));
			return false;
		}
		if (!dir || dir.indexOf('/') > -1) {
			console.log(chalk.red('请输入项目名名称'));
			return false;
		}
		return true;
	},

	/**
	 * 下载模板
	 */
	downLoadTemplate:function(template,dir){
		console.log(chalk.yellow(`使用模板${template}创建项目`));
		const spinner = ora('正在下载模板');
		spinner.start();
		exec(`npm i ${tplJson[template].npm}`, (err, data) => {
			spinner.stop();
			process.on('exit', () => {
				rm(`${process.cwd()}/node_modules`)
			})
			if (err) {
				console.log(chalk.red('模板下载失败 ', err.message));
			}
			//const tplPath = `${process.cwd()}/node_modules/${tplJson[template].npm}`;
			const projectPath = `${process.cwd()}/${dir}`;
			Metalsmith(process.cwd())
				.source('.')
				.destination(`${projectPath}`)
				.build(function(err) {
					if (err) {
						console.log(chalk.red('项目生成失败', err));
					} else {
						console.log(chalk.yellow(' \n 项目已创建'));
					}
				}
			);
		});
	},

	/**
	 * 初始化提示消息
	 */
	initPrompt:function(name,template){
		inquirer.prompt([
			{ name: 'description', message: '请输入项目描述' },
			{ name: 'author', message: '请输入作者名称' }
		]).then((answers) => {
			console.log(chalk.yellow(`使用模板${template}创建项目`));
			const spinner = ora('正在下载模板...');
			spinner.start(); //开始下载
			this.downloadFramework(name,answers,spinner,template);
		});
	},
	
	/**
	 * 下载框架
	 */
 	downloadFramework:function(name,answers,spinner,template){
		download(tplJson[template].repo, name, (err) => {
			if(err){
				spinner.fail(); //下载失败调用
				console.log(symbols.error, chalk.red(err));
			}else{
				spinner.succeed(); //下载成功调用
				const fileName = `${name}/package.json`;
				const meta = {
					name,
					description: answers.description,
					author: answers.author
				};
				if(fs.existsSync(fileName)){
					const content = fs.readFileSync(fileName).toString();
					const result = handlebars.compile(content)(meta);
					fs.writeFileSync(fileName, result);
				}
				console.log(symbols.success, chalk.green('项目初始化完成'));
			}
		});
	}

};

cli.init();