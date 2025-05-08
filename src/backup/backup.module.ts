import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { PgBackupStrategy } from './strategy/pg-backup.strategy';
import { BackupCron } from './sheduler/backup.cron';


@Module({
  providers: [BackupService, PgBackupStrategy, BackupCron]
})
export class BackupModule { }
