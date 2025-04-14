const ExcelJS = require('exceljs');
const Store = require('../Models/Store');
const ProductInventory = require('../Models/ProductInventory');
const Product = require('../Models/Product');
const Category = require('../Models/Category');
const StoreWeightOption = require('../Models/StoreWeightOption');
const WeightOption = require('../Models/WeightOption');
const { Op } = require('sequelize');

const getStockReports = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const stores = await Store.findAll({
      where,
      attributes: ['id', 'title', 'catid'],
      include: [
        {
          model: ProductInventory,
          as: 'productInventories',
          include: [
            {
              model: Product,
              as: 'inventoryProducts',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'title'], // Already correct
                },
              ],
              attributes: ['id', 'title'], // Changed from 'name' to 'title'
            },
            {
              model: StoreWeightOption,
              as: 'storeWeightOptions',
              include: [
                {
                  model: WeightOption,
                  as: 'weightOption',
                  attributes: ['weight'],
                },
              ],
              attributes: ['quantity', 'total'],
            },
          ],
          attributes: ['id', 'total', 'date'],
        },
      ],
    });

    const formattedStores = stores.map((store) => {
      const inventories = store.productInventories || [];
      const categoriesMap = {};

      // Parse store.catid to get all linked category IDs
      let storeCategoryIds = [];
      try {
        storeCategoryIds = JSON.parse(store.catid); // Assuming catid is JSON
      } catch (e) {
        storeCategoryIds = store.catid.split(',').map(id => id.trim()); // Fallback to comma-separated
      }

      inventories.forEach((inventory) => {
        const product = inventory.inventoryProducts;
        const category = product?.category;

        if (!category) return;

        if (!categoriesMap[category.id]) {
          categoriesMap[category.id] = {
            id: category.id,
            title: category.title,
            products: [],
          };
        }

        const weightDetails = inventory.storeWeightOptions.map((weightOpt) => ({
          weight: weightOpt.weightOption?.weight || 'N/A',
          quantity: weightOpt.quantity || 0,
        }));

        categoriesMap[category.id].products.push({
          id: product.id,
          title: product.title, // Changed from 'name' to 'title'
          stock: inventory.total,
          lastUpdated: inventory.date,
          weightDetails,
        });
      });

      // Add categories from catid that might not have products yet
      storeCategoryIds.forEach(async (catId) => {
        if (!categoriesMap[catId]) {
          const category = await Category.findByPk(catId, { attributes: ['id', 'title'] });
          if (category) {
            categoriesMap[catId] = {
              id: category.id,
              title: category.title,
              products: [],
            };
          }
        }
      });

      const categories = Object.values(categoriesMap);
      const totalProducts = inventories.length;
      const totalStock = inventories.reduce((sum, inv) => sum + (inv.total || 0), 0);

      return {
        id: store.id,
        title: store.title,
        totalProducts,
        totalStock,
        categories,
      };
    });

    res.json({ stores: formattedStores });
  } catch (error) {
    console.error('Error fetching stock reports:', error);
    res.status(500).json({ message: 'Error fetching stock reports' });
  }
};

