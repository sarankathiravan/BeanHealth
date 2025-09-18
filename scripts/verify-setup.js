// Supabase Setup Verification Script
// Run with: node scripts/verify-setup.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Verifying Supabase Setup...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySetup() {
    try {
        // Test database connection
        console.log('\n2. Database Connection:');
        const { data: tables, error: dbError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (dbError) {
            console.log(`   ❌ Database Error: ${dbError.message}`);
        } else {
            console.log('   ✅ Database connection successful');
        }

        // Test storage connection
        console.log('\n3. Storage Connection:');
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        
        if (storageError) {
            console.log(`   ❌ Storage Error: ${storageError.message}`);
        } else {
            console.log('   ✅ Storage connection successful');
            console.log(`   Available buckets: ${buckets?.map(b => b.name).join(', ') || 'None'}`);
            
            // Check for medical-records bucket
            const hasMedicalRecordsBucket = buckets?.some(b => b.name === 'medical-records');
            if (hasMedicalRecordsBucket) {
                console.log('   ✅ medical-records bucket exists');
            } else {
                console.log('   ⚠️  medical-records bucket not found - please create it');
            }
        }

        // Test Gemini API
        console.log('\n4. Gemini AI Configuration:');
        const geminiKey = process.env.VITE_GEMINI_API_KEY;
        console.log(`   VITE_GEMINI_API_KEY: ${geminiKey ? '✅ Set' : '⚠️  Not set (AI features will be disabled)'}`);

        console.log('\n🎉 Setup verification complete!');
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
    }
}

verifySetup();