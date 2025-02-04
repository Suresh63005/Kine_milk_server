const productInfo = async (req, res) => {
    try {
        const { uid, pid } = req.body;

        if (!uid || !pid) {
            return res.status(400).json({
                ResponseCode: "401",
                Result: "false",
                ResponseMsg: "Something Went Wrong!"
            });
        }

        // Fetch the product
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({
                ResponseCode: "404",
                Result: "false",
                ResponseMsg: "Product Not Found!"
            });
        }

        let productData = {
            id: product._id,
            title: product.title,
            product_description: product.description,
            img: [product.img]
        };

        const extraImages = await Extra.find({ mid: pid }, "img");
        productData.img.push(...extraImages.map(imgObj => imgObj.img));

       
        const attributes = await ProductAttribute.find({ product_id: pid });

        if (attributes.length > 0) {
            productData.product_info = attributes.map(attr => ({
                attribute_id: attr._id,
                product_id: attr.product_id,
                normal_price: attr.normal_price,
                subscribe_price: attr.subscribe_price,
                title: attr.title,
                product_discount: attr.discount,
                Product_Out_Stock: attr.out_of_stock,
                subscription_required: attr.subscription_required
            }));
        }

        return res.json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Product Information Get Successfully!",
            ProductData: productData
        });

    } catch (error) {
        console.error("Error fetching product information:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error"
        });
    }
}