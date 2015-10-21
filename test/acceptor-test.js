require('../app/models/acceptor');

var should = require("should");

var mongoose = require('mongoose'),
	Acceptor = mongoose.model('Acceptor');

var url = 'mongodb://localhost/jkef';

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + url);
});

describe('Acceptor model test', function () {

	var one = null;

	it('创建受助者', function (done) {
		var acceptor = new Acceptor({
			name: 'test',
			phone: '1233'
		});
		acceptor.save(function (err) {
			should.not.exist(err);
			should.exist(acceptor._id);
			one = acceptor;
			done();
		});
	});

	it('添加受助信息', function (done) {
		one.highSchool = {
			name: '一中',
			category: '文科',
			admissionYear: 2015
		};
		one.records.push({
			date: new Date(),
			project: '奖学金',
			account: 1000*1000
		});
		one.save(function (err) {
			should.not.exist(err);
			done();
		});
	});

	it('根据Id查找受助者', function (done) {
		Acceptor.findById(one._id, function (err, acce) {
			acce.name.should.eql('test');
			done();
		});
	});

	it('分类型和年份计算捐助金额', function (done) {
		Acceptor.mapReduce({
			map: function () {
				if(this.records){
					this.records.forEach(function (record) {
						emit({ 
							project: record.project,
							year: record.date.getYear() + 1900
						}, {
							amount: record.amount,
							count: 1
						});
					});
				}
			},
			reduce: function (key, values) {
				return {
					amount: Array.sum(values),
					count: values.length
				};
			}
		}, function (err, result) {
			//result: [{"_id":{"project":"奖学金","year":2015},"value":2000000}]
			should.not.exist(err);
			result.length.should.above(0);
			done();
		});
	});
});