/*
微信企业号接口
*/

var express = require('express'),
    router = express.Router();

var wxent = require('wechat-enterprise');

var mongoose = require('mongoose'),
    Acceptor = mongoose.model('Acceptor');



var wxcfg = {
    token: '',
    encodingAESKey: '6S',
    corpId: 'wxa2',
    secret: 'EOn_fiuZH',
    agentId: 1
};


/*
 微信事件消息处理程序。
    - 返回 function(msg, req, res, next)
        - 接收到正确消息时，返回消息处理结果；
        - 接收到不能处理的消息时，返回“正在建设中”提示
        - 出错时返回错误提示
    - 参数 eventHandlers
    {
        key: function (msg, req, res, next) {
            // 消息处理代码
        }
    }

*/
var handleEvent = function (eventHandlers) {
    return function (msg, req, res, next) {
        try {
            if (eventHandlers[msg.EventKey]) {
                eventHandlers[msg.EventKey](msg, req, res, next);
            } else {
                res.reply('正在建设中：' + msg.EventKey);
            }
        } catch(err){
            res.reply('出现错误，请截图并与管理员联系。\n错误信息：' + err.toString());
        }
    }
};

var handleText = function (textHandlers, sessionName) {
    return function (msg, req, res, next) {
        try {
            if (req.wxsession[sessionName]) {
                textHandlers[req.wxsession[sessionName]](msg, req, res, next);
            } else {
                res.reply('正在建设中~');
            }
        } catch(err){
            res.reply('出现错误，请截图并与管理员联系。\n错误信息：' + err.toString());
        }
    };
};


var EventHandlers = {
    /* 按年进行统计 */
	'stat_by_year': function (msg, req, res, next) {
        Acceptor.mapReduce({
            map: function () {
                if(this.records){
                    this.records.forEach(function (record) {
                        emit({ year: record.date.getYear() + 1900 }, {
                            amount: record.amount,
                            count: 1
                        });
                    });
                }
            },
            reduce: function (key, values) {
                var sum = 0, count = 0;
                values.forEach(function (val) {
                    sum += val.amount;
                    count += val.count;
                });
                return {
                    amount: sum,
                    count: count
                };
            }}, function (err, result) {
                if(err){
                    res.reply('出错了：' + err);
                    return;
                }
                if(result.length === 0){
                    res.reply('暂时还没有记录。');
                    return;
                }
                var str = ['基金会各年份捐赠记录：'];
                result.sort(function (a, b) {
                    return a._id - b._id;
                });
                var sum = 0, count = 0;
                result.forEach(function (record) {
                    var item = record._id.year + ' 年，';
                    item += '共奖励或资助 ' + record.value.count + ' 个个人或团体，';
                    item += '共计 ' + record.value.amount/1000 + ' 元人民币';
                    str.push(item);
                    sum += record.value.amount;
                    count += record.value.count;
                });
                str.push('历年来共计奖励或资助 '  + count + ' 个个人或团体，共计 ' + sum/1000 + ' 元人民币。');
                res.reply(str.join('\n\n'));
            });
	},
    'stat_by_project': function (msg, req, res, next) {
        Acceptor.mapReduce({
            map: function () {
                if(this.records){
                    this.records.forEach(function (record) {
                        emit({ project: record.project }, {
                            amount: record.amount,
                            count: 1
                        });
                    });
                }
            },
            reduce: function (key, values) {
                var sum = 0, count = 0;
                values.forEach(function (val) {
                    sum += val.amount;
                    count += val.count;
                });
                return {
                    amount: sum,
                    count: count
                };
            }}, function (err, result) {
                if(err) throw err;
                if(result.length === 0){
                    res.reply('暂时还没有记录。');
                    return;
                }
                var str = ['基金会各项目捐赠情况统计：'];
                var sum = 0, count = 0;
                result.forEach(function (record) {
                    var item = '"' + record._id.project + '"项目，';
                    item += '共奖励或资助 ' + record.value.count + ' 个个人或团体，';
                    item += '共计 ' + record.value.amount/1000 + ' 元人民币';
                    str.push(item);
                    sum += record.value.amount;
                    count += record.value.count;
                });
                str.push('历年来共计奖励或资助 '  + count + ' 个个人或团体，共计 ' + sum/1000 + ' 元人民币。');
                res.reply(str.join('\n\n'));
            });
    }
};

var TextProcessHandlers = {
};

module.exports = function (app) {
    app.use(express.query());
    app.use('/wx', router);

    router.use('/', wxent(wxcfg, wxent.event(handleEvent(EventHandlers))));
};