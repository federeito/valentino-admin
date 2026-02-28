import { mongooseconnect } from "@/lib/mongoose"; // Adjust path if necessary
import { Order } from "@/models/Order"; // Adjust path if necessary

export default async function handle(req, res) {
    await mongooseconnect();

    if (req.method === 'GET') {
        res.json(await Order.find().sort({ createdAt: -1 }));
    }

    if (req.method === 'PUT') {
        const { _id, status } = req.body;
        
        const currentOrder = await Order.findById(_id).lean();
        
        if (!currentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        let statusHistory = [];
        if (currentOrder.statusHistory && Array.isArray(currentOrder.statusHistory)) {
            statusHistory = [...currentOrder.statusHistory];
        }
        
        statusHistory.push({
            status,
            timestamp: new Date(),
        });
        
        await Order.updateOne(
            { _id },
            { 
                $set: {
                    status,
                    statusHistory
                }
            }
        );
        
        const updateResult = await Order.findById(_id);
        
        res.json(updateResult);
    }

    if (req.method === 'DELETE') {
        const { _id } = req.query;
        await Order.deleteOne({ _id });
        res.json(true);
    }
}