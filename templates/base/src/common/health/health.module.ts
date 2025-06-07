import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseHealthIndicator } from './mongoose.health';
import { SystemHealthIndicator } from './system.health';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [MongooseHealthIndicator, SystemHealthIndicator],
})
export class HealthModule {}
