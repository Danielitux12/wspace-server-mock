import pkg from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:wspace_secure_password_2026@localhost:5433/wspace_db?schema=public"
});

const adapter = new PrismaPg(pool);

const prisma = new pkg.PrismaClient({ adapter });

export default prisma;
