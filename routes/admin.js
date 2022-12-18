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
  productHelpers.getCategory().then((categories)=>{
    res.render("admin/add-product", { admin: true, layout: "layout1" ,categories});
  });
  })
  
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

router.get('/ship-order/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.shipOrder(userId).then((response)=>{
    res.redirect('/admin/orders')
  })
})
router.get("/chart",async(req,res)=>{
  let cod = await productHelpers.getCodCount()
  let online = await productHelpers.getOnlineCount()
  let orderCount= await productHelpers.getOrderCount()
  let date = await productHelpers.getOrderDate()
  let order=await productHelpers.getAllOrders().then((orders) => {
    res.render("admin/demo.hbs", {
      admin: true,
      orders,
      layout: "layout1",cod,online,date,orderCount
    });
  // res.render("admin/demo")
})
})
router.get("/sales",(req,res)=>{
  productHelpers.getSalesDetails().then((products)=>{
    res.render('admin/sales',{layout:"layout1",products})
  })
})

router.get('/categories',(req,res)=>{
  productHelpers.getCategory().then((categories)=>{
    res.render('admin/categories',{categories,layout:"layout1"})
  })
})

router.get('/add-category',(req,res)=>{
  res.render('admin/add-category',{"categoryErr":req.session.categoryExist,layout:"layout1"})
  req.session.categoryExist=false
})

router.post('/add-category',(req,res)=>{
    let categoryData=req.body
    productHelpers.addCategory(categoryData).then((response)=>{
      if(response.status){
        req.session.categoryExist="Category already exist"
        res.redirect('/admin/add-category')
        
      }else{
        res.redirect('/admin/categories')
      }
  })
})

router.get('/delete-category/:id',(req,res)=>{
  let catId = req.params.id
  productHelpers.deleteCategory(catId).then((response)=>{
    res.redirect('/admin/categories')
  })
})

router.get('/edit-category/:id',async(req,res)=>{
 
  let category = await productHelpers.getCategoryDetails(req.params.id)

  res.render('admin/edit-categories',{category,layout:"layout1"})
})

router.post('/edit-category/:id',(req,res)=>{
  let catId = req.params.id
  let catDetails = req.body
  productHelpers.updateCategory(catId,catDetails).then((response)=>{
    res.redirect('/admin/categories')
  })
})

router.get('/add-banner',function(req,res){
  productHelpers.getAllbanner().then((banner)=>{

  res.render('admin/add-banner',{admin:true,layout:"layout1",banner})
})
})

router.post('/add-banner',function(req, res) {
  // console.log(req.body);
  // console.log(req.files.banner);

  productHelpers.addBanner(req.body).then((id) => {
    console.log("Inserted Id : " + id);
    let banner = req.files.banner;
    try {
      banner.mv('./public/product-images/'+id+'.jpg');
      res.redirect("/admin/add-banner");
    } catch (err) {
      console.log(err);
    }
  });
})
router.get('/delete-banner/:id',(req,res)=>{
  let catId = req.params.id
  productHelpers.deletebanner(catId).then((response)=>{
    res.redirect('/admin/add-banner')
  })
})

router.get('/delete-coupon/:id',(req,res)=>{

  let coupId = req.params.id
  productHelpers.deleteCoupon(coupId).then((response)=>{
    res.redirect('/admin/view-coupon')
  })
})

router.get('/edit-coupon/:id',async(req,res)=>{
  let coupon = await productHelpers.getCouponDetails(req.params.id)
  res.render('admin/edit-coupon',{layout:"layout1",coupon})
})

router.post('/edit-coupon/:id',(req,res)=>{
  let coupId = req.params.id
  let coupDetails = req.body
  productHelpers.editCouponDetails(coupId,coupDetails).then((response)=>{
    res.redirect('/admin/view-coupon')
  })
})

module.exports = router;
