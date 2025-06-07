import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { SystemHealthIndicator } from './system.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private system: SystemHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const [mongodb, system] = await Promise.all([
      this.mongoose.pingCheck('mongodb'),
      this.system.check('system'),
    ]);

    const isHealthy =
      mongodb.mongodb.status === 'up' && system.system.status === 'up';

    return {
      status: isHealthy ? 'up' : 'down',
      services: {
        ...mongodb,
        ...system,
      },
    };
  }
}
