import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseHealthIndicator {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = this.connection.readyState === 1;
      console.log('this.connection', this.connection);
      return {
        [key]: {
          status: isHealthy ? 'up' : 'down',
          readyState: this.connection.readyState,
          url: this.connection.host,
        },
      };
    } catch (error: any) {
      return {
        [key]: {
          status: 'down',
          error: error.message,
          url: this.connection.host,
        },
      };
    }
  }
}
