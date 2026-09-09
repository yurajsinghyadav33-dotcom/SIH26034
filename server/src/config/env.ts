import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or local directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  corsOrigin: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  uploadDir: string;
  maxFileSizeMb: number;
  ruleEngineVersion: string;
}

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/legal_metrology_db',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production_32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  ruleEngineVersion: process.env.RULE_ENGINE_VERSION || '2011.1',
};
