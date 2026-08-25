import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface VeinNode {
  x: number;
  y: number;
  children: VeinNode[];
  thickness: number;
}

interface EnergyPulse {
  path: VeinNode[];
  nodeIndex: number;
  progress: number;
  speed: number;
}

export const BackgroundVeins = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create offscreen canvas for caching static veins
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    let veinRoots: VeinNode[] = [];
    let pulses: EnergyPulse[] = [];

    // Helper: generate a recursive branching vein tree
    const generateVeinTree = (
      x: number,
      y: number,
      angle: number,
      depth: number,
      maxDepth: number,
      thickness: number
    ): VeinNode => {
      const node: VeinNode = { x, y, children: [], thickness };
      if (depth >= maxDepth) return node;

      const length = Math.random() * 25 + 15;
      const nextX = x + Math.cos(angle) * length;
      const nextY = y + Math.sin(angle) * length;

      if (nextX < -50 || nextX > width + 50 || nextY < -50 || nextY > height + 50) {
        return node;
      }

      const branchChance = 0.15;
      if (Math.random() < branchChance && depth < maxDepth - 2) {
        const angle1 = angle + (Math.random() * 0.4 + 0.15);
        const angle2 = angle - (Math.random() * 0.4 + 0.15);
        node.children.push(generateVeinTree(nextX, nextY, angle1, depth + 1, maxDepth, thickness * 0.75));
        node.children.push(generateVeinTree(nextX, nextY, angle2, depth + 1, maxDepth, thickness * 0.75));
      } else {
        const angleOffset = (Math.random() - 0.5) * 0.3;
        node.children.push(generateVeinTree(nextX, nextY, angle + angleOffset, depth + 1, maxDepth, thickness));
      }

      return node;
    };

    // Draw veins on the offscreen context (drawn once during init/resize)
    const drawVeinNode = (cCtx: CanvasRenderingContext2D, node: VeinNode) => {
      node.children.forEach((child) => {
        cCtx.beginPath();
        cCtx.moveTo(node.x, node.y);
        cCtx.lineTo(child.x, child.y);
        cCtx.lineWidth = node.thickness;
        cCtx.strokeStyle = 'rgba(255, 95, 0, 0.08)'; // low opacity solid orange
        cCtx.stroke();
        drawVeinNode(cCtx, child);
      });
    };

    // Build the full vein system and pre-render static paths
    const initVeins = () => {
      veinRoots = [];
      pulses = [];

      // Resize offscreen canvas
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      if (offscreenCtx) {
        offscreenCtx.clearRect(0, 0, width, height);
      }

      // Generate roots from corners and borders
      const borderRoots = [
        { x: 0, y: 0, angle: Math.PI / 4 }, // Top-Left
        { x: width, y: 0, angle: (3 * Math.PI) / 4 }, // Top-Right
        { x: 0, y: height, angle: -Math.PI / 4 }, // Bottom-Left
        { x: width, y: height, angle: (-3 * Math.PI) / 4 }, // Bottom-Right
        { x: width / 2, y: 0, angle: Math.PI / 2 }, // Top-Center
        { x: width / 2, y: height, angle: -Math.PI / 2 }, // Bottom-Center
      ];

      borderRoots.forEach((root) => {
        const tree = generateVeinTree(root.x, root.y, root.angle, 0, 16, 3.5); // Depth 16 is safe and dense
        veinRoots.push(tree);
      });

      // Render static veins onto the offscreen cache
      if (offscreenCtx) {
        veinRoots.forEach((root) => {
          drawVeinNode(offscreenCtx, root);
        });
      }

      // Spawn pulses along the branches
      veinRoots.forEach((root) => {
        for (let k = 0; k < 2; k++) {
          const path: VeinNode[] = [];
          let current = root;
          path.push(current);

          while (current.children.length > 0) {
            const nextNode = current.children[Math.floor(Math.random() * current.children.length)];
            path.push(nextNode);
            current = nextNode;
          }

          if (path.length > 2) {
            pulses.push({
              path,
              nodeIndex: 0,
              progress: Math.random(),
              speed: Math.random() * 0.015 + 0.01,
            });
          }
        }
      });
    };

    initVeins();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initVeins();
    };
    window.addEventListener('resize', handleResize);

    // GSAP Ticker animation loop (blazing fast)
    const update = () => {
      if (!ctx || !canvas) return;

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // Render static background veins cache (extremely fast 1-draw)
      ctx.drawImage(offscreenCanvas, 0, 0);

      // Update and draw glowing energy pulses
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.nodeIndex++;

          if (pulse.nodeIndex >= pulse.path.length - 1) {
            pulse.nodeIndex = 0;
            const rootTree = pulse.path[0];
            const newPath: VeinNode[] = [];
            let current = rootTree;
            newPath.push(current);

            while (current.children.length > 0) {
              const nextNode = current.children[Math.floor(Math.random() * current.children.length)];
              newPath.push(nextNode);
              current = nextNode;
            }
            pulse.path = newPath;
          }
        }

        const fromNode = pulse.path[pulse.nodeIndex];
        const toNode = pulse.path[pulse.nodeIndex + 1];
        if (fromNode && toNode) {
          const px = fromNode.x + (toNode.x - fromNode.x) * pulse.progress;
          const py = fromNode.y + (toNode.y - fromNode.y) * pulse.progress;

          // Pulse Core
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#FF5F00';
          ctx.fill();

          // Pulse Aura
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 95, 0, 0.3)';
          ctx.fill();
        }
      });
    };

    gsap.ticker.add(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.95 }}
    />
  );
};
