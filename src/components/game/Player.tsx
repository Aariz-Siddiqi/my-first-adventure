import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PLATFORMS } from './Arena';

const MOVE_SPEED = 9;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.6;
const HEAD_BOB_SPEED = 11;
const HEAD_BOB_AMOUNT = 0.05;
const JUMP_FORCE = 8;
const GRAVITY = 22;
const FALL_RESET_Y = -6;

interface PlayerProps {
  onPositionUpdate: (pos: [number, number, number]) => void;
  onFall: () => void;
  resetSignal: number;
}

const SPAWN: [number, number, number] = [0, PLAYER_HEIGHT + 1, 0];

export default function Player({ onPositionUpdate, onFall, resetSignal }: PlayerProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const velocity = useRef(new THREE.Vector3());
  const isLocked = useRef(false);
  const bobTime = useRef(0);
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(false);
  const jumpsRemaining = useRef(0);

  const respawn = useCallback(() => {
    camera.position.set(...SPAWN);
    verticalVelocity.current = 0;
    isGrounded.current = false;
    jumpsRemaining.current = 0;
  }, [camera]);

  useEffect(() => { respawn(); }, [respawn, resetSignal]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const wasDown = keys.current[e.code];
    keys.current[e.code] = true;
    if (e.code === 'Space' && !wasDown) {
      if (isGrounded.current) {
        verticalVelocity.current = JUMP_FORCE;
        isGrounded.current = false;
        jumpsRemaining.current = 1; // one air jump available
      } else if (jumpsRemaining.current > 0) {
        verticalVelocity.current = JUMP_FORCE * 0.9;
        jumpsRemaining.current -= 1;
      }
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
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const handleClick = () => {
      if (!isLocked.current) gl.domElement.requestPointerLock();
    };
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, handleKeyDown, handleKeyUp, handleMouseMove, handlePointerLockChange]);

  useFrame((_, deltaRaw) => {
    const delta = Math.min(deltaRaw, 0.05);
    camera.quaternion.setFromEuler(euler.current);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();

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

    // Gravity
    verticalVelocity.current -= GRAVITY * delta;
    newPos.y = camera.position.y + verticalVelocity.current * delta;

    // Platform landing
    let landed = false;
    let landY = -Infinity;
    for (const plat of PLATFORMS) {
      const topY = plat.position[1] + plat.size[1] / 2;
      const halfW = plat.size[0] / 2;
      const halfD = plat.size[2] / 2;
      const onXZ =
        newPos.x >= plat.position[0] - halfW &&
        newPos.x <= plat.position[0] + halfW &&
        newPos.z >= plat.position[2] - halfD &&
        newPos.z <= plat.position[2] + halfD;
      if (!onXZ) continue;
      const targetFeet = topY;
      const playerFeet = newPos.y - PLAYER_HEIGHT;
      const wasAbove = (camera.position.y - PLAYER_HEIGHT) >= topY - 0.05;
      if (playerFeet <= targetFeet && wasAbove && verticalVelocity.current <= 0) {
        if (topY > landY) landY = topY;
        landed = true;
      }
    }

    if (landed) {
      newPos.y = landY + PLAYER_HEIGHT;
      verticalVelocity.current = 0;
      isGrounded.current = true;
      jumpsRemaining.current = 1; // refresh double jump on landing
    } else {
      isGrounded.current = false;
    }

    // Fall off the world
    if (newPos.y < FALL_RESET_Y) {
      onFall();
      camera.position.set(...SPAWN);
      verticalVelocity.current = 0;
      onPositionUpdate(SPAWN);
      return;
    }

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
