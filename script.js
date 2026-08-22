/* ==========================================================================
   SCRIPT.JS - BLUE SKY & ROYAL GOLD BLIND BAG GRADUATION INVITATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. CÁC BIẾN & KHỞI TẠO DOM
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const blindBag = document.getElementById('blind-bag');
    const statusText = document.getElementById('status-text');
    const tapProgress = document.getElementById('tap-progress');
    const bagStage = document.getElementById('bag-stage');
    const cardStage = document.getElementById('card-stage');
    const inviteCard = document.getElementById('invite-card');
    const cardInnerBox = document.getElementById('card-inner-box');
    const musicBtn = document.getElementById('music-btn');
    const muteSlash = document.getElementById('mute-slash');
    const appContainer = document.querySelector('.app-container');

    const bagTopPiece = document.getElementById('bag-top-piece');
    const bagBottomPiece = document.getElementById('bag-bottom-piece');
    const bagTearGap = document.getElementById('bag-tear-gap');

    const magicalFlash = document.getElementById('magical-flash');
    const congratsBanner = document.getElementById('congrats-banner');
    const congratsTitle = congratsBanner ? congratsBanner.querySelector('.congrats-title') : null;
    const congratsSubtitle = congratsBanner ? congratsBanner.querySelector('.congrats-subtitle') : null;

    const cardImage = inviteCard.querySelector('.photocard-image');
    const rarityBadge = inviteCard.querySelector('.rarity-badge');

    // DOM Mini-game 1: Lật đồng xu định mệnh
    const coinStage = document.getElementById('game-coin-stage');
    const coinArena = document.getElementById('coin-arena');
    const coinEl = document.getElementById('coin');
    const coinFlipBtn = document.getElementById('coin-flip-btn');
    const coinResult = document.getElementById('coin-result');
    const coinResultText = document.getElementById('coin-result-text');
    const coinNextBtn = document.getElementById('coin-next-btn');
    const skipGamesBtn = document.getElementById('skip-games-btn');

    // DOM Mini-game 2: Vòng quay may mắn
    const wheelStage = document.getElementById('game-wheel-stage');
    const wheelDisc = document.getElementById('wheel-disc');
    const wheelSpinBtn = document.getElementById('wheel-spin-btn');
    const wheelResult = document.getElementById('wheel-result');
    const wheelResultText = document.getElementById('wheel-result-text');
    const wheelNextBtn = document.getElementById('wheel-next-btn');

    // Cấu hình Card Pool 4 bậc: Common (50%), Rare (25%), Super Rare (15%), Special (10%)
    const cardPool = {
        common: [
            { id: 'common1', src: 'grad/common1.jpg', name: 'Gấu bông', rarity: '★ COMMON CARD ★', tier: 'common' },
            { id: 'common2', src: 'grad/common2.jpg', name: 'Bó hoa', rarity: '★ COMMON CARD ★', tier: 'common' }
        ],
        rare: [
            { id: 'rare1', src: 'grad/rare1.jpg', name: 'Bia hơi', rarity: '★★ RARE CARD ★★', tier: 'rare' },
            { id: 'rare2', src: 'grad/rare2.jpg', name: 'Bó hoa nem chua', rarity: '★★ RARE CARD ★★', tier: 'rare' }
        ],
        superRare: [
            { id: 'superrare', src: 'grad/superrare.jpg', name: 'Cút kít', rarity: '★★★ SUPER RARE ★★★', tier: 'sr' }
        ],
        special: [
            { id: 'special', src: 'grad/special.jpg', name: 'Xe lăn', rarity: '👑 SPECIAL GRADUATION 👑', tier: 'special' }
        ]
    };

    function getAllCards() {
        return [
            ...cardPool.common,
            ...cardPool.rare,
            ...cardPool.superRare,
            ...cardPool.special
        ];
    }

    // ==========================================
    // HỆ THỐNG MỞ KHÓA BỘ SƯU TẬP (COLLECTION UNLOCK)
    // ==========================================
    function getUnlockedCards() {
        try {
            const data = localStorage.getItem('usth_unlocked_cards');
            const rawList = data ? JSON.parse(data) : [];
            const validIds = getAllCards().map(c => c.id);
            // Chỉ giữ lại các ID hợp lệ trong bộ 6 thẻ hiện tại và xóa các ID cũ (normal1..4)
            const validList = rawList.filter(id => validIds.includes(id));
            if (rawList.length !== validList.length) {
                localStorage.setItem('usth_unlocked_cards', JSON.stringify(validList));
            }
            return validList;
        } catch (e) {
            return [];
        }
    }

    function saveUnlockedCard(cardId) {
        try {
            const list = getUnlockedCards();
            if (!list.includes(cardId)) {
                list.push(cardId);
                localStorage.setItem('usth_unlocked_cards', JSON.stringify(list));
            }
        } catch (e) { }
    }

    function updateCollectionUI(newlyUnlockedId = null) {
        const unlocked = getUnlockedCards();
        const allCards = getAllCards();
        const countEl = document.getElementById('unlocked-count');
        if (countEl) countEl.innerText = Math.min(unlocked.length, allCards.length);
        allCards.forEach(c => {
            const borderEl = document.getElementById('border-' + c.id);
            const badgeEl = document.getElementById('badge-' + c.id);
            if (!borderEl || !badgeEl) return;

            const isUnlocked = unlocked.includes(c.id);
            const questionMark = borderEl.querySelector('.pool-question-mark');

            if (isUnlocked) {
                borderEl.classList.remove('blurred');
                if (questionMark) questionMark.style.display = 'none';
                badgeEl.classList.remove('locked', 'common-badge', 'rare-badge', 'sr-badge', 'special-badge');

                if (c.tier === 'special') {
                    badgeEl.classList.add('special-badge');
                } else if (c.tier === 'sr') {
                    badgeEl.classList.add('sr-badge');
                } else if (c.tier === 'rare') {
                    badgeEl.classList.add('rare-badge');
                } else {
                    badgeEl.classList.add('common-badge');
                }
                badgeEl.innerText = c.name;

                if (newlyUnlockedId === c.id) {
                    borderEl.classList.add('unlocked');
                }
            } else {
                borderEl.classList.add('blurred');
                if (questionMark) questionMark.style.display = 'block';
                badgeEl.classList.remove('common-badge', 'rare-badge', 'sr-badge', 'special-badge');
                badgeEl.classList.add('locked');
                badgeEl.innerText = '???';
            }
        });
    }

    // Cập nhật UI bộ sưu tập ban đầu
    updateCollectionUI();

    // Tổng % may mắn tích lũy được từ 2 mini-game (Bắt mũ + Vòng quay) trước khi mở túi mù
    let luckBonus = 0;

    let rolledCard = null;
    function rollGacha() {
        // luckBonus dịch chuyển xác suất từ Common sang Rare/SR/Special, tối đa dịch 45 điểm %
        const shift = Math.min(luckBonus, 45) / 100;
        const specialP = 0.10 + shift * 0.5;
        const srP = 0.15 + shift * 0.3;
        const rareP = 0.25 + shift * 0.2;

        const rand = Math.random(); // Giá trị ngẫu nhiên từ 0 -> 1
        if (rand < specialP) {
            // Special (Xe lăn)
            rolledCard = cardPool.special[0];
        } else if (rand < specialP + srP) {
            // Super Rare (Cút kít)
            rolledCard = cardPool.superRare[0];
        } else if (rand < specialP + srP + rareP) {
            // Rare (Bia hơi, Bó hoa nem chua)
            const rareIndex = Math.random() < 0.5 ? 0 : 1;
            rolledCard = cardPool.rare[rareIndex];
        } else {
            // Common (Gấu bông, Bó hoa)
            const commonIndex = Math.random() < 0.5 ? 0 : 1;
            rolledCard = cardPool.common[commonIndex];
        }
    }

    let clickCount = 0;
    const maxClicks = 5;
    let isTorn = false;
    let isFlipped = false;
    let musicPlaying = false;
    let canTilt = false;

    // Quản lý hệ thống hạt Canvas
    let particles = [];
    let backgroundParticles = [];

    // ----------------------------------------------------------------------
    // 2. CANVAS & CHUYỂN ĐỘNG HẠT NỀN (Stars, Caps, Diamonds, Bubbles - NO HEARTS)
    // ----------------------------------------------------------------------
    function resizeCanvas() {
        const rect = appContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class BackgroundParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // 0: Sao lấp lánh (Star), 1: Mũ cử nhân (Grad Cap), 2: Kim cương (Diamond), 3: Bong bóng ánh sáng (Bubble)
            this.type = Math.floor(Math.random() * 4);

            this.size = Math.random() * 4 + 3;
            this.speedY = -(Math.random() * 0.4 + 0.15); // Bay chậm lên trên
            this.speedX = (Math.random() - 0.5) * 0.3;

            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.02;

            this.opacity = Math.random() * 0.6 + 0.2;
            this.fadeDir = Math.random() > 0.5 ? 0.006 : -0.006;

            // Bảng màu Sky Blue, Gold, Pearl White
            const blueSkyColors = ['#BAE6FD', '#38BDF8', '#0EA5E9', '#FEF08A', '#FACC15', '#FFFFFF'];
            this.color = blueSkyColors[Math.floor(Math.random() * blueSkyColors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.angle += this.spinSpeed;

            if (this.y < -15) {
                this.y = canvas.height + 10;
                this.x = Math.random() * canvas.width;
            }
            if (this.x < -15 || this.x > canvas.width + 15) {
                this.speedX = -this.speedX;
            }

            this.opacity += this.fadeDir;
            if (this.opacity >= 0.85 || this.opacity <= 0.15) {
                this.fadeDir = -this.fadeDir;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            const p = this.size;

            if (this.type === 0) {
                // 1. SAO 4 CÁNH LẤP LÁNH (Pixel Star)
                ctx.fillRect(0, -p, p / 2.5, p * 2);
                ctx.fillRect(-p, 0, p * 2, p / 2.5);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(-p / 4, -p / 4, p / 2, p / 2);
            } else if (this.type === 1) {
                // 2. MŨ TỐT NGHIỆP PIXEL MINI (Graduation Cap)
                ctx.fillRect(-p, -p / 3, p * 2, p / 2); // Đỉnh mũ
                ctx.fillRect(-p / 2, p / 6, p, p / 2);    // Thân mũ
                ctx.fillStyle = '#F59E0B';          // Dây tua vàng
                ctx.fillRect(p / 2, -p / 4, p / 3, p);
            } else if (this.type === 2) {
                // 3. KIM CƯƠNG ÁNH SÁNG (Diamond Shimmer)
                ctx.beginPath();
                ctx.moveTo(0, -p);
                ctx.lineTo(p * 0.7, 0);
                ctx.lineTo(0, p);
                ctx.lineTo(-p * 0.7, 0);
                ctx.closePath();
                ctx.fill();
            } else {
                // 4. BONG BÓNG ÁNH SÁNG BLUE (Glowing Bubble)
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, p * 0.8, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Khởi tạo 35 hạt nền
    for (let i = 0; i < 35; i++) {
        backgroundParticles.push(new BackgroundParticle());
    }

    // ----------------------------------------------------------------------
    // 3. HẠT PHÁO HOA & MẢNH XÉ TÚI (Confetti & Paper Shreds)
    // ----------------------------------------------------------------------
    class BurstParticle {
        constructor(x, y, isPaperShred = false) {
            this.x = x;
            this.y = y;
            this.isPaper = isPaperShred;

            const angle = Math.random() * Math.PI * 2;
            const speed = isPaperShred ? (Math.random() * 4 + 2) : (Math.random() * 8 + 3);

            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - (isPaperShred ? 1 : 4);
            this.gravity = isPaperShred ? 0.15 : 0.22;

            this.size = Math.random() * 5 + 3;
            this.opacity = 1;
            this.decay = Math.random() * 0.02 + 0.015;

            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.2;

            const burstColors = ['#38BDF8', '#0284C7', '#0EA5E9', '#FEF08A', '#F59E0B', '#FFFFFF', '#BAE6FD'];
            this.color = burstColors[Math.floor(Math.random() * burstColors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.angle += this.spin;
            this.opacity -= this.decay;
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
            ctx.restore();
        }
    }

    function createTapSparks(x, y) {
        for (let i = 0; i < 15; i++) {
            particles.push(new BurstParticle(x, y, true));
        }
    }

    function createGrandCelebration() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        for (let i = 0; i < 120; i++) {
            particles.push(new BurstParticle(centerX, centerY, false));
        }
    }

    // Vòng lặp Render Canvas 60fps
    function renderLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        backgroundParticles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(renderLoop);
    }
    renderLoop();

    // ----------------------------------------------------------------------
    // 4. BỘ TẠO ÂM THANH WEB AUDIO SYNTH (Không cần file mp3 ngoài)
    // ----------------------------------------------------------------------
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Âm thanh xé giấy
    function playTearSound(pitch = 1) {
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * 0.12;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200 * pitch;
            filter.Q.value = 3;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
        } catch (e) { }
    }

    // Âm thanh mở túi thành công (Victory Chime)
    function playVictoryChime() {
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;

                const startTime = ctx.currentTime + idx * 0.08;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.6);
            });
        } catch (e) { }
    }

    // Nhạc nền Lofi Chiptune Loop
    let bgmInterval = null;
    function startBGM() {
        if (bgmInterval) return;
        musicPlaying = true;
        muteSlash.style.display = 'none';

        const lofiProgression = [
            [261.63, 329.63, 392.00], // C
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63], // F
            [196.00, 246.94, 293.66]  // G
        ];
        let step = 0;

        bgmInterval = setInterval(() => {
            if (!musicPlaying) return;
            try {
                const ctx = getAudioContext();
                const chord = lofiProgression[step % lofiProgression.length];
                step++;

                chord.forEach(freq => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 1.2);
                });
            } catch (e) { }
        }, 1400);
    }

    function stopBGM() {
        musicPlaying = false;
        muteSlash.style.display = 'block';
        if (bgmInterval) {
            clearInterval(bgmInterval);
            bgmInterval = null;
        }
    }

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (musicPlaying) {
            stopBGM();
        } else {
            getAudioContext();
            startBGM();
        }
    });

    // ----------------------------------------------------------------------
    // 4.5. MINI-GAME 1: LẬT ĐỒNG XU ĐỊNH MỆNH (Coin Flip Gamble)
    // ----------------------------------------------------------------------
    let coinRotation = 0;
    let coinFlipping = false;

    function coinArenaCenter() {
        const rect = coinArena.getBoundingClientRect();
        const appRect = appContainer.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - appRect.left,
            y: rect.top + rect.height / 2 - appRect.top
        };
    }

    function flipCoin() {
        if (coinFlipping) return;
        coinFlipping = true;
        coinFlipBtn.disabled = true;

        if (!musicPlaying) startBGM();

        const win = Math.random() < 0.5;
        const currentMod = ((coinRotation % 360) + 360) % 360;
        const desiredMod = win ? 0 : 180;
        let diff = desiredMod - currentMod;
        if (diff <= 0) diff += 360;
        coinRotation += 2160 + diff; // 6 vòng xoay trọn + góc cần thiết để dừng đúng mặt

        coinArena.classList.remove('tossing');
        void coinArena.offsetWidth; // Trigger reflow để chạy lại animation tung xu
        coinArena.classList.add('tossing');
        coinEl.style.transform = `rotateY(${coinRotation}deg)`;

        const center = coinArenaCenter();
        createTapSparks(center.x, center.y);
        playTearSound(1.3);

        setTimeout(() => {
            coinFlipping = false;
            coinArena.classList.remove('tossing');
            coinFlipBtn.style.display = 'none';

            const landPoint = coinArenaCenter();
            createTapSparks(landPoint.x, landPoint.y);

            if (win) {
                playVictoryChime();
                createGrandCelebration();
                coinResultText.innerText = '🎉 NGỬA! May mắn mỉm cười — mời bạn vào Vòng Quay Đặc Biệt!';
                coinNextBtn.style.display = 'inline-block';
            } else {
                coinResultText.innerText = 'Sấp! Nhót...';
            }
            coinResult.classList.add('show');
        }, 1850);
    }

    coinFlipBtn.addEventListener('click', flipCoin);

    coinNextBtn.addEventListener('click', () => {
        coinStage.style.display = 'none';
        wheelStage.style.display = 'flex';
    });

    skipGamesBtn.addEventListener('click', () => {
        coinFlipping = false;
        coinStage.style.display = 'none';
        wheelStage.style.display = 'none';
        bagStage.style.display = 'flex';
    });

    // ----------------------------------------------------------------------
    // 4.6. MINI-GAME 2: VÒNG QUAY ĐẶC BIỆT (Special Lucky Wheel)
    // ----------------------------------------------------------------------
    const WHEEL_SEGMENTS = [
        { label: '+2%', bonus: 2 },
        { label: '+4%', bonus: 4 },
        { label: 'ẢO DIỆU', bonus: 3 },
        { label: '+6%', bonus: 6 },
        { label: 'MAY MẮN', bonus: 5 },
        { label: 'JACKPOT!', bonus: 8 }
    ];

    // Vẽ nhãn chữ cho từng ô của vòng quay
    WHEEL_SEGMENTS.forEach((seg, i) => {
        const segAngle = 360 / WHEEL_SEGMENTS.length;
        const midAngle = i * segAngle + segAngle / 2;
        const label = document.createElement('span');
        label.className = 'wheel-label';
        label.textContent = seg.label;
        label.style.transform = `rotate(${midAngle}deg) translateY(68px)`;
        wheelDisc.appendChild(label);
    });

    let wheelSpun = false;
    function spinWheel() {
        if (wheelSpun) return;
        wheelSpun = true;
        wheelSpinBtn.disabled = true;

        if (!musicPlaying) startBGM();

        const segIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
        const segAngle = 360 / WHEEL_SEGMENTS.length;
        const targetMidAngle = segIndex * segAngle + segAngle / 2;
        const extraSpins = 5;
        const finalRotation = 360 * extraSpins + (360 - targetMidAngle);

        wheelDisc.style.transform = `rotate(${finalRotation}deg)`;
        playTearSound(1.2);

        setTimeout(() => {
            const seg = WHEEL_SEGMENTS[segIndex];
            luckBonus += seg.bonus;
            playVictoryChime();
            createGrandCelebration();
            wheelResultText.innerText = `🎉 Bạn quay trúng "${seg.label}"! Tổng may mắn tích lũy: +${luckBonus.toFixed(0)}%`;
            wheelResult.classList.add('show');
            wheelSpinBtn.style.display = 'none';
        }, 4150);
    }

    wheelSpinBtn.addEventListener('click', spinWheel);

    wheelNextBtn.addEventListener('click', () => {
        wheelStage.style.display = 'none';
        bagStage.style.display = 'flex';
    });

    // ----------------------------------------------------------------------
    // 5. XỬ LÝ TAP XÉ TÚI MÙ (Blind Bag Rip Interaction)
    // ----------------------------------------------------------------------
    const feedbackTexts = [
        "NICE START! TAP AGAIN!",
        "KEEP GOING!!",
        "ALMOST THERE!!",
        "SO CLOSE!!",
        "OPENING... ✨"
    ];

    blindBag.addEventListener('click', (e) => {
        if (isTorn) return;

        // Bắt đầu nhạc ở tap đầu tiên
        if (!musicPlaying) {
            startBGM();
        }

        clickCount++;
        const percent = Math.min((clickCount / maxClicks) * 100, 100);
        tapProgress.style.width = percent + '%';

        // Lấy tọa độ click tạo hiệu ứng hạt
        const rect = blindBag.getBoundingClientRect();
        const sparkX = (e.clientX - rect.left) + (blindBag.offsetLeft || 0);
        const sparkY = (e.clientY - rect.top) + (blindBag.offsetTop || 0);
        createTapSparks(canvas.width / 2, canvas.height / 2);

        // Hiệu ứng âm thanh tăng dần theo độ xé
        playTearSound(1 + clickCount * 0.25);

        // Cập nhật text trạng thái
        statusText.innerText = feedbackTexts[clickCount - 1] || "KEEP GOING!";

        // Hiệu ứng giãn khe rách
        bagTearGap.style.height = (clickCount * 4.5) + 'px';

        // Rung túi
        blindBag.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
        void blindBag.offsetWidth; // Trigger reflow

        if (clickCount <= 2) {
            blindBag.classList.add('shake-light');
        } else if (clickCount <= 4) {
            blindBag.classList.add('shake-medium');
        } else {
            blindBag.classList.add('shake-heavy');
        }

        // Đạt 5 lần: Xé hoàn toàn!
        if (clickCount >= maxClicks) {
            isTorn = true;
            statusText.innerText = "✨ REVEALING... ✨";

            setTimeout(() => {
                tearBagOpen();
            }, 300);
        }
    });

    // ----------------------------------------------------------------------
    // 6. XÉ MỞ TÚI & XUẤT HIỆN THẺ RARE PHOTOCARD
    // ----------------------------------------------------------------------
    function tearBagOpen() {
        // Tung xúc xắc gacha với may mắn tích lũy từ 2 mini-game trước đó
        rollGacha();

        // Tách 2 mảnh túi
        bagTopPiece.classList.add('torn');
        bagBottomPiece.classList.add('torn');

        // Âm thanh chúc mừng & pháo hoa
        playVictoryChime();
        createGrandCelebration();

        // Lóa sáng ma thuật
        magicalFlash.classList.add('flash-active');
        setTimeout(() => {
            magicalFlash.classList.remove('flash-active');
        }, 500);

        // Ẩn túi mù, hiện Photocard
        setTimeout(() => {
            bagStage.style.display = 'none';
            cardStage.style.display = 'flex';

            // Gán dữ liệu thẻ mở được & Quote ngẫu nhiên
            cardImage.src = rolledCard.src;
            rarityBadge.innerText = rolledCard.rarity;

            // Cập nhật class viền mặt trước Photocard theo tier
            const cardFrontSide = document.getElementById('card-front-side');
            if (cardFrontSide) {
                cardFrontSide.classList.remove('tier-common', 'tier-rare', 'tier-sr', 'tier-special');
                cardFrontSide.classList.add(`tier-${rolledCard.tier}`);
            }

            // Mở khóa thẻ trong bộ sưu tập & lưu vào localStorage
            saveUnlockedCard(rolledCard.id);
            updateCollectionUI(rolledCard.id);

            // Cập nhật nội dung Banner chúc mừng đúng theo bậc thẻ
            if (congratsTitle && congratsSubtitle) {
                if (rolledCard.tier === 'special') {
                    congratsTitle.innerHTML = '👑 SPECIAL CARD! 👑';
                    congratsSubtitle.innerText = `Bạn đã mở trúng thẻ Special: "${rolledCard.name}"! 🎉`;
                } else if (rolledCard.tier === 'sr') {
                    congratsTitle.innerHTML = '🌟 SUPER RARE! 🌟';
                    congratsSubtitle.innerText = `Bạn đã mở trúng thẻ Super Rare: "${rolledCard.name}"! ✨`;
                } else if (rolledCard.tier === 'rare') {
                    congratsTitle.innerHTML = '💎 RARE CARD! 💎';
                    congratsSubtitle.innerText = `Bạn đã mở trúng thẻ Rare: "${rolledCard.name}"! ✨`;
                } else {
                    congratsTitle.innerHTML = '★ COMMON CARD ★';
                    congratsSubtitle.innerText = `Bạn đã mở trúng thẻ: "${rolledCard.name}"! 🎓`;
                }
            }

            // Hiện banner chúc mừng
            congratsBanner.classList.add('show-congrats');

            // Hoạt ảnh Photocard bay lên
            inviteCard.style.transform = 'scale(0.6) translateY(50px) rotate(-8deg)';
            inviteCard.style.opacity = '0';
            inviteCard.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            setTimeout(() => {
                inviteCard.style.transform = 'scale(1) translateY(0) rotate(0deg)';
                inviteCard.style.opacity = '1';
                canTilt = true;
            }, 50);

            // Ẩn banner chúc mừng sau 2.2s
            setTimeout(() => {
                congratsBanner.classList.remove('show-congrats');
            }, 2500);

            // Tự động lật thẻ sau 3.2s để xem thư mời tốt nghiệp
            setTimeout(() => {
                flipCard();
            }, 3200);

        }, 400);
    }

    // ----------------------------------------------------------------------
    // 7. LẬT THẺ 3D FLIP & TƯƠNG TÁC TILT
    // ----------------------------------------------------------------------
    window.flipCard = function () {
        isFlipped = !isFlipped;
        cardInnerBox.classList.toggle('is-flipped', isFlipped);
    };

    inviteCard.addEventListener('click', () => {
        flipCard();
    });

    // Cập nhật lớp ánh kim holographic (--mx, --my, --tilt) theo vị trí con trỏ / góc nghiêng
    function updateFoil(rotX, rotY, px, py) {
        const tilt = Math.min(Math.sqrt(rotX * rotX + rotY * rotY) / 18, 1);
        inviteCard.style.setProperty('--mx', `${px}%`);
        inviteCard.style.setProperty('--my', `${py}%`);
        inviteCard.style.setProperty('--tilt', tilt.toFixed(3));
    }

    function resetFoil() {
        inviteCard.style.setProperty('--mx', '50%');
        inviteCard.style.setProperty('--my', '50%');
        inviteCard.style.setProperty('--tilt', '0');
    }

    // 3D Tilt theo chuột hoặc con quay hồi chuyển di động
    window.addEventListener('mousemove', (e) => {
        if (!canTilt) return;
        const rect = inviteCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = -(y / rect.height) * 14;
        const rotY = (x / rect.width) * 14;

        inviteCard.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        updateFoil(rotX, rotY, ((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
    });

    window.addEventListener('mouseleave', () => {
        if (!canTilt) return;
        inviteCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        resetFoil();
    });

    // Vuốt ngón tay trên thẻ để nghiêng trên di động (bổ sung cho con quay hồi chuyển)
    inviteCard.addEventListener('touchmove', (e) => {
        if (!canTilt || !e.touches.length) return;
        const touch = e.touches[0];
        const rect = inviteCard.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;

        const rotX = -(y / rect.height) * 14;
        const rotY = (x / rect.width) * 14;

        inviteCard.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        updateFoil(rotX, rotY, ((touch.clientX - rect.left) / rect.width) * 100, ((touch.clientY - rect.top) / rect.height) * 100);
    }, { passive: true });

    inviteCard.addEventListener('touchend', () => {
        if (!canTilt) return;
        inviteCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        resetFoil();
    });

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if (!canTilt || !e.gamma || !e.beta) return;
            const rotY = Math.min(Math.max(e.gamma / 3, -15), 15);
            const rotX = Math.min(Math.max((e.beta - 45) / 3, -15), 15);
            inviteCard.style.transform = `perspective(1200px) rotateX(${-rotX}deg) rotateY(${rotY}deg)`;
            updateFoil(rotX, rotY, 50 + rotY * 2, 50 + rotX * 2);
        });
    }
});
