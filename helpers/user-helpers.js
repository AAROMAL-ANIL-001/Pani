var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const fast2sms = require("fast-two-sms");
const { response } = require("../app");
const Razorpay =require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_KeIppwor5rnfHK',
  key_secret: 'n6pADyjpXKzs7DSL6lB8CHx1',
});
module.exports = { 
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      console.log("pooo", userData.Password);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData={
          Name:userData.Name,
          Email:userData.Email,
          Password:userData.Password,
          Phone:userData.Phone,
          Access:true

        })
        .then((data) => {
          resolve(data.insertedId._id);
          // console.log(data)
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  obj: {
    OTP: 1,   
  },
  sendMessage: (Phone) => {
    let randomOTP = Math.floor(Math.random() * 10000);
    const options = {
      authorization:
        "5DtgLcYUqJ8xM3CjQuTXeB9wniHadK7Fm0l1hprWysNI4oE2SAl5qy1LGpcXIQ7NPjsJhaOnD3fgRtTx",
      sender_id: "INFINITY",
      message: `Your OTP for INFINITY login is ${randomOTP}`,
      numbers: [Phone],
    };

    fast2sms
      .sendMessage(options)
      .then((response) => {
        console.log("OTP send successfully");
      })
      .catch((err) => {
        console.log("Some error happened");
      });
    return randomOTP;
  },
  loginOtp: (req, res) => {
    const mobile = req.session.mobile;
    const enteredOTP = req.body.OTP;
    const sentOTP = otpHelper.obj.OTP;
    console.log(enteredOTP, sentOTP);
    if (enteredOTP == sentOTP) {
      req.session.loggedIn = true;
      req.session.user = req.session.tempUser;
      req.session.tempUser = null;
      res.redirect("/");
    } else {
      const errMsg = "Enter a valid OTP";
      res.render("users/loginOTP", { mobile, errMsg });
    }
  },

  addToCart: (proId, userId) => {
    console.log("adtocart")
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1||proExist===0) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();  
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });

      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if(details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne({_id: objectId(details.cart)},
            {
              $pull: { products:{item:objectId(details.product)}},
            }
          )
          .then((response) => {
            resolve({removeProduct:true});
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
              $inc: { 'products.$.quantity':details.count },
            }
          )
          .then((response) => {
            console.log('mmmmmmmmmmmm');
            resolve(true);
          });
      }
    });
  }
  ,

  getTotalAmount:(userId)=>{
    return new Promise(async (resolve, reject) => {
      let totalAmount = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group:{
              _id:null,
              totalAmount:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}
            }
          }
        ])

        .toArray();
        try{
          console.log(totalAmount[0].totalAmount)
          resolve(totalAmount[0].totalAmount);
        }catch(err){
          resolve(0)
        }
        
      
    });
  },
  placeOrder:(order,products,total)=>{
      return new Promise((resolve,reject)=>{
         console.log(order,products,total);
         let status=order['payment-method']==='COD'?'placed':'pending'
         let orderObj={
          deliveryDetails:{
            mobile:order.mobile,
            address:order.address,
            pincode:order.pincode
            
          },
          userId:objectId(order.userId),
          paymentMethod:order['payment-method'],
          products:products,
          totalAmount:total,
          status:status,
          date:new Date().toLocaleDateString()
         }
         db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
          db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
          console.log("order id",response.insertedId._id);
          resolve(response.insertedId)
         })
      })
  },
  getCartProductList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
      try{
        resolve(cart.products)
      }catch(err){
         resolve(0)
      }
      
    })
  },
  getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(userId)
      let orders= await db.get().collection(collection.ORDER_COLLECTION)
      .find({userId:objectId(userId)}).toArray()
      console.log(orders)
      resolve(orders)
       
      
   })
 },
 getOrderProducts: (orderId) => {
  return new Promise(async (resolve, reject) => {
    let orderItems = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {

          $match: { _id: objectId(orderId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ])
      .toArray();
      console.log(orderItems);
    resolve(orderItems);
  });
},
generateRazorpay:(orderId,total)=>{
  return new Promise((resolve,reject)=>{
    var options = {
      amount: total*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: ""+orderId
    };
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err)
      }else{
      console.log("new order :",order);
      resolve(order)
    }
    });
  })
},
verifyPayment: (details) => {
  return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'n6pADyjpXKzs7DSL6lB8CHx1')
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
          resolve()
      } else {
          reject()
      }
  })
},
changePaymentStatus:(orderId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.ORDER_COLLECTION)
    .updateOne({_id:objectId(orderId)},
    {
      $set:{
        status:'placed' 
      }
    }).then(()=>{
      resolve()
    })
  })
},
removeCartProduct:(details)=>{
  console.log(details)
  return new Promise((resolve,reject)=>{
     db.get().collection(collection.CART_COLLECTION)
     .updateOne({_id:objectId(details.cart)},
     {
      $pull:{products:{item:objectId(details.product)}}
     }
     ).then((response)=>{
      resolve(response)
     })
  })
}
}