const downloadAllStockReports = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [
        {
          model: ProductInventory,
          as: 'productInventories',
          include: [
            {
              model: Product,
              as: 'inventoryProducts',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['title'],
                },
              ],
              attributes: ['title'], // Changed from 'name' to 'title'
            },
            {
              model: StoreWeightOption,
              as: 'storeWeightOptions',
              include: [
                {
                  model: WeightOption,
                  as: 'weightOption',
                  attributes: ['weight'],
                },
              ],
              attributes: ['quantity'],
            },
          ],
          attributes: ['total', 'date'],
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Reports');

    worksheet.columns = [
      { header: 'Store Name', key: 'storeName', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Product Title', key: 'productTitle', width: 30 }, // Changed from 'Product Name' to 'Product Title'
      { header: 'Weight', key: 'weight', width: 15 },
      { header: 'Stock Quantity', key: 'stock', width: 15 },
      { header: 'Total Stock', key: 'totalStock', width: 15 },
      { header: 'Last Updated', key: 'lastUpdated', width: 20 },
    ];

    stores.forEach((store) => {
      const inventories = store.productInventories || [];
      inventories.forEach((inventory) => {
        const weightOptions = inventory.storeWeightOptions || [];
        if (weightOptions.length > 0) {
          weightOptions.forEach((weightOpt) => {
            worksheet.addRow({
              storeName: store.title,
              category: inventory.inventoryProducts?.category?.title || 'N/A',
              productTitle: inventory.inventoryProducts?.title || 'N/A', // Changed from 'productName' to 'productTitle'
              weight: weightOpt.weightOption?.weight || 'N/A',
              stock: weightOpt.quantity || 0,
              totalStock: inventory.total || 0,
              lastUpdated: inventory.date ? new Date(inventory.date).toLocaleDateString() : 'N/A',
            });
          });
        } else {
          worksheet.addRow({
            storeName: store.title,
            category: inventory.inventoryProducts?.category?.title || 'N/A',
            productTitle: inventory.inventoryProducts?.title || 'N/A', // Changed from 'productName' to 'productTitle'
            weight: 'N/A',
            stock: 0,
            totalStock: inventory.total || 0,
            lastUpdated: inventory.date ? new Date(inventory.date).toLocaleDateString() : 'N/A',
          });
        }
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all_stores_stock_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading all stock reports:', error);
    res.status(500).json({ message: 'Error downloading all stock reports' });
  }
};

const downloadSingleStoreStockReport = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findOne({
      where: { id: storeId },
      include: [
        {
          model: ProductInventory,
          as: 'productInventories',
          include: [
            {
              model: Product,
              as: 'inventoryProducts',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['title'],
                },
              ],
              attributes: ['title'], // Changed from 'name' to 'title'
            },
            {
              model: StoreWeightOption,
              as: 'storeWeightOptions',
              include: [
                {
                  model: WeightOption,
                  as: 'weightOption',
                  attributes: ['weight'],
                },
              ],
              attributes: ['quantity'],
            },
          ],
          attributes: ['total', 'date'],
        },
      ],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Stock Report - ${store.title}`);

    worksheet.columns = [
      { header: 'Store Name', key: 'storeName', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Product Title', key: 'productTitle', width: 30 }, // Changed from 'Product Name' to 'Product Title'
      { header: 'Weight', key: 'weight', width: 15 },
      { header: 'Stock Quantity', key: 'stock', width: 15 },
      { header: 'Total Stock', key: 'totalStock', width: 15 },
      { header: 'Last Updated', key: 'lastUpdated', width: 20 },
    ];

    const inventories = store.productInventories || [];
    inventories.forEach((inventory) => {
      const weightOptions = inventory.storeWeightOptions || [];
      if (weightOptions.length > 0) {
        weightOptions.forEach((weightOpt) => {
          worksheet.addRow({
            storeName: store.title,
            category: inventory.inventoryProducts?.category?.title || 'N/A',
            productTitle: inventory.inventoryProducts?.title || 'N/A', // Changed from 'productName' to 'productTitle'
            weight: weightOpt.weightOption?.weight || 'N/A',
            stock: weightOpt.quantity || 0,
            totalStock: inventory.total || 0,
            lastUpdated: inventory.date ? new Date(inventory.date).toLocaleDateString() : 'N/A',
          });
        });
      } else {
        worksheet.addRow({
          storeName: store.title,
          category: inventory.inventoryProducts?.category?.title || 'N/A',
          productTitle: inventory.inventoryProducts?.title || 'N/A', // Changed from 'productName' to 'productTitle'
          weight: 'N/A',
          stock: 0,
          totalStock: inventory.total || 0,
          lastUpdated: inventory.date ? new Date(inventory.date).toLocaleDateString() : 'N/A',
        });
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=stock_report_${storeId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading single store stock report:', error);
    res.status(500).json({ message: 'Error downloading single store stock report' });
  }
};

module.exports = {
  getStockReports,
  downloadAllStockReports,
  downloadSingleStoreStockReport,
};