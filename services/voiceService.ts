/**
 * Voice Service
 * Handles audio recording, processing, and integration with Gemini for voice-to-transaction parsing.
 */

type RecordingState = 'idle' | 'recording' | 'processing';

interface VoiceRecorder {
    stream: MediaStream | null;
    mediaRecorder: MediaRecorder | null;
    audioChunks: Blob[];
    state: RecordingState;
}

// Global recorder state
const recorder: VoiceRecorder = {
    stream: null,
    mediaRecorder: null,
    audioChunks: [],
    state: 'idle'
};

/**
 * Check if the browser supports audio recording
 */
export const isVoiceSupported = (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
};

/**
 * Request microphone permission
 * @returns Promise<boolean> - true if permission granted
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
        return true;
    } catch {
        return false;
    }
};

/**
 * Start recording audio
 * @returns Promise<void>
 */
export const startRecording = async (): Promise<void> => {
    if (recorder.state === 'recording') {
        console.warn('Already recording');
        return;
    }

    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }
        });

        recorder.stream = stream;
        recorder.audioChunks = [];

        // Determine best supported MIME type
        const mimeType = getSupportedMimeType();

        recorder.mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 128000
        });

        recorder.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recorder.audioChunks.push(event.data);
            }
        };

        recorder.mediaRecorder.start(100); // Collect data every 100ms
        recorder.state = 'recording';

    } catch (error) {
        console.error('Failed to start recording:', error);
        throw new Error('Microphone access denied');
    }
};

/**
 * Stop recording and return the audio blob
 * @returns Promise<{ blob: Blob, mimeType: string }>
 */
export const stopRecording = async (): Promise<{ blob: Blob; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        if (!recorder.mediaRecorder || recorder.state !== 'recording') {
            reject(new Error('Not recording'));
            return;
        }

        const mimeType = recorder.mediaRecorder.mimeType;

        recorder.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(recorder.audioChunks, { type: mimeType });

            // Clean up
            if (recorder.stream) {
                recorder.stream.getTracks().forEach(track => track.stop());
            }

            recorder.stream = null;
            recorder.mediaRecorder = null;
            recorder.audioChunks = [];
            recorder.state = 'idle';

            resolve({ blob: audioBlob, mimeType });
        };

        recorder.mediaRecorder.stop();
    });
};

/**
 * Cancel recording without returning audio
 */
export const cancelRecording = (): void => {
    if (recorder.mediaRecorder && recorder.state === 'recording') {
        recorder.mediaRecorder.stop();
    }

    if (recorder.stream) {
        recorder.stream.getTracks().forEach(track => track.stop());
    }

    recorder.stream = null;
    recorder.mediaRecorder = null;
    recorder.audioChunks = [];
    recorder.state = 'idle';
};

/**
 * Get current recording state
 */
export const getRecordingState = (): RecordingState => {
    return recorder.state;
};

/**
 * Convert audio blob to base64 string
 * @param blob - Audio blob
 * @returns Promise<string> - Base64 encoded audio
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Get the best supported audio MIME type
 */
const getSupportedMimeType = (): string => {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav'
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }

    return 'audio/webm'; // Fallback
};

/**
 * Get audio duration from blob (approximate)
 * @param blob - Audio blob
 * @returns Estimated duration in seconds based on file size
 */
export const estimateAudioDuration = (blob: Blob): number => {
    // Rough estimate: ~16KB per second for typical voice recording
    return Math.round(blob.size / 16000);
};
