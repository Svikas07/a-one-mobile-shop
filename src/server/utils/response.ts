import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  }

  static error(message: string, status: number = 400) {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return this.error(message, 404);
  }

  static serverError(message: string = 'Internal server error') {
    return this.error(message, 500);
  }
}
