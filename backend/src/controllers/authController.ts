import { Response } from 'express';
import { RegisterInputSchema, LoginInputSchema } from '../types/shared';
import { db } from '../db';
import { hashPassword, verifyPassword, generateToken } from '../auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  const result = RegisterInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const { email, password, name } = result.data;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name
      }
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const result = LoginInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const { email, password } = result.data;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const user = await db.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error: any) {
    console.error('Fetch Current User Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateInputSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional()
});

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const result = updateInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const input = result.data;

  try {
    const user = await db.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateData: any = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.email !== undefined && input.email !== user.email) {
      const emailTaken = await db.user.findUnique({ where: { email: input.email } });
      if (emailTaken) {
        return res.status(409).json({ error: 'Email already in use.' });
      }
      updateData.email = input.email;
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isValid = verifyPassword(input.currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect current password.' });
      }
      updateData.passwordHash = hashPassword(input.newPassword);
    }

    const updated = await db.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    return res.status(200).json({
      id: updated.id,
      email: updated.email,
      name: updated.name
    });
  } catch (error: any) {
    console.error('Update User Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
