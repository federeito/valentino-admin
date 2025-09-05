import mongoose, { Schema, models, model } from "mongoose";

const ProductSchema = new Schema({
    Título: {type: String, required: true},
    Descripción: {type: String, required: true},
    Precio: {type: Number, required: true},
    Imagenes: [{type: String}],
    Categoria: {type:mongoose.Schema.Types.ObjectId, ref: 'Category'},
    stock: { type: Number, required: true, default: 0 },
    colors: [{ name: String, code: String }],
    código: {type: String, required: false},
});

// Add a custom index that only applies to non-null values
ProductSchema.index({ código: 1 }, { unique: true, sparse: true });

export const Product = models.Product || model('Product', ProductSchema);