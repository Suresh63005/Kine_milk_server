const { Model } = require("firebase-admin/machine-learning");
const Favorite = require("../../Models/Favorite");
const Product = require("../../Models/Product");
const Category = require("../../Models/Category");
const WeightOption = require("../../Models/WeightOption");
const ProductInventory = require("../../Models/ProductInventory");
const StoreWeightOption = require("../../Models/StoreWeightOption");

const addFavorite = async (req, res) => {
  try {
    const { pid: inventoryId, store_id } = req.body;
    const uid = req.user.userId;

    console.log("Request:", { inventoryId, store_id, uid });

    if (!inventoryId || !store_id || !uid) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Inventory ID, store ID, and user ID are required",
      });
    }

    const inventory = await ProductInventory.findOne({
      where: { id: inventoryId, store_id: store_id },
    });
    console.log("Inventory:", inventory ? inventory.toJSON() : null);

    if (!inventory || inventory.quantity === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Product is not available in this store",
      });
    }

    const existingFav = await Favorite.findOne({
      where: { uid, store_id, pid: inventory.id },
    });
    console.log("Existing Favorite:", existingFav ? existingFav.toJSON() : null);

    if (existingFav) {
      return res.status(400).json({
        ResponseCode: "400", // Corrected from "200"
        Result: "false",
        ResponseMsg: "You already have this product in your favorites",
      });
    }

    const favorite = await Favorite.create({
      uid,
      store_id,
      pid: inventory.id,
    });
    console.log("Created Favorite:", favorite.toJSON());

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Favorite added successfully!",
      favorite,
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({
      Result: "false",
      ResponseMsg: "Server error",
      error,
    });
  }
};
  
  
  const getFavorites = async (req, res) => {
    try {
      const {store_id } = req.params;

      const uid = req.user.userId;
  
      const favorites = await Favorite.findAll({ where: { uid ,store_id},
      //   include:[
      //     {

      //     model: Product,
      //     as: "favproducts",
      //     include:[
      //       {
      //         model: Category,
      //         as:"category",
      //         attributes:["id","title"]
      //       },
      //       {
      //         model:WeightOption,
      //         as:"weightOptions",
      //         attributes:['id','normal_price','subscribe_price','mrp_price','weight'],
      //       },
      //     ]
      //   },
      // ]
      include:[
        {
          model:ProductInventory,
          as:"inventory",
          include:[
            {
              model:Product,
              as:"inventoryProduct",
              include:[
                {
                  model:Category,
                  as:"category",
                  attributes:["id","title"],
                }
              ]
            },
            {
              model:StoreWeightOption,
              as:"storeWeightOptions",
              include:[
                {
                  model:WeightOption,
                  as:"weightOptions",
                  attributes:["id","normal_price","subscribe_price","mrp_price","weight"],
                }
              ]
            }
          ]
        }
      ]
      });
  
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Favorites fetched  successfully!",
        favorites
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ Result: false, ResponseMsg: "Server error", error });
    }
  };
  
  // Remove a favorite
  const removeFavorite = async (req, res) => {
    try {
      const { pid, store_id } = req.body;

      const uid = req.user.userId;
  
      const deleted = await Favorite.destroy({
        where: { uid,pid, store_id,weight_id },
      });
  
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Favorite not found" });
      }
  

      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Favorite Deleted successfully!",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ Result: false, ResponseMsg: "Server error", error });
    }
  };
  
  module.exports = { addFavorite, getFavorites, removeFavorite };