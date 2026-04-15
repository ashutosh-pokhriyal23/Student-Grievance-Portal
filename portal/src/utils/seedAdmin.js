const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const seedAdminUser = async () => {
  try {
    const adminEmail = 'dkandpal801@gmail.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@1234';

    // safer query (NO .single())
    const { data: existingAdmin, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin:', error);
      return;
    }

    if (!existingAdmin) {
      console.log('Seeding admin user...');

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          name: 'Admin',
          email: adminEmail.trim().toLowerCase(),
          password: hashedPassword,
          role: 'admin',
          verification_status: 'verified'
        }]);

      if (insertError) {
        console.error('Admin insert failed:', insertError);
      } else {
        console.log('Admin created successfully');
      }
    } else {
      console.log('Admin already exists, skipping seed');
    }

  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedAdminUser;
