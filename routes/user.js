var express = require("express");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const userController = require("../controllers/userController")
const fast2sms = require("fast-two-sms");
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/",userController.getHome);

router.get("/login", userController.getLogin);

router.get("/signup", userController.getSignup);

router.post("/signup", userController.postSignup);

router.get("/otp", userController.getOtp);

router.post("/otp", userController.postOtp);

router.post("/login", userController.postLogin);

router.get("/logout", userController.getLogout);

router.get("/cart", verifyLogin, userController.cart);

router.get("/add-to-cart/:id", userController.addToCart);

router.post('/change-product-quantity',userController.changeProductQuantity)

router.get('/checkout',verifyLogin,userController.getCheckout)

router.post('/checkout',userController.postCheckout)

router.get("/order-success",userController.orderSuccess)

router.get('/orders',userController.orders)

router.get('/view-order-products/:id',userController.viewOrderProducts)

router.post('/verify-payment',userController.verifyPayment)
 
router.get('/product-detail/:id', userController.productDetail) 

router.post('/remove-cart-product',userController.removeCartProduct)

router.post('/remove-wish-product' ,(req, res) => {
  userHelpers.removeWishProduct(req.body).then((response) => {
    res.json(response);
  });
}
)

router.get('/men',async function (req, res, next) {
  console.log("mennn");
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    console.log("Blablabla");
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getMenProducts().then((products) => {
    res.render("user/men", { products, user});
  });
}
)

router.get('/women',async function (req, res, next) {
  console.log("mennn");
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    console.log("Blablabla");
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getWomenProducts().then((products) => {
    res.render("user/women", { products, user});
  });
}
)

router.get('/kids',async function (req, res, next) {
  console.log("mennn");
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    console.log("Blablabla");
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getKidsProducts().then((products) => {
    res.render("user/kids", { products, user});
  });
}
)
router.get('/profile',async(req,res)=>{
  let user = req.session.user; 

  res.render('user/profile',{user})
})
router.post('/profile',(req,res)=>{
  
  userHelpers.editUserProfile(req.session.user._id,req.body).then((response)=>{
    console.log("completedd");
    req.session.user.Email=req.session.user.Email;
    req.session.user.Name=req.session.user.Name;
    req.session.user.Address=req.body.Address;
    req.session.user.State=req.body.State;
    req.session.user.Pincode=req.body.Pincode;
    req.session.user.Phone=req.body.Phone;

    res.redirect('/profile')
  })
})

router.get('/profileUpdate',(req,res)=>{
  
})

let discountAdded;
let coupon;

router.post('/coupon-check',async(req,res)=>{
  console.log("coupon checkinggg");
  console.log(req.body);
  const userId = req.body.userId
  let totalPrice = await userHelpers.getTotalAmount(userId)
    productHelpers.getCoupon(req.body)
        .then((findcoupon)=>{
          console.log("checking then findcoupon",findcoupon);


          if (findcoupon == null) {
            res.json({ code: true, errMsg: "Invalid Coupon" });
            // console.log("no coupon");
          } else if (findcoupon.user) {
            console.log("inside loop");
            let n = 0;
            for (couponUser of findcoupon.user) {
              if (couponUser == userId) {
                n++;
              }
            }
            if (n > 0) {
              res.json({ status: true, errMsg: "Coupon already used" });
            } else {
              coupon = findcoupon.name;
              let value = parseInt(findcoupon.minvalue);
              let discount = parseInt(findcoupon.Discount);
      
              if (totalPrice > value) {
                discountAdded = totalPrice - discount;
                res.json({ discountAdded, discount, errMsg: "Coupon Applied" });
                // console.log(discountAdded);
              } else {
                res.json({ value, errMsg: "Amount is Not Enough" });
                // console.log("coupon min value is",value );
              }
            }
          }else {
            coupon = findcoupon.name;
            let value = parseInt(findcoupon.minvalue);
            let discount = parseInt(findcoupon.Discount);
    
            if (totalPrice > value) {
              discountAdded = totalPrice - discount;
              res.json({ discountAdded, discount, errMsg: "Coupon Applied" });
              // console.log(discountAdded);
            } else {
              res.json({ value, errMsg: "Amount is Not Enough" });
              // console.log("coupon min value is",value );
            }
          }
        })
})

router.get('/add-to-wishlist/:id',verifyLogin,(req,res)=>{
  // userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {

  userHelpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
// })   
}) 
 
router.get('/wishlist',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getWishlistProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products)
  res.render('user/wishlist',{products,user:req.session.user,totalValue})
})

router.get('/delete-cart/:id',(req,res)=>{
  let proid=req.params.id
 console.log(proid);

 userHelpers.deleteWishQuantity(proid).then((response)=>{
 // productHelpers.deleteProduct(proid).then((response)=>{
   res.redirect('/wishlist')

 })
})

router.post("/delete-wish-quantity", (req, res, next) => {
  userHelpers.deleteWishQuantity(req.body).then(async (response) => {

   // response.total = await userHelpers.getTotalAmount(req.body.user_id);
    res.json(response);

  });
});

module.exports = router;
