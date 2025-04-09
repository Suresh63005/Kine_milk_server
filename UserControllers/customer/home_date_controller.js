
const User = require("../../Models/User");
const Banner = require("../../Models/Banner");
const Category = require("../../Models/Category");
const Product = require("../../Models/Product");
const Store = require("../../Models/Store");
const ProductInventory = require("../../Models/ProductInventory");
const Notification = require("../../Models/Notification");
const { Op } = require("sequelize");
const StoreWeightOption = require("../../Models/StoreWeightOption");
const WeightOption = require("../../Models/WeightOption");
const ProductImage = require("../../Models/productImages");


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
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const homeAPI = async (req, res) => {
  const { pincode } = req.params;
  const { latitude, longitude } = req.body;

  console.log("Request Params:", { pincode });
  console.log("Request Body:", { latitude, longitude });

  // Require both pincode and latitude/longitude
  if (!pincode || !latitude || !longitude) {
    return res.json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Pincode, latitude, and longitude are all required!",
    });
  }

  try {
    // Fetch banners and categories (unchanged)
    const banners = await Banner.findAll({
      where: { status: 1 },
      attributes: ["id", "img"],
    });

    const categories = await Category.findAll({
      where: { status: 1 },
      attributes: ["id", "title", "img"],
    });

    let stores = [];
    let fetchMethod = ""; // To track how stores were fetched

    // Step 1: Try fetching stores by pincode
    stores = await Store.findAll({
      where: {
        status: 1,
        pincode: pincode, // Match exact pincode
      },
      attributes: ["id", "title", "rimg", "full_address", "lats", "longs"],
    });
    console.log(`Stores found for pincode ${pincode}:`, stores.length);

    if (stores.length > 0) {
      fetchMethod = "pincode";
      console.log(`Stores fetched successfully using pincode: ${pincode}`);
    } else {
      // Step 2: Fallback to radius search using latitude/longitude
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      console.log("No stores found for pincode. Falling back to radius search:", { userLat, userLon });

      const allStores = await Store.findAll({
        where: { status: 1 },
        attributes: ["id", "title", "rimg", "full_address", "lats", "longs"],
      });
      console.log("Total active stores fetched:", allStores.length);

      stores = allStores.filter((store) => {
        const storeLat = parseFloat(store.lats);
        const storeLon = parseFloat(store.longs);
        if (!storeLat || !storeLon) {
          console.log(`Store ${store.title} skipped: Invalid lat/lon (${store.lats}, ${store.longs})`);
          return false;
        }
        const distance = getDistance(userLat, userLon, storeLat, storeLon);
        console.log(`Store: ${store.title}, Lat: ${storeLat}, Lon: ${storeLon}, Distance: ${distance}km`);
        return distance <= 10; // 10km radius
      });

      if (stores.length > 0) {
        fetchMethod = "latitude/longitude";
        console.log(`Stores fetched successfully using latitude/longitude: ${latitude}, ${longitude}`);
      }
    }

    if (stores.length === 0) {
      console.log("No stores found by either pincode or latitude/longitude.");
      return res.json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "No stores found for your pincode or within 10km of your location!",
      });
    }

    // Fetch product inventory for the found stores
    const productInventory = await ProductInventory.findAll({
      where: {
        status: 1,
        store_id: { [Op.in]: stores.map((store) => store.id) },
      },
      attributes: ["id", "product_id"],
      include: [
        {
          model: Product,
          as: "inventoryProducts",
          attributes: ["id", "cat_id", "title", "img", "description"],
          include: [
            {
              model: ProductImage,
              as: "extraImages",
              attributes: ["id", "product_id", "img"],
            },
            {
              model: Category,
              as: "category",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: StoreWeightOption,
          as: "storeWeightOptions",
          include: [
            {
              model: WeightOption,
              as: "weightOption",
              required: false,
              attributes: ["id", "weight", "normal_price", "subscribe_price", "mrp_price"],
            },
          ],
        },
      ],
    });

    if (!productInventory || productInventory.length === 0) {
      console.log("No products available in the fetched stores.");
      return res.json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "No products available in the stores.",
      });
    }

    // Check for out-of-stock products
    const outOfStockProducts = productInventory.filter((item) => item?.quantity === 0);
    if (outOfStockProducts.length > 0) {
      console.log("Some products are out of stock:", outOfStockProducts.length);
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

    console.log("Home data prepared successfully.");
    return res.json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Home Data Fetched Successfully!",
      HomeData: {
        store: stores[0], // First store (adjust if all stores needed)
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
      error: error.message,
    });
  }
};

module.exports = {homeAPI};
