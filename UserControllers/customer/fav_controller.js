const Favorite = require("../../Models/Favorite");

const addFavorite = async (req, res) => {
    try {
      const { uid,pid, store_id } = req.body;
  
      const favorite = await Favorite.create({ uid,pid, store_id });

      res.status(201).json({
        ResponseCode: "201",
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
      const { uid,store_id } = req.body;
  
      const favorites = await Favorite.findAll({ where: { uid ,store_id} });
  
      res.status(200).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Favorite added successfully!",
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
      const { uid,pid, store_id } = req.body;
  
      const deleted = await Favorite.destroy({
        where: { uid,pid, store_id },
      });
  
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Favorite not found" });
      }
  

      res.status(200).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Favorite Deleted successfully!",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ Result: false, ResponseMsg: "Server error", error });
    }
  };
  
  module.exports = { addFavorite, getFavorites, removeFavorite };