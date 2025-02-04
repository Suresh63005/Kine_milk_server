const Notification = require("../Models/Notification");




const notification_fn = async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({
                ResponseCode: "401",
                Result: "false",
                ResponseMsg: "Something Went Wrong!"
            });
        }

        const notifications = await Notification.find({ uid });

        if (notifications.length === 0) {
            return res.json({
                NotificationData: [],
                ResponseCode: "200",
                Result: "false",
                ResponseMsg: "Notification Not Found!!"
            });
        }

        return res.json({
            NotificationData: notifications,
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Notification List Get Successfully!!"
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error"
        });
    }
}

module.exports = {notification_fn}