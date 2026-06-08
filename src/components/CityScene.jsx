import { Billboard, Line, OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { colors } from '../config/colors'
import { venueFunctions } from '../simulation/venueRules'

const center = value => value - 6
const cameraTargets = {
  overview: { position: [10, 10, 12], target: [0, 0, 0], up: [0, 1, 0] },
  micro: { position: [8, 7, 9], target: [0, 0, 0], up: [0, 1, 0] },
  meso: { position: [11, 11, 13], target: [0, 0, 0], up: [0, 1, 0] },
  macro: { position: [0, 18, .001], target: [0, 0, 0], up: [0, 0, -1] },
  street: { position: [0, 1.15, 11.5], target: [0, .55, 0], up: [0, 1, 0] },
  district: { position: [10, 9, 11], target: [0, 0, 0], up: [0, 1, 0] },
  top: { position: [0, 18, .001], target: [0, 0, 0], up: [0, 0, -1] },
}

function CameraRig({ mode, cameraPreset, followedAgent, findTarget, agents, cameraResetKey, onCustomView }) {
  const { camera } = useThree()
  const controls = useRef()
  const transition = useRef(null)
  const keys = useRef(new Set())
  useEffect(() => {
    const down = event => keys.current.add(event.key.toLowerCase())
    const up = event => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])
  useEffect(() => {
    if (cameraPreset === 'custom' && !findTarget) return
    const preset = cameraTargets[cameraPreset] || cameraTargets[mode]
    const targetCamera = camera.clone()
    const target = findTarget ? new THREE.Vector3(center(findTarget.x), .5, center(findTarget.z)) : new THREE.Vector3(...preset.target)
    targetCamera.position.set(...(findTarget ? [target.x + 6.5, 5.8, target.z + 7] : preset.position))
    targetCamera.up.set(...preset.up)
    targetCamera.lookAt(target)
    transition.current = {
      started: performance.now(), duration: mode === 'macro' ? 1500 : 1200,
      fromPosition: camera.position.clone(), toPosition: targetCamera.position.clone(),
      fromQuaternion: camera.quaternion.clone(), toQuaternion: targetCamera.quaternion.clone(),
      fromUp: camera.up.clone(), toUp: targetCamera.up.clone(),
    }
    controls.current?.target.copy(target)
  }, [mode, cameraPreset, findTarget, cameraResetKey, camera])
  useFrame((_, delta) => {
    const selected = agents.find(agent => agent.id === followedAgent)
    if (selected != null && mode === 'micro') {
      const target = new THREE.Vector3(center(selected.position.x), .7, center(selected.position.z))
      camera.position.lerp(target.clone().add(new THREE.Vector3(3.2, 3.2, 4.5)), .08)
      camera.lookAt(target)
    } else if (transition.current) {
      const raw = Math.min(1, (performance.now() - transition.current.started) / transition.current.duration)
      const eased = 1 - Math.pow(1 - raw, 3)
      camera.position.lerpVectors(transition.current.fromPosition, transition.current.toPosition, eased)
      camera.quaternion.slerpQuaternions(transition.current.fromQuaternion, transition.current.toQuaternion, eased)
      camera.up.lerpVectors(transition.current.fromUp, transition.current.toUp, eased)
      if (raw >= 1) transition.current = null
    } else if (mode !== 'macro' && keys.current.size) {
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward); forward.y = 0; forward.normalize()
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize()
      const movement = new THREE.Vector3()
      if (keys.current.has('w')) movement.add(forward)
      if (keys.current.has('s')) movement.sub(forward)
      if (keys.current.has('d')) movement.add(right)
      if (keys.current.has('a')) movement.sub(right)
      if (movement.lengthSq()) {
        movement.normalize().multiplyScalar(delta * 4)
        camera.position.add(movement); controls.current?.target.add(movement)
        camera.position.set(THREE.MathUtils.clamp(camera.position.x, -16, 16), camera.position.y, THREE.MathUtils.clamp(camera.position.z, -16, 16))
        controls.current?.target.setX(THREE.MathUtils.clamp(controls.current.target.x, -7, 7))
        controls.current?.target.setZ(THREE.MathUtils.clamp(controls.current.target.z, -7, 7))
        onCustomView?.()
      }
    }
  })
  const constrainControls = () => {
    if (!controls.current || mode === 'macro') return
    controls.current.target.set(
      THREE.MathUtils.clamp(controls.current.target.x, -7, 7),
      THREE.MathUtils.clamp(controls.current.target.y, 0, 4),
      THREE.MathUtils.clamp(controls.current.target.z, -7, 7),
    )
    camera.position.set(
      THREE.MathUtils.clamp(camera.position.x, -16, 16),
      THREE.MathUtils.clamp(camera.position.y, 2, 20),
      THREE.MathUtils.clamp(camera.position.z, -16, 16),
    )
  }
  return <OrbitControls ref={controls} makeDefault enabled={followedAgent == null && mode !== 'macro'} minPolarAngle={.25} maxPolarAngle={Math.PI / 2.08} minDistance={7} maxDistance={25} target={[0, 0, 0]} onStart={() => { transition.current = null; onCustomView?.() }} onChange={constrainControls} />
}

