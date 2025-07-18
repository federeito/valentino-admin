const { Schema, models, model } = require("mongoose");

const ProductSchema = new Schema({
    Título: {type: String, required: true},
    Descripción: {type: String, required: true},
    Precio: {type: Number, required: true},
    Imagenes: [{type: String}],
})

export const Product = models.Product || model('Product', ProductSchema);