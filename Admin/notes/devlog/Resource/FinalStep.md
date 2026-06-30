# CLAUDE CODE TASK: Complete recipe_resources System Implementation

**Status:** CRITICAL - Execute immediately  
**Timeline:** 4-5 hours  
**Priority:** HIGHEST  
**Complexity:** MEDIUM-HIGH  

---

## OBJECTIVE

Implement complete resource management system for all recipe types:

1. ✅ Create `recipe_resources` table in PostgreSQL
2. ✅ Create React hooks for CRUD operations
3. ✅ Create RecipeResourcesManager component (Admin UI)
4. ✅ Integrate into base_recipes, ready_recipes, simple_recipes edit forms
5. ✅ Add resource display to mobile recipe detail page
6. ✅ Test all functionality

**Result:** Admins can manage YouTube, Instagram, TikTok, Pinterest, Blog, and Idea Source links for any recipe type.

---

## WHAT THIS FIXES

Before: Each recipe type had separate source_url fields (code duplication)  
After: Single recipe_resources table serves all recipe types (clean architecture)

---

## STEP-BY-STEP EXECUTION

### STEP 1: Create Database Table (10 min)

**Action:** Execute SQL in Supabase SQL Editor

**File:** Supabase Console → SQL Editor

**Copy and paste this entire SQL block:**

```sql
-- Create recipe_resources table
CREATE TABLE recipe_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipe reference
  recipe_id UUID NOT NULL,
  recipe_type VARCHAR(50) NOT NULL,  -- 'base' | 'ready' | 'simple'
  
  -- Resource metadata
  resource_type VARCHAR(50) NOT NULL,  -- 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source'
  url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_recipe_id FOREIGN KEY (recipe_id) REFERENCES base_recipes(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, recipe_type, resource_type)
);

-- Create indexes
CREATE INDEX idx_recipe_resources_recipe_id ON recipe_resources(recipe_id);
CREATE INDEX idx_recipe_resources_type ON recipe_resources(recipe_type);
CREATE INDEX idx_recipe_resources_resource_type ON recipe_resources(resource_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_recipe_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_resources_updated_at
BEFORE UPDATE ON recipe_resources
FOR EACH ROW
EXECUTE FUNCTION update_recipe_resources_updated_at();
```

**Checklist:**
- [ ] Copy entire SQL block
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run" button
- [ ] Verify no errors
- [ ] See "0 rows" message (table created)

---

### STEP 2: Create Hooks (30 min)

**File:** `Admin/hooks/useRecipeResources.ts`

**ACTION:** Create new file with this code:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RecipeResource {
  id: string;
  recipe_id: string;
  recipe_type: 'base' | 'ready' | 'simple';
  resource_type: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source';
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

// HOOK 1: Fetch resources for a recipe
export const useRecipeResources = (recipeId: string, recipeType: 'base' | 'ready' | 'simple') => {
  return useQuery({
    queryKey: ['recipe-resources', recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('recipe_type', recipeType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as RecipeResource[]) || [];
    },
  });
};

// HOOK 2: Add new resource
export const useAddRecipeResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Omit<RecipeResource, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .insert([resource])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-resources', data.recipe_id],
      });
    },
  });
};

// HOOK 3: Delete resource
export const useDeleteRecipeResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('recipe_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-resources'],
      });
    },
  });
};

