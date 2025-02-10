const express = require('express');
const { addFavorite, getFavorites, removeFavorite } = require('../../UserControllers/Customer/fav_controller');

const router = express.Router();

router.post('/',addFavorite);
router.post('/all',getFavorites);
router.delete('/',removeFavorite);



module.exports = router;
