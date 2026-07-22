import React from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';

const schema = z.object({
  content: z.string().min(1, 'Content is required'),
});

type FormData = z.infer<typeof schema>;

export default function ComposeNoteScreen() {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { content: '' },
  });

  const onSubmit = (data: FormData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In actual implementation, insert into DB here.
    reset();
  };

  return (
    <View>
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Write your note in Markdown..."
            value={value}
            onChangeText={onChange}
            multiline
          />
        )}
      />
      {errors.content && <Text>{errors.content.message}</Text>}
      <Button title="Save Note" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
