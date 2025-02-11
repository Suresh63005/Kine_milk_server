const NormalOrder = require('../../Models/NormalOrder');
const Product = require('../../Models/Product');
const User = require('../../Models/User');
const asyncHandler = require('../../middlewares/errorHandler');

const PostProductReview = asyncHandler(async (req, res) => {
    const uid = req.user.userId; 

    if (!uid) {
        return res.status(401).json({ message: "Unauthorized! User not found." });
    }

    const { orderId, rateText, totalRate } = req.body;

    if (!orderId || !rateText || !totalRate) {
        return res.status(400).json({ message: "All Fields Required!" });
    }

    try {
        // Fetch order with product_id
        const order = await NormalOrder.findOne({
            where: { id: orderId, uid: uid },
            attributes: ['id', 'status', 'product_id'],
            include: [{ model: Product, as: "ordered_product", attributes: ['id', 'title'] }] // Use updated alias
        });
              
        
        console.log("Fetched Order:", order);
        
        if (!order) {
            return res.status(403).json({ message: "Order not found or does not belong to you!" });
        }
        
        if (!order.product) {
            return res.status(404).json({ message: "Order has no associated product!" });
        }
        

        if (order.status !== 'Completed') {
            return res.status(403).json({ message: `You can only review delivered products! Current status: ${order.status}` });
        }

        // Fetch product details using product_id
        const product = await Product.findOne({
            where: { id: order.product_id },
            attributes: ['id', 'title', 'img', 'description', 'normal_price', 'mrp_price', 'discount']
        });

        console.log("Fetched Product Data:", product);

        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }

        // Update review fields
        await NormalOrder.update(
            {
                is_rate: 1,
                rate_text: rateText,
                total_rate: totalRate,
                review_date: new Date()
            },
            { where: { id: orderId } }
        );

        // Fetch updated review details
        const updatedReview = await NormalOrder.findOne({
            where: { id: orderId },
            attributes: ['id', 'rate_text', 'total_rate', 'review_date']
        });

        // Fetch customer details
        const customer = await User.findOne({
            where: { id: uid },
            attributes: ['id', 'name', 'email']
        });

        return res.status(200).json({ 
            message: "Review submitted successfully!",
            review: updatedReview,
            customer,
            product
        });

    } catch (error) {
        console.error("Error posting review:", error);
        return res.status(500).json({ message: "Error posting review: " + error.message });
    }
});

module.exports = { PostProductReview };
