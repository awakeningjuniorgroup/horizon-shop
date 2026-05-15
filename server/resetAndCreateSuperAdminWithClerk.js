import "dotenv/config";
import mongoose from 'mongoose';
import User from './models/User.js';
import { clerhorizon shopient } from '@clerk/clerk-sdk-node';

const resetAndCreateSuperAdminWithClerk = async () => {
  try {
    console.log('🚀 Starting Fresh Super Admin Creation with Full Clerk Sync...\n');
    
    // 1. Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    const mongoURI = "mongodb+srv://awakeningjuniorgroup_db_user:2NkBb67AOJLdvbFS@kuakumarket.0qyzfx1.mongodb.net/?appName=kuakumarket";
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected!\n');

    // 2. Delete old Super Admin from MongoDB
    console.log('2️⃣ Cleaning up old MongoDB user...');
    const deleted = await User.findOneAndDelete({ email: 'awakeningjuniorgroup@gmail.com' });
    if (deleted) {
      console.log('✅ Old MongoDB user deleted\n');
    } else {
      console.log('⚠️ No old user found in MongoDB\n');
    }

    // 3. Create in Clerk
    console.log('3️⃣ Creating Super Admin in Clerk...');
    let clerkUserId = '';
    
    try {
      const clerkUser = await clerhorizon shopient.users.createUser({
        emailAddress: ['awakeningjuniorgroup@gmail.com'],
        password: '@pa12!&Ter',
        firstName: 'Awakening',
        lastName: 'junior',
        skipPasswordChecks: true,
        skipPasswordRequirement: false,
      });
      
      clerkUserId = clerkUser.id;
      console.log('✅ Clerk User Created!');
      console.log(`   Clerk ID: ${clerkUserId}\n`);
    } catch (clerkError) {
      console.error('❌ Clerk Error:', clerkError.errors?.[0]?.message || clerkError.message);
      
      // If user already exists in Clerk, delete and recreate
      if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
        console.log('⚠️ User already exists in Clerk. Deleting and recreating...\n');
        
        try {
          const clerkUsers = await clerhorizon shopient.users.getUserList({ 
            emailAddress: ['awakeningjuniorgroup@gmail.com'] 
          });
          
          if (clerkUsers.data && clerkUsers.data.length > 0) {
            const oldClerkUserId = clerkUsers.data[0].id;
            console.log(`   Deleting old Clerk user: ${oldClerkUserId}...`);
            await clerhorizon shopient.users.deleteUser(oldClerkUserId);
            console.log('   ✅ Old Clerk user deleted\n');
            
            // Now create new one
            console.log('   Creating new Clerk user...');
            const newClerkUser = await clerhorizon shopient.users.createUser({
              emailAddress: ['awakeningjuniorgroup@gmail.com'],
              password: 'pass321',
              firstName: 'Parth',
              lastName: 'Shah',
              skipPasswordChecks: true,
              skipPasswordRequirement: false,
            });
            
            clerkUserId = newClerkUser.id;
            console.log('   ✅ New Clerk User Created!');
            console.log(`   Clerk ID: ${clerkUserId}\n`);
          }
        } catch (err) {
          console.error('❌ Failed to manage Clerk user:', err.message);
          throw err;
        }
      } else {
        throw clerkError;
      }
    }

    // 4. Create in MongoDB
    console.log('4️⃣ Creating Super Admin in MongoDB...');
    const superAdmin = new User({
      clerkId: clerkUserId,
      name: 'Parth Shah',
      email: 'awakeningjuniorgroup@gmail.com',
      password: '@pa12!&Ter',
      role: 'superadmin',
      isVerified: true
    });

    await superAdmin.save();
    console.log('✅ MongoDB User Created!\n');

    // 5. Summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUPER ADMIN FULLY SYNCED!\n');
    console.log('📧 Email: awakeningjuniorgroup@gmail.com');
    
    console.log('🎯 Role: superadmin');
   
    console.log('✅ MongoDB + Clerk Synced');
    console.log('═══════════════════════════════════════════\n');
    console.log('✅ You can now login from the app!\n');

    process.exit();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
};

resetAndCreateSuperAdminWithClerk();
