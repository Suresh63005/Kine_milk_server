const ExcelJS = require('exceljs');
const NormalOrder = require('../Models/NormalOrder');
const SubscribeOrder = require('../Models/SubscribeOrder');
const Store = require('../Models/Store');
const User = require('../Models/User');
const Time = require('../Models/Time');
const { Op } = require('sequelize');

// Normal Orders Controller
const getNormalOrders = async (req, res) => {
  try {
    const { search, fromDate, toDate, page = 1, limit = 10 } = req.query;

    console.log(req.query, "rrrrrrrrrrrrrrrrrrrrrrrrrr");

    // Step 1: Build the base where clause for filtering all data
    const where = {};
    if (search) {
      where[Op.or] = [
        { order_id: { [Op.like]: `%${search}%` } },
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$store.title$': { [Op.like]: `%${search}%` } },
      ];
    }
    if (fromDate) {
      where.odate = { [Op.gte]: new Date(fromDate) };
    }
    if (toDate) {
      where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };
    }

    // Step 2: Get the total count of all matching records (no pagination yet)
    const totalCount = await NormalOrder.count({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslot", attributes: ['mintime', 'maxtime'] },
      ],
    });

    // Step 3: Apply pagination to fetch only the current page's rows
    const offset = (page - 1) * limit;
    const rows = await NormalOrder.findAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslot", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Step 4: Format the rows
    const formattedOrders = rows.map(order => ({
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    }));

    // Step 5: Send the response with total count based on full search
    res.json({
      orders: formattedOrders,
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching normal orders' });
  }
};

const downloadNormalOrders = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    console.log(req.query,"kkkkkkkkkkkkkkkkkkkkkkk")

    const where = {};
    if (fromDate) where.odate = { [Op.gte]: new Date(fromDate) };
    if (toDate) where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };

    const orders = await NormalOrder.findAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslot", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
    });

    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Normal Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Order Status', key: 'order_status', width: 15 },
      { header: 'Mobile No', key: 'user_mobile_no', width: 15 },
      { header: 'Timeslot', key: 'timeslot', width: 15 },
    ];

    worksheet.addRows(formattedOrders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=normal_orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading normal orders' });
  }
};

const downloadSingleNormalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(req.params,"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")

    const order = await NormalOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslot", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const formattedOrder = {
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Normal Order');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Order Status', key: 'order_status', width: 15 },
      { header: 'Mobile No', key: 'user_mobile_no', width: 15 },
      { header: 'Timeslot', key: 'timeslot', width: 15 },
    ];

    worksheet.addRow(formattedOrder);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=normal_order_${orderId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading single order' });
  }
};

console.log("-------------")
// Subscribe Orders Controller
const getSubscribeOrders = async (req, res) => {
  try {
    const { search, fromDate, toDate, page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { order_id: { [Op.like]: `%${search}%` } },
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$store.title$': { [Op.like]: `%${search}%` } },
      ];
    }
    if (fromDate) {
      where.odate = { [Op.gte]: new Date(fromDate) };
    }
    if (toDate) {
      where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await SubscribeOrder.findAndCountAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslots", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedOrders = rows.map(order => ({
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    }));

    res.json({
      orders: formattedOrders,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscribe orders' });
  }
};

const downloadSubscribeOrders = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const where = {};
    if (fromDate) where.odate = { [Op.gte]: new Date(fromDate) };
    if (toDate) where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };

    const orders = await SubscribeOrder.findAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslots", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
    });

    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribe Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Order Status', key: 'order_status', width: 15 },
      { header: 'Mobile No', key: 'user_mobile_no', width: 15 },
      { header: 'Timeslot', key: 'timeslot', width: 15 },
    ];

    worksheet.addRows(formattedOrders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribe_orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading subscribe orders' });
  }
};

const downloadSingleSubscribeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await SubscribeOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
        { model: Time, as: "timeslots", attributes: ['mintime', 'maxtime'] },
      ],
      attributes: ['order_id', 'odate', 'status'],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const formattedOrder = {
      order_id: order.order_id,
      order_date: order.odate,
      username: order.user?.name,
      store_name: order.store?.title,
      order_status: order.status,
      user_mobile_no: order.user?.mobile,
      timeslot: `${order.timeslot?.mintime} - ${order.timeslot?.maxtime}`,
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribe Order');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Order Status', key: 'order_status', width: 15 },
      { header: 'Mobile No', key: 'user_mobile_no', width: 15 },
      { header: 'Timeslot', key: 'timeslot', width: 15 },
    ];

    worksheet.addRow(formattedOrder);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=subscribe_order_${orderId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading single subscribe order' });
  }
};

module.exports = {
  getNormalOrders,
  downloadNormalOrders,
  downloadSingleNormalOrder,
  getSubscribeOrders,
  downloadSubscribeOrders,
  downloadSingleSubscribeOrder,
};