function Road({ road, generationProgress }) {
  const group = useRef()
  const visible = generationProgress * 2.1 >= road.revealIndex * .018
  useFrame(() => {
    if (!group.current) return
    group.current.visible = visible
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, visible ? .025 : 4, .1)
  })
  if (generationProgress <= 0) return null
  return <group ref={group} position={[center(road.x), 4, center(road.z)]}>
    <mesh><boxGeometry args={[.88, .05, .88]} /><meshStandardMaterial color={colors.road} roughness={.9} /></mesh>
    {road.connections?.map((connected, direction) => connected && [0, 1].map(segment => {
      const vertical = direction === 0 || direction === 2
      const sign = direction === 0 || direction === 3 ? -1 : 1
      const offset = .13 + segment * .18
      return <mesh key={`${direction}-${segment}`} rotation={[-Math.PI / 2, 0, vertical ? 0 : Math.PI / 2]} position={[vertical ? 0 : sign * offset, .031, vertical ? sign * offset : 0]}><planeGeometry args={[.11, .035]} /><meshBasicMaterial color="#e4bd45" /></mesh>
    }))}
    {road.connections?.filter(Boolean).length >= 3 && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .032, 0]}><planeGeometry args={[.11, .11]} /><meshBasicMaterial color="#e4bd45" /></mesh>}
  </group>
}

const buildingIcons = { home: '⌂', hospital: 'H', police: 'P', shop: '▣', bar: '◒', club: '♪', rehab: '+' }

