
const User = require("../../Models/User");
const Banner = require("../../Models/Banner");
const Category = require("../../Models/Category");
const Product = require("../../Models/Product");
const Store = require("../../Models/Store");
const ProductInventory = require("../../Models/ProductInventory");
const Notification = require("../../Models/Notification");


// Function to calculate distance
// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of Earth in km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// }

// Home API
// const homeAPI = async (req, res) => {
//     const { pincode } = req.params;

//     try {
        
//         const banners = await Banner.findAll({
//             where: { status: 1 },
//             attributes: ["id", "img"]
//         });

       
//         const categories = await Category.findAll({
//             where: { status: 1 },
//             attributes: ["id", "title", "img"]
//         });

       
//         const store = await Store.findOne({
//             where: { status: 1, pincode: pincode },
//             attributes: ["id", "title", "rimg", "full_address"]
//         });

//         if (!store) {
//             return res.json({
//                 ResponseCode: "400",
//                 Result: "false",
//                 ResponseMsg: "No store for your pincode!",
//             });
//         }

//         // Fetch all products for the store
//         const productInventory = await ProductInventory.findAll({
//             where: { status: 1, store_id: store.id },
//             attributes:["id","product_id"],
//             include: [
//                 {
//                     model: Product, 
//                     as:"inventoryProducts",
//                     attributes: ["id", "cat_id", "title","mrp_price","img","description","subscribe_price","normal_price","weight"],
//                     include:[
//                         {
//                             model:Category,
//                             as:"category",
//                             attributes:['id','title']
//                         }
//                     ]
//                 }
//             ]
//         });

//         if(!productInventory || productInventory.length === 0){
//             return res.json({
//                 ResponseCode: "400",
//                 Result: "false",
//                 ResponseMsg: "No products available in store.",
//               });
//         }

//         const outOfStockProducts = productInventory.filter(item => item.quantity === 0);
//         if(outOfStockProducts.length > 0){
//             return res.json({
//                 ResponseCode: "400",
//                 Result: "false",
//                 ResponseMsg: "Out of stock.",
//                 OutOfStockProducts: outOfStockProducts.map(p => ({
//                     product_id: p.product_id,
//                     title: p.inventoryProducts.title
//                 }))
//             });
//         }
        
//         const categoryProducts = [];

 

//         // Iterate through each category and filter products belonging to that category
//         for (const category of categories) {
//             const productsInCategory = productInventory.filter(
//                 (productItem) => productItem.inventoryProducts?.cat_id === category?.id
//             );

            
//                 categoryProducts?.push({
//                     name: category?.title,
//                     items: productsInCategory
//                 });
            
//         }

//         // Return the response
//         return res.json({
//             ResponseCode: "200",
//             Result: "true",
//             ResponseMsg: "Home Data Get Successfully!",
//             HomeData: {
//                 store: store,
//                 Banlist: banners,
//                 Catlist: categories,
//                 CategoryProducts: categoryProducts,
//                 currency: "INR",
//             }
//         });
//     } catch (error) {
//         console.error("Error fetching home data:", error);
//         return res.status(500).json({
//             ResponseCode: "500",
//             Result: "false",
//             ResponseMsg: "Internal Server Error"
//         });
//     }
// };

const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };
  
  const homeAPI = async (req, res) => {
    const { pincode } = req.params; 
    const { latitude, longitude } = req.body; 
  
    // Validation: Require either pincode or both latitude and longitude
    if (!pincode && (!latitude || !longitude)) {
      return res.json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Either pincode or both latitude and longitude are required!",
      });
    }
  
    try {
      // Fetch banners and categories
      const banners = await Banner.findAll({
        where: { status: 1 },
        attributes: ["id", "img"],
      });
  
      const categories = await Category.findAll({
        where: { status: 1 },
        attributes: ["id", "title", "img"],
      });
  
      let stores = [];
  
      if (pincode) {
        // Scenario 1: Pincode provided, fetch stores by pincode
        stores = await Store.findAll({
          where: { status: 1, pincode: pincode },
          attributes: ["id", "title", "rimg", "full_address", "lats", "longs"],
        });
  
        if (!stores || stores.length === 0) {
          return res.json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "No stores found for your pincode!",
          });
        }
      } else {
        // Scenario 2: Latitude and longitude provided, fetch stores within 10km radius
        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);
  
        // Fetch all active stores
        const allStores = await Store.findAll({
          where: { status: 1 },
          attributes: ["id", "title", "rimg", "full_address", "lats", "longs"],
        });
  
        // Filter stores within 10km radius
        stores = allStores.filter((store) => {
          const storeLat = parseFloat(store.lats);
          const storeLon = parseFloat(store.longs);
          const distance = getDistance(userLat, userLon, storeLat, storeLon);
          return distance <= 10; // 10km radius
        });
  
        if (!stores || stores.length === 0) {
          return res.json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "No stores found within 10km of your location!",
          });
        }
      }
  
      // Fetch product inventory for all matching stores
      const productInventory = await ProductInventory.findAll({
        where: {
          status: 1,
          store_id: stores.map((store) => store.id), // Match any of the store IDs
        },
        attributes: ["id", "product_id"],
        include: [
          {
            model: Product,
            as: "inventoryProducts",
            attributes: [
              "id",
              "cat_id",
              "title",
              "mrp_price",
              "img",
              "description",
              "subscribe_price",
              "normal_price",
              "weight",
            ],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "title"],
              },
            ],
          },
        ],
      });
  
      if (!productInventory || productInventory.length === 0) {
        return res.json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "No products available in the stores.",
        });
      }
  
      // Check for out-of-stock products (assuming ProductInventory has a quantity field)
      const outOfStockProducts = productInventory.filter((item) => item.quantity === 0);
      if (outOfStockProducts.length > 0) {
        return res.json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Some products are out of stock.",
          OutOfStockProducts: outOfStockProducts.map((p) => ({
            product_id: p.product_id,
            title: p.inventoryProducts.title,
          })),
        });
      }
  
      // Group products by category
      const categoryProducts = [];
      for (const category of categories) {
        const productsInCategory = productInventory.filter(
          (productItem) => productItem.inventoryProducts?.cat_id === category?.id
        );
  
        if (productsInCategory.length > 0) {
          categoryProducts.push({
            name: category?.title,
            items: productsInCategory,
          });
        }
      }
  
      // Return the response
      return res.json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Home Data Fetched Successfully!",
        HomeData: {
          store: stores[0], // Return the first store; modify if you want all stores
          Banlist: banners,
          Catlist: categories,
          CategoryProducts: categoryProducts,
          currency: "INR",
        },
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error",
      });
    }
  };


module.exports = {homeAPI};
