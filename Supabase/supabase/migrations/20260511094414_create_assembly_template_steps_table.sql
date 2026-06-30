CREATE TABLE public.assembly_template_steps (
  id SERIAL NOT NULL PRIMARY KEY,
  assembly_template_id INTEGER NOT NULL REFERENCES assembly_templates(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_description TEXT NOT NULL,
  step_description_bg TEXT,
  step_description_en TEXT,
  step_image_url TEXT,
  primary_image_url TEXT,
  image_generation_hints TEXT,
  step_duration_minutes INTEGER DEFAULT 5,
  ingredients_used TEXT[] DEFAULT '{}',
  equipment_needed INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT assembly_template_steps_unique UNIQUE (assembly_template_id, step_number)
);

-- Create indexes
CREATE INDEX idx_assembly_steps_template_id
ON public.assembly_template_steps(assembly_template_id);

-- Create trigger for updated_at
CREATE TRIGGER assembly_template_steps_updated_at
BEFORE UPDATE ON assembly_template_steps
FOR EACH ROW EXECUTE FUNCTION update_updated_at();