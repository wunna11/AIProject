import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
// Import core and backends before the model
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Camera, CameraOff, Settings } from 'lucide-react';

interface Detection {
  bbox: number[];
  class: string;
  score: number;
}

const RECYCLABLE_ITEMS = [
  'bottle', 'cup', 'book', 'paper', 'box', 'can',
  'container', 'newspaper', 'magazine', 'cardboard'
];

const ObjectDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [fps, setFps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initTensorFlow = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, ensure TensorFlow core is ready
        await tf.ready();
        
        // Explicitly set memory configuration
        tf.env().set('WEBGL_FORCE_F16_TEXTURES', false);
        tf.env().set('WEBGL_VERSION', 2);
        tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
        
        // Try WebGL first
        if (tf.findBackend('webgl')) {
          await tf.setBackend('webgl');
        } else if (tf.findBackend('cpu')) {
          await tf.setBackend('cpu');
        } else {
          throw new Error('No suitable backend found');
        }

        if (!isMounted) return;

        console.log('TensorFlow initialized with backend:', tf.getBackend());
        
        // Load the COCO-SSD model
        const loadedModel = await cocossd.load({
          base: 'lite_mobilenet_v2'
        });
        
        if (!isMounted) return;
        
        setModel(loadedModel);
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize TensorFlow');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initTensorFlow();

    return () => {
      isMounted = false;
      // Cleanup tensors and memory
      tf.engine().disposeVariables();
    };
  }, []);

  const detect = async () => {
    if (!model || !webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    if (!video || !video.readyState) return;

    const { videoWidth, videoHeight } = video;
    video.width = videoWidth;
    video.height = videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    try {
      const startTime = performance.now();
      const detections = await model.detect(video);
      const filteredDetections = detections.filter(detection => detection.score >= confidenceThreshold);
      const endTime = performance.now();
      
      setFps(Math.round(1000 / (endTime - startTime)));

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      filteredDetections.forEach((detection: Detection) => {
        const [x, y, width, height] = detection.bbox;
        const isRecyclable = RECYCLABLE_ITEMS.some(item => 
          detection.class.toLowerCase().includes(item)
        );

        ctx.fillStyle = isRecyclable ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = isRecyclable ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        const text = `${detection.class} (${Math.round(detection.score * 100)}%) - ${isRecyclable ? 'Recyclable' : 'Non-recyclable'}`;
        ctx.font = '16px Arial';
        const textMetrics = ctx.measureText(text);
        const textHeight = 24;
        const textY = y > textHeight ? y - 5 : y + height + textHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, textY - textHeight + 5, textMetrics.width + 10, textHeight);

        ctx.fillStyle = isRecyclable ? '#22c55e' : '#ef4444';
        ctx.fillText(text, x + 5, textY);
      });
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  useEffect(() => {
    let animationId: number;
    
    const detectLoop = () => {
      if (isWebcamOn) {
        detect();
      }
      animationId = requestAnimationFrame(detectLoop);
    };

    if (model) {
      detectLoop();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [model, isWebcamOn, confidenceThreshold]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h3 className="font-bold mb-2">Error Initializing AI Model</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please try refreshing the page or check if your browser supports WebGL.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p>Loading AI model...</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10 flex gap-4 bg-black/50 p-2 rounded-lg">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-white hover:text-gray-200 transition-colors"
          title="Settings"
        >
          <Settings size={24} />
        </button>
        <button
          onClick={() => setIsWebcamOn(!isWebcamOn)}
          className="text-white hover:text-gray-200 transition-colors"
          title="Toggle camera"
        >
          {isWebcamOn ? <Camera size={24} /> : <CameraOff size={24} />}
        </button>
        <span className="text-white font-mono">{fps} FPS</span>
      </div>

      {showSettings && (
        <div className="absolute top-16 right-4 z-10 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-white font-semibold mb-2">Detection Settings</h3>
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm">
              Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceThreshold * 100}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value) / 100)}
              className="w-48"
            />
          </div>
        </div>
      )}
      
      <div className="relative">
        <Webcam
          ref={webcamRef}
          className={`rounded-lg ${!isWebcamOn ? 'hidden' : ''}`}
          mirrored
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-lg"
        />
      </div>
    </div>
  );
};

export default ObjectDetection;