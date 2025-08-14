import React, { useRef, useEffect, useState } from 'react';

interface PetriNetProps {
  marking: number[];
  fireTransition: (t: number) => void;
}

export default function PetriNet({ marking, fireTransition }: PetriNetProps) {
  // Références pour chaque élément du graphe
  const p1Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const p2Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const p3Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const p4Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const t1Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const t2Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const t3Ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // État pour stocker les coordonnées des arcs
  const [arcPaths, setArcPaths] = useState<string[]>([]);

  // Fonction pour calculer un point sur le bord d'un cercle (Place)
  const getPointOnCircle = React.useCallback(
    (center: { x: number, y: number }, target: { x: number, y: number }, radius: number) => {
      const angle = Math.atan2(target.y - center.y, target.x - center.x);
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      return { x, y };
    },
    []
  );

  // Fonction pour calculer un point sur le bord d'un rectangle (Transition)
  const getPointOnRect = React.useCallback(
    (center: { x: number, y: number }, target: { x: number, y: number }, width: number, height: number) => {
      const dx = target.x - center.x;
      const dy = target.y - center.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      
      let x, y;
      if (absDx > absDy) {
          x = center.x + Math.sign(dx) * halfWidth;
          y = center.y + (dy / absDx) * halfWidth;
      } else {
          x = center.x + (dx / absDy) * halfHeight;
          y = center.y + Math.sign(dy) * halfHeight;
      }
      return { x, y };
    },
    []
  );

  const getArcPath = React.useCallback(
    (startRef: React.RefObject<HTMLDivElement>, endRef: React.RefObject<HTMLDivElement>) => {
      if (!startRef.current || !endRef.current || !containerRef.current) return '';
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const startRect = startRef.current.getBoundingClientRect();
      const endRect = endRef.current.getBoundingClientRect();

      const startCenter = {
        x: startRect.left + startRect.width / 2 - containerRect.left,
        y: startRect.top + startRect.height / 2 - containerRect.top
      };
      const endCenter = {
        x: endRect.left + endRect.width / 2 - containerRect.left,
        y: endRect.top + endRect.height / 2 - containerRect.top
      };

      let startPoint, endPoint;

      // Déterminer le point de départ ajusté
      if (startRect.width === startRect.height) { // C'est une place (cercle)
        const radius = startRect.width / 2;
        startPoint = getPointOnCircle(startCenter, endCenter, radius);
      } else { // C'est une transition (rectangle)
        startPoint = getPointOnRect(startCenter, endCenter, startRect.width, startRect.height);
      }
      
      // Déterminer le point d'arrivée ajusté
      if (endRect.width === endRect.height) { // C'est une place (cercle)
        const radius = endRect.width / 2;
        endPoint = getPointOnCircle(endCenter, startCenter, radius + 5); 
      } else { // C'est une transition (rectangle)
        endPoint = getPointOnRect(endCenter, startCenter, endRect.width, endRect.height);
      }

      return `M${startPoint.x} ${startPoint.y} L${endPoint.x} ${endPoint.y}`;
    },
    [containerRef, getPointOnCircle, getPointOnRect]
  );

  useEffect(() => {
    const updateArcs = () => {
      if (p1Ref.current && p2Ref.current && p3Ref.current && p4Ref.current && t1Ref.current && t2Ref.current && t3Ref.current) {
        const paths = [
          getArcPath(t1Ref, p1Ref),
          getArcPath(p1Ref, t2Ref),
          getArcPath(p2Ref, t2Ref),
          getArcPath(t2Ref, p3Ref),
          getArcPath(p3Ref, t3Ref),
          getArcPath(t3Ref, p4Ref),
          getArcPath(t3Ref, p2Ref),
        ];
        setArcPaths(paths);
      }
    };
    
    updateArcs();
    window.addEventListener('resize', updateArcs);
    return () => window.removeEventListener('resize', updateArcs);
  }, [marking, getArcPath]);

  const canFire = (t: number, currentMarking: number[]): boolean => {
    if (t === 1) return true;
    if (t === 2) return currentMarking[0] > 0 && currentMarking[1] > 0;
    if (t === 3) return currentMarking[2] > 0;
    return false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-lg shadow-md p-4 mb-8">
      {/* Places */}
      <div 
        ref={p1Ref}
        className={`absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 ${marking[0] > 0 ? 'border-blue-500' : 'border-gray-300'} flex items-center justify-center`}
      >
        {Array(marking[0]).fill(0).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full mx-0.5"></div>
          ))}
                <div className="absolute -top-8 flex justify-center w-full">
          <span className="font-bold">P1</span>
        </div>
      </div>

      <div 
        ref={p2Ref}
        className={`absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full border-4 ${marking[1] > 0 ? 'border-green-500' : 'border-gray-300'} flex items-center justify-center`}
      >   {Array(marking[1]).fill(0).map((_, i) => (
          <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full mx-0.5"></div>))}
        
        <div className="absolute -bottom-8 flex justify-center w-full">
          <span className="font-bold ">P2</span>
        </div>
      </div>

      <div 
        ref={p3Ref}
        className={`absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 ${marking[2] > 0 ? 'border-yellow-500' : 'border-gray-300'} flex items-center justify-center`}
      >
        {Array(marking[2]).fill(0).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full mx-0.5"></div>
          ))}
        <div className="absolute -top-8 flex justify-center w-full">
        <span className="font-bold">P3</span>  
        </div>
      </div>

      <div 
        ref={p4Ref}
        className={`absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full border-4 ${marking[3] > 0 ? 'border-purple-500' : 'border-gray-300'} flex items-center justify-center`}
      >
        {Array(marking[3]).fill(0).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full mx-0.5"></div>
          ))}
        <div className="absolute -top-8 flex justify-center w-full">
          <span className="font-bold">P4</span>
        </div>
      </div>

      {/* Transitions */}
      <div 
        ref={t1Ref}
        className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-8 ${canFire(1, marking) ? 'bg-red-500 cursor-pointer' : 'bg-gray-400'} flex items-center justify-center text-white font-bold rounded`}
        onClick={() => canFire(1, marking) && fireTransition(1)}
      >
        T1
      </div>

      <div 
        ref={t2Ref}
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-8 ${canFire(2, marking) ? 'bg-red-500 cursor-pointer' : 'bg-gray-400'} flex items-center justify-center text-white font-bold rounded`}
        onClick={() => canFire(2, marking) && fireTransition(2)}
      >
        T2
      </div>

      <div 
        ref={t3Ref}
        className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-12 h-8 ${canFire(3, marking) ? 'bg-red-500 cursor-pointer' : 'bg-gray-400'} flex items-center justify-center text-white font-bold rounded`}
        onClick={() => canFire(3, marking) && fireTransition(3)}
      >
        T3
      </div>

      {/* Arcs avec des flèches */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>

        {/* T1 -> P1 */}
        <path 
          d={arcPaths[0]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* P1 -> T2 */}
        <path 
          d={arcPaths[1]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* P2 -> T2 */}
        <path 
          d={arcPaths[2]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* T2 -> P3 */}
        <path 
          d={arcPaths[3]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* P3 -> T3 */}
        <path 
          d={arcPaths[4]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* T3 -> P4 */}
        <path 
          d={arcPaths[5]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        {/* T3 -> P2 (ligne pointillée) */}
        <path 
          d={arcPaths[6]} 
          stroke="black" 
          strokeWidth="2" 
          fill="none"
          //strokeDasharray="5,5" (pour une ligne pointillée)
          markerEnd="url(#arrowhead)"
        />
      </svg>
    </div>
  );
}