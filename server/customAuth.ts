import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { storage } from './storage';
import type { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { RegisterData, LoginData } from '@shared/schema';
import type { User } from '@shared/schema';

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Token generation
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateJWT(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '7d' }
  );
}

// Email service
export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  // For development, we'll just log the verification link
  // In production, you'd configure a real email service
  if (process.env.NODE_ENV === 'development') {
    console.log('=== EMAIL VERIFICATION ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your eSlate account`);
    console.log(`Hi ${firstName},`);
    console.log(`Please verify your email by clicking: http://localhost:5000/verify-email?token=${token}`);
    console.log('==========================');
    return;
  }

  // Production email configuration (you'll need to set up your email service)
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Verification link:', `http://localhost:5000/verify-email?token=${token}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@eslate.com',
    to: email,
    subject: 'Verify your eSlate account',
    html: `
      <h2>Welcome to eSlate!</h2>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="http://localhost:5000/verify-email?token=${token}">Verify Email</a>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, firstName: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== PASSWORD RESET ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your eSlate password`);
    console.log(`Hi ${firstName},`);
    console.log(`Reset your password: http://localhost:5000/reset-password?token=${token}`);
    console.log('======================');
    return;
  }

  // Production email would be sent here
  console.warn('Email service not configured. Reset link:', `http://localhost:5000/reset-password?token=${token}`);
}

export interface SubmissionNotificationData {
  parentEmail: string;
  parentFirstName: string;
  studentFirstName: string;
  studentLastName: string;
  assignmentTitle: string;
  submittedAt: Date;
  isLate: boolean;
  status: string;
}

export async function sendHomeworkSubmissionEmail(data: SubmissionNotificationData) {
  const { parentEmail, parentFirstName, studentFirstName, studentLastName, assignmentTitle, submittedAt, isLate, status } = data;
  
  const formattedDate = submittedAt.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const lateWarning = isLate ? '<p style="color: #dc2626; font-weight: bold;">Note: This submission was submitted after the due date.</p>' : '';
  const statusBadge = status === 'submitted' 
    ? '<span style="background-color: #22c55e; color: white; padding: 4px 8px; border-radius: 4px;">Submitted</span>'
    : `<span style="background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;

  if (process.env.NODE_ENV === 'development') {
    console.log('=== PARENT HOMEWORK NOTIFICATION ===');
    console.log(`To: ${parentEmail}`);
    console.log(`Subject: ${studentFirstName} ${studentLastName} has submitted homework`);
    console.log(`Hi ${parentFirstName},`);
    console.log(`Your child ${studentFirstName} ${studentLastName} has submitted their homework:`);
    console.log(`- Assignment: ${assignmentTitle}`);
    console.log(`- Submitted: ${formattedDate}`);
    console.log(`- Status: ${status}`);
    if (isLate) console.log(`- Note: This was a late submission`);
    console.log('=====================================');
    return;
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Parent notification not sent for:', assignmentTitle);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@eslate.com',
    to: parentEmail,
    subject: `${studentFirstName} ${studentLastName} has submitted homework - eSlate`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Homework Submission Notification</h2>
        <p>Hi ${parentFirstName},</p>
        <p>Your child <strong>${studentFirstName} ${studentLastName}</strong> has submitted their homework.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p style="margin: 0 0 8px 0;"><strong>Submitted:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Status:</strong> ${statusBadge}</p>
        </div>
        
        ${lateWarning}
        
        <p>You can log in to eSlate to view more details about your child's progress.</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          This is an automated notification from eSlate. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}

// Authentication middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Check session-based authentication first
    if ((req as any).session?.userId) {
      const user = await storage.getUser((req as any).session.userId);
      if (user && user.isActive && !user.isDeleted) {
        req.user = user;
        return next();
      }
    }

    // Check JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as { userId: string };
        const user = await storage.getUser(decoded.userId);
        if (user && user.isActive && !user.isDeleted) {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
      }
    }

    // Debug logging for authentication failures
    console.error('Authentication failed:', {
      hasSession: !!(req as any).session?.userId,
      hasAuthHeader: !!authHeader,
      userAgent: req.headers['user-agent'],
      path: req.path
    });

    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
}

// Setup authentication routes
export function setupCustomAuth(app: Express) {
  app.use(getSession());

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, role } = req.body as RegisterData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      // Hash password and generate verification token
      const hashedPassword = await hashPassword(password);
      const verificationToken = generateVerificationToken();

      // Create user
      const userId = await storage.createUserWithAuth({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'student',
        authProvider: 'email',
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken, firstName);

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        userId,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginData;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive || user.isDeleted) {
        return res.status(401).json({ message: 'Account is inactive' });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Set session
      (req as any).session.userId = user.id;

      // Generate JWT for API access
      const token = generateJWT(user.id);

      // Return user data (exclude password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Get role-specific data
      let roleData = null;
      switch (req.user.role) {
        case 'student':
          roleData = await storage.getStudentByUserId(req.user.id);
          break;
        case 'parent':
          roleData = await storage.getParentByUserId(req.user.id);
          break;
        case 'tutor':
          roleData = await storage.getTutorByUserId(req.user.id);
          break;
        case 'company_admin':
          roleData = await storage.getCompanyAdminByUserId(req.user.id);
          break;
      }

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = req.user;
      res.json({ ...userWithoutPassword, roleData });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Email verification endpoint
  app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      const success = await storage.verifyEmailToken(token);
      if (!success) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Forgot password endpoint
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
      }

      const resetToken = generateVerificationToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await storage.setPasswordResetToken(user.id, resetToken, expires);
      await sendPasswordResetEmail(email, resetToken, user.firstName || 'User');

      res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });

  // Reset password endpoint
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
      }

      const hashedPassword = await hashPassword(password);
      const success = await storage.resetPassword(token, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  });
}