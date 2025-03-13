const ProductInventory = require("../Models/ProductInventory");
const Time = require("../Models/Time");
const NormalOrder = require("../Models/NormalOrder");
const SubscribeOrder = require("../Models/SubscribeOrder");
const Rider = require("../Models/Rider");

const getStoreDashboardData = async (req, res) => {
    try {
        const { store_id } = req.params; // Get store_id from request params

        if (!store_id) {
            return res.status(400).json({ success: false, message: "Store ID is required" });
        }

        // Fetch count of records related to the specific store
        const [
            productInventoryCount,
            timeCount,
            NormalOrderCount,
            subscribeOrderCount,
            riderCount
        ] = await Promise.all([
            ProductInventory.count({ where: { store_id } }),
            Time.count({ where: { store_id } }),
            NormalOrder.count({ where: { store_id } }),
            SubscribeOrder.count({ where: { store_id } }),
            Rider.count({ where: { store_id } })
        ]);

        // Calculate total records count for this store
        const totalRecords = 
            productInventoryCount + timeCount + 
            NormalOrderCount + subscribeOrderCount + riderCount;

        return res.json({
            success: true,
            data: {
                productInventory: productInventoryCount,
                times: timeCount,
                NormalOrders: NormalOrderCount,
                subscribeOrders: subscribeOrderCount,
                riders: riderCount,
                totalRecords
            }
        });
    } catch (error) {
        console.error("Error fetching store dashboard data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getStoreDashboardData };
