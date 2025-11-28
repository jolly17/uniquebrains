# UniqueBrains Backend Setup Guide
## Minimal Budget Launch ($12-20/month)

This guide will help you set up a fully functional backend using **FREE** services.

---

## 🎯 Tech Stack (All Free Tiers)

- **Frontend**: Vercel (Free)
- **Backend + Database + Auth**: Supabase (Free - 500MB database, 50k monthly active users)
- **File Storage**: Cloudinary (Free - 25GB storage, 25GB bandwidth)
- **Email**: Resend (Free - 100 emails/day) or SendGrid (Free - 100 emails/day)
- **Payments**: Stripe (Free - only transaction fees)
- **Domain**: Namecheap/GoDaddy ($12/year)

**Total Cost: $12/year (just domain!)**

---

## 📋 Step-by-Step Setup

### **Phase 1: Set Up Supabase (Backend + Database + Auth)**

#### 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub (free)
3. Click "New Project"
4. Name it: `uniquebrains`
5. Set a strong database password (save it!)
6. Choose region closest to your users
7. Click "Create new project" (takes ~2 minutes)

#### 2. Create Database Tables

Go to SQL Editor in Supabase and run these queries:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('student', 'instructor')),
  neurodiversity_profile TEXT[],
  other_needs TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  instructor_id UUID REFERENCES public.profiles(id),
  instructor_name TEXT,
  is_published BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  thumbnail TEXT,
  session_duration INTEGER,
  session_frequency TEXT,
  selected_days TEXT[],
  day_times JSONB,
  is_self_paced BOOLEAN DEFAULT false,
  enrollment_limit INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id),
  course_id UUID REFERENCES public.courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(student_id, course_id)
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id),
  student_id UUID REFERENCES public.profiles(id),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  topic TEXT,
  meeting_link TEXT,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homework table
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id),
  title TEXT NOT NULL,
  description TEXT,
  submission_type TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id),
  student_id UUID REFERENCES public.profiles(id),
  student_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (users can read all, update own)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for courses (everyone can read published, instructors can manage own)
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true OR instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update own courses"
  ON public.courses FOR UPDATE
  USING (instructor_id = auth.uid());

-- Policies for enrollments
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Policies for sessions
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (student_id = auth.uid() OR 
         course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid()));

CREATE POLICY "Instructors can manage sessions"
  ON public.sessions FOR ALL
  USING (course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid()));

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Students can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (student_id = auth.uid());
```

#### 3. Set Up Authentication

In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Optional: Enable **Google** or **GitHub** OAuth
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL: `https://your-username.github.io/uniquebrains`

#### 4. Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them):
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep secret!)

---

### **Phase 2: Set Up Cloudinary (File Storage)**

#### 1. Create Account
1. Go to https://cloudinary.com
2. Sign up (free)
3. Verify email

#### 2. Get Credentials
1. Go to Dashboard
2. Copy:
   - Cloud name
   - API Key
   - API Secret

---

### **Phase 3: Set Up Stripe (Payments)**

#### 1. Create Account
1. Go to https://stripe.com
2. Sign up
3. Activate account (requires business info)

#### 2. Get API Keys
1. Go to **Developers** → **API keys**
2. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

#### 3. Create Products
1. Go to **Products**
2. Create a product for each course price tier
3. Note the Price IDs

---

### **Phase 4: Connect Frontend to Backend**

#### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

#### 2. Create Environment Variables

Create `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### 3. Create Supabase Client

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 4. Update AuthContext

Replace `src/context/AuthContext.jsx` with real Supabase auth:

```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password, role) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Update profile with role
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, email, role })
    
    return data.user
  }

  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })
    
    if (error) throw error
    
    // Create profile
    await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'student',
        neurodiversity_profile: userData.neurodiversityProfile || [],
        other_needs: userData.otherNeeds || ''
      })
    
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

---

### **Phase 5: Deploy to Vercel (Free)**

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: uniquebrains
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### 3. Add Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all your `.env` variables

---

### **Phase 6: Set Up Custom Domain**

#### 1. Buy Domain
- Namecheap: ~$12/year for .com
- GoDaddy: ~$15/year
- Google Domains: ~$12/year

#### 2. Connect to Vercel
1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain: `uniquebrains.com`
3. Follow DNS instructions
4. Add these records to your domain provider:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### 3. Wait for DNS Propagation (5-48 hours)

---

## 🚀 **You're Live!**

Your site is now:
- ✅ Hosted on Vercel (free)
- ✅ Connected to Supabase backend (free)
- ✅ Using Cloudinary for files (free)
- ✅ Ready for Stripe payments
- ✅ On your custom domain

**Total Cost: $12/year** (just the domain!)

---

## 📊 **Next Steps**

### Immediate:
1. Test all features with real data
2. Invite beta users
3. Set up Google Analytics (free)
4. Add Sentry for error tracking (free tier)

### When You Get Users:
1. Set up email notifications (Resend/SendGrid)
2. Implement Stripe payment flow
3. Add video call integration
4. Set up automated backups

### When You Need to Scale:
1. Upgrade Supabase ($25/month for more storage)
2. Add CDN (Cloudflare - free)
3. Upgrade Vercel if needed ($20/month)

---

## 🆘 **Troubleshooting**

**Supabase connection issues?**
- Check API keys are correct
- Verify RLS policies are set up
- Check browser console for errors

**Authentication not working?**
- Verify email provider is enabled
- Check redirect URLs are correct
- Clear browser cache

**Deployment fails?**
- Check environment variables
- Verify build command: `npm run build`
- Check Node version compatibility

---

## 📚 **Resources**

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Cloudinary Docs: https://cloudinary.com/documentation

---

## 💡 **Pro Tips**

1. **Use Supabase Studio** - Visual database editor
2. **Enable Supabase Realtime** - For live chat features
3. **Set up database backups** - Supabase does daily backups
4. **Monitor usage** - Stay within free tier limits
5. **Use Vercel Analytics** - Free insights on your site

---

Need help? The Supabase and Vercel communities are very active and helpful!
