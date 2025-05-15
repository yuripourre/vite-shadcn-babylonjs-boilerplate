import React, { useEffect, useRef } from 'react';
import { Engine, Scene as BabylonScene } from '@babylonjs/core';
// Import the GLTF loader explicitly
import '@babylonjs/loaders/glTF';
// Import the inspector for debugging
import '@babylonjs/inspector';

interface SceneProps extends React.HTMLAttributes<HTMLCanvasElement> {
  engineOptions?: any;
  adaptToDeviceRatio?: boolean;
  onSceneReady: (scene: BabylonScene) => void;
  onRender?: (scene: BabylonScene) => void;
}

const Scene: React.FC<SceneProps> = ({
  engineOptions,
  adaptToDeviceRatio,
  onSceneReady,
  onRender,
  ...rest
}) => {
  const reactCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!reactCanvas.current) return;
    
    const engine = new Engine(
      reactCanvas.current,
      true,
      engineOptions,
      adaptToDeviceRatio
    );
    const scene = new BabylonScene(engine);

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === 'function') {
        onRender(scene);
      }
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener('resize', resize);
    }

    return () => {
      scene.getEngine().dispose();
      if (window) {
        window.removeEventListener('resize', resize);
      }
    };
  }, [engineOptions, adaptToDeviceRatio, onSceneReady, onRender]);

  return <canvas ref={reactCanvas} {...rest} />;
};

export default Scene;