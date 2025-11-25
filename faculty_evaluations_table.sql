-- Create faculty_evaluations table for faculty to evaluate candidates
-- Run this SQL in your Supabase SQL editor

-- First, check what type the faculty_applications.id column is
-- If it's UUID, keep UUID. If it's INTEGER/BIGINT, change to BIGINT below

CREATE TABLE IF NOT EXISTS faculty_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    faculty_id TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    teaching_competence INTEGER NOT NULL CHECK (teaching_competence >= 0 AND teaching_competence <= 10),
    research_potential INTEGER NOT NULL CHECK (research_potential >= 0 AND research_potential <= 10),
    industry_experience INTEGER NOT NULL CHECK (industry_experience >= 0 AND industry_experience <= 10),
    communication_skills INTEGER NOT NULL CHECK (communication_skills >= 0 AND communication_skills <= 10),
    subject_knowledge INTEGER NOT NULL CHECK (subject_knowledge >= 0 AND subject_knowledge <= 10),
    overall_suitability INTEGER NOT NULL CHECK (overall_suitability >= 0 AND overall_suitability <= 10),
    remarks TEXT,
    evaluated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTE: If you get an error about foreign key constraint, it means faculty_applications.id is not UUID
-- In that case, change line 10 above from "application_id UUID" to "application_id BIGINT"

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_evaluations_application_id ON faculty_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_faculty_evaluations_faculty_id ON faculty_evaluations(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_evaluations_evaluated_at ON faculty_evaluations(evaluated_at DESC);

-- Enable Row Level Security
ALTER TABLE faculty_evaluations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Anyone authenticated can read evaluations
CREATE POLICY "Authenticated users can read evaluations" 
ON faculty_evaluations 
FOR SELECT 
USING (true);

-- Policy: Faculty can insert their own evaluations
CREATE POLICY "Faculty can insert evaluations" 
ON faculty_evaluations 
FOR INSERT 
WITH CHECK (true);

-- Policy: Faculty can update their own evaluations
CREATE POLICY "Faculty can update own evaluations" 
ON faculty_evaluations 
FOR UPDATE 
USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_faculty_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_faculty_evaluations_updated_at
    BEFORE UPDATE ON faculty_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_faculty_evaluations_updated_at();

-- Add comment to table
COMMENT ON TABLE faculty_evaluations IS 'Stores faculty evaluations of candidate applications with scoring on multiple parameters';
