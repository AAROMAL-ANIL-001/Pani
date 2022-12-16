var express = require("express");
const productHelpers = require("../helpers/product-helpers");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  // productHelpers.getAllProducts().then((products) => {
  res.render("admin/login",{layout:false});
  // });

});
router.get('/demo',(req,res)=>{
  res.render('admin/demo',
  {
    admin:true,
    layout:"layout1"
  }
  )
})
router.get("/products", function (req, res, next) {
  if (req.session.admin) {
    productHelpers.getAllProducts().then((products) => {
      res.render("admin/view-products.hbs", {
        admin: true,
        products,
        layout: "layout1",
      });
    });
  } else {
    res.redirect("/admin");
  }
});

router.post("/", (req, res) => {
  if (req.body.username == "admin" && req.body.password == "123") {
    req.session.admin = true;
    res.redirect("admin/products");
  } else {
    res.redirect("/admin");
  }
});
router.get("/admin_logout", (req, res) => {
  req.session.admin = false;
  res.redirect("/admin");
});

router.get("/adminlogout", (req, res) => {
  req.session.admin = false;
  res.redirect("/adminlog");
});

router.get("/users", function (req, res, next) {
  productHelpers.getAllUsers().then((users) => {
    res.render("admin/view-users.hbs", {
      admin: true,
      users,
      layout: "layout1",
    });
  });
});

router.get("/orders", function (req, res, next) {
  productHelpers.getAllOrders().then((orders) => {
    res.render("admin/orders.hbs", {
      admin: true,
      orders,
      layout: "layout1",
    });
  });
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product", { admin: true, layout: "layout1" });
});
router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product", { layout: "layout1" });
      } else {
        console.log(err);
        res.render("admin/add-product", { layout: "layout1" });
      }
    });
  });
});
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/products");
  });
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product, admin:true, layout: "layout1" });
});
router.post("/edit-product/:id", (req, res) => {
  console.log(req.params.id);
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    try {
      if (req.files.Image) {
        let image = req.files.Image;
        image.mv("./public/product-images/" + id + ".jpg");  
        res.redirect("/admin/products",{ product, admin:true, layout: "layout1" });
      }
    } catch (err) {
      res.redirect("/admin");
    }
  }); 
  
});  

router.get('/block-user/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.blockUser(userId).then((response)=>{
    res.redirect('/admin/users')
  })
})

router.get('/unblock-user/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.unBlockUser(userId).then((response)=>{
    res.redirect('/admin/users')
  })
})

router.get('/add-coupon',function(req,res){
  res.render('admin/add-coupon',{admin:true,layout:"layout1"})
})

router.post('/add-coupon',(req,res)=>{

  console.log(req.body);

  
productHelpers.addCoupon(req.body,(id)=>{
// let image=req.files.image
// image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
//   if(!err){
    res.render("admin/add-coupon",{admin:true})

  })
})
router.get('/view-coupon',function(req,res){
    productHelpers.getAllCoupons().then((coupon)=>{

  res.render('admin/view-coupon',{admin:true,coupon,layout:"layout1"})
})
 })

router.get('/cancel-order/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.cancelOrder(userId).then((response)=>{

  })
})

router.get('/place-order/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.placeOrder(userId).then((response)=>{
    res.redirect('/admin/orders')
  })
})

router.get("/chart",async(req,res)=>{
  let order=await productHelpers.getAllOrders().then((orders) => {
    res.render("admin/demo.hbs", {
      admin: true,
      orders,
      layout: "layout1",
    });
  // res.render("admin/demo")
})
})
router.get("/sales",(req,res)=>{
  productHelpers.getSalesDetails().then((products)=>{
    res.render('admin/sales',{layout:"layout1",products})
  })
})
module.exports = router;
