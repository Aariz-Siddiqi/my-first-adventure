import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PLATFORMS, type PlatformData } from './Arena';

const MOVE_SPEED = 10;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.7;
const ARENA_SIZE = 48;
const HEAD_BOB_SPEED = 12;
const HEAD_BOB_AMOUNT = 0.04;
const JUMP_FORCE = 6;
const GRAVITY = 15;

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
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
    if (e.code === 'Space' && isGrounded.current) {
      verticalVelocity.current = JUMP_FORCE;
      isGrounded.current = false;
      e.preventDefault();
    }
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

    // Jumping / gravity
    verticalVelocity.current -= GRAVITY * delta;
    newPos.y = camera.position.y + verticalVelocity.current * delta;

    // Check platform collisions
    let groundLevel = PLAYER_HEIGHT; // default floor
    for (const plat of PLATFORMS) {
      const topY = plat.position[1] + plat.size[1] / 2;
      const halfW = plat.size[0] / 2;
      const halfD = plat.size[2] / 2;
      const onPlatformXZ =
        newPos.x >= plat.position[0] - halfW &&
        newPos.x <= plat.position[0] + halfW &&
        newPos.z >= plat.position[2] - halfD &&
        newPos.z <= plat.position[2] + halfD;
      if (onPlatformXZ) {
        const platGroundLevel = topY + PLAYER_HEIGHT;
        // Only land if coming from above
        if (platGroundLevel > groundLevel && camera.position.y >= topY + PLAYER_HEIGHT - 0.3) {
          groundLevel = platGroundLevel;
        }
      }
    }

    if (newPos.y <= groundLevel) {
      newPos.y = groundLevel;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    // Head bob (only when grounded and moving)
    if (moving && isGrounded.current) {
      bobTime.current += delta * HEAD_BOB_SPEED;
      newPos.y += Math.sin(bobTime.current) * HEAD_BOB_AMOUNT;
    } else if (isGrounded.current) {
      bobTime.current = 0;
    }

    camera.position.copy(newPos);
    onPositionUpdate([camera.position.x, camera.position.y, camera.position.z]);
  });

  return null;
}
