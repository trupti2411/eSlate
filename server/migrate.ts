
import { db } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Check if assignments table exists and has the correct structure
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assignments' AND table_schema = 'public'
    `);
    
    console.log('Current assignments table columns:', result);
    
    // Add company_id column if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE assignments 
        ADD COLUMN IF NOT EXISTS company_id varchar REFERENCES tutoring_companies(id)
      `);
      console.log('Added company_id column to assignments table');
    } catch (error) {
      console.log('company_id column might already exist:', error.message);
    }
    
    // Update existing assignments to have a company_id if possible
    await db.execute(sql`
      UPDATE assignments 
      SET company_id = (
        SELECT tutors.company_id 
        FROM tutors 
        WHERE tutors.id = assignments.tutor_id
      )
      WHERE assignments.company_id IS NULL AND assignments.tutor_id IS NOT NULL
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
