import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface LabNoteResult {
  id: string;
  category: string;
  icon: string | null;
  title: string;
  title_bg: string | null;
  subtitle_en: string | null;
  subtitle_bg: string | null;
  is_active: boolean;
}

export const useLabNotes = (query: string) => {
  return useQuery({
    queryKey: ['labNotes', query],
    queryFn: async (): Promise<LabNoteResult[]> => {
      if (query.length < 2) return [];

      const { data, error } = await supabase
        .from('lab_notes')
        .select('id, category, icon, title, title_bg, subtitle_en, subtitle_bg, is_active')
        .eq('is_active', true)
        .or(
          `title.ilike.%${query}%,title_bg.ilike.%${query}%,content.ilike.%${query}%,content_bg.ilike.%${query}%`
        )
        .order('display_order', { ascending: true })
        .limit(20);

      if (error) return [];
      return (data as LabNoteResult[]) || [];
    },
    enabled: query.trim().length >= 2,
  });
};
