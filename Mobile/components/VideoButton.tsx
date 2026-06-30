import React, { useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { YouTubePlayerModal } from './YouTubePlayerModal';

interface VideoButtonProps {
  sourceUrl: string;
}

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

export const VideoButton = ({ sourceUrl }: VideoButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const videoId = useMemo(() => extractYouTubeId(sourceUrl), [sourceUrl]);
  if (!videoId) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: 42,
          height: 26,
          borderRadius: 9,
          backgroundColor: '#A80048',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        <Ionicons name="play" size={15} color="white" />
      </TouchableOpacity>

      <YouTubePlayerModal
        visible={modalVisible}
        videoId={videoId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
