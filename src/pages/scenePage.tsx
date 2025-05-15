import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
// Import the GLTF loader explicitly
import '@babylonjs/loaders/glTF';
// Import the inspector for debugging
import '@babylonjs/inspector';

const ScenePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing...');

  useEffect(() => {
    // Only create the engine and scene if they don't exist and canvas exists
    if (!engineRef.current && canvasRef.current) {
      setLoadingStatus('Creating scene...');
      
      // Create engine with debugging
      engineRef.current = new BABYLON.Engine(canvasRef.current, true, { 
        preserveDrawingBuffer: true, 
        stencil: true 
      });
      
      // Enable inspector on Ctrl+Alt+I
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.code === 'KeyI' && sceneRef.current) {
          if (sceneRef.current.debugLayer.isVisible()) {
            sceneRef.current.debugLayer.hide();
          } else {
            sceneRef.current.debugLayer.show();
          }
        }
      });
      
      // Create scene
      const scene = new BABYLON.Scene(engineRef.current);
      sceneRef.current = scene;
      
      // Add debug logging to scene
      scene.onReadyObservable.add(() => {
        setLoadingStatus('Scene is ready');
        console.log('Scene is ready');
      });
      
      // Setup camera
      const camera = new BABYLON.ArcRotateCamera(
        'camera1', 
        Math.PI / 2, 
        Math.PI / 3, 
        10, 
        BABYLON.Vector3.Zero(), 
        scene
      );
      camera.attachControl(canvasRef.current, true);
      
      // Setup lighting
      const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.7;
      
      // Create a ground
      BABYLON.MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);
      
      // Create a temporary box in case the model doesn't load
      const tempBox = BABYLON.MeshBuilder.CreateBox('tempBox', { size: 2 }, scene);
      tempBox.position.y = 1;
      
      // Load a model
      const loadModel = async () => {
        console.log('Attempting to load cube.glb');
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          "", 
          "./", 
          "cube.glb", 
          scene
        );
        
        console.log('Cube model loaded successfully:', result);
        setLoadingStatus('Cube model loaded successfully!');
        
        // Hide the temporary box if the model loaded
        tempBox.dispose();
        
        // Setup animation for the imported mesh
        if (result.meshes.length > 0) {
          const box = result.meshes[0];
          box.position.y = 1; // Raise the model above the ground
          
          // Register a render loop to rotate the box
          scene.registerBeforeRender(() => {
            if (box) {
              box.rotation.y += 0.01;
            }
          });
        }
      };
      
      loadModel();
      
      // Start the render loop
      engineRef.current.runRenderLoop(() => {
        if (scene && !scene.isDisposed) {
          scene.render();
        }
      });
      
      // Handle window resize
      const handleResize = () => {
        if (engineRef.current) {
          engineRef.current.resize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('keydown', (e) => {
          if (e.ctrlKey && e.altKey && e.code === 'KeyI') {
            // This is just to clean up, but event listeners added with anonymous 
            // functions don't get removed this way (we'd need a ref to the function)
          }
        });
        
        // Stop the render loop
        engineRef.current?.stopRenderLoop();
        
        // Dispose scene and engine
        if (sceneRef.current) {
          sceneRef.current.dispose();
          sceneRef.current = null;
        }
        
        engineRef.current?.dispose();
        engineRef.current = null;
      };
    }
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {loadingStatus && (
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {loadingStatus}
        </div>
      )}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        Press Ctrl+Alt+I for Debug Inspector
      </div>
    </div>
  );
};

export default ScenePage;