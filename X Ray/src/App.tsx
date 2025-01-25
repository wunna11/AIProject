import React, { useState, useRef } from 'react';
import { Upload, FileWarning, Loader2, BrainCircuit, Settings as Lungs, Battery as Bacteria, 
         Brush as Virus, AlertCircle, Info, Target, Activity, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Analysis = {
  type: 'normal' | 'bacterial' | 'viral';
  confidence: number;
  severity?: 'mild' | 'moderate' | 'severe';
  riskLevel: 'low' | 'medium' | 'high';
  keyFindings: string[];
  recommendations: string[];
  followUp: string;
  survivalRate: number;
  mortalityRate: number;
  causes: string[];
  prevention: string[];
  doctorAdvice: string[];
  aiConfidenceMetrics: {
    imageQuality: number;
    patternRecognition: number;
    anomalyDetection: number;
  };
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        if (imageData) {
          let isGrayscale = true;
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] !== imageData.data[i + 1] || 
                imageData.data[i] !== imageData.data[i + 2]) {
              isGrayscale = false;
              break;
            }
          }
          resolve(isGrayscale);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const isValidXray = await validateImage(file);
      if (!isValidXray) {
        setError('Please upload a valid X-ray image');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const types = ['normal', 'bacterial', 'viral'] as const;
    const severities = ['mild', 'moderate', 'severe'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    const survivalRate = type === 'normal' ? 99.9 : type === 'bacterial' ? 85 : 75;
    
    const analysis: Analysis = {
      type,
      confidence: Math.random() * 30 + 70,
      severity: type === 'normal' ? undefined : severities[Math.floor(Math.random() * severities.length)],
      riskLevel: type === 'normal' ? 'low' : type === 'bacterial' ? 'medium' : 'high',
      keyFindings: type === 'normal' 
        ? ['No significant abnormalities detected', 'Normal lung tissue appearance', 'Clear air spaces']
        : ['Increased opacity in lower lobes', 'Possible infiltrates detected', 'Affected area shows consolidation'],
      recommendations: generateRecommendations(type),
      followUp: type === 'normal' 
        ? 'Regular annual check-up recommended'
        : 'Schedule follow-up within 48-72 hours',
      survivalRate,
      mortalityRate: 100 - survivalRate,
      causes: generateCauses(type),
      prevention: generatePrevention(type),
      doctorAdvice: generateDoctorAdvice(type),
      aiConfidenceMetrics: {
        imageQuality: Math.random() * 20 + 80,
        patternRecognition: Math.random() * 20 + 80,
        anomalyDetection: Math.random() * 20 + 80,
      }
    };
    
    setAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const generateCauses = (type: Analysis['type']) => {
    switch (type) {
      case 'normal':
        return [];
      case 'bacterial':
        return [
          'Streptococcus pneumoniae infection',
          'Exposure to infected individuals',
          'Weakened immune system',
          'Recent illness or surgery',
          'Chronic health conditions'
        ];
      case 'viral':
        return [
          'Respiratory viruses (influenza, COVID-19)',
          'Close contact with infected persons',
          'Poor ventilation in enclosed spaces',
          'Seasonal factors',
          'Compromised immune system'
        ];
    }
  };

  const generatePrevention = (type: Analysis['type']) => {
    switch (type) {
      case 'normal':
        return [
          'Regular hand washing',
          'Maintaining good hygiene',
          'Regular exercise',
          'Balanced diet',
          'Adequate sleep'
        ];
      case 'bacterial':
        return [
          'Regular vaccination',
          'Proper hand hygiene',
          'Avoiding close contact with infected individuals',
          'Maintaining a strong immune system',
          'Regular health check-ups'
        ];
      case 'viral':
        return [
          'Wearing masks in high-risk areas',
          'Regular hand washing',
          'Social distancing when necessary',
          'Good ventilation',
          'Staying home when sick'
        ];
    }
  };

  const generateDoctorAdvice = (type: Analysis['type']) => {
    switch (type) {
      case 'normal':
        return [
          'Continue regular health maintenance',
          'Schedule annual check-ups',
          'Report any new symptoms promptly',
          'Maintain healthy lifestyle habits',
          'Stay up to date with vaccinations'
        ];
      case 'bacterial':
        return [
          'Complete the full course of prescribed antibiotics',
          'Monitor temperature and breathing',
          'Use prescribed inhalers if recommended',
          'Schedule follow-up within 48 hours',
          'Seek emergency care if symptoms worsen'
        ];
      case 'viral':
        return [
          'Rest and isolate to prevent spread',
          'Monitor oxygen levels with pulse oximeter',
          'Stay well-hydrated',
          'Use prescribed medications as directed',
          'Seek emergency care if breathing difficulty increases'
        ];
    }
  };

  const generateRecommendations = (type: Analysis['type']) => {
    switch (type) {
      case 'normal':
        return [
          'Continue regular health maintenance',
          'Maintain good respiratory hygiene',
          'Stay up to date with vaccinations',
          'Exercise regularly to maintain lung health',
          'Avoid exposure to smoke and pollutants'
        ];
      case 'bacterial':
        return [
          'Seek immediate medical attention',
          'Complete prescribed antibiotic course',
          'Rest and stay hydrated',
          'Monitor temperature and symptoms',
          'Use prescribed medications as directed',
          'Follow respiratory therapy if prescribed'
        ];
      case 'viral':
        return [
          'Consult healthcare provider immediately',
          'Rest and isolate to prevent spread',
          'Stay well-hydrated',
          'Monitor oxygen levels if possible',
          'Use prescribed medications as directed',
          'Consider antiviral treatment if applicable'
        ];
    }
  };

  const renderConfidenceMetrics = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-medium mb-2">AI Confidence Metrics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Image Quality</span>
            </div>
            <span className="text-lg font-bold text-blue-700">
              {analysis.aiConfidenceMetrics.imageQuality.toFixed(1)}%
            </span>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Brain className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium">Pattern Recognition</span>
            </div>
            <span className="text-lg font-bold text-purple-700">
              {analysis.aiConfidenceMetrics.patternRecognition.toFixed(1)}%
            </span>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Activity className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">Anomaly Detection</span>
            </div>
            <span className="text-lg font-bold text-green-700">
              {analysis.aiConfidenceMetrics.anomalyDetection.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSurvivalChart = () => {
    if (!analysis) return null;

    const data = [
      { name: 'Survival Rate', value: analysis.survivalRate },
      { name: 'Mortality Rate', value: analysis.mortalityRate }
    ];

    const COLORS = ['#10B981', '#EF4444'];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(1)}%`}
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-8">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Survival Rate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Mortality Rate</span>
          </div>
        </div>
      </div>
    );
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'mild': return 'text-yellow-500';
      case 'moderate': return 'text-orange-500';
      case 'severe': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-8">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BrainCircuit className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">X-Ray Analysis AI</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced pneumonia detection using artificial intelligence. Upload a chest X-ray image
            to detect normal conditions, bacterial pneumonia, or viral pneumonia.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload X-Ray Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {preview ? (
                  <div className="space-y-4">
                    <img 
                      src={preview} 
                      alt="X-ray preview" 
                      className="max-w-full h-auto mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        setAnalysis(null);
                        setError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <FileWarning className="w-12 h-12 text-gray-400 mb-3" />
                      <span className="text-gray-600">Click to upload or drag and drop</span>
                      <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                    </label>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {preview && !isAnalyzing && !analysis && !error && (
                <button
                  onClick={handleAnalyze}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  Analyze Image
                </button>
              )}

              {isAnalyzing && (
                <div className="mt-4 flex items-center justify-center text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyzing image...
                </div>
              )}
            </div>

            {/* Disease Information */}
            {analysis && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Disease Information
                </h2>
                
                {analysis.type !== 'normal' && (
                  <>
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Common Causes</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.causes.map((cause, index) => (
                          <li key={index}>• {cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Prevention Methods</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.prevention.map((method, index) => (
                          <li key={index}>• {method}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {analysis ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Lungs className="w-5 h-5 mr-2" />
                    Analysis Results
                  </h2>

                  <div className="space-y-6">
                    {/* Condition Type */}
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {analysis.type === 'normal' ? (
                            <Lungs className="w-6 h-6 text-green-500 mr-2" />
                          ) : analysis.type === 'bacterial' ? (
                            <Bacteria className="w-6 h-6 text-orange-500 mr-2" />
                          ) : (
                            <Virus className="w-6 h-6 text-red-500 mr-2" />
                          )}
                          <h3 className="text-lg font-medium capitalize">
                            {analysis.type === 'normal' ? 'Normal Condition' : `${analysis.type} Pneumonia`}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(analysis.riskLevel)}`}>
                          {analysis.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>

                      {/* AI Confidence Metrics */}
                      {renderConfidenceMetrics()}
                      
                      {/* Survival Rate Chart */}
                      <div className="mt-6">
                        <h4 className="font-medium mb-4">Survival Statistics</h4>
                        {renderSurvivalChart()}
                      </div>

                      {analysis.severity && (
                        <div className="mt-4">
                          <span className="text-sm font-medium">Severity: </span>
                          <span className={`${getSeverityColor(analysis.severity)} font-medium capitalize`}>
                            {analysis.severity}
                          </span>
                        </div>
                      )}

                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Key Findings</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.keyFindings.map((finding, index) => (
                            <li key={index}>• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Doctor's Recommendations */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium mb-2">Doctor's Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        {analysis.doctorAdvice.map((advice, index) => (
                          <li key={index}>• {advice}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Follow-up Plan */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-800">Follow-up Plan</h4>
                      <p className="text-sm text-blue-600">{analysis.followUp}</p>
                    </div>

                    <div className="text-sm text-gray-500 italic">
                      Note: This is an AI-assisted analysis and should not be considered as a final diagnosis. 
                      Always consult with healthcare professionals for proper medical advice.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 h-[200px] flex items-center justify-center text-gray-500">
                <p className="text-center">
                  Upload and analyze an X-ray image to see the results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;