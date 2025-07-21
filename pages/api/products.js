import { mongooseconnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";

export default async function handle(req, res) {
    const { method } = req;

    await mongooseconnect();

    if (method === 'POST') {
        const { Título, Descripción, Precio, Imagenes, Categoria} = req.body;

        const productDoc = await Product.create({

           Título, Descripción, Precio, Imagenes, Categoria
        })
        res.json(productDoc);
    }

    if (method === 'GET') {
      if(req.query?.id)  {
        res.json(await Product.findById(req.query.id).populate('Categoria'));
      }else {
        res.json(await Product.find().populate('Categoria'));
    }

    }

if (method === 'PUT') {
    const { Título, Descripción, Precio, Imagenes, Categoria, _id } = req.body;
    await Product.updateOne ({_id}, {
      Título, Descripción, Precio, Imagenes, Categoria
});
res.json(true);
}

if (method === 'DELETE') {
    if(req.query?.id) {
      await Product.deleteOne({_id:req.query?.id})
      res.json(true)
    }
}

}
