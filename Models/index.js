// const Admin = require("./Admin");
// const Category = require("./Category");
// const Product = require("./Product");
const Address = require("./Address");
const Cart = require("./Cart");
const Category = require("./Category");
const Favorite = require("./Favorite");
const NormalOrder = require("./NormalOrder");
const NormalOrderProduct = require("./NormalOrderProduct");
const Product = require("./Product");
const ProductInventory = require("./ProductInventory");
// const User = require("./User");
// const PaymentList = require("./PaymentList");
// const Coupon = require('./Coupon');
// const Rider = require('./Rider');
// const SubscribeOrder = require('./SubscribeOrder');
// const ProductAttribute = require("./ProductAttribute");

const Store = require("./Store");
const SubscribeOrder = require("./SubscribeOrder");
const SubscribeOrderProduct = require("./SubscribeOrderProduct");
const User = require("./User");

// const ProductImage = require("./productImages");

// const Store = require("./Store");



Product.belongsTo(Category, { as: "category", foreignKey: "cat_id" });
Category.hasMany(Product, { as: "products", foreignKey: "cat_id" });


// ProductImage.belongsTo(Product, { as: "extraImages", foreignKey: "product_id" });
// Product.hasMany(ProductImage, { as: "extraImages", foreignKey: "product_id" });

NormalOrder.belongsTo(Store, { as: "store", foreignKey: "store_id" });
Store.hasMany(NormalOrder, { as: "store", foreignKey: "store_id"});



NormalOrder.belongsTo(User, { as: "user", foreignKey: "uid" });
User.hasMany(NormalOrder, { as: "orders", foreignKey: "uid"});

NormalOrderProduct.belongsTo(NormalOrder,{ foreignKey: "oid", as: "NormalProducts" })
NormalOrder.hasMany(NormalOrderProduct, { foreignKey: "oid", as: "NormalProducts" });

NormalOrderProduct.belongsTo(Product, { foreignKey: "product_id", as: "ProductDetails" });

SubscribeOrder.hasMany(SubscribeOrderProduct, { foreignKey: "oid", as: "orderProducts" });
SubscribeOrderProduct.belongsTo(Product, { foreignKey: "product_id", as: "productDetails" });


Cart.belongsTo(Product,{foreignKey:"product_id", as:"CartproductDetails"});
Product.hasMany(Cart,{foreignKey:"product_id", });



// Product.hasMany(NormalOrder, { foreignKey: "product_id", as: "product_orders" }); 
// NormalOrder.belongsTo(Product, { foreignKey: "product_id", as: "ordered_product" }); // Change alias to "ordered_product"


// NormalOrder.belongsTo(PaymentList, { as: "paymentmethod", foreignKey: "p_method_id" });
// PaymentList.hasMany(NormalOrder, { as: "orders", foreignKey: "p_method_id"});

// NormalOrder.belongsTo(Coupon, { as: "coupon", foreignKey: "cou_id" });
// Coupon.hasMany(NormalOrder, { as: "orders", foreignKey: "cou_id"});

// NormalOrder.belongsTo(Rider, { as: "rider", foreignKey: "rid" });
// Rider.hasMany(NormalOrder, { as: "orders", foreignKey: "rid"});

// SubscribeOrder.belongsTo(Admin, { as: "admin", foreignKey: "store_id" });
// Admin.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "store_id"});

// SubscribeOrder.belongsTo(Product, { as: "product", foreignKey: "product_id" });
// Product.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "product_id"});

// SubscribeOrder.belongsTo(User, { as: "user", foreignKey: "uid" });
// User.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "uid"});

// SubscribeOrder.belongsTo(PaymentList, { as: "paymentmethod", foreignKey: "p_method_id" });
// PaymentList.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "p_method_id"});

// SubscribeOrder.belongsTo(Coupon, { as: "coupon", foreignKey: "cou_id" });
// Coupon.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "cou_id"});

// // SubscribeOrder.belongsTo(Rider, { as: "rider", foreignKey: "rid" });
// // Rider.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "rid"});

// ProductAttribute.belongsTo(Product, {as:"products", foreignKey:"product_id"});
// Product.hasMany(ProductAttribute, {as:"attributes", foreignKey:"product_id"});

// ProductAttribute.belongsTo(Admin, {as:"store", foreignKey:"store_id"});
// Admin.hasMany(ProductAttribute, {as:"attributes", foreignKey:"store_id"});

// User.belongsTo(Store, { foreignKey: "store_id", as: "store" });
// Store.hasMany(User, { foreignKey: "store_id", as: "users" });


ProductInventory.belongsTo(Product, { foreignKey: "product_id", as: "inventoryProducts" });
Product.hasMany(ProductInventory, { foreignKey: "product_id", as: "inventoryProducts" });

<<<<<<< HEAD
Address.belongsTo(User, { foreignKey: 'uid', as: 'user' });
User.hasMany(Address, { foreignKey: 'uid', as: 'addresses' });
=======
Favorite.belongsTo(Product, { foreignKey: "pid", as: "favproducts" });
Product.belongsTo(Favorite, { foreignKey: "pid", as: "favproducts" });


>>>>>>> 08fdcd9d1e9ac1fd777a6e8cf52fc32abbd1b099
