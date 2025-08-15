'use client';
import { useState, useEffect } from 'react';

export default function MatrixCalculator({ marking, history }) {
  // Matrices du réseau de Petri basées sur votre code
  const Pre = [
    [0, 1, 0], // P1: T1=0, T2=1, T3=0
    [0, 1, 0], // P2: T1=0, T2=1, T3=0
    [0, 0, 1], // P3: T1=0, T2=0, T3=1
    [0, 0, 0]  // P4: T1=0, T2=0, T3=0
  ];
  
  const Post = [
    [1, 0, 0], // P1: T1=1, T2=0, T3=0
    [0, 0, 1], // P2: T1=0, T2=0, T3=1
    [0, 1, 0], // P3: T1=0, T2=1, T3=0
    [0, 0, 1]  // P4: T1=0, T2=0, T3=1
  ];
  
  // Calcul de la matrice d'incidence C = Post - Pre
  const C = Post.map((postRow, i) => 
    postRow.map((postVal, j) => postVal - Pre[i][j])
  );

  // Fonction pour déterminer quelle transition a été tirée entre deux marquages
  const getTransitionBetween = (m1, m2) => {
    if (m2[0] === m1[0] + 1) return 1; // T1
    if (m2[2] === m1[2] + 1) return 2; // T2
    if (m2[3] === m1[3] + 1) return 3; // T3
    return 0;
  };

  // Fonction pour vérifier le calcul matriciel
  const verifyMatrixCalculation = (prevMarking, currentMarking, transition) => {
    if (!transition) return true;
    
    const calculatedMarking = [...prevMarking];
    for (let i = 0; i < 4; i++) {
      calculatedMarking[i] += C[i][transition - 1];
    }
    
    return calculatedMarking.every((val, i) => val === currentMarking[i]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">
        🧮 Vérification Matricielle
      </h2>
      
      {/* Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2 text-red-600">Matrice Pre</h3>
          <div className="bg-red-50 p-3 rounded border text-xs">
            <div className="font-mono">
              {Pre.map((row, i) => (
                <div key={i} className="mb-1">
                  P{i+1}: [{row.join(', ')}]
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2 text-green-600">Matrice Post</h3>
          <div className="bg-green-50 p-3 rounded border text-xs">
            <div className="font-mono">
              {Post.map((row, i) => (
                <div key={i} className="mb-1">
                  P{i+1}: [{row.join(', ')}]
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2 text-blue-600"> MI = Post - Pre</h3>
          <div className="bg-blue-50 p-3 rounded border text-xs">
            <div className="font-mono">
              {C.map((row, i) => (
                <div key={i} className="mb-1">
                  P{i+1}: [{row.map(val => val >= 0 ? ` ${val}` : `${val}`).join(', ')}]
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formule */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-700 font-mono text-center">
          <strong>Formule :</strong> M<sub>nouveau</sub> = M<sub>actuel</sub> + MI × S<sub>t</sub>
        </p>
        <p className="text-xs text-gray-600 text-center mt-1">
          où S<sub>t</sub> est le vecteur de tir (1 pour la transition tirée, 0 ailleurs)
        </p>
      </div>

      {/* Vérification des calculs */}
      <div>
        <h3 className="font-semibold mb-3">Vérification des calculs :</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {history.map((currentMarking, i) => {
            if (i === 0) {
              return (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">
                    M<sub>0</sub>: [{currentMarking.join(', ')}]
                  </span>
                  <span className="ml-4 text-gray-500 text-xs">État initial</span>
                </div>
              );
            }
            
            const prevMarking = history[i - 1];
            const transition = getTransitionBetween(prevMarking, currentMarking);
            const isValid = verifyMatrixCalculation(prevMarking, currentMarking, transition);
            
            return (
              <div key={i} className="border-l-4 border-blue-400 pl-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    M<sub>{i}</sub>: [{currentMarking.join(', ')}]
                  </span>
                  {transition && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      T{transition}
                    </span>
                  )}
                  {isValid ? (
                    <span className="text-green-600 text-xs">✅</span>
                  ) : (
                    <span className="text-red-600 text-xs">❌</span>
                  )}
                </div>
                
                {transition && (
                  <div className="mt-1 text-xs text-gray-600 font-mono">
                    Calcul: [{prevMarking.join(', ')}] + [{C.map(row => row[transition-1]).join(', ')}] = [{currentMarking.join(', ')}]
                  </div>
                )}
                
                {transition && (
                  <div className="mt-1 text-xs text-gray-500">
                    Vecteur S<sub>t</sub>: [
                    {Array.from({length: 3}, (_, j) => j + 1 === transition ? '1' : '0').join(', ')}
                    ]
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Marquages vérifiés : {history.length}
            </p>
            <p className="text-xs text-gray-600">
              Tous les calculs utilisent la formule matricielle
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-700">
              Marquage actuel : [{marking.join(', ')}]
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}