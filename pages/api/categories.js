import { mongooseconnect } from "@/lib/mongoose";
import { Category } from "@/models/Category"; // Import your new Category model

export default async function handle(req, res) {
  const { method } = req;
  await mongooseconnect();

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await Category.findById(req.query.id));
    } else {
      res.json(await Category.find());
    }
  }

  if (method === 'POST') {
    const { name } = req.body;
    const categoryDoc = await Category.create({ name });
    res.json(categoryDoc);
  }

  if (method === 'PUT') {
    const { name, _id } = req.body;
    await Category.updateOne({ _id }, { name });
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await Category.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}