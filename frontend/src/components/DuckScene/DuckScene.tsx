import { Suspense, useMemo, useRef } from 'react'
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
  const { scene } = useGLTF('/models/duck.glb')

  const enhancedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const origMat = child.material as THREE.MeshStandardMaterial
        const physicalMat = new THREE.MeshPhysicalMaterial({
          map: origMat.map,
          color: origMat.color,
          roughness: 0.50,
          metalness: 0.10,
          clearcoat: 0.50,
          clearcoatRoughness: 0.2,
          reflectivity: 0.72,
          ior: 1.48,
          sheen: 0.26,
          sheenRoughness: 0.38,
          sheenColor: new THREE.Color('#fff5e6'),
          envMapIntensity: 1.0,
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

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime
    const floatSpeed = isThinking ? 2.8 : 1.5
    const floatAmplitude = isThinking ? 0.045 : 0.03

    groupRef.current.position.y = Math.sin(time * floatSpeed) * floatAmplitude

    const targetRotY = (state.pointer.x * 0.28) - 0.15
    const targetRotX = (-state.pointer.y * 0.12) + (isThinking ? 0.07 : 0)
    const targetRotZ = Math.sin(time * 1.1) * 0.02 + (isThinking ? 0.05 : 0)

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.05
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      0.05
    )
  })

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        <primitive object={enhancedScene} scale={1.55} />
      </Center>
      <Html position={[0.45, 1.0, 0]} center distanceFactor={6}>
        <div className="duck-annotation">
          <span>{isThinking ? 'Pensando na resposta...' : 'Quack quack, quack!'}</span>
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
    <section className="duck-scene-container" aria-label="Rubber duck 3D assistant">
      <div className="duck-canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0.15, 3.2], fov: 55 }}
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
            color={"#fb8989"}
          />

          <pointLight position={[0, 1.7, 2.01]} intensity={0.5} color={"#f9cf9f"} />

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
              opacity={0.10}
              scale={5.00}
              blur={1.0}
              far={1.0}
              color={"#000000"} receiveShadow={false} visible={false} depthWrite={false}
            />
          </Suspense>

          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.84}
              luminanceSmoothing={0.32}
              intensity={0.42}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.18} darkness={0.2} />
          </EffectComposer>
        </Canvas>
      </div>
    </section>
  )
}
