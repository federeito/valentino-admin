import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;
  
  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET':
        try {
          const { status } = req.query;
          
          let filter = {};
          if (status === 'pending') {
            filter.isApproved = { $eq: false };
          } else if (status === 'approved') {
            filter.$or = [
              { isApproved: { $eq: true } },
              { isApproved: { $exists: false } } // Treat users without isApproved field as approved (admin users)
            ];
          }

          const users = await db.collection('users')
            .find(filter)
            .project({ password: 0, __v: 0 }) // Exclude sensitive fields
            .sort({ createdAt: -1 })
            .toArray();

          // Add default values for users without approval fields (admin users)
          const usersWithDefaults = users.map(user => ({
            ...user,
            isApproved: user.isApproved !== undefined ? user.isApproved : true,
            canViewPrices: user.canViewPrices !== undefined ? user.canViewPrices : true
          }));

          res.status(200).json({ success: true, data: usersWithDefaults });
        } catch (error) {
          console.error('GET /api/admin/users error:', error);
          res.status(500).json({ success: false, error: error.message });
        }
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}
