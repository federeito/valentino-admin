import mongoose from "mongoose";
import { Product } from "@/models/Product";

// Simple connection function if mongooseConnect doesn't work
async function connectDB() {
    if (mongoose.connections[0].readyState) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    const { method } = req;
    
    try {
        await connectDB();
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({ error: 'Database connection failed' });
    }

    if (method === 'GET') {
        const { code, excludeId } = req.query;
        
        if (!code) {
            return res.status(400).json({ error: 'Code parameter is required' });
        }

        try {
            const query = { código: code };
            
            // If excludeId is provided, exclude that product from the search (for updates)
            if (excludeId && excludeId !== '') {
                query._id = { $ne: excludeId };
            }

            const existingProduct = await Product.findOne(query);
            
            res.json({ exists: !!existingProduct });
        } catch (error) {
            console.error('Error checking duplicate code:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
