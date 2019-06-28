/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId();
const expect = require('chai').expect;
const threadSchema = require("../models/thread");
const Reply = require("../models/reply");
const bcrypt = require('bcrypt');
mongoose.connect(process.env.DB, { useNewUrlParser: true })

mongoose.set('useFindAndModify', false);

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    
    .post((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {text, delete_password} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      return bcrypt
        .hash(delete_password, 12)
        .then(hashedPassword => {
          const newThread = new Thread({text, reported: false, delete_password: hashedPassword, replies: []})
          newThread.save().then(result => {
            res.redirect(`/b/${board}/`)
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })
  
    .get((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const Thread = mongoose.model(board, threadSchema, board);
      Thread.find({}).sort({_id: -1}).limit(10).then(threads => {
        const result = threads.map(thread => {
          return {
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies,
            replycount: thread.replies.length
          }
        })
        res.json(result);
      })
    })
  
    .delete((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {thread_id, delete_password} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      Thread.findById({_id: thread_id}).then(thread => {
        bcrypt
        .compare(delete_password, thread.delete_password)
        .then(match => {
          if(match) {
            return Thread.deleteOne({ _id: thread_id });
          } else {
            res.send("incorrect password");
          }
          
        }).then(result => res.send("success")
         ).catch(err => console.log(err))
      })
    })
  
    .put((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {thread_id} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      console.log(thread_id, req)
      Thread.findOneAndUpdate({ "_id": thread_id },{ "$set": {"reported": true}}).then(result => {
        res.send("success")
      }).catch(err => console.log(err))
    });
    
  app.route('/api/replies/:board')
  
    .post((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {thread_id, text, delete_password} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      
      return bcrypt
        .hash(delete_password, 12)
        .then(hashedPassword => {
        Thread.findOne({_id: thread_id}).then(thread => {
          const newReply = new Reply({text, delete_password: hashedPassword, reported: false})
          const replies = thread.replies;
          replies.push(newReply);
          thread.replies = replies;
          thread.save().then(result => {
            res.redirect(`/b/${board}/${thread_id}/`)
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      })
    })
  
    .get((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const Thread = mongoose.model(board, threadSchema, board);
      const _id = req.query.thread_id;
      Thread.findOne({_id}).then(thread => {
        res.json({
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: thread.replies,
          replycount: thread.replies.length
        });
      })
    })
  
    .delete((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {thread_id, reply_id, delete_password} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      Thread.findById({_id: thread_id}).then(thread => {
        const reply = thread.replies.find(reply => {
          return reply._id.toString() === reply_id
        });
        
        bcrypt
        .compare(delete_password, reply.delete_password)
        .then(match => {
          if(match) {
            Thread.findOneAndUpdate({ "_id": thread_id, "replies._id": reply._id },{ "$set": {"replies.$.text": '[deleted]'}})
              .then(result => {
              res.send("success");
            }).catch(err => console.log(err));
          } else {
            res.send("incorrect password");
          }
        }).catch(err => console.log(err))
      })
    })
  
    .put((req, res) => {
      const board = req.params.board ? req.params.board.toLowerCase() : req.body.board.toLowerCase();
      const {thread_id, reply_id} = req.body;
      const Thread = mongoose.model(board, threadSchema, board);
      console.log(thread_id, reply_id);
      Thread.findOneAndUpdate({ "_id": thread_id, "replies._id": mongoose.Types.ObjectId(reply_id) },{ "$set": {"replies.$.reported": true}})
        .then(result => {
          console.log(result)
          res.send("success");
      }).catch(err => console.log(err))
    });

};
