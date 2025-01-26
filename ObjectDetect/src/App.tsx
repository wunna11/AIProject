import React from 'react';
import { Recycle } from 'lucide-react';
import ObjectDetection from './components/ObjectDetection';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Recycle className="w-12 h-12 text-green-500" />
            <h1 className="text-4xl font-bold text-white">EcoScan AI</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Real-time recycling assistant using AI to help you identify recyclable objects.
            Point your camera at any object to determine if it's recyclable or not.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-xl">
          <ObjectDetection />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-green-500">Recyclable Items</h3>
              <p>The AI model can detect common recyclable items such as bottles, cans, paper, cardboard, and containers.</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-red-500">Non-Recyclable Items</h3>
              <p>Items not listed as recyclable will be marked in red. Always check your local recycling guidelines.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;