
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
const homeAPI = async (req, res) => {
    const { pincode } = req.params;

    try {
        
        const banners = await Banner.findAll({
            where: { status: 1 },
            attributes: ["id", "img"]
        });

       
        const categories = await Category.findAll({
            where: { status: 1 },
            attributes: ["id", "title", "img"]
        });

       
        const store = await Store.findOne({
            where: { status: 1, pincode: pincode },
            attributes: ["id", "title", "rimg", "full_address"]
        });

        if (!store) {
            return res.json({
                ResponseCode: "400",
                Result: "false",
                ResponseMsg: "No store for your pincode!",
            });
        }

        // Fetch all products for the store
        const productInventory = await ProductInventory.findAll({
            where: { status: 1, store_id: store.id },
            attributes:["id","product_id"],
            include: [
                {
                    model: Product, 
                    as:"inventoryProducts",
                    attributes: ["id", "cat_id", "title","mrp_price","img","description","subscribe_price","normal_price","weight"],
                    include:[
                        {
                            model:Category,
                            as:"category",
                            attributes:['id','title']
                        }
                    ]
                }
            ]
        });

        if(!productInventory || productInventory.length === 0){
            return res.json({
                ResponseCode: "400",
                Result: "false",
                ResponseMsg: "No products available in store.",
              });
        }

        const outOfStockProducts = productInventory.filter(item => item.quantity === 0);
        if(outOfStockProducts.length > 0){
            return res.json({
                ResponseCode: "400",
                Result: "false",
                ResponseMsg: "Out of stock.",
                OutOfStockProducts: outOfStockProducts.map(p => ({
                    product_id: p.product_id,
                    title: p.inventoryProducts.title
                }))
            });
        }
        
        const categoryProducts = [];

 

        // Iterate through each category and filter products belonging to that category
        for (const category of categories) {
            const productsInCategory = productInventory.filter(
                (productItem) => productItem.inventoryProducts?.cat_id === category?.id
            );

            
                categoryProducts?.push({
                    name: category?.title,
                    items: productsInCategory
                });
            
        }

        // Return the response
        return res.json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Home Data Get Successfully!",
            HomeData: {
                store: store,
                Banlist: banners,
                Catlist: categories,
                CategoryProducts: categoryProducts,
                currency: "INR",
            }
        });
    } catch (error) {
        console.error("Error fetching home data:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error"
        });
    }
};





module.exports = {homeAPI};
