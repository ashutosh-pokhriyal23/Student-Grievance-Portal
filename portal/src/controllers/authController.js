const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tesseract = require('tesseract.js');
const stringSimilarity = require('string-similarity');

// Fail hard in production if JWT_SECRET is not explicitly set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
  }
  console.warn('[Auth] WARNING: JWT_SECRET not set — using insecure fallback. Set JWT_SECRET before deploying.');
}
const RESOLVED_JWT_SECRET = JWT_SECRET || 'fallback_secret_for_development';


// Registration logic with AI OCR ID Validation
exports.register = async (req, res) => {
  try {
    const { name, password } = req.body;
    let { email } = req.body;
    const role = req.body.role || 'student'; // Default role safely set to student

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be complete.' });
    }

    let verificationStatus = 'verified';
    let validYear = new Date().getFullYear();
    let studentUniqueId = null;

    if (role === 'student') {
      if (!req.file) {
        return res.status(400).json({ error: 'ID card image must be uploaded for student registration.' });
      }

      const sharp = require('sharp');
      const imageMetadata = await sharp(req.file.buffer).metadata();
      
      if (imageMetadata.width < 100 || imageMetadata.height < 100) {
        return res.status(400).json({
          error: "Image too small for OCR processing"
        });
      }

      // Helper function for dynamic OCR verification
      const runOCR = async (buffer, attempt) => {
        let processedBuffer;
        if (attempt === 1) {
          processedBuffer = await sharp(buffer)
            .resize({ width: 1000 })
            .grayscale()
            .normalize()
            .toBuffer();
        } else {
          processedBuffer = await sharp(buffer)
            .resize({ width: 1000 })
            .grayscale()
            .normalize()
            .sharpen()
            .threshold(150)
            .toBuffer();
        }

        const os = require('os');
        const fs = require('fs');
        const path = require('path');
        const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.img`);
        fs.writeFileSync(tempFilePath, processedBuffer);

        try {
          const result = await Tesseract.recognize(tempFilePath, 'eng');
          
          let conf = result.data.confidence;
          // 2. VERIFY TESSERACT CONFIDENCE IS REAL (Compute average if per-word or missing)
          if (conf === undefined || conf === null || isNaN(conf)) {
            if (result.data.words && result.data.words.length > 0) {
              const totalConf = result.data.words.reduce((sum, w) => sum + (w.confidence || 0), 0);
              conf = totalConf / result.data.words.length;
            } else {
              conf = 0; // Fallback safely
            }
          }

          return {
            text: result.data.text || "",
            confidence: conf
          };
        } finally {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      };

      // 1. CONFIRM OCR PIPELINE IS ACTUALLY USING BEST RESULT
      let attempt1 = await runOCR(req.file.buffer, 1);
      let attempt2 = null;
      let ocrResult = attempt1;

      if (attempt1.confidence < 45) { // Increased threshold slightly for retry
        attempt2 = await runOCR(req.file.buffer, 2);
        // Ensure final selected OCR result = max(confidence)
        if (attempt2.confidence > attempt1.confidence) {
          ocrResult = attempt2;
        }
      }

      // 3 & 4. CHECK FOR FALSE NEGATIVE CAUSE IN CLEANING PIPELINE & VERIFY MATCHING ORDER
      function cleanOCRTokens(text) {
        return text
          .toLowerCase()
          .replace(/[\r\n]+/g, " ") // Preserve word boundaries from newlines
          .replace(/[^a-z0-9\s]/g, " ") // Preserve A-Z, 0-9, and space
          .replace(/\s+/g, " ") // Collapse multiple spaces
          .trim()
          .split(" ")
          .filter(Boolean);
      }

      const tokens = cleanOCRTokens(ocrResult.text);
      let isPending = false;

      const keywords = [
        ["btkit"],
        ["kumaun", "kumaon"],
        ["dwarahat"],
        ["bipin", "tripathi"]
      ];
      
      // 4. PRECISE MATCHING ORDER: Strict match FIRST
      const strictMatch = keywords.some(group =>
        group.every(word => tokens.includes(word))
      );

      let isValidCollege = false;
      let matchTypeLog = "NONE";

      if (strictMatch) {
         isValidCollege = true;
         matchTypeLog = "STRICT";
      // Fallback match ONLY IF confidence rules pass (confidence > 60)
      } else if (ocrResult.confidence > 60) {
         const looseMatch = tokens.includes("btkit") || tokens.includes("kumaun") || tokens.includes("kumaon") || tokens.includes("tripathi");
         if (looseMatch) {
            isValidCollege = true;
            matchTypeLog = "LOOSE_FALLBACK";
         }
      }

      // 6. ADD FINAL DEBUG LOG (MANDATORY)
      console.log('--- OCR DEBUG START ---');
      console.log(`OCR ATTEMPT 1 confidence: ${attempt1.confidence.toFixed(2)}`);
      console.log(`OCR ATTEMPT 2 confidence: ${attempt2 ? attempt2.confidence.toFixed(2) : 'N/A'}`);
      console.log(`SELECTED CONFIDENCE: ${ocrResult.confidence.toFixed(2)}`);
      console.log(`FINAL CLEANED TEXT: ${tokens.join(" ")}`);
      console.log(`MATCH RESULT (strict/fallback): ${matchTypeLog}`);
      console.log('--- OCR DEBUG END ---');
      
      // 5. CHECK API RESPONSE FLOW (Single decision return)
      if (!isValidCollege) {
        return res.status(400).json({
          error: "ID verification failed: College Name not recognized. Please provide a clearer image.",
          status: 'rejected'
        });
      }

      // We still use ocrText string for year/name boundary checking below, 
      // so join the tokens back together for the subsequent regex matching
      let ocrText = tokens.join(" ");

      // 2. Year boundaries and sanitization
      const yearSanitizedText = ocrText.replace(/o/g, '0').replace(/i/g, '1').replace(/l/g, '1');
      const yearMatches = yearSanitizedText.match(/\b(20[2-9]\d)\b/g);
      const currentYear = new Date().getFullYear();

      if (yearMatches) {
        for (const yearStr of yearMatches) {
          const yearInt = parseInt(yearStr, 10);
          if (yearInt >= currentYear) {
            validYear = yearInt;
            break;
          }
        }
      } else {
        isPending = true;
      }

      // 3. Name fuzzy matchmaking
      const cleanedOcrWords = ocrText.replace(/:|-|,/g, ' ').split(/\s+/);
      let nameFound = false;
      const inputNameParts = name.toLowerCase().split(' ');

      for (const part of inputNameParts) {
        if (part.length < 3) continue;
        const match = stringSimilarity.findBestMatch(part, cleanedOcrWords);
        if (match.bestMatch.rating >= 0.70) {
          nameFound = true;
          break;
        }
      }

      if (!nameFound) {
        isPending = true;
      }

      // Determine final status strictly
      verificationStatus = isPending ? 'pending' : 'verified';

      // Generate unique BTKIT ID with max 5 retries
      const splitName = name.replace(/[^a-zA-Z]/g, '');
      const first3 = splitName.length >= 3 ? splitName.substring(0, 3).toUpperCase() : (splitName.toUpperCase() + 'XXX').substring(0, 3);

      let isUnique = false;
      let retries = 0;

      while (!isUnique && retries < 5) {
        const randomPortion = Math.floor(10000 + Math.random() * 90000);
        studentUniqueId = `BTKIT-${validYear}-${first3}-${randomPortion}`;

        const { data: checkId } = await supabase
          .from('users')
          .select('id')
          .eq('student_unique_id', studentUniqueId)
          .maybeSingle();

        if (!checkId) {
          isUnique = true;
        }
        retries++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Failed to generate unique Student ID. Please try again.' });
      }
    } else {
      // Admin and Teacher bypass OCR and are automatically verified
      verificationStatus = 'verified';
    }

    // CRITICAL FIX: Hash the password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize email before insert
    email = email.trim().toLowerCase();
    console.log("REGISTER HIT", { name, email, role, idCardUploaded: !!req.file });

    const { error: insertError, data: insertData } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
          verification_status: verificationStatus,
          otp: null,
          student_unique_id: studentUniqueId,
          college_name: 'Bipin Tripathi Kumaun Institute of Technology, Dwarahat',
          year_of_validation: validYear.toString(),
          created_at: new Date().toISOString()
        }
      ]).select();
      
    console.log("DB RESPONSE REGISTER", insertData ? insertData.length : 0, insertError);

    if (insertError) {
      console.error('Registration insertion error:', insertError);
      return res.status(500).json({ error: 'Failed to create account. Verify database schema.' });
    }

    const insertedUser = insertData[0];
    let token = null;

    // AUTO-LOGIN: If the user is automatically verified by AI, issue a token immediately
    if (verificationStatus === 'verified') {
      token = jwt.sign(
        { userId: insertedUser.id, email: insertedUser.email, role: insertedUser.role },
        RESOLVED_JWT_SECRET,
        { expiresIn: '24h' }
      );
    }

    res.status(201).json({
      message: 'ID verified successfully and account created.',
      token,
      user: {
        id: insertedUser.id,
        name: insertedUser.name,
        email: insertedUser.email,
        role: insertedUser.role,
        student_unique_id: insertedUser.student_unique_id
      },
      status: verificationStatus
    });

  } catch (error) {
    console.error('Server error on AI Registration:', error);
    res.status(500).json({ error: 'Internal server error during verification.' });
  }
};

// Verify logic
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    let { email } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    email = email.trim().toLowerCase();

    // Fetch unverified user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // IF account is already verified, we allow the request to proceed to issue a fresh token (auto-login)
    if (user.verification_status === 'verified') {
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        RESOLVED_JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.status(200).json({
        message: 'Account verified. Logging in...',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          student_unique_id: user.student_unique_id
        }
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Update verification state and clear OTP to prevent reuse
    const { error: updateError } = await supabase
      .from('users')
      .update({ verification_status: 'verified', otp: null })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to complete verification.' });
    }

    // Generate Token for auto-login after OTP verification
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      RESOLVED_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Verification successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_unique_id: user.student_unique_id
      }
    });

  } catch (error) {
    console.error('Server error on verification:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Login Logic validating passwords and generating JWT token
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    let { email } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    email = email.trim().toLowerCase();
    console.log("LOGIN HIT", { email, passwordLength: password ? password.length : 0 });

    // Fetch user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    console.log("DB RESPONSE", user ? user.email : null, error);

    if (error) {
      console.error('[Auth] Supabase Error on login:', error);
      return res.status(500).json({ error: 'Database error occurred. Please verify schema.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare Hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({ error: 'Invalid email or password.' });
    }

    // Role-Isolated Verification check
    if (user.role === 'student' && user.verification_status !== 'verified') {
      if (user.verification_status === 'pending') {
        return res.status(403).json({ error: 'Your account is under admin review. Please wait.' });
      }
      return res.status(403).json({ error: 'Account not verified' });
    }
    // Admin and Teacher bypass verification checks during login

    // Generate Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      RESOLVED_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_unique_id: user.student_unique_id
      }
    });

  } catch (error) {
    console.error('Server error on login:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Return currently authenticated user info (verified via authMiddleware)
exports.getProfile = async (req, res) => {
  try {
    // req.user is populated by authMiddleware after JWT validation
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
