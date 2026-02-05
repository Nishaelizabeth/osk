import { useState, useEffect, useRef } from 'react';

/**
 * Hook to preload an array of image paths and return loaded Image objects
 * @param {string[]} framePaths - Array of image URLs to preload
 * @returns {{ images: HTMLImageElement[], loaded: boolean, progress: number }}
 */
export function useImageSequence(framePaths) {
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadedCountRef = useRef(0);

  useEffect(() => {
    if (!framePaths || framePaths.length === 0) {
      setLoaded(true);
      return;
    }

    const imageObjects = [];
    loadedCountRef.current = 0;
    setLoaded(false);
    setProgress(0);

    const totalFrames = framePaths.length;

    framePaths.forEach((path, index) => {
      const img = new Image();
      
      img.onload = () => {
        loadedCountRef.current += 1;
        const currentProgress = loadedCountRef.current / totalFrames;
        setProgress(currentProgress);

        if (loadedCountRef.current === totalFrames) {
          setImages(imageObjects);
          setLoaded(true);
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${path}`);
        loadedCountRef.current += 1;
        const currentProgress = loadedCountRef.current / totalFrames;
        setProgress(currentProgress);

        if (loadedCountRef.current === totalFrames) {
          setImages(imageObjects);
          setLoaded(true);
        }
      };

      img.src = path;
      imageObjects[index] = img;
    });

    return () => {
      // Cleanup - cancel any pending image loads
      imageObjects.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    };
  }, [framePaths]);

  return { images, loaded, progress };
}

export default useImageSequence;
