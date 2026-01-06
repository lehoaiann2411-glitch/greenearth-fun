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
  callType: 'voice' | 'video'
): Promise<MediaStream> => {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: callType === 'video' ? {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
    } : false,
  };

  return navigator.mediaDevices.getUserMedia(constraints);
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

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
