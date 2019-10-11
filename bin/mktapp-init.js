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
const co = require('co');
const prompt = require('co-prompt');

var cli = {

	params:{
		templateName:"",
		projectName:"",
	},

	init:function(){
		this.initProgram();
		if(program.args.length < 2){
			return program.help();
		}
		this.params.templateName = program.args[0];	//模板名称
		this.params.projectName = program.args[1];	//项目名称
		if(!this.checkArgs()){
			return;
		}
		this.initPrompt();
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
	checkArgs:function(){
		if (!tplJson[this.params.templateName]) {
			console.log(chalk.red(`template.json里没有${this.params.templateName}的模板信息，请添加！`));
			return false;
		}
		if (!this.params.projectName || this.params.projectName.indexOf('/') > -1) {
			console.log(chalk.red('请输入项目名名称'));
			return false;
		}
		return true;
	},

	/**
	 * 初始化提示消息
	 */
	initPrompt:function(){
		inquirer.prompt([
			{ name: 'description', message: '请输入项目描述' },
			{ name: 'author', message: '请输入作者名称' }
		]).then((answers) => {
			console.log(chalk.yellow(`使用模板${this.params.templateName}创建项目`));
			const spinner = ora('正在下载模板...');
			spinner.start(); //开始下载
			switch(tplJson[this.params.templateName].type){
				case "github":
					this.downloadGithub(answers,spinner);
					break;
				case "gitlab":
					this.downloadGitlab(answers,spinner);
					break;
				default:
					console.log(symbols.error,chalk.red('\n 模板类型无效，请您重新编辑模板~ \n'));
					break;
			}
		});
	},
	
	/**
	 * github 下载
	 */
	downloadGithub:function(answers,spinner){
		download(tplJson[this.params.templateName].repo, this.params.projectName, (err) => {
			if(err){
				spinner.fail(); //下载失败调用
				console.log(symbols.error,chalk.red('\n 项目初始化失败 \n'));
				console.log(symbols.error, chalk.red(err));
			}else{
				spinner.succeed(); //下载成功调用
				this.setPackageJsonFile(answers);
				console.log(symbols.success, chalk.green('项目初始化完成'));
			}
		});
	},

	/**
	 * gitlab 下载
	 */
	downloadGitlab(answers,spinner){
		let gitlabUrl =  tplJson[this.params.templateName].repo;
		let branch = tplJson[this.params.templateName].branch;
		if (!gitlabUrl && !branch) {
			halk.red('\n 没有配置项目地址 或 分支信息 \n')
			return;
		}
		let cmdStr = `git clone ${gitlabUrl} ${this.params.projectName} && cd ${this.params.projectName} && git checkout ${branch}`

		exec(cmdStr, (error, stdout, stderr) => {
			if (error) {
				spinner.fail(); //下载失败调用
				console.log(symbols.error,chalk.red('\n 项目初始化失败 \n'));
				console.log(symbols.error,chalk.red(error));
				process.exit();
			} else {
				spinner.succeed(); //下载成功调用
				this.setPackageJsonFile(answers);
				console.log(symbols.success, chalk.green('项目初始化完成'));
				process.exit();
			}
		})
	},

	/**
	 * 设置package.json文件
	 */
	setPackageJsonFile(answers){
		let filePath = "";
		switch(this.params.templateName){	//特殊处理
			case "webHorse":
				filePath = "/web-horse";
				break;
		}
		const file = `${this.params.projectName}${filePath}/package.json`;
		const meta = {
			name:this.params.projectName || "app_horse_vue",
			description: answers.description || "初始化框架",
			author: answers.author ||'wenshu.zhang(1201500)'
		};
		if(fs.existsSync(file)){
			const content = fs.readFileSync(file).toString();
			const result = handlebars.compile(content)(meta);
			fs.writeFileSync(file, result);
		}
	}

};

cli.init();