const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const seedStudentUser = async () => {
  try {
    const studentEmail = 'dkandpal8001@gmail.com';
    const studentPassword = 'Deepak@1234';

    // safer query (NO .single())
    const { data: existingStudent, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', studentEmail)
      .maybeSingle();

    if (error) {
      console.error('Error checking student:', error);
      return;
    }

    if (!existingStudent) {
      console.log('Seeding test student user...');

      const hashedPassword = await bcrypt.hash(studentPassword, 10);
      const currentYear = new Date().getFullYear();
      const randomPortion = Math.floor(10000 + Math.random() * 90000);
      const studentUniqueId = `BTKIT-${currentYear}-TES-${randomPortion}`;

      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          name: 'Test Student',
          email: studentEmail.trim().toLowerCase(),
          password: hashedPassword,
          role: 'student',
          verification_status: 'verified',
          student_unique_id: studentUniqueId,
          branch: 'CSE',
          college_name: 'Bipin Tripathi Kumaun Institute of Technology, Dwarahat',
          year_of_validation: currentYear.toString()
        }]);

      if (insertError) {
        console.error('Test student insert failed:', insertError);
      } else {
        console.log('Test student created successfully');
      }
    } else {
      console.log('Test student already exists, skipping seed');
    }

  } catch (err) {
    console.error('Seed student error:', err);
  }
};

module.exports = seedStudentUser;
