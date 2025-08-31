import { connectToDatabase } from '../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  
  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET':
        try {
          // Get all pending approval users (users with isApproved explicitly set to false)
          const pendingUsers = await db.collection('users')
            .find({ isApproved: { $eq: false } })
            .project({ password: 0, __v: 0 }) // Exclude sensitive fields
            .toArray();
          
          res.status(200).json({ success: true, data: pendingUsers });
        } catch (error) {
          console.error('GET /api/admin/approvals error:', error);
          res.status(500).json({ success: false, error: error.message });
        }
        break;

      case 'PUT':
        try {
          const { userId, action, isApproved, canViewPrices } = req.body;

          if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
          }

          let updateData = {};

          if (action === 'approve' || action === 'reject') {
            updateData.isApproved = action === 'approve';
          }

          if (typeof canViewPrices === 'boolean') {
            updateData.canViewPrices = canViewPrices;
          }

          if (typeof isApproved === 'boolean') {
            updateData.isApproved = isApproved;
          }

          if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid update data provided' });
          }

          // Add updatedAt timestamp
          updateData.updatedAt = new Date();

          const result = await db.collection('users')
            .updateOne(
              { _id: new ObjectId(userId) },
              { $set: updateData }
            );

          if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
          }

          res.status(200).json({ success: true, message: 'User updated successfully' });
        } catch (error) {
          console.error('PUT /api/admin/approvals error:', error);
          res.status(500).json({ success: false, error: error.message });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}
