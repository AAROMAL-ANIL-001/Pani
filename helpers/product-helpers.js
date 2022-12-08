var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
       console.log(product)
       db.get().collection('product').insertOne(product).then((data)=>{
        console.log(data)
        callback(data.insertedId)
       })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        console.log("fdfdf",proId);
        return new Promise(async(resolve,reject)=>{
           let products =await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
           console.log(products)
           resolve(products)
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getSingleProducts:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    Access:false
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    unBlockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    Access:true
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getMenProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Men"}).toArray()
            resolve(products)
        })
    },
    getWomenProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Women"}).toArray()
            resolve(products)
        })
    },
    getKidsProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Kids"}).toArray()
            resolve(products)
        })
    },
    addCoupon:(coupon,callback)=>{
        console.log(coupon)
        db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((data)=>{
            callback(data.insertedId)
    })
    },
    getCoupon:(couponDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).findOne({name:couponDetails.coupon})
            .then((getCoupon)=>{
                resolve(getCoupon)
        })
        })
    },
    getAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    cancelOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"cancelled" 
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    placeOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"placed"
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
}