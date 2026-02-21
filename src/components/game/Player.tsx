import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MOVE_SPEED = 8;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.7;
const ARENA_SIZE = 24;
const HEAD_BOB_SPEED = 12;
const HEAD_BOB_AMOUNT = 0.04;

interface PlayerProps {
  onPositionUpdate: (pos: [number, number, number]) => void;
}

export default function Player({ onPositionUpdate }: PlayerProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const velocity = useRef(new THREE.Vector3());
  const isLocked = useRef(false);
  const bobTime = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked.current) return;
    euler.current.y -= e.movementX * MOUSE_SENSITIVITY;
    euler.current.x -= e.movementY * MOUSE_SENSITIVITY;
    euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x));
  }, []);

  const handlePointerLockChange = useCallback(() => {
    isLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl]);

  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 0);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const handleClick = () => {
      if (!isLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, handleKeyDown, handleKeyUp, handleMouseMove, handlePointerLockChange]);

  useFrame((_, delta) => {
    camera.quaternion.setFromEuler(euler.current);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    velocity.current.set(0, 0, 0);
    let moving = false;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) { velocity.current.add(forward); moving = true; }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) { velocity.current.sub(forward); moving = true; }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) { velocity.current.add(right); moving = true; }
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) { velocity.current.sub(right); moving = true; }

    if (velocity.current.length() > 0) {
      velocity.current.normalize().multiplyScalar(MOVE_SPEED * delta);
    }

    const newPos = camera.position.clone().add(velocity.current);
    const boundary = ARENA_SIZE / 2 - 0.5;
    newPos.x = Math.max(-boundary, Math.min(boundary, newPos.x));
    newPos.z = Math.max(-boundary, Math.min(boundary, newPos.z));

    // Head bob
    if (moving) {
      bobTime.current += delta * HEAD_BOB_SPEED;
      newPos.y = PLAYER_HEIGHT + Math.sin(bobTime.current) * HEAD_BOB_AMOUNT;
    } else {
      newPos.y = PLAYER_HEIGHT;
      bobTime.current = 0;
    }

    camera.position.copy(newPos);
    onPositionUpdate([camera.position.x, camera.position.y, camera.position.z]);
  });

  return null;
}
