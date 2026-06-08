import { Billboard, OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { colors } from '../config/colors'
import { venueFunctions } from '../simulation/venueRules'

const center = value => value - 6

function CameraRig({ mode, selectedAgent, agents }) {
  const { camera } = useThree()
  useFrame(() => {
    const selected = agents.find(agent => agent.id === selectedAgent)
    if (selected != null && mode === 'micro') {
      const target = new THREE.Vector3(center(selected.position.x), .7, center(selected.position.z))
      camera.position.lerp(target.clone().add(new THREE.Vector3(3.2, 3.2, 4.5)), .035)
      camera.lookAt(target)
    } else if (mode === 'macro') {
      camera.position.lerp(new THREE.Vector3(0, 18, .01), .04)
      camera.lookAt(0, 0, 0)
    }
  })
  return <OrbitControls enabled={selectedAgent == null && mode !== 'macro'} minPolarAngle={.25} maxPolarAngle={Math.PI / 2.08} minDistance={8} maxDistance={25} target={[0, 0, 0]} />
}

function Road({ road, visible }) {
  if (!visible) return null
  const horizontal = road.variant === 'horizontal' || road.variant === 'cross'
  return <group position={[center(road.x), .025, center(road.z)]}>
    <mesh><boxGeometry args={[.88, .05, .88]} /><meshStandardMaterial color={colors.road} roughness={.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .031, 0]}><planeGeometry args={horizontal ? [.6, .025] : [.025, .6]} /><meshBasicMaterial color={colors.roadLine} /></mesh>
  </group>
}

function Building({ building, stage, onSelect }) {
  if (stage < 2) return null
  const info = venueFunctions[building.type]
  const height = building.type === 'home' ? .72 : .9
  const raised = stage >= 4
  return <group position={[center(building.x), 0, center(building.z)]} onClick={event => { event.stopPropagation(); onSelect({ ...building, ...info }) }}>
    <mesh position={[0, .055, 0]}><boxGeometry args={[.78, .1, .78]} /><meshStandardMaterial color={colors.foundation} /></mesh>
    {stage >= 3 && <mesh position={[0, .115, 0]}><boxGeometry args={[.64, .025, .64]} /><meshBasicMaterial color={colors[building.type]} transparent opacity={.7} /></mesh>}
    {raised && <group>
      <mesh position={[0, height / 2 + .11, 0]}><boxGeometry args={[.66, height, .66]} /><meshStandardMaterial color={colors[building.type]} roughness={.75} /></mesh>
      <Text position={[0, height + .125, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.13} color="#07111b" anchorX="center" anchorY="middle">{info.label.toUpperCase()}</Text>
    </group>}
  </group>
}

function Agent({ agent, selected, onSelect }) {
  return <group position={[center(agent.position.x), .08, center(agent.position.z)]} onClick={event => { event.stopPropagation(); onSelect(agent.id) }}>
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <mesh scale={selected ? 1.35 : 1}><circleGeometry args={[.12, 20]} /><meshBasicMaterial color={agent.color} depthTest /></mesh>
      <mesh position={[0, -.18, 0]} scale={selected ? 1.35 : 1}><planeGeometry args={[.28, .32]} /><meshBasicMaterial color={agent.color} transparent opacity={.95} depthTest /></mesh>
      {selected && <mesh position={[0, -.07, -.01]}><ringGeometry args={[.24, .29, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>}
    </Billboard>
  </group>
}

export default function CityScene({ world, worldStage, agents, populationStage, mode, selectedAgent, onSelectAgent, onSelectBuilding }) {
  return <Canvas camera={{ position: [10, 10, 12], fov: 48 }} dpr={[1, 1.6]} onPointerMissed={() => onSelectBuilding(null)}>
    <color attach="background" args={[colors.background]} />
    <ambientLight intensity={1.7} />
    <directionalLight position={[5, 10, 6]} intensity={2.2} />
    <mesh position={[0, -.08, 0]}><boxGeometry args={[13.6, .12, 13.6]} /><meshStandardMaterial color={colors.ground} /></mesh>
    <gridHelper args={[13, 13, '#365062', '#233847']} position={[0, 0, 0]} />
    {world?.roads.map(road => <Road key={`${road.x}-${road.z}`} road={road} visible={worldStage >= 1} />)}
    {world?.buildings.map(building => <Building key={building.id} building={building} stage={worldStage} onSelect={onSelectBuilding} />)}
    {populationStage >= 2 && agents.map(agent => <Agent key={agent.id} agent={agent} selected={agent.id === selectedAgent} onSelect={onSelectAgent} />)}
    <CameraRig mode={mode} selectedAgent={selectedAgent} agents={agents} />
  </Canvas>
}
