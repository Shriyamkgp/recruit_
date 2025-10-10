import type { Request, Response } from "express";

export interface ControllerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export abstract class BaseController {
  protected createResponse<T>(
    success: boolean,
    statusCode: number,
    data?: T,
    message?: string,
    error?: string
  ): ControllerResponse<T> {
    return {
      success,
      statusCode,
      ...(data && { data }),
      ...(message && { message }),
      ...(error && { error }),
    };
  }

  protected success<T>(
    data?: T,
    message?: string,
    statusCode: number = 200
  ): ControllerResponse<T> {
    return this.createResponse(true, statusCode, data, message);
  }

  protected created<T>(data?: T, message?: string): ControllerResponse<T> {
    return this.createResponse(true, 201, data, message);
  }

  protected badRequest(error: string): ControllerResponse {
    return this.createResponse(false, 400, undefined, undefined, error);
  }

  protected notFound(error: string = "Resource not found"): ControllerResponse {
    return this.createResponse(false, 404, undefined, undefined, error);
  }

  protected internalError(
    error: string = "Internal server error"
  ): ControllerResponse {
    return this.createResponse(false, 500, undefined, undefined, error);
  }

  public sendResponse<T>(
    res: Response,
    response: ControllerResponse<T>
  ): Response {
    return res.status(response.statusCode).json({
      ...(response.data && { ...response.data }),
      ...(response.message && { message: response.message }),
      ...(response.error && { error: response.error }),
    });
  }

  protected validateRequired(fields: Record<string, any>): string | null {
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === "") {
        return `${key} is required`;
      }
    }
    return null;
  }

  protected parsePagination(query: any): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  protected createPaginationResponse(
    page: number,
    limit: number,
    total: number
  ) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
