import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await db.user.count();
    const totalForms = await db.form.count();
    const totalSubmissions = await db.submission.count();

    // Fetch user details for admin user management
    const usersRaw = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { forms: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const users = usersRaw.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      formCount: u._count.forms,
      role: u.role === 'ADMIN' ? 'Admin' : 'Creator'
    }));

    // Calculate dynamic conversion rate (percent of live forms with at least 1 response)
    const formsWithResponses = await db.form.count({
      where: {
        submissions: {
          some: {}
        }
      }
    });
    const globalConversionRate = totalForms > 0 ? Math.round((formsWithResponses / totalForms) * 100) : 0;

    // Last 7 days submissions (aggregated)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const submissionsOverTime = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await db.submission.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay
            }
          }
        });

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return { day: dayName, count };
      })
    );

    // Mock system status checks
    const systemHealth = {
      database: { status: 'Connected', latency: '4ms' },
      gemini: { status: 'Active', latency: '120ms' },
      vercel: { status: 'Healthy', deployment: 'Production' }
    };

    return res.status(200).json({
      totalUsers,
      totalForms,
      totalSubmissions,
      globalConversionRate,
      users,
      submissionsOverTime,
      systemHealth
    });
  } catch (error) {
    console.error('Fetch Admin Stats Error:', error);
    return res.status(500).json({ error: 'Internal server error while fetching admin stats.' });
  }
};

export const deleteUserByAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete the admin account.' });
    }

    await db.user.delete({ where: { id: userId } });

    return res.status(200).json({ success: true, message: 'User account and forms deleted successfully.' });
  } catch (error) {
    console.error('Delete User by Admin Error:', error);
    return res.status(500).json({ error: 'Internal server error while deleting user.' });
  }
};
