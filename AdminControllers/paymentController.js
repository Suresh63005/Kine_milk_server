const ExcelJS = require('exceljs');
const NormalOrder = require('../Models/NormalOrder');
const SubscribeOrder = require('../Models/SubscribeOrder');
const Store = require('../Models/Store');
const User = require('../Models/User');
const { Op } = require('sequelize');
const Coupon = require('../Models/Coupon');

// Normal Payments Controller
const getNormalPayments = async (req, res) => {
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
    const { count, rows } = await NormalOrder.findAndCountAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedPayments = rows.map(payment => ({
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    }));

    res.json({
      payments: formattedPayments,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching normal payments' });
  }
};

const downloadNormalPayments = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const where = {};
    if (fromDate) where.odate = { [Op.gte]: new Date(fromDate) };
    if (toDate) where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };

    const payments = await NormalOrder.findAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission'
      ],
    });

    const formattedPayments = payments.map(payment => ({
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Normal Payments');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Delivery Charge', key: 'delivery_charge', width: 15 },
      { header: 'Coupon Amount', key: 'coupon_amount', width: 15 },
      { header: 'Wallet Amount', key: 'wallet_amount', width: 15 },
      { header: 'Transaction ID', key: 'transaction_id', width: 20 },
    ];

    worksheet.addRows(formattedPayments);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=normal_payments.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading normal payments' });
  }
};

const downloadSingleNormalPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await NormalOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission'
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const formattedPayment = {
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Normal Payment');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Delivery Charge', key: 'delivery_charge', width: 15 },
      { header: 'Coupon Amount', key: 'coupon_amount', width: 15 },
      { header: 'Wallet Amount', key: 'wallet_amount', width: 15 },
      { header: 'Transaction ID', key: 'transaction_id', width: 20 },
    ];

    worksheet.addRow(formattedPayment);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=normal_payment_${orderId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading single normal payment' });
  }
};

// Subscribe Payments Controller
const getSubscribePayments = async (req, res) => {
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
        // {model: Coupon, as:"coupon",attributes:["coupon_code",""]}
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission','end_date'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedPayments = rows.map(payment => ({
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      end_date:payment.end_date,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    }));

    res.json({
      payments: formattedPayments,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscribe payments' });
  }
};

const downloadSubscribePayments = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const where = {};
    if (fromDate) where.odate = { [Op.gte]: new Date(fromDate) };
    if (toDate) where.odate = { ...where.odate, [Op.lte]: new Date(toDate) };

    const payments = await SubscribeOrder.findAll({
      where,
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission'
      ],
    });

    const formattedPayments = payments.map(payment => ({
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribe Payments');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Delivery Charge', key: 'delivery_charge', width: 15 },
      { header: 'Coupon Amount', key: 'coupon_amount', width: 15 },
      { header: 'Wallet Amount', key: 'wallet_amount', width: 15 },
      { header: 'Transaction ID', key: 'transaction_id', width: 20 },
    ];

    worksheet.addRows(formattedPayments);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribe_payments.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading subscribe payments' });
  }
};

const downloadSingleSubscribePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await SubscribeOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: Store, as: "store", attributes: ['title'] },
        { model: User, as: "user", attributes: ['name', 'mobile'] },
      ],
      attributes: [
        'order_id', 'odate', 'o_total', 'subtotal', 'tax', 'd_charge', 
        'cou_amt', 'wall_amt', 'trans_id', 'store_charge', 'commission'
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const formattedPayment = {
      order_id: payment.order_id,
      order_date: payment.odate,
      username: payment.user?.name,
      store_name: payment.store?.title,
      total_amount: payment.o_total,
      subtotal: payment.subtotal,
      tax: payment.tax,
      delivery_charge: payment.d_charge,
      coupon_amount: payment.cou_amt,
      wallet_amount: payment.wall_amt,
      transaction_id: payment.trans_id,
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribe Payment');

    worksheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 25 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Delivery Charge', key: 'delivery_charge', width: 15 },
      { header: 'Coupon Amount', key: 'coupon_amount', width: 15 },
      { header: 'Wallet Amount', key: 'wallet_amount', width: 15 },
      { header: 'Transaction ID', key: 'transaction_id', width: 20 },
    ];

    worksheet.addRow(formattedPayment);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=subscribe_payment_${orderId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading single subscribe payment' });
  }
};

module.exports = {
  getNormalPayments,
  downloadNormalPayments,
  downloadSingleNormalPayment,
  getSubscribePayments,
  downloadSubscribePayments,
  downloadSingleSubscribePayment,
};