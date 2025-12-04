import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1764298814328 implements MigrationInterface {
    name = 'InitDatabase1764298814328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`body\` varchar(200) NOT NULL, \`authorId\` int NULL, \`articleId\` int NULL, \`parentId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(50) NOT NULL, UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`articles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`title\` varchar(100) NOT NULL, \`slug\` varchar(100) NOT NULL, \`description\` varchar(100) NOT NULL, \`body\` text NOT NULL, \`status\` enum ('draft', 'pending', 'published', 'rejected') NOT NULL DEFAULT 'draft', \`cover_image\` varchar(200) NULL, \`published_at\` timestamp NULL, \`views\` int NOT NULL DEFAULT '0', \`reading_time\` int NOT NULL DEFAULT '0', \`deleted_at\` datetime(6) NULL, \`authorId\` int NULL, UNIQUE INDEX \`IDX_3c28437db9b5137136e1f6d609\` (\`title\`), UNIQUE INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`title\` varchar(255) NOT NULL, \`body\` varchar(255) NOT NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`action_url\` varchar(255) NULL, \`recipientId\` int NULL, \`senderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(20) NOT NULL, \`email\` varchar(30) NOT NULL, \`username\` varchar(10) NOT NULL, \`password\` varchar(200) NOT NULL, \`bio\` varchar(200) NOT NULL DEFAULT '', \`image\` varchar(100) NOT NULL DEFAULT '', \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER', \`fcm_token\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`articles_tag_list_tags\` (\`articlesId\` int NOT NULL, \`tagsId\` int NOT NULL, INDEX \`IDX_77fbcba9604a1725f5ac5f5aac\` (\`articlesId\`), INDEX \`IDX_92bf241babb02aca4f6a7e2d8c\` (\`tagsId\`), PRIMARY KEY (\`articlesId\`, \`tagsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_favorite_articles\` (\`article_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_e0e08ca4194585a4068c6d2f9d\` (\`article_id\`), INDEX \`IDX_c60904e8896cc251f8cde67697\` (\`user_id\`), PRIMARY KEY (\`article_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_follows\` (\`follower_id\` int NOT NULL, \`following_id\` int NOT NULL, INDEX \`IDX_f7af3bf8f2dcba61b4adc10823\` (\`follower_id\`), INDEX \`IDX_5a71643cec3110af425f92e76e\` (\`following_id\`), PRIMARY KEY (\`follower_id\`, \`following_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4548cc4a409b8651ec75f70e280\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_b0011304ebfcb97f597eae6c31f\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8770bd9030a3d13c5f79a7d2e81\` FOREIGN KEY (\`parentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_65d9ccc1b02f4d904e90bd76a34\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_db873ba9a123711a4bff527ccd5\` FOREIGN KEY (\`recipientId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_ddb7981cf939fe620179bfea33a\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`articles_tag_list_tags\` ADD CONSTRAINT \`FK_77fbcba9604a1725f5ac5f5aaca\` FOREIGN KEY (\`articlesId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`articles_tag_list_tags\` ADD CONSTRAINT \`FK_92bf241babb02aca4f6a7e2d8cd\` FOREIGN KEY (\`tagsId\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorite_articles\` ADD CONSTRAINT \`FK_e0e08ca4194585a4068c6d2f9d9\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorite_articles\` ADD CONSTRAINT \`FK_c60904e8896cc251f8cde676978\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_f7af3bf8f2dcba61b4adc108239\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_5a71643cec3110af425f92e76e5\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_5a71643cec3110af425f92e76e5\``);
        await queryRunner.query(`ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_f7af3bf8f2dcba61b4adc108239\``);
        await queryRunner.query(`ALTER TABLE \`user_favorite_articles\` DROP FOREIGN KEY \`FK_c60904e8896cc251f8cde676978\``);
        await queryRunner.query(`ALTER TABLE \`user_favorite_articles\` DROP FOREIGN KEY \`FK_e0e08ca4194585a4068c6d2f9d9\``);
        await queryRunner.query(`ALTER TABLE \`articles_tag_list_tags\` DROP FOREIGN KEY \`FK_92bf241babb02aca4f6a7e2d8cd\``);
        await queryRunner.query(`ALTER TABLE \`articles_tag_list_tags\` DROP FOREIGN KEY \`FK_77fbcba9604a1725f5ac5f5aaca\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_ddb7981cf939fe620179bfea33a\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_db873ba9a123711a4bff527ccd5\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_65d9ccc1b02f4d904e90bd76a34\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8770bd9030a3d13c5f79a7d2e81\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_b0011304ebfcb97f597eae6c31f\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4548cc4a409b8651ec75f70e280\``);
        await queryRunner.query(`DROP INDEX \`IDX_5a71643cec3110af425f92e76e\` ON \`user_follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_f7af3bf8f2dcba61b4adc10823\` ON \`user_follows\``);
        await queryRunner.query(`DROP TABLE \`user_follows\``);
        await queryRunner.query(`DROP INDEX \`IDX_c60904e8896cc251f8cde67697\` ON \`user_favorite_articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_e0e08ca4194585a4068c6d2f9d\` ON \`user_favorite_articles\``);
        await queryRunner.query(`DROP TABLE \`user_favorite_articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_92bf241babb02aca4f6a7e2d8c\` ON \`articles_tag_list_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_77fbcba9604a1725f5ac5f5aac\` ON \`articles_tag_list_tags\``);
        await queryRunner.query(`DROP TABLE \`articles_tag_list_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` ON \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c28437db9b5137136e1f6d609\` ON \`articles\``);
        await queryRunner.query(`DROP TABLE \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
    }

}
