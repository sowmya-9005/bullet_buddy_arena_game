import * as THREE from 'three';
import { TREES, ROCKS, FALLEN_LOGS, BUSHES, FOREST_LIGHTS, MAP_HALF } from '@/lib/mapData';

const Environment = () => (
  <>
    {/* Ultra-realistic forest lighting */}
    <ambientLight intensity={0.15} color="#90ee90" />
    <directionalLight 
      position={[15, 25, 10]} 
      intensity={1.2} 
      castShadow 
      color="#fffacd"
      shadow-mapSize={[4096, 4096]}
      shadow-camera-far={80}
      shadow-camera-left={-70}
      shadow-camera-right={70}
      shadow-camera-top={70}
      shadow-camera-bottom={-70}
      shadow-bias={-0.0001}
    />
    <hemisphereLight args={['#87CEEB', '#2d5016', 0.6]} />
    
    {/* God rays effect */}
    <spotLight
      position={[10, 20, 5]}
      angle={0.2}
      penumbra={0.3}
      intensity={0.8}
      color="#ffffe0"
      castShadow
    />
    
    {/* Dense forest fog */}
    <fog attach="fog" args={['#4a6741', 15, 60]} />
    <color attach="background" args={['#87CEEB']} />

    {/* Multi-layered forest floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[MAP_HALF * 2, MAP_HALF * 2, 100, 100]} />
      <meshStandardMaterial color="#3d5a3d" roughness={1.0} metalness={0.0} />
    </mesh>
    
    {/* Forest undergrowth layers */}
    {[
      { pos: [15, 0.02, 15], size: [12, 12], color: '#2d4a2d' },
      { pos: [-20, 0.02, -18], size: [10, 10], color: '#4a6741' },
      { pos: [25, 0.02, -25], size: [15, 15], color: '#355a35' },
      { pos: [-30, 0.02, 30], size: [8, 8], color: '#4a6741' },
      { pos: [8, 0.02, -35], size: [11, 11], color: '#2d4a2d' },
      { pos: [-12, 0.02, 38], size: [9, 9], color: '#355a35' },
      { pos: [40, 0.02, 8], size: [13, 13], color: '#4a6741' },
      { pos: [-38, 0.02, -12], size: [7, 7], color: '#2d4a2d' },
    ].map((patch, i) => (
      <mesh key={`undergrowth${i}`} position={patch.pos as any} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[patch.size[0], patch.size[1], 20, 20]} />
        <meshStandardMaterial color={patch.color} roughness={1.0} />
      </mesh>
    ))}
    
    <gridHelper args={[MAP_HALF * 2, 50, '#2a4a2a', '#2a3f2a']} position={[0, 0.01, 0]} />

    {/* Forest Boundary - Natural rock walls */}
    {[
      [0, 3, -MAP_HALF] as const, [0, 3, MAP_HALF] as const,
      [-MAP_HALF, 3, 0] as const, [MAP_HALF, 3, 0] as const,
    ].map((pos, i) => (
      <mesh key={`bw${i}`} position={pos as any} castShadow receiveShadow>
        <boxGeometry args={[i < 2 ? MAP_HALF * 2 : 0.5, 6, i < 2 ? 0.5 : MAP_HALF * 2]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
    ))}

    {/* Ultra-realistic Trees */}
    {TREES.map((tree, i) => (
      <group key={`tree${i}`} position={tree.pos}>
        {/* Main trunk with natural taper */}
        <mesh position={[0, tree.height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tree.trunkRadius * 0.8, tree.trunkRadius * 1.3, tree.height, 16]} />
          <meshStandardMaterial 
            color={tree.type === 'birch' ? '#faf0e6' : tree.type === 'oak' ? '#8b4513' : '#4b3621'} 
            roughness={0.98} 
            metalness={0.02}
          />
        </mesh>
        
        {/* Natural Foliage */}
        {tree.type === 'pine' ? (
          <>
            {/* Realistic pine layers */}
            <mesh position={[0, tree.height + 0.5, 0]} castShadow receiveShadow>
              <coneGeometry args={[tree.trunkRadius * 4.5, tree.height * 0.6, 16]} />
              <meshStandardMaterial color="#0d4d0d" roughness={0.95} />
            </mesh>
            <mesh position={[0, tree.height + 2, 0]} castShadow receiveShadow>
              <coneGeometry args={[tree.trunkRadius * 3.8, tree.height * 0.5, 16]} />
              <meshStandardMaterial color="#0a3d0a" roughness={0.95} />
            </mesh>
            <mesh position={[0, tree.height + 3.5, 0]} castShadow receiveShadow>
              <coneGeometry args={[tree.trunkRadius * 3, tree.height * 0.4, 16]} />
              <meshStandardMaterial color="#083008" roughness={0.95} />
            </mesh>
            <mesh position={[0, tree.height + 4.5, 0]} castShadow receiveShadow>
              <coneGeometry args={[tree.trunkRadius * 2, tree.height * 0.3, 16]} />
              <meshStandardMaterial color="#062306" roughness={0.95} />
            </mesh>
          </>
        ) : tree.type === 'oak' ? (
          <>
            {/* Massive oak crown */}
            <mesh position={[0, tree.height + 1, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 5, 16, 12]} />
              <meshStandardMaterial color="#228b22" roughness={0.95} />
            </mesh>
            <mesh position={[tree.trunkRadius * 3, tree.height + 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 3, 12, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.95} />
            </mesh>
            <mesh position={[-tree.trunkRadius * 3, tree.height + 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 3, 12, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.95} />
            </mesh>
            <mesh position={[0, tree.height + 2.5, tree.trunkRadius * 3]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 2.5, 10, 8]} />
              <meshStandardMaterial color="#228b22" roughness={0.95} />
            </mesh>
            <mesh position={[0, tree.height + 2.5, -tree.trunkRadius * 3]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 2.5, 10, 8]} />
              <meshStandardMaterial color="#228b22" roughness={0.95} />
            </mesh>
          </>
        ) : (
          /* Birch with delicate foliage */
          <>
            <mesh position={[0, tree.height + 1, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 4, 14, 10]} />
              <meshStandardMaterial color="#90ee90" roughness={0.95} />
            </mesh>
            <mesh position={[tree.trunkRadius * 2, tree.height + 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 2.5, 10, 8]} />
              <meshStandardMaterial color="#98fb98" roughness={0.95} />
            </mesh>
            <mesh position={[-tree.trunkRadius * 2, tree.height + 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[tree.trunkRadius * 2.5, 10, 8]} />
              <meshStandardMaterial color="#98fb98" roughness={0.95} />
            </mesh>
          </>
        )}
        
        {/* Natural root system */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <cylinderGeometry args={[tree.trunkRadius * 2, tree.trunkRadius * 2.5, 0.6, 12]} />
          <meshStandardMaterial 
            color={tree.type === 'birch' ? '#faf0e6' : tree.type === 'oak' ? '#8b4513' : '#4b3621'} 
            roughness={0.98} 
          />
        </mesh>
      </group>
    ))}

    {/* Rocks with realistic shapes */}
    {ROCKS.map((rock, i) => (
      <group key={`rock${i}`} position={rock.pos}>
        <mesh position={[0, rock.size[1] / 2, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[rock.size[0] / 2, 0]} />
          <meshStandardMaterial color="#696969" roughness={0.95} metalness={0.1} />
        </mesh>
        <mesh position={[rock.size[0] * 0.1, rock.size[1] / 2.5, rock.size[2] * 0.1]} castShadow receiveShadow>
          <dodecahedronGeometry args={[rock.size[0] / 3, 0]} />
          <meshStandardMaterial color="#808080" roughness={0.9} metalness={0.1} />
        </mesh>
      </group>
    ))}

    {/* Fallen Logs with realistic details */}
    {FALLEN_LOGS.map((log, i) => (
      <group key={`log${i}`} position={log.pos} rotation={log.rotation}>
        <mesh position={[0, log.size[1] / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[log.size[2] / 2, log.size[2] / 2.2, log.size[0], 12]} />
          <meshStandardMaterial color="#5d4e37" roughness={0.95} />
        </mesh>
        {/* Bark texture details */}
        <mesh position={[0, log.size[1] / 2 + 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[log.size[2] / 2.1, log.size[2] / 2.3, log.size[0], 8]} />
          <meshStandardMaterial color="#4a3c28" roughness={0.98} />
        </mesh>
        {/* Moss patches */}
        {Math.random() > 0.5 && (
          <mesh position={[log.size[0] * 0.2, log.size[1] / 2 + 0.15, 0]} castShadow receiveShadow>
            <sphereGeometry args={[log.size[2] / 4, 6, 4]} />
            <meshStandardMaterial color="#3a5f3a" roughness={0.9} />
          </mesh>
        )}
      </group>
    ))}

    {/* Dense grass coverage */}
    {[
      [10, 0.08, 10], [-10, 0.08, 10], [10, 0.08, -10], [-10, 0.08, -10],
      [20, 0.08, 20], [-20, 0.08, 20], [20, 0.08, -20], [-20, 0.08, -20],
      [30, 0.08, 5], [-30, 0.08, 5], [30, 0.08, -5], [-30, 0.08, -5],
      [5, 0.08, 30], [-5, 0.08, 30], [5, 0.08, -30], [-5, 0.08, -30],
      [15, 0.08, 25], [-15, 0.08, 25], [15, 0.08, -25], [-15, 0.08, -25],
      [25, 0.08, 15], [-25, 0.08, 15], [25, 0.08, -15], [-25, 0.08, -15],
    ].map((pos, i) => (
      <group key={`densegrass${i}`} position={pos as any}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.2, 4]} />
          <meshStandardMaterial color="#7cfc00" roughness={0.95} />
        </mesh>
        <mesh position={[0.05, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.18, 4]} />
          <meshStandardMaterial color="#90ee90" roughness={0.95} />
        </mesh>
        <mesh position={[-0.05, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.22, 4]} />
          <meshStandardMaterial color="#7cfc00" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.04, 0.05]} receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.19, 4]} />
          <meshStandardMaterial color="#90ee90" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.04, -0.05]} receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.21, 4]} />
          <meshStandardMaterial color="#7cfc00" roughness={0.95} />
        </mesh>
      </group>
    ))}

    {/* Large fern clusters */}
    {[
      [18, 0.25, 18], [-18, 0.25, 18], [18, 0.25, -18], [-18, 0.25, -18],
      [35, 0.25, 10], [-35, 0.25, 10], [35, 0.25, -10], [-35, 0.25, -10],
      [10, 0.25, 35], [-10, 0.25, 35], [10, 0.25, -35], [-10, 0.25, -35],
    ].map((pos, i) => (
      <group key={`ferncluster${i}`} position={pos as any}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.95} />
        </mesh>
        <mesh position={[0.2, 0.12, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 6, 4]} />
          <meshStandardMaterial color="#388e3c" roughness={0.95} />
        </mesh>
        <mesh position={[-0.2, 0.12, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 6, 4]} />
          <meshStandardMaterial color="#388e3c" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.18, 0.2]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 6, 4]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.95} />
        </mesh>
      </group>
    ))}

    {/* Wildflower meadows */}
    {[
      [12, 0.12, 8], [-8, 0.12, 12], [22, 0.12, -15], [-22, 0.12, 25], 
      [6, 0.12, -32], [-16, 0.12, 28], [32, 0.12, 6], [-28, 0.12, -8],
      [25, 0.12, -38], [-38, 0.12, 22], [15, 0.12, 42], [-42, 0.12, -25],
    ].map((pos, i) => (
      <group key={`flowermeadow${i}`} position={pos as any}>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={i % 4 === 0 ? '#ff69b4' : i % 4 === 1 ? '#ffd700' : i % 4 === 2 ? '#ff6347' : '#da70d6'} roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 0.06, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={i % 4 === 1 ? '#ff69b4' : i % 4 === 2 ? '#ffd700' : i % 4 === 3 ? '#ff6347' : '#da70d6'} roughness={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.06, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={i % 4 === 2 ? '#ff69b4' : i % 4 === 3 ? '#ffd700' : i % 4 === 0 ? '#ff6347' : '#da70d6'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0.08]} castShadow receiveShadow>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={i % 4 === 3 ? '#ff69b4' : i % 4 === 0 ? '#ffd700' : i % 4 === 1 ? '#ff6347' : '#da70d6'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, -0.08]} castShadow receiveShadow>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color={i % 4 === 0 ? '#ff69b4' : i % 4 === 1 ? '#ffd700' : i % 4 === 2 ? '#ff6347' : '#da70d6'} roughness={0.8} />
        </mesh>
      </group>
    ))}

    {/* Ground cover leaves */}
    {[
      [8, 0.05, 6], [-6, 0.05, 8], [16, 0.05, -12], [-16, 0.05, 16], 
      [4, 0.05, -22], [-12, 0.05, 20], [26, 0.05, 4], [-24, 0.05, -6],
      [18, 0.05, -28], [-28, 0.05, 18], [8, 0.05, 36], [-36, 0.05, -18],
    ].map((pos, i) => (
      <mesh key={`leaves${i}`} position={pos as any} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]} receiveShadow>
        <boxGeometry args={[0.15, 0.01, 0.08]} />
        <meshStandardMaterial color={i % 3 === 0 ? '#8b4513' : i % 3 === 1 ? '#a0522d' : '#cd853f'} roughness={0.95} />
      </mesh>
    ))}

    {/* Bushes */}
    {BUSHES.map((bush, i) => (
      <mesh key={`bush${i}`} position={bush.pos} castShadow receiveShadow>
        <sphereGeometry args={[bush.size[0] / 2, 6, 4]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.9} />
      </mesh>
    ))}

    {/* Natural forest lights */}
    {FOREST_LIGHTS.map((l, i) => (
      <pointLight key={`fl${i}`} position={l.pos} color={l.color} intensity={l.intensity} distance={15} decay={2} />
    ))}
  </>
);

export default Environment;
