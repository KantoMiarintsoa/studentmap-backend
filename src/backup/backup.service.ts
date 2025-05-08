import { Injectable, Logger } from '@nestjs/common';
import { PgBackupStrategy } from './strategy/pg-backup.strategy';

@Injectable()
export class BackupService {
    private readonly logger = new Logger(BackupService.name);

    constructor(private readonly pgStrategy: PgBackupStrategy) { }

    async performBackup() {
        this.logger.log('Début du backup...');
        // await this.pgStrategy.execute();
        this.logger.log('Backup terminé.');
    }
}