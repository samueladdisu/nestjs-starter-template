import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';
import checkDiskSpace from 'check-disk-space';

@Injectable()
export class SystemHealthIndicator {
  private readonly startTime = Date.now();
  private readonly diskPath = process.platform === 'win32' ? 'C:\\' : '/';

  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      const memory = os.freemem() / os.totalmem();
      const diskInfo = await checkDiskSpace(this.diskPath);
      const cpuUsage = os.loadavg()[0];
      const uptime = process.uptime();

      const isHealthy = memory > 0.1 && diskInfo.free > 1024 * 1024 * 1024; // 1GB free space minimum

      return {
        [key]: {
          status: isHealthy ? 'up' : 'down',
          memory: {
            free: Math.round(memory * 100) + '%',
            total: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + 'GB',
          },
          disk: {
            free: Math.round(diskInfo.free / (1024 * 1024 * 1024)) + 'GB',
            total: Math.round(diskInfo.size / (1024 * 1024 * 1024)) + 'GB',
            path: this.diskPath,
          },
          cpu: {
            load: cpuUsage.toFixed(2),
            cores: os.cpus().length,
          },
          uptime: {
            seconds: Math.round(uptime),
            formatted: this.formatUptime(uptime),
          },
        },
      };
    } catch (error: any) {
      return {
        [key]: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}
