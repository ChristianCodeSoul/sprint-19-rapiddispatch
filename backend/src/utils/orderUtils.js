const calculateOrderTotal = items => {
    return items.reduce(
        (total, item) => total + item.product.price * item.quantity, 0 
    );
};

const buildOrderItems = items => {
    return items.map(item => ({
        product: item.product._id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,


    }));
};

const validateCartItems = items => {
    for (const item of items) {
        if (!item.product) {
            return {
                valid: false,
                message: "A product in the cart no longer exists",
            };
        }
        if (item.product.stock < item.quantity) {
            return { valid: false, message: `Not enough stock for ${item.product.title}`, };
        }
    }

    return {
        valid: true,
    };
};
module.exports = { calculateOrderTotal, buildOrderItems, validateCartItems, };