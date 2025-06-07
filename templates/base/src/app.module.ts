import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/config';
import { CommonModule } from './common/common.module';
import { LoggerModule } from './common/logger/logger.module';
// __IMPORT_MODULES__

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongoUri'),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
      }),
      global: true,
    }),
    HealthModule,
    CommonModule,
    LoggerModule,
    // __MODULES__
  ],
})
export class AppModule {}
