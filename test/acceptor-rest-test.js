// /* global process */
// /* global it */
// /* global describe */

// var should = require("should");
// var urllib = require('urllib');

// var base = 'http://localhost:18080/acceptors/';

// describe('Acceptros REST test', function () {

// 	it('url', function (done) {
// 		this.timeout(15000);
// 		urllib.request(base + 'url', {
// 			type: 'GET',
// 			data: {
// 				redirect_uri: 'http://hello.com'
// 			}
// 		}, function(err, data){
// 			should.not.exist(err);
// 			var c = JSON.parse(data.toString());
// 			c.ret.should.eql(0);
// 			should.ok(c.data);
// 			done();
// 		});
// 	});
// });