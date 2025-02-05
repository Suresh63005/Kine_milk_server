const Admin = require("./Admin");
const Category = require("./Category");
const Product = require("./Product");
const NormalOrder = require("./NormalOrder");
const User = require("./User");
const PaymentList = require("./PaymentList");
const Coupon = require('./Coupon');
const Rider = require('./Rider');
const SubscribeOrder = require('./SubscribeOrder');
const ProductAttribute = require("./ProductAttribute");
const Store = require("./Store");


Product.belongsTo(Category, { as: "category", foreignKey: "cat_id" });
Category.hasMany(Product, { as: "products", foreignKey: "cat_id" });

NormalOrder.belongsTo(Admin, { as: "admin", foreignKey: "store_id" });
Admin.hasMany(NormalOrder, { as: "orders", foreignKey: "store_id"});

NormalOrder.belongsTo(Product, { as: "product", foreignKey: "product_id" });
Product.hasMany(NormalOrder, { as: "orders", foreignKey: "product_id"});

NormalOrder.belongsTo(User, { as: "user", foreignKey: "uid" });
User.hasMany(NormalOrder, { as: "orders", foreignKey: "uid"});

NormalOrder.belongsTo(PaymentList, { as: "paymentmethod", foreignKey: "p_method_id" });
PaymentList.hasMany(NormalOrder, { as: "orders", foreignKey: "p_method_id"});

NormalOrder.belongsTo(Coupon, { as: "coupon", foreignKey: "cou_id" });
Coupon.hasMany(NormalOrder, { as: "orders", foreignKey: "cou_id"});

NormalOrder.belongsTo(Rider, { as: "rider", foreignKey: "rid" });
Rider.hasMany(NormalOrder, { as: "orders", foreignKey: "rid"});

SubscribeOrder.belongsTo(Admin, { as: "admin", foreignKey: "store_id" });
Admin.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "store_id"});

SubscribeOrder.belongsTo(Product, { as: "product", foreignKey: "product_id" });
Product.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "product_id"});

SubscribeOrder.belongsTo(User, { as: "user", foreignKey: "uid" });
User.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "uid"});

SubscribeOrder.belongsTo(PaymentList, { as: "paymentmethod", foreignKey: "p_method_id" });
PaymentList.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "p_method_id"});

SubscribeOrder.belongsTo(Coupon, { as: "coupon", foreignKey: "cou_id" });
Coupon.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "cou_id"});

SubscribeOrder.belongsTo(Rider, { as: "rider", foreignKey: "rid" });
Rider.hasMany(SubscribeOrder, { as: "suborders", foreignKey: "rid"});

ProductAttribute.belongsTo(Product, {as:"products", foreignKey:"product_id"});
Product.hasMany(ProductAttribute, {as:"attributes", foreignKey:"product_id"});

ProductAttribute.belongsTo(Admin, {as:"store", foreignKey:"store_id"});
Admin.hasMany(ProductAttribute, {as:"attributes", foreignKey:"store_id"});

User.belongsTo(Store, { foreignKey: "store_id", as: "store" });
Store.hasMany(User, { foreignKey: "store_id", as: "users" });


