// src/pages/index.tsx
import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import styles from './index.module.css';
import Link from '@docusaurus/Link';

export default function Home(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Configuración de las líneas
    const lineWidth = 2;                  // grosor de cada línea
    const columns = Math.floor(canvas.width / lineWidth);
    const drops = Array(columns).fill(0).map(() => Math.random() * canvas.height);

    function draw() {
      // Fondo semitransparente para el “fade”
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#271F56'; // tono suave tipo neon
      ctx.lineWidth = lineWidth;

      for (let i = 0; i < columns; i++) {
        const x = i * lineWidth;
        const y = drops[i];
        const length = 20 + Math.random() * 30;   // longitud variable

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + length);
        ctx.stroke();
        
        // Avanza o reinicia
        drops[i] = y > canvas.height ? 0 : y + length * 0.5;
       //setTimeout(() => requestAnimationFrame(draw), 1000 / 10);

      }

      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <Layout
      title="Sherry Protocol Docs"
      description="Documentation for the Sherry SDK and miniapp framework.">
      
      <header className={styles.heroBanner}>
        <canvas ref={canvasRef} className={styles.matrixCanvas} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sherry Documentation</h1>
          <p className={styles.heroSubtitle}>
            All the tools you need to build cross-chain Web3 miniapps.
          </p>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
