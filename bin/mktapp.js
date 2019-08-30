#!/usr/bin/env node

const program = require('commander');
const packageInfo = require('../package.json');

program
    .version(packageInfo.version, '-v, --version')     //  显示版本号
    .usage('<command> [options]');

program
    .command('list')
    .description('显示所有模板')
    .action(require('../lib/temp-list'));

program
    .command('add')
    .description('添加模板')
    .action(require('../lib/temp-add'));

program
    .command('delete')
    .description('删除模板')
    .action(require('../lib/temp-delete'));

program
    .command('init', '使用模板生成项目');

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}