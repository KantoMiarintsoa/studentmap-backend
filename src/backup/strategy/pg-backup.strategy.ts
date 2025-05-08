import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class PgBackupStrategy {
    private readonly logger = new Logger(PgBackupStrategy.name);

    async execute() {
        const date = new Date().toISOString().split('T')[0];

        // Spécification du répertoire de sauvegarde
        const backupDir = path.resolve('C:', 'Users', 'mahef', 'Documents', 'projects', 'Kanto', 'ProjeFinEtude', 'StudentMap', 'backup');

        // Vérifiez si le répertoire de sauvegarde existe, sinon créez-le
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log(`Répertoire de sauvegarde créé : ${backupDir}`);
        }

        // Création du chemin du fichier de sauvegarde avec date
        const backupFile = path.resolve(backupDir, `backup-${date}.sql`);

        // Récupération des variables d'environnement
        const dbName = process.env.DB_NAME;
        const dbPassword = process.env.DB_PASSWORD;
        const dbHost = process.env.DB_HOST;
        const dbUser = process.env.DB_USER;

        if (!dbUser || !dbHost || !dbName || !dbPassword) {
            this.logger.error('Les variables d\'environnement sont manquantes');
            return;
        }

        const command = `pg_dump -U ${dbUser} -h ${dbHost} -d ${dbName} > "${backupFile}"`;

        console.log(`Commande à exécuter : ${command}`);

        try {
            const { stdout, stderr } = await execAsync(command);

            if (stdout) {
                console.log(`Sortie standard : ${stdout}`);
            }

            if (stderr) {
                console.error(`Erreur standard : ${stderr}`);
            }

            this.logger.log(`Fichier sauvegardé : ${backupFile}`);
        } catch (error) {
            this.logger.error('Erreur lors du backup', error);
        }
    }
}