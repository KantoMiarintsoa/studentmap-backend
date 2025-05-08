import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from '../backup.service';

@Injectable()
export class BackupCron {
    constructor(private readonly backupService: BackupService) { }

    @Cron(CronExpression.EVERY_WEEKEND)
    handleDailyBackup() {
        return this.backupService.performBackup();
    }
}