// HOOK 4: Update resource
export const useUpdateRecipeResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: RecipeResource) => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .update(resource)
        .eq('id', resource.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-resources', data.recipe_id],
      });
    },
  });
};
```

**Checklist:**
- [ ] File created at `Admin/hooks/useRecipeResources.ts`
- [ ] All 4 hooks exported
- [ ] No import errors
- [ ] TypeScript types correct

---

### STEP 3: Create RecipeResourcesManager Component (90 min)

**File:** `Admin/components/RecipeResourcesManager.tsx`

**ACTION:** Create new file - PASTE ENTIRE CODE BELOW:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRecipeResources, useAddRecipeResource, useDeleteRecipeResource } from '@/hooks/useRecipeResources';
import Colors from '@/constants/Colors';
import { useToast } from 'react-native-toast-notifications';

interface RecipeResourcesManagerProps {
  recipeId: string;
  recipeType: 'base' | 'ready' | 'simple';
  language: 'en' | 'bg';
}

const RESOURCE_TYPES = [
  { id: 'youtube', label: 'YouTube', icon: '📹' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
  { id: 'blog', label: 'Blog', icon: '📝' },
  { id: 'idea_source', label: 'Idea Source', icon: '💡' },
];

export const RecipeResourcesManager = ({
  recipeId,
  recipeType,
  language,
}: RecipeResourcesManagerProps) => {
  const toast = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
  });

  const { data: resources = [], isLoading } = useRecipeResources(recipeId, recipeType);
  const addResource = useAddRecipeResource();
  const deleteResource = useDeleteRecipeResource();

  const handleAddResource = async () => {
    if (!selectedResourceType || !formData.url.trim()) {
      toast.show('Please fill all required fields', { type: 'warning' });
      return;
    }

    try {
      await addResource.mutateAsync({
        recipe_id: recipeId,
        recipe_type: recipeType,
        resource_type: selectedResourceType as any,
        url: formData.url.trim(),
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      toast.show('Resource added successfully!', { type: 'success' });
      setFormData({ url: '', title: '', description: '' });
      setSelectedResourceType(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.show('Failed to add resource', { type: 'danger' });
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    Alert.alert(
      language === 'bg' ? 'Изтриване' : 'Delete',
      language === 'bg' ? 'Наистина ли искаш да изтриеш?' : 'Are you sure?',
      [
        { text: language === 'bg' ? 'Отмяна' : 'Cancel' },
        {
          text: language === 'bg' ? 'Изтрий' : 'Delete',
          onPress: async () => {
            try {
              await deleteResource.mutateAsync(resourceId);
              toast.show('Resource deleted', { type: 'success' });
            } catch (error) {
              console.error('Error deleting resource:', error);
              toast.show('Failed to delete resource', { type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const getResourceTypeIcon = (typeId: string) => {
    return RESOURCE_TYPES.find(r => r.id === typeId)?.icon || '🔗';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        🔗 {language === 'bg' ? 'Ресурси' : 'Resources'}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary.main} />
      ) : (
        <>
          {/* Display existing resources */}
          {resources.length > 0 && (
            <View style={styles.resourcesList}>
              {resources.map(resource => (
                <View key={resource.id} style={styles.resourceCard}>
                  <View style={styles.resourceHeader}>
                    <Text style={styles.resourceIcon}>
                      {getResourceTypeIcon(resource.resource_type)}
                    </Text>
                    <View style={styles.resourceContent}>
                      <Text style={styles.resourceType}>
                        {RESOURCE_TYPES.find(r => r.id === resource.resource_type)?.label}
                      </Text>
                      {resource.title && (
                        <Text style={styles.resourceTitle} numberOfLines={1}>
                          {resource.title}
                        </Text>
                      )}
                      <Text style={styles.resourceUrl} numberOfLines={1}>
                        {resource.url}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteResource(resource.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  {resource.description && (
                    <Text style={styles.resourceDescription}>
                      {resource.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Add new resource form */}
          {!isAddingNew ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setIsAddingNew(true)}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addBtnText}>
                {language === 'bg' ? 'Добави ресурс' : 'Add Resource'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              {/* Resource type selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {language === 'bg' ? 'Тип ресурс' : 'Resource Type'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeGrid}
                >
                  {RESOURCE_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        selectedResourceType === type.id && styles.typeOptionSelected,
                      ]}
                      onPress={() => setSelectedResourceType(type.id)}
                    >
                      <Text style={styles.typeIcon}>{type.icon}</Text>
                      <Text
                        style={[
                          styles.typeLabel,
                          selectedResourceType === type.id && styles.typeLabelSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* URL input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  value={formData.url}
                  onChangeText={(text) => setFormData({ ...formData, url: text })}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              {/* Title input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {language === 'bg' ? 'Заглавие' : 'Title'} ({language === 'bg' ? 'опционално' : 'optional'})
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'bg' ? 'Заглавие' : 'Title'}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              {/* Description input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {language === 'bg' ? 'Описание' : 'Description'} ({language === 'bg' ? 'опционално' : 'optional'})
                </Text>
                <TextInput
                  style={[styles.input, styles.inputTextArea]}
                  placeholder={language === 'bg' ? 'Описание' : 'Description'}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholderTextColor={Colors.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action buttons */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => {
                    setIsAddingNew(false);
                    setFormData({ url: '', title: '', description: '' });
                    setSelectedResourceType(null);
                  }}
                >
                  <Text style={styles.btnCancelText}>
                    {language === 'bg' ? 'Отмяна' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnAdd]}
                  onPress={handleAddResource}
                  disabled={addResource.isPending}
                >
                  <Text style={styles.btnAddText}>
                    {addResource.isPending
                      ? language === 'bg' ? 'Добавяне...' : 'Adding...'
                      : language === 'bg' ? 'Добави' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  resourcesList: {
    marginBottom: 12,
  },
  resourceCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  resourceContent: {
    flex: 1,
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 2,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  resourceUrl: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  resourceDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
  },
  typeOption: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.background.primary,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary.opacity[10] || 'rgba(168, 0, 72, 0.1)',
    borderColor: Colors.primary.main,
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  typeLabelSelected: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Colors.background.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text.primary,
    fontSize: 13,
  },
  inputTextArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnAdd: {
    backgroundColor: Colors.primary.main,
  },
  btnAddText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  btnCancel: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  btnCancelText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
  },
});
```

