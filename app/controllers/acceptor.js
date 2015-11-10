/*
使用基于微信企业号的用户认证
*/


var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Acceptor = mongoose.model('Acceptor');
var moment = require('moment');
var AcceptorManager = require('../models/acceptor').AcceptorManager;


var ensureUserLogged = (req, res, next) => {
  var userId = req.signedCookies.userId;
  if(userId) next();
  else res.send({ret: -2, msg: 'you have to sign in first.'})
}

module.exports = function (app, config) {
  app.use('/acceptors', router);

  var AM = new AcceptorManager();

  // 获取全部受助人
  router.get('/list', ensureUserLogged, (req, res, next) => {
    AM.list((err, acceptors) => {
      if(err) res.send({ret: -1, msg: err});
      else res.send({ret: 0, data: acceptors});
    });
  });

  // 获取指定Id的受助人
  router.get('/:id', ensureUserLogged, (req, res, next) => {
    var id = req.params.id;
    if(id)
      AM.findById(id, (err, acc) => {
        if(err) res.send({ret: -1, msg: err});
        else res.send({ret: 0, data: acc});
      });
    else
      res.send({ret: -1, msg: 'bad id'});
  });

  // 新增受助者
  router.put('/', ensureUserLogged, (req, res, next) => {
    var name = req.body.name;
    if(!name) {
      res.send({ret: -1, msg: 'acceptor must have a name.'});
      return;
    }
    var acceptor = new Acceptor(req.body);
    AM.upsert(acceptor, (err) => {
      if(err) res.send({ret: -1, msg: err});
      else res.send({ret: 0, data: acceptor});
    });
  });

  router.post('/:id', ensureUserLogged, (req, res, next) => {
    var id = req.params.id;
    if(!id) {
      res.send({ret: -1, msg: 'bad id.'});
      return;
    }

    var name = req.body.name;
    if(!name) {
      res.send({ret: -1, msg: 'acceptor must have a name.'});
      return;
    }
    var acceptor = new Acceptor({
      _id: id,
      name: name,
      homeAddress: req.body.homeAddress,
      phone: req.body.phone,
      idCard: req.body.idCard,
      highSchool: req.body.highSchool,
      bachelorSchool: req.body.bachelorSchool,
      masterSchool: req.body.masterSchool,
      doctorSchool: req.body.doctorSchool,
      records: req.body.records
    });

    AM.upsert(acceptor, (err) => {
      if(err) res.send({ret: -1, msg: err});
      else res.send({ret: 0, data: acceptor});
    });
  });

  // 删除指定id的受助者
  router.delete('/:id', ensureUserLogged, (req, res, next) => {
    var id = req.params.id;
    if(id)
      AM.remove(id, (err) => {
        if(err) res.send({ret: -1, msg: err});
        else res.send({ret: 0, data: {}});
      });
    else
      res.send({ret: -1, msg: 'bad id.'});
  });

  // 为受助着添加记录
  router.put('/:id/records', ensureUserLogged, (req, res, next) => {
    var id = req.body.id;
    var record = {
      _id: new mongoose.Types.ObjectId,
      project : req.body.project,
      amount : parseFloat(req.body.amount),
      date : moment(req.body.date),
      recommander : req.body.recommander,
      remark : req.body.remark
    }
    
    if(!id || !record.date || !record.project || !record.amount)
      res.send({ret: -1, msg: 'date, project or amount must have a value'});
    AM.findById(id, (err, acc) => {
      if(err) res.send({ret: -1, msg: msg});
      else {
        acc.records.push(record);
        AM.upsert(acc, (err, result) => {
          if(err) res.send({ret: -1, msg: msg});
          else res.send({ret: 0, data: acc});
        });
      }
    });
  });

  // 删除受助者的受助记录
  router.delete('/:id/records/:rid', ensureUserLogged, (req, res, next) =>{
    var id = req.params.id;
    var rid = req.params.rid;
    AM.findById(id, (err, acc) => {
      if(err) res.send({ret: -1, msg: msg});
      else {
        acc.records = acc.records.filter((record) => {
          return record._id !== rid;
        });
        AM.upsert(acc, (err, result) => {
          if(err) res.send({ret: -1, msg: err});
          else res.send({ret: 0, data: acc});
        });
      }
    });
  });
};
