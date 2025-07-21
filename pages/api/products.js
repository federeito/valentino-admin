import { mongooseconnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";

export default async function handle(req, res) {
    const { method } = req;

    await mongooseconnect();

    if (method === 'POST') {
        const { Título, Descripción, Precio, Imagenes } = req.body;

        const productDoc = await Product.create({

            Título, Descripción, Precio, Imagenes
        })
        res.json(productDoc);
    }

    if (method === 'GET') {
      if(req.query?.id)  {
        res.json(await Product.findById(req.query.id));
      }else {
        res.json(await Product.find());
    }

    }

if (method === 'DELETE') {
    if(req.query.id) {
      await Project.deleteOne({_id: req.query.id})
      res.json(true)
    }
}

}