**Checklist:**
- [ ] File created at `Admin/components/RecipeResourcesManager.tsx`
- [ ] All imports correct
- [ ] Component renders without errors
- [ ] No TypeScript errors

---

### STEP 4: Add to BaseRecipeEditForm (20 min)

**File:** `Admin/components/BaseRecipeEditForm.tsx`

**ACTION 1:** Add import at top

```typescript
import { RecipeResourcesManager } from './RecipeResourcesManager';
```

**ACTION 2:** Find where form fields end (before Save/Delete buttons), ADD THIS:

```typescript
{/* Resources Section */}
<RecipeResourcesManager
  recipeId={recipe.id}
  recipeType="base"
  language={language}
/>
```

**Checklist:**
- [ ] Import added
- [ ] Component placed in form
- [ ] No console errors
- [ ] Component displays in UI

---

### STEP 5: Add to ReadyRecipeEditForm (20 min)

**File:** `Admin/components/ReadyRecipeEditForm.tsx`

**ACTION 1:** Add import

```typescript
import { RecipeResourcesManager } from './RecipeResourcesManager';
```

**ACTION 2:** Add component in form

```typescript
{/* Resources Section */}
<RecipeResourcesManager
  recipeId={recipe.id}
  recipeType="ready"
  language={language}
/>
```

**Checklist:**
- [ ] Import added
- [ ] Component placed
- [ ] No errors

---

### STEP 6: Add to SimpleRecipeEditForm (20 min)

**File:** `Admin/components/SimpleRecipeEditForm.tsx`

**ACTION 1:** Add import

```typescript
import { RecipeResourcesManager } from './RecipeResourcesManager';
```

**ACTION 2:** Add component in form

```typescript
{/* Resources Section */}
<RecipeResourcesManager
  recipeId={recipe.id}
  recipeType="simple"
  language={language}
/>
```

**Checklist:**
- [ ] Import added
- [ ] Component placed
- [ ] No errors

---

### STEP 7: Add Mobile Display (60 min)

**File:** `Mobile/hooks/useRecipeResources.ts` (CREATE NEW)

**ACTION:** Create new file with this code:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export interface RecipeResource {
  id: string;
  recipe_id: string;
  recipe_type: 'base' | 'ready' | 'simple';
  resource_type: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source';
  url: string;
  title?: string;
  description?: string;
}

export const useRecipeResources = (recipeId: string, recipeType: 'base' | 'ready' | 'simple') => {
  return useQuery({
    queryKey: ['recipe-resources', recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('recipe_type', recipeType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as RecipeResource[]) || [];
    },
  });
};
```

**Checklist:**
- [ ] File created at `Mobile/hooks/useRecipeResources.ts`
- [ ] Hook exported

---

### STEP 8: Update RecipeDetailView (40 min)

**File:** `Mobile/components/RecipeDetailView.tsx`

**ACTION 1:** Add imports

```typescript
import { useRecipeResources } from '@/hooks/useRecipeResources';
import { Linking } from 'react-native';
```

**ACTION 2:** Add hook in component

```typescript
const { data: resources = [] } = useRecipeResources(recipe.id, recipeType);
```

**ACTION 3:** Add helper functions (before return)

```typescript
const getResourceIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    youtube: '📹',
    instagram: '📷',
    tiktok: '🎵',
    pinterest: '📌',
    blog: '📝',
    idea_source: '💡',
  };
  return icons[type] || '🔗';
};

const getResourceTypeLabel = (type: string) => {
  const labels: { [key: string]: { bg: string; en: string } } = {
    youtube: { bg: 'YouTube', en: 'YouTube' },
    instagram: { bg: 'Instagram', en: 'Instagram' },
    tiktok: { bg: 'TikTok', en: 'TikTok' },
    pinterest: { bg: 'Pinterest', en: 'Pinterest' },
    blog: { bg: 'Блог', en: 'Blog' },
    idea_source: { bg: 'Идеен източник', en: 'Idea Source' },
  };
  return labels[type]?.[language] || type;
};

