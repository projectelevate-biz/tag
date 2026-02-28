-- Rebound & Relay Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('consultant', 'institution', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultant profiles
CREATE TABLE IF NOT EXISTS public.consultant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  expertise TEXT[], -- Array of expertise areas
  hourly_rate DECIMAL(10,2),
  years_experience INTEGER,
  education TEXT,
  certifications TEXT[],
  location TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  stripe_account_id TEXT, -- For Stripe Connect
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Institution profiles
CREATE TABLE IF NOT EXISTS public.institution_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_type TEXT, -- e.g., 'university', 'college', 'community college'
  website TEXT,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Engagements
CREATE TABLE IF NOT EXISTS public.engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  stripe_payment_intent_id TEXT,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view consultant profiles" ON public.consultant_profiles
  FOR SELECT USING (verification_status = 'approved');

CREATE POLICY "Consultants can update their own profile" ON public.consultant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Consultants can insert their own profile" ON public.consultant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Institutions can view their own profile" ON public.institution_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Institutions can update their own profile" ON public.institution_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Institutions can insert their own profile" ON public.institution_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for engagements
CREATE POLICY "Users can view engagements they're part of" ON public.engagements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultant_profiles cp
      WHERE cp.id = engagements.consultant_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.institution_profiles ip
      WHERE ip.id = engagements.institution_id AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can create engagements" ON public.engagements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.institution_profiles ip
      WHERE ip.id = institution_id AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update engagements they're part of" ON public.engagements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.consultant_profiles cp
      WHERE cp.id = engagements.consultant_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.institution_profiles ip
      WHERE ip.id = engagements.institution_id AND ip.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their engagements" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.consultant_profiles cp ON e.consultant_id = cp.id
      WHERE e.id = messages.engagement_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.institution_profiles ip ON e.institution_id = ip.id
      WHERE e.id = messages.engagement_id AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their engagements" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.consultant_profiles cp ON e.consultant_id = cp.id
      WHERE e.id = engagement_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.institution_profiles ip ON e.institution_id = ip.id
      WHERE e.id = engagement_id AND ip.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their engagements" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.consultant_profiles cp ON e.consultant_id = cp.id
      WHERE e.id = documents.engagement_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.institution_profiles ip ON e.institution_id = ip.id
      WHERE e.id = documents.engagement_id AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to their engagements" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.consultant_profiles cp ON e.consultant_id = cp.id
      WHERE e.id = engagement_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.engagements e
      INNER JOIN public.institution_profiles ip ON e.institution_id = ip.id
      WHERE e.id = engagement_id AND ip.user_id = auth.uid()
    )
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their engagements" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultant_profiles cp
      WHERE cp.id = invoices.consultant_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.institution_profiles ip
      WHERE ip.id = invoices.institution_id AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultant_profiles cp
      WHERE cp.id = consultant_id AND cp.user_id = auth.uid()
    )
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_profiles_updated_at BEFORE UPDATE ON public.consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institution_profiles_updated_at BEFORE UPDATE ON public.institution_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at BEFORE UPDATE ON public.engagements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
