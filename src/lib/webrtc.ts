// WebRTC utilities for voice/video calls

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export const createPeerConnection = (): RTCPeerConnection => {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
};

export const getLocalStream = async (
  callType: 'voice' | 'video',
  facingMode: 'user' | 'environment' = 'user'
): Promise<MediaStream> => {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: callType === 'video' ? {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      facingMode,
      frameRate: { ideal: 30, max: 60 },
    } : false,
  };

  return navigator.mediaDevices.getUserMedia(constraints);
};

// Robust stream getter for Live streaming with fallback
export const getLocalStreamForLive = async (
  facingMode: 'user' | 'environment' = 'user'
): Promise<MediaStream> => {
  console.log('[WebRTC] Getting stream for live, facingMode:', facingMode);
  
  // Try #1: Full audio + video with high quality
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode,
        frameRate: { ideal: 30, max: 60 },
      },
    });
    console.log('[WebRTC] Got full audio+video stream');
    return stream;
  } catch (err) {
    console.warn('[WebRTC] Full stream failed, trying video-only:', err);
  }

  // Try #2: Video only (in case mic permission denied)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode,
        frameRate: { ideal: 30, max: 60 },
      },
    });
    console.log('[WebRTC] Got video-only stream');
    return stream;
  } catch (err) {
    console.warn('[WebRTC] Video-only failed, trying lower quality:', err);
  }

  // Try #3: Lower quality video
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode,
      },
    });
    console.log('[WebRTC] Got low-quality video stream');
    return stream;
  } catch (err) {
    console.warn('[WebRTC] Low-quality video failed, trying any video:', err);
  }

  // Try #4: Any video at all
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  console.log('[WebRTC] Got basic video stream');
  return stream;
};

// Enable/disable audio tracks explicitly
export const setAudioEnabled = (stream: MediaStream, enabled: boolean): void => {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
    console.log('[WebRTC] Audio track enabled:', enabled);
  });
};

// Enable/disable video tracks explicitly  
export const setVideoEnabled = (stream: MediaStream, enabled: boolean): void => {
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
    console.log('[WebRTC] Video track enabled:', enabled);
  });
};

export const createOffer = async (
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> => {
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await peerConnection.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> => {
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  return answer;
};

export const setRemoteDescription = async (
  peerConnection: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit
): Promise<void> => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
};

export const addIceCandidate = async (
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

export const addStreamToPeerConnection = (
  peerConnection: RTCPeerConnection,
  stream: MediaStream
): void => {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
};

export const stopStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

export const toggleAudio = (stream: MediaStream, enabled: boolean): void => {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

export const toggleVideo = (stream: MediaStream, enabled: boolean): void => {
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

// Switch camera (front/back) for mobile devices
export const switchCamera = async (
  currentStream: MediaStream,
  peerConnection: RTCPeerConnection | null
): Promise<MediaStream> => {
  const currentVideoTrack = currentStream.getVideoTracks()[0];
  const currentFacingMode = currentVideoTrack?.getSettings().facingMode || 'user';
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

  // Stop current video track
  currentVideoTrack?.stop();

  // Get new stream with opposite camera
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: newFacingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  const newVideoTrack = newStream.getVideoTracks()[0];

  // Replace track in stream
  currentStream.removeTrack(currentVideoTrack);
  currentStream.addTrack(newVideoTrack);

  // Replace track in peer connection
  if (peerConnection) {
    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }
  }

  return currentStream;
};

// Check if device has multiple cameras
export const hasMultipleCameras = async (): Promise<boolean> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    return videoDevices.length > 1;
  } catch {
    return false;
  }
};

// Get connection quality indicator (based on RTCStats)
export const getConnectionQuality = (stats: RTCStatsReport): 'excellent' | 'good' | 'poor' | 'bad' => {
  let packetsLost = 0;
  let packetsReceived = 0;
  let jitter = 0;

  stats.forEach((stat) => {
    if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
      packetsLost = stat.packetsLost || 0;
      packetsReceived = stat.packetsReceived || 0;
      jitter = stat.jitter || 0;
    }
  });

  const totalPackets = packetsLost + packetsReceived;
  const lossRate = totalPackets > 0 ? packetsLost / totalPackets : 0;

  if (lossRate < 0.01 && jitter < 0.03) return 'excellent';
  if (lossRate < 0.05 && jitter < 0.1) return 'good';
  if (lossRate < 0.15 && jitter < 0.3) return 'poor';
  return 'bad';
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get screen share stream
export const getScreenShareStream = async (): Promise<MediaStream> => {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
};

// Replace video track in peer connection (for screen share)
export const replaceVideoTrack = async (
  peerConnection: RTCPeerConnection | null,
  newTrack: MediaStreamTrack
): Promise<void> => {
  if (peerConnection) {
    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }
};
