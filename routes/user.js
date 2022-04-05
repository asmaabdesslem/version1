var express = require('express');
var Router = express.Router();
const { requireAuth, checkUser, notReqAuthentication } = require('../middleware/authMiddleware')
const User = require('../model/User')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')

Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: "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"
  
    }
  }))

  Router.post('/reset-password',notReqAuthentication, (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err)
      }
      const token = buffer.toString("hex")
      User.findOne({ email: req.body.email })
        .then(user => {
          if (!user) {
            return res.status(422).json({ error: "User dont exists with that email" })
          }
          user.resetToken = token
          user.expireToken = Date.now() + 86400000
          user.save().then((result) => {
            transporter.sendMail({
              to: user.email,
              from: "ouhibi.azer@esprit.tn",
              subject: "password reset",
              html: `
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="http://localhost:3000/reset-password/${token}">link</a> to reset password</h5>
                    `
            })
            res.json({ message: "check your email" })
          })
  
        })
    })
  })
  
  Router.post('/new-password',notReqAuthentication, (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
      .then(user => {
        if (!user) {
          return res.status(422).json({ error: "Try again session expired" })
        }
        bcrypt.hash(newPassword, 12).then(hashedpassword => {
          user.password = hashedpassword
          user.resetToken = undefined
          user.expireToken = undefined
          user.save().then((saveduser) => {
            res.json({ message: "password updated success" })
          })
        })
      }).catch(err => {
        console.log(err)
      })
  })
  
  Router.put('/follow', checkUser, (req, res) => {
    
//   var verif 
//    User.findById(req.body.followId).then(result => {
//        if (!result) {
//         return res.status(422).json({ error: "invalid user" })

//        }
//        verif = result._id
//    })
    //create cnst verifID (find followID)
    User.findByIdAndUpdate(req.body.followId, {
      $push: { followers: req.user._id } }, {new: true}, (err, result) => {
      if (err) {
          
        return res.status(422).json({ error: err })
      }
      User.findByIdAndUpdate(req.user._id, {
        $push: { following: req.body.followId }
  
      }, { new: true }).then(result => {
        res.json("done")
        consol.log(verif)

      }).catch(err => {
        return res.status(422).json({ error: err })
      })
  
    }
    )
  })
  
  Router.put('/unfollow', checkUser, (req, res) => {
    
//     var verif 
//    User.findById(req.body.unfollowId).then(result => {
//        if (!result) {
//         return res.status(422).send({ error: "invalid user" })

//        }
//        verif = result._id
//    })
  
    User.findByIdAndUpdate(req.body.unfollowId, {
      $pull: { followers: req.user._id }
    }, {
      new: true
    }, (err, result) => {
      if (err) {
        return res.status(422).json({ error: err })
      }
      User.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.body.unfollowId }
  
      }, { new: true }).then(result => {
        res.json("done")
      }).catch(err => {
        return res.status(422).json({ error: err })
      })
  
    }
    )
  })

  Router.get("/search/:key",requireAuth,async (req,resp)=>{
    let data = await User.find(
        {
            "$or":[
                {firstName:{$regex:req.params.key}},
                {lastName:{$regex:req.params.key}},
                {email:{$regex:req.params.key}}

            ]
        }
    )
    resp.send(data);

})

  Router.put('/updatepic',checkUser,(req,res)=>{
  User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},
      (err,result)=>{
       if(err){
           return res.status(422).json({error:"pic canot post"})
       }
       res.json(result)
  })
})

  module.exports = Router;
