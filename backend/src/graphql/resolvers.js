const Product = require("../models/Product");
const resolvers = {

    
    Query: {
        products: async () => {
            return Product.find().sort({ createdAt: -1 });
        },

        product: async (_, { id }) => {
            return Product.findById(id);
        },
    },
    Product: {
        id: product => product._id.toString(),
    },
};


module.exports = resolvers;