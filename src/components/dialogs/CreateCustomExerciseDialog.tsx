import { useState, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateCustomExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const exerciseTypes = [
  { value: 'weights', label: 'Weights' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'other', label: 'Other' },
];

const equipmentOptions = [
  'None', 'Barbell', 'Dumbbells', 'Kettlebell', 'Machine',
  'Cable', 'Band', 'Pull-up Bar', 'Medicine Ball', 'Swiss Ball',
];

const muscleGroups = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'legs', label: 'Legs' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'cardio', label: 'Cardio' },
];

const CreateCustomExerciseDialog = ({ open, onOpenChange, onCreated }: CreateCustomExerciseDialogProps) => {
  const [name, setName] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [equipment, setEquipment] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [otherMuscles, setOtherMuscles] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName('');
    setExerciseType('');
    setEquipment('');
    setPrimaryMuscle('');
    setOtherMuscles('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    if (!name.trim() || !exerciseType || !primaryMuscle) {
      toast.error('Please fill in Exercise Name, Type, and Primary Muscle Group.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create exercises.');
        return;
      }

      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('exercise-images')
          .upload(path, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const description = otherMuscles
        ? `Other muscles: ${otherMuscles}`
        : null;

      const { error } = await supabase.from('exercises').insert({
        name: name.trim(),
        exercise_type: exerciseType as any,
        equipment: equipment || null,
        muscle_group: primaryMuscle as any,
        image_url: imageUrl,
        description,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success('Custom exercise created!');
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create exercise.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Create Custom Exercise</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Add Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Exercise Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Exercise Name</Label>
            <Input
              placeholder="Enter exercise name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Exercise Type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Exercise Type</Label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Equipment</Label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {equipmentOptions.map(eq => (
                  <SelectItem key={eq} value={eq.toLowerCase()}>{eq}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Muscle Group */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Primary Muscle Group</Label>
            <Select value={primaryMuscle} onValueChange={setPrimaryMuscle}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other Muscles */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Other Muscles</Label>
            <Select value={otherMuscles} onValueChange={setOtherMuscles}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups
                  .filter(m => m.value !== primaryMuscle)
                  .map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Exercise'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomExerciseDialog;
