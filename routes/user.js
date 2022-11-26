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
  
module.exports = router;
