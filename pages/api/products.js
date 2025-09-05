import { mongooseconnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export default async function handle(req, res) {
    const { method } = req;

    await mongooseconnect();

    if (method === 'POST') {
        const { Título, Descripción, Precio, Imagenes, Categoria, stock, colors, código} = req.body;

        const productDoc = await Product.create({
           Título, Descripción, Precio, Imagenes, Categoria, stock, colors, código
        })
        
        res.json(productDoc);
    }

    if (method === 'GET') {
      if(req.query?.id)  {
        const product = await Product.findById(req.query.id).populate('Categoria');
        res.json(product);
      }else {
        res.json(await Product.find().populate('Categoria'));
    }

    }

if (method === 'PUT') {
    const { Título, Descripción, Precio, Imagenes, stock, colors, código, _id} = req.body;
    let { Categoria } = req.body;
    
    if (Categoria === '') {
      Categoria = null;
    }
    
    // Prepare update object
    const updateData = {
        Título, 
        Descripción, 
        Precio, 
        Imagenes, 
        Categoria, 
        stock, 
        colors
    };
    
    // Only include código if it has a meaningful value
    if (código && código.trim() !== '') {
        updateData.código = código.trim();
    } else {
        // Remove the field entirely if it's empty
        updateData.$unset = { código: "" };
    }
    
    const result = await Product.updateOne({_id}, updateData);
    
    res.json(true);
}

if (method === 'DELETE') {
    if(req.query?.id) {
      await Product.deleteOne({_id:req.query?.id})
      res.json(true)
    }
}

}
