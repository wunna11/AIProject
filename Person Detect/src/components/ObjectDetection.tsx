import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import * as Human from '@vladmandic/human';
import { Camera, CameraOff, Info } from 'lucide-react';

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface PersonDetails {
  bbox: [number, number, number, number];
  gender: string;
  age: number;
  confidence: number;
}

export function ObjectDetection() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [humanModel, setHumanModel] = useState<Human.Human | null>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [fps, setFps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [personCount, setPersonCount] = useState({ total: 0, male: 0, female: 0 });
  const [ageGroups, setAgeGroups] = useState({
    child: 0, // 0-12
    teen: 0,  // 13-19
    adult: 0, // 20-59
    senior: 0 // 60+
  });

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "environment"
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await tf.ready();
        const [cocoModel, human] = await Promise.all([
          cocossd.load({
            base: 'mobilenet_v2',
            modelUrl: 'https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json'
          }),
          new Human.Human({
            modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
            filter: { enabled: true, equalization: false },
            face: {
              enabled: true,
              detector: { rotation: true },
              age: { enabled: true },
              gender: { enabled: true }
            },
            body: { enabled: false },
            hand: { enabled: false },
            object: { enabled: false },
            gesture: { enabled: false }
          })
        ]);

        setModel(cocoModel);
        setHumanModel(human);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();

    return () => {
      if (model) {
        tf.dispose(model);
      }
    };
  }, []);

  const getAgeGroup = (age: number) => {
    if (age <= 12) return 'child';
    if (age <= 19) return 'teen';
    if (age <= 59) return 'adult';
    return 'senior';
  };

  const detect = async () => {
    if (!model || !humanModel || !webcamRef.current || !canvasRef.current || !isWebcamOn) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    try {
      const startTime = performance.now();
      
      // Detect objects using COCO-SSD
      const predictions = await model.detect(video);
      
      // Get person detections
      const personDetections = predictions.filter(pred => pred.class === 'person');
      
      // Detect faces and demographics using Human
      const humanResults = await humanModel.detect(video);
      
      const endTime = performance.now();
      setFps(Math.round(1000 / (endTime - startTime)));

      // Process demographics
      const demographics = {
        total: personDetections.length,
        male: 0,
        female: 0
      };

      const ages = {
        child: 0,
        teen: 0,
        adult: 0,
        senior: 0
      };

      humanResults.face.forEach(face => {
        if (face.gender && face.age) {
          demographics[face.gender === 'male' ? 'male' : 'female']++;
          ages[getAgeGroup(face.age)]++;
        }
      });

      setPersonCount(demographics);
      setAgeGroups(ages);

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      // Draw person detections
      personDetections.forEach((detection: Detection) => {
        const [x, y, width, height] = detection.bbox;
        
        // Draw bounding box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y - 30, width, 30);

        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Person ${Math.round(detection.score * 100)}%`, x + 5, y - 10);
      });

      // Draw face detections with demographics
      humanResults.face.forEach(face => {
        const box = face.box;
        const gender = face.gender || 'unknown';
        const age = face.age ? Math.round(face.age) : 'unknown';

        // Draw face box
        ctx.strokeStyle = gender === 'male' ? '#0088ff' : '#ff69b4';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.left, box.top, box.width, box.height);

        // Draw demographics label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(box.left, box.top - 50, box.width, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`${gender}, ${age} years`, box.left + 5, box.top - 30);
        ctx.fillText(`${Math.round(face.genderScore * 100)}% confidence`, box.left + 5, box.top - 10);
      });

    } catch (error) {
      console.error('Detection error:', error);
    }

    if (isWebcamOn) {
      requestAnimationFrame(detect);
    }
  };

  useEffect(() => {
    let detectInterval: number;

    if (isWebcamOn && model && humanModel) {
      const checkVideoReady = () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          detect();
        } else {
          detectInterval = window.setTimeout(checkVideoReady, 100);
        }
      };
      checkVideoReady();
    }

    return () => {
      if (detectInterval) {
        clearTimeout(detectInterval);
      }
    };
  }, [model, humanModel, isWebcamOn]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8">
      <div className="max-w-4xl w-full px-4">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Person Detection & Demographics</h1>
            <div className="flex items-center gap-4">
              {!isLoading && (
                <span className="text-green-400 font-mono">
                  {fps} FPS
                </span>
              )}
              <button
                onClick={() => setIsWebcamOn(!isWebcamOn)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isWebcamOn ? (
                  <>
                    <CameraOff size={20} />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Start Camera
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-[480px] bg-gray-700 rounded-lg">
                  <div className="text-white text-xl">Loading models...</div>
                </div>
              ) : (
                <div className="relative">
                  {isWebcamOn && (
                    <Webcam
                      ref={webcamRef}
                      className="rounded-lg w-full"
                      videoConstraints={videoConstraints}
                      style={{ visibility: isWebcamOn ? 'visible' : 'hidden' }}
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                  {!isWebcamOn && (
                    <div className="flex items-center justify-center h-[480px] bg-gray-700 rounded-lg">
                      <div className="text-white text-xl">Camera is turned off</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Demographics</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Person Count</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-600 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{personCount.total}</div>
                      <div className="text-sm text-gray-300">Total</div>
                    </div>
                    <div className="bg-blue-600/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{personCount.male}</div>
                      <div className="text-sm text-gray-300">Male</div>
                    </div>
                    <div className="bg-pink-600/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{personCount.female}</div>
                      <div className="text-sm text-gray-300">Female</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Age Groups</h3>
                  <div className="space-y-2">
                    <div className="bg-green-600/30 p-3 rounded-lg flex justify-between">
                      <span className="text-white">Children (0-12)</span>
                      <span className="font-bold text-white">{ageGroups.child}</span>
                    </div>
                    <div className="bg-yellow-600/30 p-3 rounded-lg flex justify-between">
                      <span className="text-white">Teens (13-19)</span>
                      <span className="font-bold text-white">{ageGroups.teen}</span>
                    </div>
                    <div className="bg-orange-600/30 p-3 rounded-lg flex justify-between">
                      <span className="text-white">Adults (20-59)</span>
                      <span className="font-bold text-white">{ageGroups.adult}</span>
                    </div>
                    <div className="bg-purple-600/30 p-3 rounded-lg flex justify-between">
                      <span className="text-white">Seniors (60+)</span>
                      <span className="font-bold text-white">{ageGroups.senior}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-gray-300">
            <h2 className="text-xl font-semibold mb-2">Features:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Real-time person detection</li>
              <li>Gender classification with confidence scores</li>
              <li>Age estimation and grouping</li>
              <li>Live demographics dashboard</li>
              <li>Color-coded visualizations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}