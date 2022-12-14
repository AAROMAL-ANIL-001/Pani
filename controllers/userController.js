const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");

module.exports = {
  productDetail: (req, res) => {
    const id = req.params;
    console.log(id);
   
    productHelpers.getSingleProducts(id).then((product) => {
      console.log("ajshdgj");
      console.log(product);
      res.render("user/product-detail", { product,layout:"layout" });

    }).catch(()=>{
      res.render("error",{layout:false})
    })
  },
  removeCartProduct: (req, res) => {
    userHelpers.removeCartProduct(req.body).then((response) => {
      res.json(response);
    });
  },
  verifyPayment: (req, res) => {
    console.log("lilululu");
    console.log(req.body);
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          console.log("Payment Success");
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
  },
  viewOrderProducts: async (req, res) => {
    let products = await userHelpers.getOrderProducts(req.params.id);
    console.log(products);
    res.render("user/view-order-products", {
      user: req.session.user,
      products,
    });
  },
  orders: async (req, res) => {
    let orders = await userHelpers.getUserOrders(req.session.user._id);
    res.render("user/orders", { user: req.session.user, orders });
  },
  orderSuccess: (req, res) => {
    res.render("user/order-success", { user: req.session.user, layout: false });
  },
  postCheckout: async (req, res) => {
    let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }

      // })
      // console.log(req.body)
    });
  },
  getCheckout: async (req, res) => {
    console.log("checkout");
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    console.log(total);
    res.render("user/checkout", { total, cartCount, user: req.session.user });
  },
  changeProductQuantity: (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      let total = await userHelpers.getTotalAmount(req.body.user);
      console.log(total);
      res.json({ response, total });
    });
  },
  addToCart: (req, res) => {
    console.log("api-call");
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
      // res.redirect("/")
    });
  },
  cart: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let totalValue = 0;
    if (products.length > 0) {
      totalValue = await userHelpers.getTotalAmount(req.session.user._id);
    }
    let users = req.session.user;

    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    const userId = users._id;
    let banner = await productHelpers.getAllbanner(req.session.user._id);
    res.render("user/cart", { user:req.session.user, products, userId, totalValue, cartCount,banner });
  },
  getLogout: (req, res) => {
    req.session.user = null;

    req.session.userLoggedIn = false;
    res.redirect("/");
  },
  postLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (!response.status) {
        req.session.loginErr = "Invalid entries";
        res.redirect("/login");
      } else if (!response.user.Access) {
        req.session.Accesserr = "You are BLOCKED";
        res.redirect("/login");
      } else {
        req.session.userLoggedIn = true;
        req.session.user = response.user;

        res.redirect("/");
      }
    });
  },
  postOtp: (req, res) => {
    console.log("optt" + req.body.otp == userHelpers.obj.OTP);
    if (req.body.otp == userHelpers.obj.OTP) {
      res.redirect("/login");
    } else {
      res.render("user/otperror");
    }
  },
  getOtp: (req, res) => {
    res.render("user/otp", { layout: false });
  },
  postSignup: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      console.log(response);

      req.session.user = response;
      req.session.userLoggedIn = true;
      // res.redirect('/')
      userHelpers.obj.OTP = userHelpers.sendMessage(req.body.Phone);
      console.log(userHelpers.obj.OTP);
      console.log("hi");
      res.redirect("/otp");
    });
  },
  getSignup: (req, res) => {
    res.render("user/signup");
  },
  getLogin: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("user/login", {
        loginErr: req.session.loginErr,
        Accesserr: req.session.Accesserr,
      });
      req.session.loginErr = false;
      req.session.Accesserr = false;
    }
  },
  getHome: async function (req, res, next) {
    console.log("Blablabla");
    let user = req.session.user;
    console.log(user);
    let cartCount = null;
    if (req.session.user) {
      console.log("Blablabla");
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }

    productHelpers.getAllProducts().then((products) => {
      res.render("user/view-products", { products, user, cartCount });
    });
  },
};
