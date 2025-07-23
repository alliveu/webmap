import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AnimationMixer, Box3, Vector3, Raycaster } from 'three';

const CHARACTER_SPEED = 0.01;
const BOUNDING_BOX = new Box3(new Vector3(-20, 0, -20), new Vector3(20, 10, 20));

function Character({ url, destination, groupRef, collisionMeshes, setPathPoints }) {
  const group = useRef();
  const [mixer, setMixer] = useState(null);
  const [actions, setActions] = useState({});
  const [currentAction, setCurrentAction] = useState(null);
  const { scene, animations } = useGLTF(url);
  const initialized = useRef(false);

  useEffect(() => {
    if (scene) {
      group.current.add(scene);
      const mixer = new AnimationMixer(scene);

      const runAction = mixer.clipAction(animations.find(a => a.name === 'run'));
      const standAction = mixer.clipAction(animations.find(a => a.name === 'standing'));

      runAction.setLoop(THREE.LoopRepeat);
      standAction.setLoop(THREE.LoopRepeat);
      runAction.clampWhenFinished = false;
      standAction.clampWhenFinished = false;
      runAction.enable = true;
      standAction.enable = true;

      standAction.play();

      setMixer(mixer);
      setActions({ run: runAction, standing: standAction });
      setCurrentAction('standing');
    }
  }, [scene, animations]);

  useEffect(() => {
    if (groupRef) {
      groupRef.current = group.current;
    }
  }, [groupRef]);

  useFrame(() => {
    if (!mixer || !group.current) return;

    if (!initialized.current) {
      group.current.position.set(-1, 0, -1);
      group.current.scale.set(0.05, 0.05, 0.05);
      initialized.current = true;
    }

    mixer.update(1 / 60);

    const char = group.current;
    if (!destination) return;

    const dir = new Vector3().subVectors(destination, char.position);
    const dist = dir.length();
    if (dist > 0.1) {
      const raycaster = new Raycaster(char.position.clone(), dir.clone().normalize(), 0, 0.3);
      const hits = collisionMeshes ? raycaster.intersectObjects(collisionMeshes, true) : [];
      const blocked = hits.length > 0;

      if (!blocked) {
        if (currentAction !== 'run') {
          actions.standing.fadeOut(0.2);
          actions.run.reset().fadeIn(0.2).play();
          setCurrentAction('run');
        }
        dir.normalize();
        char.position.add(dir.multiplyScalar(CHARACTER_SPEED));
        char.lookAt(destination);
        setPathPoints(prev => [...prev, char.position.clone()]);
      } else {
        if (currentAction !== 'standing') {
          actions.run.fadeOut(0.2);
          actions.standing.reset().fadeIn(0.2).play();
          setCurrentAction('standing');
        }
      }
    } else {
      if (currentAction !== 'standing') {
        actions.run.fadeOut(0.2);
        actions.standing.reset().fadeIn(0.2).play();
        setCurrentAction('standing');
        char.lookAt(char.position.clone().add(new Vector3(0, 0, 1)));
      }
    }

    const clamped = char.position.clone().clamp(BOUNDING_BOX.min, BOUNDING_BOX.max);
    char.position.copy(clamped);
  });

  return <group ref={group} />;
}

function Map({ url, onLoaded }) {
  const gltf = useGLTF(url);
  useEffect(() => {
    if (onLoaded) onLoaded(gltf.scene);
  }, [gltf, onLoaded]);
  return <primitive object={gltf.scene} />;
}

function CameraController({ targetRef }) {
  const { camera, gl } = useThree();
  const controls = useRef();
  const prevCharPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (targetRef.current && controls.current) {
      const currentPos = targetRef.current.position.clone();
      const delta = currentPos.clone().sub(prevCharPos.current);
      camera.position.add(delta);
      controls.current.target.copy(currentPos);
      controls.current.update();
      prevCharPos.current.copy(currentPos);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enablePan={false}
      enableRotate={true}
      enableZoom={true}
    />
  );
}

function ClickHandler({ setDestination }) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    const handleClick = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        setDestination(intersects[0].point);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, scene, gl, setDestination]);

  return null;
}

function PathLine({ points }) {
  const lineRef = useRef();
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  useEffect(() => {
    if (lineRef.current && points.length > 1) {
      lineRef.current.geometry.setFromPoints(points);
    }
  }, [points]);

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial attach="material" color="blue" linewidth={2} />
    </line>
  );
}

function Scene() {
  const [destination, setDestination] = useState(null);
  const [collisionMeshes, setCollisionMeshes] = useState([]);
  const [pathPoints, setPathPoints] = useState([]);
  const charRef = useRef();

  const handleMapLoaded = (scene) => {
    const collidables = [];
    scene.traverse((child) => {
      if (child.isMesh && child.name.includes("Cube")) {
        collidables.push(child);
      }
    });
    setCollisionMeshes(collidables);
  };

  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <Map url="/map.glb" onLoaded={handleMapLoaded} />
      <Character
        url="/character.glb"
        destination={destination}
        groupRef={charRef}
        collisionMeshes={collisionMeshes}
        setPathPoints={setPathPoints}
      />
      <CameraController targetRef={charRef} />
      <ClickHandler setDestination={setDestination} />
      <PathLine points={pathPoints} />
    </Canvas>
  );
}

import TopRightMenu from './components/UI/TopRightMenu';
// ...
import UILayout from './components/UI/UILayout';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />
      <TopRightMenu />
      <UILayout /> {/* ← 여기에 전체 UI 레이어 추가 */}
    </div>
  );
}