function Building({ building, generationProgress, onSelect, occupants, buildingIndex, highlighted }) {
  const foundation = useRef()
  const structure = useRef()
  const typeIndex = ['home', 'shop', 'bar', 'club', 'hospital', 'rehab', 'police'].indexOf(building.type)
  const zoneStart = .48 + (typeIndex + 1) * .018
  const buildingStart = .68 + buildingIndex * .003
  useFrame(() => {
    if (foundation.current) foundation.current.scale.y = THREE.MathUtils.lerp(foundation.current.scale.y, generationProgress >= .32 ? 1 : .01, .06)
    if (structure.current) structure.current.scale.y = THREE.MathUtils.lerp(structure.current.scale.y, generationProgress >= buildingStart ? 1 : .01, .055)
  })
  if (generationProgress < .28) return null
  const info = venueFunctions[building.type]
  const height = building.type === 'home' ? .72 : .9
  return <group position={[center(building.x), 0, center(building.z)]} onClick={event => { event.stopPropagation(); onSelect({ ...building, ...info }) }}>
    <mesh ref={foundation} scale={[1, .01, 1]} position={[0, .055, 0]}><boxGeometry args={[.78, .1, .78]} /><meshStandardMaterial color={colors.foundation} /></mesh>
    {generationProgress >= zoneStart && <mesh position={[0, .115, 0]}><boxGeometry args={[.64, .025, .64]} /><meshBasicMaterial color={colors[building.type]} transparent opacity={.7} /></mesh>}
    {generationProgress >= buildingStart && <group ref={structure} scale={[1, .01, 1]}>
      <mesh position={[0, height / 2 + .11, 0]}><boxGeometry args={[.66, height, .66]} /><meshStandardMaterial color={colors[building.type]} roughness={.75} /></mesh>
      {highlighted && <mesh position={[0, height / 2 + .11, 0]} scale={1.08}><boxGeometry args={[.66, height, .66]} /><meshBasicMaterial color="#ffffff" wireframe /></mesh>}
      <Text position={[0, height + .125, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.28} color={building.type === 'hospital' ? '#b91c1c' : '#07111b'} anchorX="center" anchorY="middle">{buildingIcons[building.type]}</Text>
      {occupants.length > 0 && <group>
        {occupants.slice(0, 8).map((occupant, index) => <mesh key={occupant.id} position={[.23 - (index % 4) * .075, height + .16, -.23 + Math.floor(index / 4) * .075]}><boxGeometry args={[.06, .025, .06]} /><meshBasicMaterial color={occupant.color} /></mesh>)}
      </group>}
    </group>}
  </group>
}

function Agent({ agent, selected, highlighted, onSelect }) {
  const group = useRef()
  const [initialPosition] = useState(() => [center(agent.position.x), agent.spawnDrop ? 4 : .47, center(agent.position.z)])
  useFrame((_, delta) => {
    if (!group.current) return
    const smoothing = 1 - Math.exp(-delta * 12)
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, center(agent.position.x), smoothing)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, center(agent.position.z), smoothing)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, .47, agent.spawnDrop ? 1 - Math.exp(-delta * 3) : smoothing)
  })
  return <group ref={group} position={initialPosition} onClick={event => { event.stopPropagation(); onSelect(agent.id) }}>
    <Billboard follow><group visible={agent.renderMode !== 'dot'}><mesh position={[0, .1, 0]} scale={selected ? 1.35 : 1}><circleGeometry args={[.12, 20]} /><meshBasicMaterial color={agent.color} depthTest /></mesh><mesh position={[0, -.02, 0]} scale={selected ? 1.35 : 1}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([-.18, 0, 0, .18, 0, 0, 0, -.36, 0]), 3]} /></bufferGeometry><meshBasicMaterial color={agent.color} side={THREE.DoubleSide} depthTest /></mesh></group><mesh visible={agent.renderMode === 'dot'}><circleGeometry args={[.15, 20]} /><meshBasicMaterial color={agent.color} depthTest /></mesh>{(selected || highlighted) && <mesh position={[0, -.03, -.01]}><ringGeometry args={[.28, .33, 32]} /><meshBasicMaterial color={selected ? '#ffffff' : '#f7d96f'} /></mesh>}</Billboard>
  </group>
}

const worldPoint = (item, buildings) => {
  const building = item.insideBuildingId ? buildings.find(place => place.id === item.insideBuildingId) : null
  return [center(building?.x ?? item.position?.x ?? item.x), building ? .95 : .48, center(building?.z ?? item.position?.z ?? item.z)]
}

function NetworkOverlay({ mode, selectedAgent, selectedBuilding, agents, buildings }) {
  if (!['meso', 'macro'].includes(mode)) return null
  const agent = agents.find(item => item.id === selectedAgent)
  const source = agent || selectedBuilding
  if (!source) return null
  const links = agent
    ? [...(agent.socialIds || []).map(id => agents.find(item => item.id === id)).filter(Boolean), agent.home, buildings.find(item => item.id === agent.favoriteVenueId)].filter(Boolean)
    : agents.filter(item => item.favoriteVenueId === selectedBuilding.id || item.home.id === selectedBuilding.id || item.insideBuildingId === selectedBuilding.id)
  const sourcePoint = worldPoint(source, buildings)
  return <group>{links.map((target, index) => <Line key={`${target.id}-${index}`} points={[sourcePoint, worldPoint(target, buildings)]} color={agent ? (index < (agent.socialIds?.length || 0) ? '#7ed9ed' : '#ffd84d') : '#ffd84d'} lineWidth={6} transparent opacity={.95} />)}</group>
}

