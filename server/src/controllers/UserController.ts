import bcrypt from "bcrypt";

import { User } from "../models/index.js";
import { BaseController } from "./base/BaseController.js";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "hr" | "applicant";
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
  };
}

export interface UserFilters {
  role?: "hr" | "applicant";
  page?: number;
  limit?: number;
  search?: string;
}

export class UserController extends BaseController {
  // Register a new user
  async registerUser(data: CreateUserData) {
    try {
      const { name, email, password, role, profile } = data;

      // Validate required fields
      const validationError = this.validateRequired({
        name,
        email,
        password,
        role,
      });

      if (validationError) {
        return this.badRequest(validationError);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return this.badRequest("Invalid email format");
      }

      // Validate password strength
      if (password.length < 6) {
        return this.badRequest("Password must be at least 6 characters long");
      }

      // Validate role
      if (!["hr", "applicant"].includes(role)) {
        return this.badRequest("Role must be either 'hr' or 'applicant'");
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return this.badRequest("User with this email already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        profile: profile || {},
      });

      const savedUser = await user.save();

      // Return user without password
      const userResponse = {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        profile: savedUser.profile,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      };

      return this.created(userResponse, "User registered successfully");
    } catch (error: any) {
      console.error("Error registering user:", error);
      if (error.code === 11000) {
        return this.badRequest("User with this email already exists");
      }
      return this.internalError("Failed to register user");
    }
  }

  // Login user
  async loginUser(data: LoginData) {
    try {
      const { email, password } = data;

      // Validate required fields
      const validationError = this.validateRequired({ email, password });
      if (validationError) {
        return this.badRequest(validationError);
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return this.badRequest("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.badRequest("Invalid email or password");
      }

      // Return user without password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return this.success(userResponse, "Login successful");
    } catch (error: any) {
      console.error("Error logging in user:", error);
      return this.internalError("Failed to login user");
    }
  }

  // Get user by ID
  async getUserById(userId: string) {
    try {
      if (!userId) {
        return this.badRequest("User ID is required");
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return this.notFound("User not found");
      }

      return this.success(user, "User retrieved successfully");
    } catch (error: any) {
      console.error("Error getting user:", error);
      return this.internalError("Failed to retrieve user");
    }
  }

  // Update user
  async updateUser(userId: string, data: UpdateUserData) {
    try {
      if (!userId) {
        return this.badRequest("User ID is required");
      }

      const { name, email, password, profile } = data;

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return this.notFound("User not found");
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return this.badRequest("Invalid email format");
        }

        // Check if email is already taken by another user
        const emailExists = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: userId },
        });
        if (emailExists) {
          return this.badRequest("Email is already taken by another user");
        }
      }

      // Validate password if provided
      if (password && password.length < 6) {
        return this.badRequest("Password must be at least 6 characters long");
      }

      // Prepare update data
      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (profile) updateData.profile = { ...existingUser.profile, ...profile };

      // Hash new password if provided
      if (password) {
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      return this.success(updatedUser, "User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error.code === 11000) {
        return this.badRequest("Email is already taken by another user");
      }
      return this.internalError("Failed to update user");
    }
  }

  // Delete user
  async deleteUser(userId: string) {
    try {
      if (!userId) {
        return this.badRequest("User ID is required");
      }

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return this.notFound("User not found");
      }

      return this.success(null, "User deleted successfully");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return this.internalError("Failed to delete user");
    }
  }

  // Get all users with filters
  async getUsers(filters: UserFilters) {
    try {
      const { page = 1, limit = 10, role, search } = filters;
      const { skip } = this.parsePagination({ page, limit });

      // Build query
      const query: any = {};
      if (role) {
        query.role = role;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Get users and total count
      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        User.countDocuments(query),
      ]);

      const pagination = this.createPaginationResponse(
        Number(page),
        Number(limit),
        total
      );

      return this.success(
        {
          users,
          pagination,
        },
        "Users retrieved successfully"
      );
    } catch (error: any) {
      console.error("Error getting users:", error);
      return this.internalError("Failed to retrieve users");
    }
  }

  // Get users by role (helper method)
  async getUsersByRole(role: "hr" | "applicant") {
    try {
      const users = await User.find({ role }).select("-password");
      return this.success(users, `${role} users retrieved successfully`);
    } catch (error: any) {
      console.error("Error getting users by role:", error);
      return this.internalError("Failed to retrieve users");
    }
  }

  // Check if email exists (helper method)
  async checkEmailExists(email: string) {
    try {
      if (!email) {
        return this.badRequest("Email is required");
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      return this.success({ exists: !!user }, "Email check completed");
    } catch (error: any) {
      console.error("Error checking email:", error);
      return this.internalError("Failed to check email");
    }
  }
}
