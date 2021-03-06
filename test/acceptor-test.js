var AcceptorManager = require('../app/models/acceptor').AcceptorManager;

var should = require("should");

var mongoose = require('mongoose'),
	Acceptor = mongoose.model('Acceptor');

var url = 'mongodb://localhost/jkef';

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var am = new AcceptorManager();

describe('Acceptor model test', function () {

	var one = null;

	it('创建受助者', function (done) {
		var acceptor = new Acceptor({
			name: 'test',
			phone: '1233'
		});

		am.upsert(acceptor, (err) => {
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
		am.upsert(one, (err) => {
			should.not.exist(err);
			done();
		})
	});

	it('根据Id查找受助者', function (done) {
		am.findById(one._id, (err, acce) => {
			acce.name.should.eql('test');
			done();
		});
	});

	it('列出全部受助者', function (done) {
		am.list((err, as) => {
			should.not.exist(err);
			as.length.should.above(0);
			done();
		});
	})

	it('分类型和年份计算捐助金额', function (done) {
		am.statByYear((err, result) => {
			should.not.exist(err);
			result.length.should.above(0);
			done();
		})
	});
});