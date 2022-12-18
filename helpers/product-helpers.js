var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
       console.log(product)
       db.get().collection('product').insertOne(product={
        Name:product.Name,
        Category:product.Category,
        Price:product.Price,
        Description:product.Description,
        Stock:product.Stock,
        Available:true
       }).then((data)=>{
        console.log(data)
        callback(data.insertedId)
       })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Available:true}).sort({_id:-1}).toArray()
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
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Available:false
                }
            }).then((response)=>{
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
            }).catch((err)=>{
                reject(err)
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
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Men",Available:true}).toArray()
            resolve(products)
        })
    },
    getWomenProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Women",Available:true}).toArray()
            resolve(products)
        })
    },
    getKidsProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Kids",Available:true}).toArray()
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
    shipOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"shipped"
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getSalesDetails:()=>{
        return new Promise(async(resolve,reject)=>{
          let products =await db.get().collection(collection.PRODUCT_COLLECTION)
            .find().toArray()
            resolve(products)
        })
    },



    addCategory:(categoryData)=>{
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
          }
        let category = capitalizeFirstLetter(categoryData.Category)
        return new Promise(async(resolve,reject)=>{
            let response={}
            let categoryExist = await db.get().collection(collection.CATEGORY_COLLECTION)
            .findOne({Category:category})
            if(categoryExist){
                console.log("category already exist")
                response.status=true
                resolve(response)
            }else{
             db.get().collection(collection.CATEGORY_COLLECTION)
            .insertOne(
                categoryData={
                    Category:category,
                    Description:categoryData.Description
                }
            ).then((data)=>{
                categoryData._id=data.insertedId
                resolve(categoryData)
            })
          }
        })
    },

    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION)
            .find().sort({_id:-1}).toArray()
            resolve(categories)
        })
    },

    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .deleteOne({_id:objectId(catId)}).then((response)=>{
                resolve(response)
            })
        })
    },

    getCategoryDetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category)
            })
        })
    },

    updateCategory:(catId,catDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:objectId(catId)},{
                $set:{
                    Category:catDetails.Category,
                    Description:catDetails.Description
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getCodCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{paymentMethod:"COD"}
                },
                {
                    $group:{_id:'$COD',count:{$sum:1}}
                },
                {

                    $project:{_id:0,count:1}
                }
            ]).toArray()
            resolve(totalCount[0].count)
        })
    },
    getOnlineCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{paymentMethod:"ONLINE"}
                },
                {
                    $group:{_id:'$ONLINE',count:{$sum:1}}
                },
                {

                    $project:{_id:0,count:1}
                }
            ]).toArray()
            console.log(totalCount[0].count)
            resolve(totalCount[0].count)
        })
    },
    getOrderCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:"$date", count:{$sum:1}}
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:5
                },
                {
                    $project:{_id:0,count:1}
                }

            ]).toArray()
            let count = [];
            let i;
            let n=orderCount.length
            for(i=0;i<n;i++){
             count[n-1-i]=orderCount[i].count
            }
            resolve(count)
        })
    },

    getOrderDate:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderDate = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:"$date", count:{$sum:1}}
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:5
                },
                {
                    $project:{_id:1,count:0}
                }
            ]).toArray()
            console.log(orderDate)
            let count = [];
            let i;
            let n=orderDate.length
            for(i=0;i<n;i++){
             count[n-1-i]=orderDate[i]._id
            }
            let obj={}
            for(i=0;i<count.length;i++){
                obj[i]=count[i]

            }
            console.log(obj)
            resolve(obj)
        })
    },
    addBanner: (banner) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.BANNER_COLLECTION)
            .insertOne({ name: banner.name })
            .then((data) => {
              resolve(data.insertedId);
            });
        });
      },
      getAllbanner:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray()
            resolve(banner)
        })
    },

deletebanner:(catId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.BANNER_COLLECTION)
        .deleteOne({_id:objectId(catId)}).then((response)=>{
            resolve(response)
        })
    })
},

deleteCoupon:(coupId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION)
        .deleteOne({_id:objectId(coupId)}).then((response)=>{
            resolve(response)
        })
    })
},

getCouponDetails:(coupId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION)
        .findOne({_id:objectId(coupId)}).then((coupon)=>{
            resolve(coupon)
        })
    })
},

editCouponDetails:(coupId,coupDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION)
        .updateOne({_id:objectId(coupId)},{
            $set:{
                name:coupDetails.name,
               date:coupDetails.date,
               minvalue:coupDetails.minvalue,
                Discount:coupDetails.Discount
            }
        }).then((response)=>{
            resolve()
        })
    })
},


}