import React, { useEffect, useRef } from 'react';
import { 
  Engine, 
  Scene, 
  FreeCamera, 
  HemisphericLight, 
  MeshBuilder, 
  Vector3 
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/inspector';

const CubeScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Babylon.js
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    
    // Create camera
    const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);
    
    // Create light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Create cube
    MeshBuilder.CreateBox('box', { size: 2 }, scene);
    
    // Run render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
    
    // Handle window resize
    const resize = () => {
      engine.resize();
    };
    
    window.addEventListener('resize', resize);
    
    // Cleanup
    return () => {
      engine.dispose();
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      id="babylon-canvas" 
      style={{ width: '100%', height: '100%' }} 
    />
  );
};

export default CubeScene; 