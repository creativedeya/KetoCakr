'use client';

import { EnhancedStepImages } from './EnhancedStepImages';
import IngredientAutocomplete from '@/components/IngredientAutocomplete';
import LabNotesManager from '@/components/LabNotesManager';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
