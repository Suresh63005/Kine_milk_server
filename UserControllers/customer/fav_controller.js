const { Model } = require("firebase-admin/machine-learning");
const Favorite = require("../../Models/Favorite");
const Product = require("../../Models/Product");

const addFavorite = async (req, res) => {
    try {
      const { pid, store_id } = req.body;

      const uid = req.user.userId;

      const existingFav = await Favorite.findOne({where:{uid,pid, store_id}});

      if(existingFav){
        return res.status(400).json({
          ResponseCode: "200",
          ResponseMsg: "You already have this product in your favorites"});
      }
  
      const favorite = await Favorite.create({ uid,pid, store_id });

      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Favorite added successfully!",
        favorite
      });

    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ Result: false, ResponseMsg: "Server error", error });
    }
  };
  
  
  const getFavorites = async (req, res) => {
    try {
      const {store_id } = req.params;

      const uid = req.user.userId;
  
      const favorites = await Favorite.findAll({ where: { uid ,store_id},
        include:[{
          model: Product,
          as: "favproducts",
        },]
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
        where: { uid,pid, store_id },
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