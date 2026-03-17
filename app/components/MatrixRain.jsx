import React, { useRef, useEffect } from 'react';

const MatrixRain = ({ opacity = 0.06 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array.from({ length: columns }, () =>
            Math.random() * -100
        );

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const colors = ['#00f2ff', '#00d4e0', '#7000ff', '#5800cc', '#00f2ff'];

        let lastTime = 0;
        const frameInterval = 75; // ms between frames — higher = slower rain

        const draw = (timestamp) => {
            animationId = requestAnimationFrame(draw);

            if (timestamp - lastTime < frameInterval) return;
            lastTime = timestamp;

            ctx.fillStyle = `rgba(10, 10, 10, 0.08)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];

                // Brighter heads, dimmer tails
                const headY = drops[i] * fontSize;
                const alpha = 0.8 + Math.random() * 0.2;
                ctx.fillStyle = color;
                ctx.globalAlpha = alpha;
                ctx.fillText(char, i * fontSize, headY);

                // Reset alpha
                ctx.globalAlpha = 1;

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity }}
        />
    );
};

export default MatrixRain;
