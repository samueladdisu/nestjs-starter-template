// src/shared/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MongoServerError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const now = new Date().toISOString();

    console.log('exception', exception);

    // 1) Mongo duplicate-key
    if (
      exception instanceof MongoServerError &&
      exception.code === 11000 &&
      exception.keyValue
    ) {
      const [field, value] = Object.entries(exception.keyValue)[0] as [
        string,
        string,
      ];
      const friendly = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" already exists.`;
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: now,
        path: req.url,
        message: friendly,
      });
    }

    // 2) Mongoose validation errors (schema-level)
    if ((exception as any).name === 'ValidationError') {
      const valErr = exception as any;
      const messages = Object.values(valErr.errors).map((e: any) => e.message);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: now,
        path: req.url,
        message: messages,
      });
    }

    // 3) Mongoose cast errors (e.g. invalid ObjectId)
    if ((exception as any).name === 'CastError') {
      const castErr = exception as any;
      const friendly = `Invalid ${castErr.path}: "${castErr.value}"`;
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: now,
        path: req.url,
        message: friendly,
      });
    }

    // 4) SyntaxError from JSON.parse in body
    if (
      exception instanceof SyntaxError &&
      exception.message.includes('JSON')
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: now,
        path: req.url,
        message: 'Malformed JSON in request body.',
      });
    }

    // 5) Any HttpException (including class-validator errors)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      // class-validator returns { message: [...], error: "..."} or a string
      const message =
        typeof resp === 'string' ? resp : (resp as any).message || resp;

      console.log('message', message);
      return res.status(status).json({
        statusCode: status,
        timestamp: now,
        path: req.url,
        message,
      });
    }

    // 6) Fallback – 500 Internal Server Error
    console.error('Unhandled exception', exception);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: now,
      path: req.url,
      message: 'Internal server error.',
    });
  }
}
