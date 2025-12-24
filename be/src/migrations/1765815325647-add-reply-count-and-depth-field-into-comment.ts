import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplyCountAndDepthFieldIntoComment1765815325647 implements MigrationInterface {
  name = 'AddReplyCountAndDepthFieldIntoComment1765815325647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`depth\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`replyCount\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`body\``);
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`body\` varchar(500) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`body\``);
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD \`body\` varchar(200) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP COLUMN \`replyCount\``,
    );
    await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`depth\``);
  }
}
