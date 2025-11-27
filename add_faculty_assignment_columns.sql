-- Add columns for faculty assignment to faculty_applications table

-- Add assigned_faculty_id column (integer to match faculty member ID)
ALTER TABLE faculty_applications 
ADD COLUMN IF NOT EXISTS assigned_faculty_id INTEGER;

-- Add assigned_faculty_name column
ALTER TABLE faculty_applications 
ADD COLUMN IF NOT EXISTS assigned_faculty_name TEXT;

-- Add assigned_faculty_email column
ALTER TABLE faculty_applications 
ADD COLUMN IF NOT EXISTS assigned_faculty_email TEXT;

-- Add index for faster queries by assigned faculty
CREATE INDEX IF NOT EXISTS idx_faculty_applications_assigned_faculty 
ON faculty_applications(assigned_faculty_id);

-- Add comment for documentation
COMMENT ON COLUMN faculty_applications.assigned_faculty_id IS 'ID of the faculty member assigned to review this application';
COMMENT ON COLUMN faculty_applications.assigned_faculty_name IS 'Name of the faculty member assigned to review this application';
COMMENT ON COLUMN faculty_applications.assigned_faculty_email IS 'Email of the faculty member assigned to review this application';
