const express = require('express');
var Router = express.Router();
const expressAsyncHandler = require ( 'express-async-handler');
const Order = require ( '../model/orderModel.js');
const User = require ( '../model/User.js');
const { requireAuth, checkUser, notReqAuthentication } = require('../middleware/authMiddleware')
const nodemailer = require ( 'nodemailer');
//var nodemailer = require('nodemailer');


Router.post('/',checkUser,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'smartSales4twin5@gmail.com',
        pass: 'smartSales',
      },
    });

    
    var mailOptions = {
      from: 'smartSales4twin5@gmail.com',
      to: user.email,
      subject: 'smart Sales Order',
      text:
        'Good morning im the app Smart Sales, i send this email for verifing your information' ,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

Router.get('/mine',checkUser,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

Router.get('/:id',requireAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

Router.put('/:id/pay',checkUser,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: 'Amazona <amazona@mg.yourdomain.com>',
                        to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


module.exports = Router;
