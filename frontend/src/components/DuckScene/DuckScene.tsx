import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, ContactShadows, Environment, Html, Lightformer, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import './DuckScene.css'

interface DuckModelProps {
  isThinking?: boolean
}

function DuckModel({ isThinking }: DuckModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hopImpulse, setHopImpulse] = useState(0)
  const { scene } = useGLTF('/models/duck.glb')

  const enhancedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const origMat = child.material as THREE.MeshStandardMaterial
        const physicalMat = new THREE.MeshPhysicalMaterial({
          map: origMat.map,
          color: origMat.color,
          roughness: 0.46,
          metalness: 0.1,
          clearcoat: 0.56,
          clearcoatRoughness: 0.18,
          reflectivity: 0.75,
          ior: 1.48,
          sheen: 0.28,
          sheenRoughness: 0.35,
          sheenColor: new THREE.Color('#fff5e6'),
          envMapIntensity: 1.05,
        })
        if (origMat.map) {
          origMat.map.colorSpace = THREE.SRGBColorSpace
        }
        child.material = physicalMat
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime
    const floatSpeed = isThinking ? 3.0 : 1.5
    const floatAmplitude = isThinking ? 0.048 : 0.032

    if (hopImpulse > 0.001) {
      setHopImpulse((prev) => Math.max(0, prev - delta * 2.8))
    }

    const baseFloatY = Math.sin(time * floatSpeed) * floatAmplitude
    const hopOffset = Math.sin(hopImpulse * Math.PI) * 0.18
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      baseFloatY + hopOffset,
      0.12
    )

    const pointerX = state.pointer.x * 0.28
    const pointerY = state.pointer.y * 0.16

    const targetRotY = -0.15 + Math.sin(time * 0.8) * 0.04 + pointerX
    const targetRotX = (isThinking ? 0.06 : 0) - pointerY
    const targetRotZ = Math.sin(time * 1.1) * 0.02 + (isThinking ? 0.05 : 0)

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.06
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.06
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      0.06
    )
  })

  return (
    <group
      ref={groupRef}
      dispose={null}
      onClick={() => setHopImpulse(1)}
    >
      <Center>
        <primitive object={enhancedScene} scale={1.58} />
      </Center>
      <Html position={[0.42, 1.02, 0]} center distanceFactor={6}>
        <div className="duck-annotation">
          <span
            className={'status-dot-pulse ' + (isThinking ? 'pending' : '')}
            style={{ width: 6, height: 6 }}
          />
          <span>
            {isThinking
              ? 'Buscando mentor compatível...'
              : hopImpulse > 0.1
              ? 'Quack! Vamos depurar!'
              : 'Quack quack, quack!'}
          </span>
        </div>
      </Html>
    </group>
  )
}

useGLTF.preload('/models/duck.glb')

interface DuckSceneProps {
  isThinking?: boolean
}

export function DuckScene({ isThinking = false }: DuckSceneProps) {
  return (
    <section className="duck-scene-container" aria-label="Assistente 3D Rubber Duck">
      <div className="duck-hud-top">
        <span className="duck-hud-badge">
          <span className={'status-dot-pulse ' + (isThinking ? 'pending' : '')} />
          <span>{isThinking ? 'Pareamento Vetorial Ativo' : 'Rubber Duck 3D • Interativo'}</span>
        </span>
        <span className="duck-hud-mono">AI • FastEmbed</span>
      </div>

      <div className="duck-canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0.15, 3.2], fov: 54 }}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.18,
          }}
        >
          <ambientLight intensity={0.55} />

          <directionalLight
            position={[4.2, 5.5, 4.5]}
            intensity={1.75}
            color="#fffaf2"
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0001}
          />

          <directionalLight
            position={[-4, 2, 2.5]}
            intensity={1.45}
            color="#fb8989"
          />

          <pointLight position={[0, 1.7, 2.01]} intensity={0.5} color="#f9cf9f" />

          <Environment resolution={256}>
            <group rotation={[-Math.PI / 4, -0.2, 0.8]}>
              <Lightformer
                form="circle"
                color="#ffffff"
                intensity={1}
                scale={7}
                position={[4, 6, 4]}
              />
              <Lightformer
                form="ring"
                color="#fed7aa"
                intensity={2.2}
                scale={1}
                position={[-4, 4, -4]}
              />
              <Lightformer
                form="rect"
                color="#e0f2fe"
                intensity={1}
                scale={[10, 5, 1]}
                position={[-6, 1, 3]}
              />
              <Lightformer
                form="rect"
                color="#ffffff"
                intensity={1}
                scale={[12, 12, 1]}
                position={[0, 4, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              />
            </group>
          </Environment>

          <Suspense fallback={null}>
            <DuckModel isThinking={isThinking} />
            <ContactShadows
              position={[0, -0.92, 0]}
              opacity={0.14}
              scale={4.5}
              blur={1.8}
              far={1.2}
              color="#73030D"
            />
          </Suspense>

          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.84}
              luminanceSmoothing={0.32}
              intensity={0.42}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.18} darkness={0.18} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="duck-hud-bottom">
        <span>Mova o cursor ou clique no pato durante a revisão do código</span>
      </div>
    </section>
  )
}

