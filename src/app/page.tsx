'use client';
import { useState } from 'react';
import PetriNet from '../components/PetriNet';

// Fonctions utilitaires
function canFire(t: number, marking: number[]): boolean {
  if (t === 1) return true;
  if (t === 2) return marking[0] > 0 && marking[1] > 0;
  if (t === 3) return marking[2] > 0;
  return false;
}

function getTransitionBetween(m1: number[], m2: number[]): number {
  if (m2[0] === m1[0] + 1 && m1[0] !== m2[0]) return 1;
  if (m2[2] === m1[2] + 1 && m1[2] !== m2[2]) return 2;
  if (m2[3] === m1[3] + 1 && m1[3] !== m2[3]) return 3;
  return 0;
}

export default function Home() {
  const [marking, setMarking] = useState([0, 1, 0, 0]);
  const [history, setHistory] = useState<number[][]>([[0, 1, 0, 0]]);

  const fireTransition = (t: number) => {
    const newMarking = [...marking];
    
    // Vérification des préconditions
    if (t === 1) { // T1
      newMarking[0] += 1;
    } 
    else if (t === 2 && marking[0] > 0 && marking[1] > 0) { // T2
      newMarking[0] -= 1;
      newMarking[1] -= 1;
      newMarking[2] += 1;
    } 
    else if (t === 3 && marking[2] > 0) { // T3
      newMarking[2] -= 1;
      newMarking[1] += 1;
      newMarking[3] += 1;
    } 
    else {
      return; // Transition non tirable
    }

    setMarking(newMarking);
    setHistory([...history, newMarking]);
  };

  const reset = () => {
    setMarking([0, 1, 0, 0]);
    setHistory([[0, 1, 0, 0]]);
  };

  const undo = () => {
    if (history.length > 1) {
      setMarking(history[history.length - 2]);
      setHistory(history.slice(0, -1));
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col">
      <div className="mb-6 flex justify-center">
        <div className="px-8 py-4 rounded-xl shadow-lg bg-gradient-to-r from-fuchsia-400 via-blue-400 to-indigo-400">
          <h1 className="text-3xl font-bold text-center text-white drop-shadow">
            Réseau de Petri Interactif : Modèle de Passage à la frontière
          </h1>
        </div>
      </div>

      <div className="flex flex-row space-x-8 h-full overflow-hidden">
        <div className="w-1/2">
          <PetriNet marking={marking} fireTransition={fireTransition} />
        </div>
        
        <div className="w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={() => fireTransition(1)}
              disabled={!canFire(1, marking)}
              className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold flex items-center gap-2
                ${canFire(1, marking) 
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 focus:ring-2 focus:ring-green-300' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              T1 (Arrivée)
            </button>
            <button 
              onClick={() => fireTransition(2)}
              disabled={!canFire(2, marking)}
              className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold flex items-center gap-2
              ${canFire(2, marking) 
                ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 focus:ring-2 focus:ring-blue-300' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              T2 (Début contrôle)
            </button>
            <button 
              onClick={() => fireTransition(3)}
              disabled={!canFire(3, marking)}
              className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-semibold flex items-center gap-2
              ${canFire(3, marking) 
                ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 focus:ring-2 focus:ring-red-300' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              T3 (Fin contrôle)
            </button>
          </div>
          
          <div className="flex justify-center space-x-4 mb-8">
            <div className="flex justify-end items-center space-x-2 w-full">
                <button
                  onClick={undo}
                  disabled={history.length <= 1}
                    className={`px-2 py-1 rounded shadow-sm font-semibold flex items-center gap-1 text-sm transition-all duration-200
                    ${history.length > 1
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-900 hover:scale-105 focus:ring-2 focus:ring-gray-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-5-5m0 0l5-5m-5 5h16a4 4 0 010 8h-1" />
                    </svg>
                    Annuler
                  </button>
                  <button
                    onClick={reset}
                    className="px-2 py-1 rounded shadow-sm font-semibold flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-red-400"
                    style={{ minWidth: 0 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M4 20L20 4" />
                    </svg>
                    Réinitialiser
                  </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Marquage courant :</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-100 rounded shadow flex flex-col items-center">
                <div className="font-bold text-blue-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                P1
                </div>
                <div className="text-sm">{marking[0]} voyageur{marking[0] !== 1 ? 's' : ''} en attente</div>
              </div>
              <div className="p-3 bg-green-100 rounded shadow flex flex-col items-center">
                <div className="font-bold text-green-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0M12 14v7m-4-4h8"/>
                </svg>
                P2
                </div>
                <div className="text-sm">{marking[1]} agent{marking[1] !== 1 ? 's' : ''} disponible{marking[1] !== 1 ? 's' : ''}</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded shadow flex flex-col items-center">
                <div className="font-bold text-yellow-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93"/>
                </svg>
                P3
                </div>
                <div className="text-sm">{marking[2]} contrôle{marking[2] !== 1 ? 's' : ''} en cours</div>
              </div>
              <div className="p-3 bg-purple-100 rounded shadow flex flex-col items-center">
                <div className="font-bold text-purple-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                P4
                </div>
                <div className="text-sm">{marking[3]} voyageur{marking[3] !== 1 ? 's' : ''} autorisé{marking[3] !== 1 ? 's' : ''}</div>
              </div>
              </div>
            </div>

            <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Graphe de marquage :</h3>
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-200 p-4 rounded-lg shadow-inner">
              {history.map((m, i) => (
              <div key={i} className="flex items-center mb-3">

                <span className="font-mono bg-white px-4 py-1 rounded-lg border border-gray-200 shadow text-gray-700 text-sm">
                <span className="font-bold">M{i}</span> : (<span>{m.join(', ')}</span>)
                </span>

                {i < history.length - 1 && (
                <span className="mx-3 flex items-center text-gray-500 text-lg">
                  <svg className="w-5 h-5 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold text-xs shadow">
                  T{getTransitionBetween(history[i], history[i+1])}
                  </span>
                </span>
                )}
              </div>
              ))}
            </div>
            
            </div>
        </div>
      </div>
    </div>
  );
}