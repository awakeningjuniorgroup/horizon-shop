import "dotenv/config";
import mongoose from 'mongoose';
import User from './models/User.js';
import { clerhorizon shopient } from '@clerk/clerk-sdk-node';
import bcrypt from 'bcryptjs';

const createSuperAdminWithClerk = async () => {
  try {
    console.log('🚀 Starting Super Admin Creation with Clerk Sync...\n');
    
    // 1. Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected!\n');

    // 2. Check if Super Admin already exists
    console.log('2️⃣ Checking if Super Admin already exists...');
    const existingAdmin = await User.findOne({ email: 'awakeningjuniorgroup@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Super Admin already exists in MongoDB!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // If it exists in MongoDB but not in Clerk, try to sync
      if (!existingAdmin.clerkId) {
        console.log('\n🔄 Found MongoDB user without Clerk sync. Attempting to sync...');
        
        try {
          // Try to find in Clerk
          const clerkUsers = await clerhorizon shopient.users.getUserList({ 
            emailAddress: ['awakeningjuniorgroup@gmail.com'] 
          });
          
          if (clerkUsers.data && clerkUsers.data.length > 0) {
            existingAdmin.clerkId = clerkUsers.data[0].id;
            await existingAdmin.save();
            console.log('✅ Synced with existing Clerk user!');
          } else {
            console.log('❌ User not found in Clerk. You may need to create manually in Clerk Dashboard.');
          }
        } catch (err) {
          console.log('⚠️ Could not sync with Clerk:', err.message);
        }
      }
      
      process.exit();
    }

    // 3. Create in Clerk
    console.log('3️⃣ Creating Super Admin in Clerk...');
    let clerkUserId = '';
    
    try {
      const clerkUser = await clerhorizon shopient.users.createUser({
        emailAddress: ['awakeningjuniorgroup@gmail.com'],
        password: '@pa12!&Ter',
        firstName: 'Parth',
        lastName: 'Shah',
        skipPasswordChecks: true,
        skipPasswordRequirement: false,
      });
      
      clerkUserId = clerkUser.id;
      console.log('✅ Clerk User Created!');
      console.log(`   Clerk ID: ${clerkUserId}\n`);
    } catch (clerkError) {
      console.error('❌ Clerk Error:', clerkError.errors?.[0]?.message || clerkError.message);
      
      // If user already exists in Clerk, get their ID
      if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
        console.log('⚠️ User already exists in Clerk. Fetching ID...');
        const clerkUsers = await clerhorizon shopient.users.getUserList({ 
          emailAddress: ['awakeningjuniorgroup@gmail.com'] 
        });
        
        if (clerkUsers.data && clerkUsers.data.length > 0) {
          clerkUserId = clerkUsers.data[0].id;
          console.log(`✅ Found existing Clerk user: ${clerkUserId}\n`);
        } else {
          throw new Error('Could not find or create Clerk user');
        }
      } else {
        throw clerkError;
      }
    }

    // 4. Create in MongoDB
    console.log('4️⃣ Creating Super Admin in MongoDB...');
    const superAdmin = new User({
      clerkId: clerkUserId,
      name: 'awakening junior group',
      email: 'awakeningjuniorgroup@gmail.com',
      password: '@pa12!&Ter',
      role: 'superadmin',
      isVerified: true
    });

    await superAdmin.save();
    console.log('✅ MongoDB User Created!\n');

    // 5. Summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY!\n');
    console.log('📧 Email: oawakeningjuniorgroup@gmail.com');
    
    console.log('🎯 Role: superadmin');
    
    console.log('═══════════════════════════════════════════\n');
    console.log('✅ You can now login from the app!\n');

    process.exit();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createSuperAdminWithClerk();
