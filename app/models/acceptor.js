
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


// 基金会受助人信息
var jkefRecordSchemaObject = {

    // 姓名
    name: String,

    // 高中
    highSchool: {
        name: String,
        category: String,
        admissionYear: Number
    },

    // 大学
    bachelorSchool: {
        name: String,
        major: String,
        admissionYear: Number
    },

    // 硕士
    masterSchool: {
        name: String,
        major: String,
        admissionYear: Number
    },

    // 博士
    doctorSchool: {
        name: String,
        major: String,
        admissionYear: Number
    },

    // 家庭住址
    homeAddress:String,

    // 联系电话
    phone:String,

    // 证件
    idCard: String,

    // 性别
    isMale: Boolean,

    // 记录
    records: [{
        _id: Schema.Types.ObjectId,
        date: Date,
        project:String,
        amount: Number,
        recommander: String,
        remark:String
    }]
};

var schema = new Schema(jkefRecordSchemaObject);
mongoose.model('Acceptor', schema);
var Acceptor = mongoose.model('Acceptor');

class AcceptorManager {
    constructor(options) {
        this.mgoptions = options;

    }

    list(cb) {
        Acceptor.find({}, cb);
    }

    upsert(acceptor, cb) {
        if(acceptor instanceof Acceptor){
            acceptor.save(cb);
        } else {
            cb('acceptor must be a instance of Acceptor model.');
        }
    }

    findById(id, cb) {
        Acceptor.findById(id, cb);
    }

    statByYear(cb) {
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
        }, cb);
    }

    remove(id, cb) {
        Acceptor.findByIdAndRemove(id, cb);
    }
}

module.exports = {
    AcceptorManager: AcceptorManager
}
