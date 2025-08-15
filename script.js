document.querySelectorAll('.social-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.add('clicked');
        setTimeout(() => icon.classList.remove('clicked'), 300);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-music');
    const pulseWrapper = document.querySelector('.pulse-wrapper');
    const container = document.querySelector('.container');
    const background = document.querySelector('.background');

    audio.volume = 0;


    for (let i = 0; i < 3; i++) {
        const layer = document.createElement('div');
        layer.classList.add('pulse-effect');
        layer.style.zIndex = -1;
        layer.style.opacity = 0.4 - i * 0.1;
        layer.style.transform = "translate(-50%, -50%) scale(1)";
        pulseWrapper.prepend(layer);
    }

    const pulseLayers = document.querySelectorAll('.pulse-effect');
    const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animatePulse() {
        requestAnimationFrame(animatePulse);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const avg = sum / bufferLength;

        pulseLayers.forEach((layer, idx) => {
            const scale = 1 + (avg / 255) * (0.4 + idx * 0.1);
            const color1 = 'hsla(200, 92.10%, 50.40%, 0.40)';
            const color2 = 'hsla(211, 93.10%, 54.70%, 0.40)';
            layer.style.background = `radial-gradient(circle, ${color1}, ${color2} 70%)`;
            layer.style.transform = `translate(-50%, -50%) scale(${scale})`;
            layer.style.opacity = 0.3 + (avg / 255) * 0.7;
        });
    }

    function startMusic() {
        audioCtx.resume().then(() => {
            audio.play().then(() => {
                let vol = 0;
                const volInterval = setInterval(() => {
                    vol += 0.02;
                    if (vol >= 0.5) {
                        vol = 0.5;
                        clearInterval(volInterval);
                    }
                    audio.volume = vol;
                }, 100);
                animatePulse();
            }).catch(err => {
                console.warn('Autoplay diblokir:', err);
                animatePulse();
            });
        });
    }

    startMusic();
    document.body.addEventListener('click', startMusic, { once: true });

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        container.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
        background.style.transform = `translate(${x * 20}px, ${y * 20}px) scale(1.05)`;
    });

    document.addEventListener('mouseleave', () => {
        container.style.transform = 'rotateY(0deg) rotateX(0deg)';
        background.style.transform = 'translate(0, 0) scale(1.05)';
    });
});