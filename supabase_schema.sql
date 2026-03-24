-- 1. Create a table for user profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at timestamp WITH time zone,
  full_name text,
  avatar_url text,
  email text
);

-- 2. Create a table for generated 3D models
CREATE TABLE public.generated_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  model_url text NOT NULL,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create a table for projects
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Models: Users can only see and manage their own models
CREATE POLICY "Users can view own models" ON public.generated_models FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own models" ON public.generated_models FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own models" ON public.generated_models FOR DELETE USING (auth.uid() = user_id);

-- Projects: Users can only see and manage their own projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Storage Setup (Run these manually or via UI)
-- Create a public bucket named "models"
-- INSERT INTO storage.buckets (id, name, public) VALUES ('models', 'models', true);

-- Storage Policies: Allow anyone to view, but only authenticated users to upload
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'models');
-- CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');
