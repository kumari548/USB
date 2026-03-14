import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface USBVisualizerProps {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'IDLE';
}

export const USBVisualizer: React.FC<USBVisualizerProps> = ({ verdict }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // USB Body
    const geometry = new THREE.BoxGeometry(1, 0.3, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2,
    });
    const usb = new THREE.Mesh(geometry, material);
    scene.add(usb);

    // Connector
    const connectorGeo = new THREE.BoxGeometry(0.6, 0.2, 0.5);
    const connectorMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1 });
    const connector = new THREE.Mesh(connectorGeo, connectorMat);
    connector.position.z = 1.25;
    usb.add(connector);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Particles for collapse
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0xff0000 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    particles.visible = false;
    scene.add(particles);

    camera.position.z = 5;

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      if (verdict === 'DANGEROUS') {
        usb.rotation.x += 0.05;
        usb.rotation.y += 0.05;
        usb.scale.set(Math.max(0, usb.scale.x - 0.01), Math.max(0, usb.scale.y - 0.01), Math.max(0, usb.scale.z - 0.01));
        particles.visible = true;
        particles.rotation.y += 0.01;
      } else if (verdict === 'SAFE') {
        usb.rotation.y += 0.01;
        usb.position.y = Math.sin(Date.now() * 0.002) * 0.2;
        usb.scale.set(1, 1, 1);
        particles.visible = false;
      } else if (verdict === 'SUSPICIOUS') {
        usb.rotation.y += 0.03;
        usb.position.x = Math.sin(Date.now() * 0.01) * 0.1;
        usb.scale.set(1, 1, 1);
        particles.visible = false;
      } else {
        usb.rotation.y += 0.005;
        usb.scale.set(1, 1, 1);
        particles.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [verdict]);

  return <div ref={containerRef} className="w-full h-64 md:h-96" />;
};
