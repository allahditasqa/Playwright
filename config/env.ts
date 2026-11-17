// Central place for environment settings. Override with environment variables or a .env file.
// TEST_ENV=staging loads .env.staging first (dotenv never overwrites a value that is already set), then .env.
import dotenv from 'dotenv';
import path from 'path';

if (process.env.TEST_ENV) {
  dotenv.config({ path: path.resolve(__dirname, '..', `.env.${process.env.TEST_ENV}`), quiet: true });
}
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

export const ENV = {
  baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiURL: process.env.API_URL ?? 'https://jsonplaceholder.typicode.com',
};
