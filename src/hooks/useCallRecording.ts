import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface RecordingResult {
  blob: Blob;
  url: string;
}

interface UseCallRecordingReturn {
  isRecording: boolean;
  recordingDuration: number;
  startRecording: (localStream: MediaStream, remoteStream: MediaStream | null) => void;
  stopRecording: () => Promise<RecordingResult | null>;
  uploadRecording: (callId: string, blob: Blob, isGroupCall?: boolean) => Promise<string | null>;
}

export function useCallRecording(): UseCallRecordingReturn {
  const { user } = useAuth();
  const { t } = useTranslation();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const startRecording = useCallback((localStream: MediaStream, remoteStream: MediaStream | null) => {
    try {
      // Create audio context to mix streams
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const destination = audioContext.createMediaStreamDestination();
      
      // Add local audio
      const localAudioTracks = localStream.getAudioTracks();
      if (localAudioTracks.length > 0) {
        const localSource = audioContext.createMediaStreamSource(new MediaStream(localAudioTracks));
        localSource.connect(destination);
      }
      
      // Add remote audio if available
      if (remoteStream) {
        const remoteAudioTracks = remoteStream.getAudioTracks();
        if (remoteAudioTracks.length > 0) {
          const remoteSource = audioContext.createMediaStreamSource(new MediaStream(remoteAudioTracks));
          remoteSource.connect(destination);
        }
      }
      
      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error(t('calls.recordingError'));
    }
  }, [t]);

  const stopRecording = useCallback((): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setIsRecording(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        console.log('Recording stopped, blob size:', blob.size);
        resolve({ blob, url });
      };
      
      mediaRecorderRef.current.stop();
    });
  }, []);

  const uploadRecording = useCallback(async (
    callId: string, 
    blob: Blob, 
    isGroupCall = false
  ): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileName = `${user.id}/${callId}_${Date.now()}.webm`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('call-recordings')
        .upload(fileName, blob, {
          contentType: 'audio/webm',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('call-recordings')
        .getPublicUrl(uploadData.path);
      
      // Save to database
      const insertData = isGroupCall 
        ? {
            recorded_by: user.id,
            file_url: uploadData.path,
            duration_seconds: recordingDuration,
            file_size_bytes: blob.size,
            group_call_id: callId,
          }
        : {
            recorded_by: user.id,
            file_url: uploadData.path,
            duration_seconds: recordingDuration,
            file_size_bytes: blob.size,
            call_id: callId,
          };
      
      const { error: dbError } = await supabase
        .from('call_recordings')
        .insert(insertData);
      
      if (dbError) throw dbError;
      
      toast.success(t('calls.recordingSaved'));
      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload recording:', error);
      toast.error(t('calls.recordingUploadError'));
      return null;
    }
  }, [user, recordingDuration, t]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    uploadRecording,
  };
}
