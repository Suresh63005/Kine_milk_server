const Category = require("../Models/Category");
const { Op } = require("sequelize");
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const {
  getCategoryByIdSchema,
  categoryDeleteSchema,
  categorySearchSchema,
  upsertCategorySchema,
} = require("../utils/validation");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");

const upsertCategory = asynHandler(async (req, res) => {
  const { error } = upsertCategorySchema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: error.details[0].message,
    });
  }

  const { id, title, status, cover } = req.body;
  let imageUrl;

  if (req.file) {
    imageUrl = await uploadToS3(req.file, "image");
  }

  if (id) {
    const category = await Category.findByPk(id);
    if (!category) {
      logger.error("Category not found");
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Category not found.",
      });
    }

    category.title = title;
    category.img = imageUrl || category.img;
    category.status = status;
    category.cover = cover;

    await category.save();

    logger.info("Category updated successfully:", category);
    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Category updated successfully.",
      category,
    });
  } else {
    if (!req.file) {
      logger.error("No image provided");
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Image is required for a new category.",
      });
    }

    const category = await Category.create({
      title,
      img: imageUrl,
      status,
      cover,
    });

    logger.info("Category created successfully:", category);
    return res.status(201).json({
      ResponseCode: "201",
      Result: "true",
      ResponseMsg: "Category created successfully.",
      category,
    });
  }
});



const getAllCategories = asynHandler(async (req, res, next) => {
  const categories = await Category.findAll();
  logger.info("sucessfully get all categories");
  res.status(200).json(categories);

});

const getCategoryCount = asynHandler(async (req, res) => {
  const categoryCount = await Category.count();
  const categories = await Category.findAll();
  logger.info("categories", categoryCount);
  res.status(200).json({ categories, category: categoryCount });
});

const getCategoryById = asynHandler(async (req, res) => {
  const { error } = getCategoryByIdSchema.validate(req.params);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { id } = req.params;
  console.log(id);
  const category = await Category.findOne({ where: { id: id } });
  if (!category) {
    logger.error("Category not found");
    return res.status(404).json({ error: "Category not found" });
  }
  logger.info("Category found");
  res.status(200).json(category);
});

const deleteCategory = asynHandler(async (req, res) => {
  const dataToValidate = { ...req.params, ...req.body };
  const { error } = categoryDeleteSchema.validate(dataToValidate);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { id } = req.params;
  const { forceDelete } = req.body;

  const category = await Category.findOne({ where: { id }, paranoid: false });

  if (!category) {
    logger.error("Category not found");
    return res.status(404).json({ error: "Category not found" });
  }

  if (category.deletedAt && forceDelete !== "true") {
    logger.error("Category is already soft-deleted");
    return res
      .status(400)
      .json({
        error:
          "Category is already soft-deleted. Use forceDelete=true to permanently delete it.",
      });
  }

  if (forceDelete === "true") {
    await category.destroy({ force: true });
    logger.info("Category permanently deleted");
    return res
      .status(200)
      .json({ message: "Category permanently deleted successfully" });
  }

  await category.destroy();
  logger.info("Category soft-deleted");
  return res
    .status(200)
    .json({ message: "Category soft deleted successfully" });
});

const searchCategory = asynHandler(async (req, res) => {
  const { error } = categorySearchSchema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { id, title } = req.body;
  const whereClause = {};
  if (id) {
    whereClause.id = id;
  }

  if (title && title.trim() != "") {
    whereClause.title = { [Sequelize.Op.like]: `%${title.trim()}%` };
  }

  const category = await Category.findAll({ where: whereClause });

  if (category.length === 0) {
    logger.error("No matching admins found");
    return res.status(404).json({ error: "No matching admins found" });
  }
  logger.info("Categories found ");
  res.status(200).json(category);
});

const toggleCategoryStatus = asynHandler(async (req, res) => {
  const { id, value } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    logger.error("Category not found");
    return res.status(404).json({ message: "Category not found." });
  }

  category.status = value;
  await category.save();

  logger.info("Category updated successfully:", category);
  res.status(200).json({
    message: "Category status updated successfully.",
    updatedStatus: category.status,
  });
});

module.exports = {
  upsertCategory,
  getAllCategories,
  getCategoryCount,
  getCategoryById,
  deleteCategory,
  searchCategory,
  toggleCategoryStatus,
};