const openResourceURL = async (url: string) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};
```

**ACTION 4:** Add JSX section (in recipe detail JSX, near nutrition section)

```typescript
{/* Resources Section */}
{resources.length > 0 && (
  <View style={styles.resourcesSection}>
    <Text style={styles.resourcesSectionTitle}>
      🔗 {language === 'bg' ? 'Ресурси' : 'Resources'}
    </Text>
    <View style={styles.resourcesList}>
      {resources.map(resource => (
        <TouchableOpacity
          key={resource.id}
          style={styles.resourceItem}
          onPress={() => openResourceURL(resource.url)}
        >
          <Text style={styles.resourceIcon}>
            {getResourceIcon(resource.resource_type)}
          </Text>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceType}>
              {getResourceTypeLabel(resource.resource_type)}
            </Text>
            {resource.title && (
              <Text style={styles.resourceTitle} numberOfLines={1}>
                {resource.title}
              </Text>
            )}
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.primary.main} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}
```

**ACTION 5:** Add styles (in stylesheet)

```typescript
resourcesSection: {
  marginVertical: 16,
  paddingHorizontal: 16,
},
resourcesSectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: Colors.text.primary,
  marginBottom: 12,
},
resourcesList: {
  gap: 8,
},
resourceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.background.secondary,
  borderRadius: 8,
  padding: 12,
  gap: 10,
},
resourceIcon: {
  fontSize: 20,
},
resourceContent: {
  flex: 1,
},
resourceType: {
  fontSize: 12,
  fontWeight: '600',
  color: Colors.primary.main,
},
resourceTitle: {
  fontSize: 12,
  color: Colors.text.primary,
  marginTop: 2,
},
```

**Checklist:**
- [ ] Imports added
- [ ] Hook integrated
- [ ] Helper functions added
- [ ] JSX section added
- [ ] Styles added
- [ ] Resources display in recipe detail
- [ ] Click opens URL
- [ ] No console errors

---

### STEP 9: Test Everything (60 min)

#### Admin Panel Tests:

1. **Test Base Recipe Resources:**
   - [ ] Navigate to base-recipes edit page
   - [ ] Scroll to Resources section
   - [ ] Click "Add Resource"
   - [ ] Select YouTube from type options
   - [ ] Enter URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - [ ] Enter title: "How to Make"
   - [ ] Click "Add"
   - [ ] Resource appears in list
   - [ ] Can delete resource

2. **Test Ready Recipe Resources:**
   - [ ] Same as above but for ready-recipes
   - [ ] Verify resource_type = 'ready'

3. **Test Simple Recipe Resources:**
   - [ ] Same as above but for simple-recipes
   - [ ] Verify resource_type = 'simple'

#### Mobile App Tests:

1. **Test Recipe Detail Display:**
   - [ ] Open recipe detail page (one with resources added)
   - [ ] Scroll to Resources section
   - [ ] See resource icons and types
   - [ ] Tap resource → opens URL in browser
   - [ ] All resource types display correctly

#### General Tests:

- [ ] No console errors anywhere
- [ ] Bilingual (BG/EN) text correct
- [ ] Database queries work
- [ ] Add/Edit/Delete all work
- [ ] UI is responsive

---

## VERIFICATION CHECKLIST

### Database:
- [ ] `recipe_resources` table exists in Supabase
- [ ] Can insert/query/update/delete records
- [ ] Indexes created
- [ ] Trigger works

### Code Files:
- [ ] `Admin/hooks/useRecipeResources.ts` created ✅
- [ ] `Admin/components/RecipeResourcesManager.tsx` created ✅
- [ ] BaseRecipeEditForm updated ✅
- [ ] ReadyRecipeEditForm updated ✅
- [ ] SimpleRecipeEditForm updated ✅
- [ ] `Mobile/hooks/useRecipeResources.ts` created ✅
- [ ] RecipeDetailView updated ✅

### Functionality:
- [ ] Add resources works in all 3 recipe types
- [ ] Delete resources works
- [ ] Resources display on mobile
- [ ] Links open correctly
- [ ] No crashes
- [ ] Bilingual UI

---

## SUCCESS CRITERIA

✅ **Task complete when:**

1. ✅ recipe_resources table created and working in Supabase
2. ✅ Admin can add/delete resources for base_recipes
3. ✅ Admin can add/delete resources for ready_recipes
4. ✅ Admin can add/delete resources for simple_recipes
5. ✅ All 6 resource types (YouTube, Instagram, TikTok, Pinterest, Blog, Idea Source) work
6. ✅ Mobile displays resources with clickable links
7. ✅ No database errors
8. ✅ No console errors
9. ✅ Bilingual interface (BG/EN)
10. ✅ All CRUD operations smooth and responsive

---

**EXECUTE NOW. Do NOT skip steps. This is the foundation!** 🚀

Generated: 2026-05-23  
Priority: CRITICAL  
Status: READY FOR EXECUTION  
Execution Order: STEP 1 → STEP 9 (sequential)