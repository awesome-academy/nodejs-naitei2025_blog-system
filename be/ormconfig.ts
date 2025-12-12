import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path/win32';

config(); // Tải các biến môi trường từ file .env

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '34713'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: true,
  migrationsTableName: 'migrations', // Tên bảng để theo dõi migrations đã chạy
});
