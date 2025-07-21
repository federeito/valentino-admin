import { mongooseconnect } from "@/lib/mongoose"; // Adjust path if necessary
import { Order } from "@/models/Order"; // Adjust path if necessary

export default async function handle(req, res) {
    await mongooseconnect();

    if (req.method === 'GET') {
        // Fetch all orders, newest first
        res.json(await Order.find().sort({ createdAt: -1 }));
    }
}