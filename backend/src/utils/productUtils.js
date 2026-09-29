const DOMPurify = require("isomorphic-dompurify");

const textFields = [
    "title",
    "description",
    "image",
    "category",
];

const cleanText = value => {
    if (value === undefined || value === null) {
        return value;
    }

    return DOMPurify.sanitize(String(value), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).trim();
};

const sanitizeProductFields = data => {
    const result = {};

    for (const field of textFields) {
        if (data[field] !== undefined) {
            result[field] = cleanText(data[field]);
        }
    }

    return result;
};

const buildProductUpdates = data => {
    const allowedFields = [
        "title",
        "description",
        "price",
        "image",
        "category",
        "stock",
    ];
    
    const updates = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = textFields.includes(field)
                ? cleanText(data[field])
                : data[field];
        }
    }
    return updates;
};

module.exports = {
    cleanText,
    sanitizeProductFields,
    buildProductUpdates,
};