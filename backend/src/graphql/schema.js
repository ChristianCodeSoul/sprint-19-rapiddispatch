const typeDefs = `#graphql
    type Product {
        id: ID!
        title: String!
        description: String
        price: Float!
        originalPrice: Float
        discountPercentage: Float
        image: String
        category: String
        stock: Int!
        createdAt: String
        updatedAt: String
    }

    type Query {
        products: [Product!]!
        product(id: ID!): Product
    }
`;



module.exports = typeDefs;