function DayNight({ simMinutes }) {
  const minute = simMinutes % 1440
  const daylight = THREE.MathUtils.smoothstep(minute, 300, 420) * (1 - THREE.MathUtils.smoothstep(minute, 1020, 1140))
  const background = new THREE.Color('#050810').lerp(new THREE.Color('#13283a'), daylight)
  return <><color attach="background" args={[background]} /><ambientLight intensity={.55 + daylight * 1.25} /><directionalLight color={daylight > .4 ? '#fff4d6' : '#7397bd'} position={[5, 10, 6]} intensity={.35 + daylight * 1.9} /></>
}

function SelectionAnchor({ selectedAgent, selectedBuilding, agents, onAnchorChange }) {
  const { camera } = useThree()
  const last = useRef({ x: -1, y: -1 })
  useFrame(() => {
    const agent = agents.find(item => item.id === selectedAgent)
    const item = agent || selectedBuilding
    if (!item || !onAnchorChange) return
    const point = new THREE.Vector3(center(item.position?.x ?? item.x), agent ? .65 : .9, center(item.position?.z ?? item.z)).project(camera)
    const anchor = { x: (point.x + 1) * 50, y: (1 - point.y) * 50 }
    if (Math.abs(anchor.x - last.current.x) > .2 || Math.abs(anchor.y - last.current.y) > .2) {
      last.current = anchor
      onAnchorChange(anchor)
    }
  })
  return null
}

export default function CityScene({ world, generationProgress, agents, populationStage, mode, cameraPreset, selectedAgent, selectedBuilding, followedAgent, highlightedAgent, highlightedBuilding, findTarget, simMinutes, onCustomView, onSelectAgent, onSelectBuilding, onAnchorChange, cameraResetKey }) {
  const renderedAgents = mode === 'macro' ? agents.map(agent => ({ ...agent, renderMode: 'dot' })) : agents
  return <Canvas camera={{ position: [10, 10, 12], fov: 48 }} dpr={[1, 1.6]} onPointerMissed={() => onSelectBuilding(null)}>
    <DayNight simMinutes={simMinutes} />
    <mesh position={[0, -.08, 0]}><boxGeometry args={[13.6, .12, 13.6]} /><meshStandardMaterial color={colors.ground} /></mesh>
    <gridHelper args={[13, 13, '#365062', '#233847']} position={[0, 0, 0]} />
    {world?.roads.map(road => <Road key={`${road.x}-${road.z}`} road={road} generationProgress={generationProgress} />)}
    {world?.buildings.map((building, index) => <Building key={building.id} building={building} buildingIndex={index} generationProgress={generationProgress} onSelect={onSelectBuilding} highlighted={building.id === highlightedBuilding} occupants={agents.filter(agent => agent.insideBuildingId === building.id)} />)}
    {populationStage >= 2 && renderedAgents.filter(agent => !agent.insideBuildingId).map(agent => <Agent key={agent.id} agent={agent} selected={agent.id === selectedAgent} highlighted={agent.id === highlightedAgent} onSelect={onSelectAgent} />)}
    <NetworkOverlay mode={mode} selectedAgent={selectedAgent} selectedBuilding={selectedBuilding} agents={agents} buildings={world?.buildings || []} />
    <CameraRig mode={mode} cameraPreset={cameraPreset} followedAgent={followedAgent} findTarget={findTarget} agents={agents} cameraResetKey={cameraResetKey} onCustomView={onCustomView} />
    <SelectionAnchor selectedAgent={selectedAgent} selectedBuilding={selectedBuilding} agents={agents} onAnchorChange={onAnchorChange} />
  </Canvas>
}
