/* ==========================================================================
   SCRIPT.JS - THREE.JS 3D WEBGL BLIND BAG GRADUATION INVITATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. CÁC BIẾN & KHỞI TẠO DOM
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
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
    const celebrateBtn = document.getElementById('celebrate-salvo-btn');

    const bagTopPiece = document.getElementById('bag-top-piece');
    const bagBottomPiece = document.getElementById('bag-bottom-piece');
    const bagTearGap = document.getElementById('bag-tear-gap');

    const magicalFlash = document.getElementById('magical-flash');
    const congratsBanner = document.getElementById('congrats-banner');
    const congratsTitle = congratsBanner ? congratsBanner.querySelector('.congrats-title') : null;
    const congratsSubtitle = congratsBanner ? congratsBanner.querySelector('.congrats-subtitle') : null;

    const cardImage = inviteCard.querySelector('.photocard-image');
    const rarityBadge = inviteCard.querySelector('.rarity-badge');
    const photocardName = document.getElementById('photocard-name');
    const heroQuote = document.getElementById('hero-quote');

    // Danh sách 5 lời nhắn mời dự lễ tốt nghiệp ngẫu nhiên
    const GRADUATION_QUOTES = [
        "Hành trình thanh xuân đại học khép lại với biết bao kỷ niệm đẹp. Rất mong được đón bạn tới chung vui và cùng chụp vài kiểu ảnh kỷ niệm nhé! 🎓✨",
        "Thời khắc nhận bằng tốt nghiệp sẽ trọn vẹn và ý nghĩa hơn rất nhiều nếu có sự hiện diện của bạn. Hẹn gặp bạn tại NEU ngày 27/08 này nhé! 📸✨",
        "Thanh xuân rực rỡ tại giảng đường đã đến ngày gặt hái quả ngọt! Sự có mặt và nụ cười của bạn là món quà ý nghĩa nhất đối với mình. ✨🎓",
        "Cảm ơn vì đã luôn là một phần thật đẹp trong những năm tháng thanh xuân của mình. Hãy đến chia vui và lưu giữ khoảnh khắc này cùng mình nhé! 🌟🎓",
        "Sau bao đêm chạy deadline và đồ án, ngày trọng đại này cuối cùng cũng tới! Rất mong được gặp bạn tại lễ tốt nghiệp để cùng ăn mừng cột mốc mới nhé! 🎉🎓"
    ];

    function applyRandomQuote() {
        if (heroQuote) {
            const randomQuote = GRADUATION_QUOTES[Math.floor(Math.random() * GRADUATION_QUOTES.length)];
            heroQuote.innerText = randomQuote;
        }
    }
    applyRandomQuote();

    // Cấu hình Card Pool 4 bậc: Common (40%), Rare (30%), Super Rare (20%), Special (10%)
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

    updateCollectionUI();

    let rolledCard = null;
    function rollGacha() {
        const rand = Math.random();
        if (rand < 0.10) {
            // Special: 10% (0.00 -> 0.10)
            rolledCard = cardPool.special[0];
        } else if (rand < 0.30) {
            // Super Rare: 20% (0.10 -> 0.30)
            rolledCard = cardPool.superRare[0];
        } else if (rand < 0.60) {
            // Rare: 30% (0.30 -> 0.60)
            const rareIndex = Math.random() < 0.5 ? 0 : 1;
            rolledCard = cardPool.rare[rareIndex];
        } else {
            // Common: 40% (0.60 -> 1.00)
            const commonIndex = Math.random() < 0.5 ? 0 : 1;
            rolledCard = cardPool.common[commonIndex];
        }
    }
    rollGacha();

    let clickCount = 0;
    const maxClicks = 5;
    let isTorn = false;
    let isFlipped = false;
    let musicPlaying = false;
    let canTilt = false;

    function triggerScreenShake(level = 'medium') {
        if (!appContainer) return;
        appContainer.classList.remove('screen-shake-light', 'screen-shake-medium', 'screen-shake-heavy', 'screen-shake-mega');
        void appContainer.offsetWidth;
        appContainer.classList.add(`screen-shake-${level}`);
        setTimeout(() => {
            appContainer.classList.remove(`screen-shake-${level}`);
        }, level === 'mega' ? 750 : 320);
    }

    // ----------------------------------------------------------------------
    // 2. THREE.JS 3D WEBGL ENGINE KHỞI TẠO & SCENE SETUP
    // ----------------------------------------------------------------------
    let scene, camera, renderer;
    let wheelchair3DGroup;
    let ambientParticles3D = [];
    let confetti3D = [];
    let sparks3D = [];
    let shockwaves3D = [];
    let rockets3D = [];

    function initThreeJS() {
        const width = appContainer.clientWidth || window.innerWidth;
        const height = appContainer.clientHeight || window.innerHeight;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 28);

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 1. Ánh sáng đa sắc (Dynamic 3D Lighting)
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xFEF08A, 1.4);
        dirLight.position.set(6, 12, 10);
        scene.add(dirLight);

        const bluePointLight = new THREE.PointLight(0x38BDF8, 3.5, 50);
        bluePointLight.position.set(-12, -4, 12);
        scene.add(bluePointLight);

        const goldPointLight = new THREE.PointLight(0xF59E0B, 3.5, 50);
        goldPointLight.position.set(12, 8, 12);
        scene.add(goldPointLight);

        // 2. Tạo Mô Hình Xe Lăn 3D Xoay 360 Độ (3D Wheelchair Model)
        create3DWheelchair();

        // 3. Tạo 50 Hạt Nền 3D Lơ Lửng (3D Ambient Star & Diamond Cloud)
        create3DAmbientParticles();

        // 4. Kích hoạt hiệu ứng xoay 3D cho toàn bộ card trong bộ sưu tập
        initCollection3DInteractions();
    }

    function create3DWheelchair() {
        wheelchair3DGroup = new THREE.Group();

        // Chất liệu Chrome, Gold, Sapphire Blue & Rubber
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xE2E8F0,
            metalness: 0.95,
            roughness: 0.15
        });
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xF59E0B,
            metalness: 0.9,
            roughness: 0.2
        });
        const sapphireBlueMat = new THREE.MeshStandardMaterial({
            color: 0x0284C7,
            roughness: 0.35,
            metalness: 0.3
        });
        const darkRubberMat = new THREE.MeshStandardMaterial({
            color: 0x0F172A,
            roughness: 0.8,
            metalness: 0.1
        });

        // 1. Đệm ngồi (Seat Cushion) & Tựa lưng (Backrest)
        const seatGeo = new THREE.BoxGeometry(2.3, 0.26, 2.3);
        const seatMesh = new THREE.Mesh(seatGeo, sapphireBlueMat);
        seatMesh.position.set(0, 0, 0);
        wheelchair3DGroup.add(seatMesh);

        const backGeo = new THREE.BoxGeometry(2.3, 2.2, 0.25);
        const backMesh = new THREE.Mesh(backGeo, sapphireBlueMat);
        backMesh.position.set(0, 1.2, -1.05);
        wheelchair3DGroup.add(backMesh);

        // 2. Hai bánh xe sau lớn (Two Big Rear Wheels with Golden Handrims)
        [-1.38, 1.38].forEach((xSide) => {
            const wheelSubGroup = new THREE.Group();
            wheelSubGroup.position.set(xSide, 0, -0.35);

            // Lốp cao su ngoài
            const tireGeo = new THREE.TorusGeometry(1.5, 0.12, 16, 36);
            const tireMesh = new THREE.Mesh(tireGeo, darkRubberMat);
            tireMesh.rotation.y = Math.PI / 2;
            wheelSubGroup.add(tireMesh);

            // Vành kim loại bạc
            const rimGeo = new THREE.TorusGeometry(1.35, 0.05, 16, 36);
            const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
            rimMesh.rotation.y = Math.PI / 2;
            wheelSubGroup.add(rimMesh);

            // Vành đẩy tay mạ vàng (Golden Handrim)
            const handrimGeo = new THREE.TorusGeometry(1.15, 0.04, 16, 36);
            const handrimMesh = new THREE.Mesh(handrimGeo, goldMat);
            handrimMesh.rotation.y = Math.PI / 2;
            handrimMesh.position.x = xSide > 0 ? 0.16 : -0.16;
            wheelSubGroup.add(handrimMesh);

            // Trục bánh xe tâm
            const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 16);
            const hubMesh = new THREE.Mesh(hubGeo, goldMat);
            hubMesh.rotation.z = Math.PI / 2;
            wheelSubGroup.add(hubMesh);

            // Nan hoa kim loại (8 Spokes)
            for (let i = 0; i < 4; i++) {
                const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.7, 8);
                const spokeMesh = new THREE.Mesh(spokeGeo, chromeMat);
                spokeMesh.rotation.x = (Math.PI / 4) * i;
                wheelSubGroup.add(spokeMesh);
            }

            wheelchair3DGroup.add(wheelSubGroup);
        });

        // 3. Hai bánh xe trước nhỏ xoay (Two Front Caster Wheels)
        [-0.95, 0.95].forEach((xSide) => {
            const casterGroup = new THREE.Group();
            casterGroup.position.set(xSide, -0.9, 1.25);

            const smallTireGeo = new THREE.TorusGeometry(0.42, 0.08, 12, 24);
            const smallTireMesh = new THREE.Mesh(smallTireGeo, darkRubberMat);
            smallTireMesh.rotation.y = Math.PI / 2;
            casterGroup.add(smallTireMesh);

            const smallRimGeo = new THREE.TorusGeometry(0.35, 0.03, 12, 24);
            const smallRimMesh = new THREE.Mesh(smallRimGeo, chromeMat);
            smallRimMesh.rotation.y = Math.PI / 2;
            casterGroup.add(smallRimMesh);

            const forkGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8);
            const forkMesh = new THREE.Mesh(forkGeo, chromeMat);
            forkMesh.position.set(0, 0.35, 0);
            casterGroup.add(forkMesh);

            wheelchair3DGroup.add(casterGroup);
        });

        // 4. Khung xe (Frame Crossbars)
        const crossBarGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.6, 8);
        const crossBar1 = new THREE.Mesh(crossBarGeo, chromeMat);
        crossBar1.rotation.z = Math.PI / 2;
        crossBar1.position.set(0, -0.2, -0.3);
        wheelchair3DGroup.add(crossBar1);

        const crossBar2 = new THREE.Mesh(crossBarGeo, chromeMat);
        crossBar2.rotation.z = Math.PI / 2;
        crossBar2.position.set(0, -0.2, 0.8);
        wheelchair3DGroup.add(crossBar2);

        // 5. Tay vịn hai bên (Armrests)
        [-1.25, 1.25].forEach((xSide) => {
            const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8);
            const postMesh = new THREE.Mesh(postGeo, chromeMat);
            postMesh.position.set(xSide, 0.45, 0);
            wheelchair3DGroup.add(postMesh);

            const padGeo = new THREE.BoxGeometry(0.24, 0.12, 1.7);
            const padMesh = new THREE.Mesh(padGeo, darkRubberMat);
            padMesh.position.set(xSide, 0.88, -0.1);
            wheelchair3DGroup.add(padMesh);
        });

        // 6. Chỗ gác chân mạ vàng (Gold Footrests)
        [-0.65, 0.65].forEach((xSide) => {
            const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
            const poleMesh = new THREE.Mesh(poleGeo, chromeMat);
            poleMesh.position.set(xSide, -0.7, 1.15);
            poleMesh.rotation.x = -Math.PI / 16;
            wheelchair3DGroup.add(poleMesh);

            const plateGeo = new THREE.BoxGeometry(0.85, 0.08, 0.9);
            const plateMesh = new THREE.Mesh(plateGeo, goldMat);
            plateMesh.position.set(xSide, -1.2, 1.35);
            plateMesh.rotation.x = -Math.PI / 8;
            wheelchair3DGroup.add(plateMesh);
        });

        // 7. Tay đẩy cao su phía sau (Push Handles)
        [-0.95, 0.95].forEach((xSide) => {
            const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
            const tubeMesh = new THREE.Mesh(tubeGeo, chromeMat);
            tubeMesh.position.set(xSide, 2.2, -1.05);
            wheelchair3DGroup.add(tubeMesh);

            const gripGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.75, 12);
            const gripMesh = new THREE.Mesh(gripGeo, darkRubberMat);
            gripMesh.rotation.x = Math.PI / 2;
            gripMesh.position.set(xSide, 2.7, -1.4);
            wheelchair3DGroup.add(gripMesh);
        });

        // Vị trí phía trên bao bì túi mù
        wheelchair3DGroup.position.set(0, 11, 2);
        wheelchair3DGroup.scale.set(0.85, 0.85, 0.85);
        scene.add(wheelchair3DGroup);
    }

    // ----------------------------------------------------------------------
    // 3. TƯƠNG TÁC XOAY 3D CHO CÁC THẺ TRONG BỘ SƯU TẬP (Flip H/V & Xoay 90 Độ)
    // ----------------------------------------------------------------------
    const FLIP_ROTATION_PRESETS = [
        { name: 'flip-h', x: 0, y: 180, z: 0 },         // Lật ngang (Horizontal Flip)
        { name: 'flip-v', x: 180, y: 0, z: 0 },         // Lật dọc (Vertical Flip)
        { name: 'rotate-90', x: 0, y: 0, z: 90 },       // Xoay ngang 90 độ
        { name: 'rotate-270', x: 0, y: 0, z: 270 },     // Xoay 270 độ (-90 độ)
        { name: 'rotate-180', x: 0, y: 0, z: 180 },     // Xoay ngược 180 độ
        { name: 'flip-h-90', x: 0, y: 180, z: 90 },     // Lật ngang + xoay 90 độ
        { name: 'flip-v-90', x: 180, y: 0, z: 90 },     // Lật dọc + xoay 90 độ
        { name: 'flip-hv', x: 180, y: 180, z: 0 },      // Lật ngang & dọc 180 độ
        { name: 'flip-h-270', x: 0, y: 180, z: 270 },   // Lật ngang + xoay 270 độ
        { name: 'normal', x: 0, y: 0, z: 0 }            // Về góc chuẩn ban đầu
    ];

    function initCollection3DInteractions() {
        const poolItems = document.querySelectorAll('.pool-item');
        poolItems.forEach(item => {
            const borderEl = item.querySelector('.pool-card-border');
            const shineEl = item.querySelector('.pool-card-shine');
            if (!borderEl) return;

            // Lưu trạng thái góc xoay/lật hiện tại
            borderEl.dataset.baseX = '0';
            borderEl.dataset.baseY = '0';
            borderEl.dataset.baseZ = '0';
            borderEl.dataset.presetIdx = '9'; // 'normal'

            // Hàm kích hoạt xoay Flip Horizontal / Vertical / 90° ngẫu nhiên khi click
            function rollRandomFlipOrRotation() {
                const currentIdx = parseInt(borderEl.dataset.presetIdx) || 0;
                // Chọn một preset khác với preset hiện tại
                let nextIdx;
                do {
                    nextIdx = Math.floor(Math.random() * FLIP_ROTATION_PRESETS.length);
                } while (nextIdx === currentIdx && FLIP_ROTATION_PRESETS.length > 1);

                const preset = FLIP_ROTATION_PRESETS[nextIdx];
                borderEl.dataset.presetIdx = nextIdx.toString();
                borderEl.dataset.baseX = preset.x.toString();
                borderEl.dataset.baseY = preset.y.toString();
                borderEl.dataset.baseZ = preset.z.toString();

                const scale = (preset.x !== 0 || preset.y !== 0 || preset.z !== 0) ? 1.15 : 1.0;
                const zDepth = (preset.x !== 0 || preset.y !== 0 || preset.z !== 0) ? 22 : 0;

                borderEl.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.85, 0.4, 1.25), box-shadow 0.3s ease';
                borderEl.style.transform = `perspective(600px) rotateX(${preset.x}deg) rotateY(${preset.y}deg) rotateZ(${preset.z}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(${zDepth}px)`;

                if (shineEl) {
                    shineEl.style.opacity = '1';
                    const posX = preset.y === 180 ? 80 : 30;
                    const posY = preset.x === 180 ? 80 : 30;
                    shineEl.style.background = `radial-gradient(circle at ${posX}% ${posY}%, rgba(255, 255, 255, 0.75) 0%, rgba(56, 189, 248, 0.45) 40%, transparent 80%)`;
                }

                playFlipSound();

                const rect = borderEl.getBoundingClientRect();
                createTapSparks3D(rect.left + rect.width / 2, rect.top + rect.height / 2, 2);
            }

            // Click: Xoay Flip H/V hoặc 90/180/270 độ ngẫu nhiên mỗi lần bấm!
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                rollRandomFlipOrRotation();
            });

            // Rê chuột: Nghiêng 3D nhẹ tương tác theo con trỏ chuột
            item.addEventListener('mousemove', (e) => {
                borderEl.style.transition = 'transform 0.1s ease-out';
                const rect = borderEl.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = -((mouseY - centerY) / centerY) * 12;
                const deltaY = ((mouseX - centerX) / centerX) * 14;

                const curBaseX = parseFloat(borderEl.dataset.baseX) || 0;
                const curBaseY = parseFloat(borderEl.dataset.baseY) || 0;
                const curBaseZ = parseFloat(borderEl.dataset.baseZ) || 0;
                const isTransformed = (curBaseX !== 0 || curBaseY !== 0 || curBaseZ !== 0);
                const scale = isTransformed ? 1.15 : 1.05;
                const zDepth = isTransformed ? 22 : 8;

                borderEl.style.transform = `perspective(600px) rotateX(${curBaseX + deltaX}deg) rotateY(${curBaseY + deltaY}deg) rotateZ(${curBaseZ}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(${zDepth}px)`;

                if (shineEl) {
                    shineEl.style.opacity = '1';
                    const px = (mouseX / rect.width) * 100;
                    const py = (mouseY / rect.height) * 100;
                    shineEl.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.65) 0%, rgba(56, 189, 248, 0.35) 40%, transparent 80%)`;
                }
            });

            // Rời chuột: Trả về trạng thái Flip/Xoay đã chọn
            item.addEventListener('mouseleave', () => {
                borderEl.style.transition = 'transform 0.35s ease-out';
                const curBaseX = parseFloat(borderEl.dataset.baseX) || 0;
                const curBaseY = parseFloat(borderEl.dataset.baseY) || 0;
                const curBaseZ = parseFloat(borderEl.dataset.baseZ) || 0;
                const isTransformed = (curBaseX !== 0 || curBaseY !== 0 || curBaseZ !== 0);
                const scale = isTransformed ? 1.15 : 1.0;
                const zDepth = isTransformed ? 22 : 0;

                borderEl.style.transform = `perspective(600px) rotateX(${curBaseX}deg) rotateY(${curBaseY}deg) rotateZ(${curBaseZ}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(${zDepth}px)`;

                if (shineEl && !isTransformed) {
                    shineEl.style.opacity = '0';
                }
            });

            // Hỗ trợ cảm ứng vuốt trên điện thoại
            item.addEventListener('touchmove', (e) => {
                if (!e.touches || !e.touches[0]) return;
                borderEl.style.transition = 'transform 0.1s ease-out';
                const touch = e.touches[0];
                const rect = borderEl.getBoundingClientRect();
                const mouseX = touch.clientX - rect.left;
                const mouseY = touch.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = -((mouseY - centerY) / centerY) * 12;
                const deltaY = ((mouseX - centerX) / centerX) * 12;

                const curBaseX = parseFloat(borderEl.dataset.baseX) || 0;
                const curBaseY = parseFloat(borderEl.dataset.baseY) || 0;
                const curBaseZ = parseFloat(borderEl.dataset.baseZ) || 0;
                const isTransformed = (curBaseX !== 0 || curBaseY !== 0 || curBaseZ !== 0);
                const scale = isTransformed ? 1.15 : 1.05;

                borderEl.style.transform = `perspective(600px) rotateX(${curBaseX + deltaX}deg) rotateY(${curBaseY + deltaY}deg) rotateZ(${curBaseZ}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(18px)`;
            }, { passive: true });
        });
    }

    function create3DAmbientParticles() {
        const starGeo = new THREE.OctahedronGeometry(0.35, 0);
        const sphereGeo = new THREE.SphereGeometry(0.25, 8, 8);

        const colors = [0xBAE6FD, 0x38BDF8, 0x0EA5E9, 0xFEF08A, 0xFACC15, 0xFFFFFF];

        for (let i = 0; i < 45; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.3,
                metalness: 0.8,
                transparent: true,
                opacity: Math.random() * 0.5 + 0.35
            });

            const mesh = new THREE.Mesh(Math.random() > 0.5 ? starGeo : sphereGeo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 26,
                (Math.random() - 0.5) * 36,
                (Math.random() - 0.5) * 16
            );

            mesh.userData = {
                speedY: Math.random() * 0.03 + 0.015,
                speedX: (Math.random() - 0.5) * 0.01,
                rotSpeedX: (Math.random() - 0.5) * 0.03,
                rotSpeedY: (Math.random() - 0.5) * 0.03
            };

            scene.add(mesh);
            ambientParticles3D.push(mesh);
        }
    }

    function onResizeThree() {
        if (!renderer || !camera || !appContainer) return;
        const width = appContainer.clientWidth || window.innerWidth;
        const height = appContainer.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResizeThree);

    // Chuyển tọa độ màn hình (2D Screen) sang không gian 3D World (Z=0 plane)
    function screenToWorld3D(screenX, screenY, targetZ = 0) {
        const rect = canvas.getBoundingClientRect();
        const x = ((screenX - rect.left) / rect.width) * 2 - 1;
        const y = -((screenY - rect.top) / rect.height) * 2 + 1;

        const vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = (targetZ - camera.position.z) / dir.z;
        return camera.position.clone().add(dir.multiplyScalar(distance));
    }

    // ----------------------------------------------------------------------
    // 3. HỆ THỐNG VẬT LÝ KIM TUYẾN & PHÁO HOA 3D (3D Volumetric Confetti)
    // ----------------------------------------------------------------------

    // A. Mảnh Ruy Băng Kim Tuyến 3D Nhỏ, Rơi Chậm & Lơ Lửng Rất Lâu
    class ConfettiPiece3D {
        constructor(x, y, z, vx, vy, vz) {
            this.vx = vx;
            this.vy = vy;
            this.vz = vz;
            // Trọng lực cực nhẹ và lực cản không khí cao để rơi thật chậm, bay bổng
            this.gravity = -0.0032;
            this.friction = 0.986;

            // Tốc độ xoay 3D lấp lánh nhẹ nhàng
            this.rxSpeed = (Math.random() - 0.5) * 0.10;
            this.rySpeed = (Math.random() - 0.5) * 0.12;
            this.rzSpeed = (Math.random() - 0.5) * 0.08;

            this.swayTimer = Math.random() * 20;
            this.swaySpeed = Math.random() * 0.035 + 0.018;
            this.swayAmp = Math.random() * 0.016 + 0.008;

            this.life = 1.0;
            // Tỷ lệ mờ dần siêu chậm giúp pháo hoa ở lại trên màn hình lâu gấp 3 lần (12-18s)
            this.decay = Math.random() * 0.0016 + 0.0011;

            const palette = [0xF59E0B, 0xFEF08A, 0xFDE047, 0x38BDF8, 0x0EA5E9, 0x0284C7, 0xEC4899, 0xC084FC, 0x10B981, 0xFFFFFF];
            const color = palette[Math.floor(Math.random() * palette.length)];

            // Kích thước pháo nhỏ hơn, tinh xảo như kim tuyến kim loại thật
            const isStrip = Math.random() > 0.4;
            const geo = isStrip ? new THREE.PlaneGeometry(0.32, 0.68) : new THREE.PlaneGeometry(0.38, 0.38);

            const mat = new THREE.MeshStandardMaterial({
                color: color,
                side: THREE.DoubleSide,
                roughness: 0.15,
                metalness: 0.9,
                transparent: true,
                opacity: 1.0
            });

            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.position.set(x, y, z);
            this.mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            scene.add(this.mesh);
        }

        update() {
            this.swayTimer += this.swaySpeed;
            this.vx += Math.sin(this.swayTimer) * this.swayAmp;
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vz *= this.friction;
            this.vy += this.gravity;

            this.mesh.position.x += this.vx;
            this.mesh.position.y += this.vy;
            this.mesh.position.z += this.vz;

            this.mesh.rotation.x += this.rxSpeed;
            this.mesh.rotation.y += this.rySpeed;
            this.mesh.rotation.z += this.rzSpeed;

            this.life -= this.decay;
            this.mesh.material.opacity = Math.max(0, this.life);

            return this.life > 0;
        }

        destroy() {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }

    // B. Tia Lửa Nhỏ Phát Sáng 3D (Mini Glowing 3D Sparks)
    class Spark3D {
        constructor(x, y, z, vx, vy, vz, color = 0xFEF08A) {
            this.vx = vx;
            this.vy = vy;
            this.vz = vz;
            this.gravity = -0.005;
            this.friction = 0.978;
            this.life = 1.0;
            this.decay = Math.random() * 0.008 + 0.005;

            // Tia sáng nhỏ li ti lấp lánh
            const geo = new THREE.SphereGeometry(0.10, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1.0
            });

            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.position.set(x, y, z);
            scene.add(this.mesh);
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vz *= this.friction;
            this.vy += this.gravity;

            this.mesh.position.x += this.vx;
            this.mesh.position.y += this.vy;
            this.mesh.position.z += this.vz;

            this.life -= this.decay;
            this.mesh.material.opacity = Math.max(0, this.life);
            this.mesh.scale.multiplyScalar(0.985);

            return this.life > 0;
        }

        destroy() {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }

    // C. Sóng Xung Kích 3D (3D Expanding Shockwave Ring)
    class Shockwave3D {
        constructor(x, y, z, maxScale = 7.0, color = 0x38BDF8) {
            this.scale = 0.2;
            this.maxScale = maxScale;
            this.growth = maxScale / 20;
            this.life = 1.0;
            this.decay = 0.05;

            const geo = new THREE.RingGeometry(0.8, 1.1, 32);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95
            });

            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.position.set(x, y, z);
            scene.add(this.mesh);
        }

        update() {
            this.scale += this.growth;
            this.mesh.scale.set(this.scale, this.scale, this.scale);
            this.life -= this.decay;
            this.mesh.material.opacity = Math.max(0, this.life);
            return this.life > 0;
        }

        destroy() {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }

    // D. Tên Lửa Pháo Hoa 3D Bay Vút & Nổ Cầu 360 Độ
    class FireworkRocket3D {
        constructor(startX, startY, startZ, targetX, targetY, targetZ) {
            this.current = new THREE.Vector3(startX, startY, startZ);
            this.target = new THREE.Vector3(targetX, targetY, targetZ);
            const dir = this.target.clone().sub(this.current);
            this.dist = dir.length();
            this.velocity = dir.normalize().multiplyScalar(0.75);
            this.exploded = false;
            this.trailTimer = 0;

            const geo = new THREE.SphereGeometry(0.28, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            this.mesh = new THREE.Mesh(geo, mat);
            this.mesh.position.copy(this.current);
            scene.add(this.mesh);
        }

        update() {
            if (this.exploded) return false;

            this.current.add(this.velocity);
            this.mesh.position.copy(this.current);

            this.trailTimer++;
            if (this.trailTimer % 2 === 0) {
                sparks3D.push(new Spark3D(this.current.x, this.current.y, this.current.z, (Math.random() - 0.5) * 0.05, -0.05, (Math.random() - 0.5) * 0.05, 0xFEF08A));
            }

            if (this.current.distanceTo(this.target) < 1.2 || this.current.y >= this.target.y) {
                this.explode();
                return false;
            }
            return true;
        }

        explode() {
            this.exploded = true;
            shockwaves3D.push(new Shockwave3D(this.current.x, this.current.y, this.current.z, 5.0, 0xF59E0B));

            // Bắn nổ hình cầu 3D 360 độ
            for (let i = 0; i < 50; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const speed = Math.random() * 0.5 + 0.2;

                const vx = Math.sin(phi) * Math.cos(theta) * speed;
                const vy = Math.sin(phi) * Math.sin(theta) * speed;
                const vz = Math.cos(phi) * speed;

                const colors = [0x38BDF8, 0x0EA5E9, 0xFEF08A, 0xF59E0B, 0xEC4899, 0xFFFFFF];
                const color = colors[Math.floor(Math.random() * colors.length)];
                sparks3D.push(new Spark3D(this.current.x, this.current.y, this.current.z, vx, vy, vz, color));
            }
            this.destroy();
        }

        destroy() {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }

    // ==========================================
    // CÁC HÀM TRIGGER HIỆU ỨNG 3D
    // ==========================================

    function createTapSparks3D(clickX, clickY, clickNum = 1) {
        const worldPos = screenToWorld3D(clickX, clickY, 0);
        const count = 25 + clickNum * 8;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 0.35 + 0.15) * (1 + clickNum * 0.2);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const vz = (Math.random() - 0.5) * speed * 1.2;
            sparks3D.push(new Spark3D(worldPos.x, worldPos.y, worldPos.z, vx, vy, vz, clickNum % 2 === 0 ? 0xF59E0B : 0x38BDF8));
        }

        shockwaves3D.push(new Shockwave3D(worldPos.x, worldPos.y, worldPos.z, 2.5 + clickNum * 0.8, clickNum % 2 === 0 ? 0xF59E0B : 0x38BDF8));
        triggerScreenShake(clickNum <= 2 ? 'light' : (clickNum <= 4 ? 'medium' : 'heavy'));
    }

    function createGrandCelebration3D() {
        triggerScreenShake('mega');

        // 1. Pháo nổ tâm cầu 3D
        for (let i = 0; i < 120; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = Math.random() * 0.55 + 0.2;
            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = Math.sin(phi) * Math.sin(theta) * speed;
            const vz = Math.cos(phi) * speed;
            sparks3D.push(new Spark3D(0, 0, 0, vx, vy, vz));
        }
        shockwaves3D.push(new Shockwave3D(0, 0, 0, 8.0, 0xFEF08A));

        // 2. Đại bác 3D bắn từ 2 góc dưới (Dual 3D Confetti Cannons)
        fireCannonSalvo3D(-14, -14, 0, 0.48, 0.95, 130);
        fireCannonSalvo3D(14, -14, 0, -0.48, 0.95, 130);

        // 3. Bắn pháo hoa liên hoàn 3D và mưa kim tuyến chậm
        const salvos = [
            { delay: 300, x: -7, y: 7, z: 2 },
            { delay: 650, x: 7, y: 8, z: -2 },
            { delay: 1100, x: 0, y: 10, z: 3 },
            { delay: 1600, x: -5, y: 8, z: -1 }
        ];

        salvos.forEach(s => {
            setTimeout(() => {
                rockets3D.push(new FireworkRocket3D(0, -15, 0, s.x, s.y, s.z));
                fireCannonSalvo3D(Math.random() > 0.5 ? -14 : 14, -14, 0, (Math.random() - 0.5) * 0.6, 0.85, 50);
            }, s.delay);
        });

        setTimeout(() => {
            spawnTopCascade3D(100);
        }, 1200);
    }

    function spawnTopCascade3D(count) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 26;
            const y = Math.random() * 6 + 14;
            const z = (Math.random() - 0.5) * 10;
            const vx = (Math.random() - 0.5) * 0.12;
            const vy = -(Math.random() * 0.06 + 0.015);
            const vz = (Math.random() - 0.5) * 0.12;
            confetti3D.push(new ConfettiPiece3D(x, y, z, vx, vy, vz));
        }
    }

    function fireCannonSalvo3D(originX, originY, originZ, baseVx, baseVy, count) {
        for (let i = 0; i < count; i++) {
            const vx = baseVx + (Math.random() - 0.5) * 0.42;
            const vy = baseVy + (Math.random() - 0.5) * 0.30 + (Math.random() * 0.22);
            const vz = (Math.random() - 0.5) * 0.50;

            if (Math.random() > 0.2) {
                confetti3D.push(new ConfettiPiece3D(originX, originY, originZ, vx, vy, vz));
            } else {
                sparks3D.push(new Spark3D(originX, originY, originZ, vx * 1.15, vy * 1.15, vz * 1.15));
            }
        }
    }

    function createSalvo3D() {
        triggerScreenShake('heavy');
        playSalvoSound();

        // Đợt 1 (Ngay lập tức): 2 Đại bác phóng hơn 260 mảnh kim tuyến nhỏ bay vút lên trời
        fireCannonSalvo3D(-14, -14, 0, 0.48, 0.95, 140);
        fireCannonSalvo3D(14, -14, 0, -0.48, 0.95, 140);

        // Đợt 2 (+250ms): Tên lửa pháo hoa nổ bung trên cao
        setTimeout(() => {
            rockets3D.push(new FireworkRocket3D(0, -15, 0, (Math.random() - 0.5) * 6, 9, 0));
        }, 250);

        // Đợt 3 (+550ms): Đợt bắn bổ sung 180 mảnh kim tuyến
        setTimeout(() => {
            fireCannonSalvo3D(-14, -14, 0, 0.38, 0.88, 90);
            fireCannonSalvo3D(14, -14, 0, -0.38, 0.88, 90);
        }, 550);

        // Đợt 4 (+950ms): Mưa kim tuyến từ trên không trung rơi lơ lửng khắp toàn màn hình
        setTimeout(() => {
            spawnTopCascade3D(120);
        }, 950);

        // Đợt 5 (+1500ms): Thêm đợt mưa kim tuyến rơi siêu chậm thứ 2
        setTimeout(() => {
            spawnTopCascade3D(90);
            rockets3D.push(new FireworkRocket3D(0, -15, 0, (Math.random() - 0.5) * 8, 8.5, 0));
        }, 1500);
    }

    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createSalvo3D();
        });
    }

    // Vòng lặp Three.js Animation Loop (60 FPS)
    let clock = new THREE.Clock();
    function animateThree() {
        requestAnimationFrame(animateThree);
        const elapsedTime = clock.getElapsedTime();

        // 1. Chuyển động Xe Lăn 3D Xoay 360 Độ
        if (wheelchair3DGroup) {
            wheelchair3DGroup.rotation.y += 0.022; // Xoay vòng 360 độ liên tục
            wheelchair3DGroup.rotation.x = Math.sin(elapsedTime * 1.6) * 0.07;
            wheelchair3DGroup.position.y = 10.5 + Math.sin(elapsedTime * 2.2) * 0.45;
        }

        // 2. Hạt nền lơ lửng 3D
        ambientParticles3D.forEach(p => {
            p.position.y += p.userData.speedY;
            p.position.x += p.userData.speedX;
            p.rotation.x += p.userData.rotSpeedX;
            p.rotation.y += p.userData.rotSpeedY;

            if (p.position.y > 18) {
                p.position.y = -18;
                p.position.x = (Math.random() - 0.5) * 26;
            }
        });

        // 3. Cập nhật Kim Tuyến 3D
        for (let i = confetti3D.length - 1; i >= 0; i--) {
            if (!confetti3D[i].update()) {
                confetti3D[i].destroy();
                confetti3D.splice(i, 1);
            }
        }

        // 4. Cập nhật Tia Lửa 3D
        for (let i = sparks3D.length - 1; i >= 0; i--) {
            if (!sparks3D[i].update()) {
                sparks3D[i].destroy();
                sparks3D.splice(i, 1);
            }
        }

        // 5. Cập nhật Sóng Xung Kích 3D
        for (let i = shockwaves3D.length - 1; i >= 0; i--) {
            if (!shockwaves3D[i].update()) {
                shockwaves3D[i].destroy();
                shockwaves3D.splice(i, 1);
            }
        }

        // 6. Cập nhật Tên Lửa Pháo Hoa 3D
        for (let i = rockets3D.length - 1; i >= 0; i--) {
            if (!rockets3D[i].update()) {
                rockets3D.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
    }

    initThreeJS();
    animateThree();

    // ----------------------------------------------------------------------
    // 4. BỘ PHÁT NHẠC NỀN NGẪU NHIÊN 1 TRONG 4 BÀI TỪ THƯ MỤC "GRAD MUSIC"
    // ----------------------------------------------------------------------
    const GRAD_MUSIC_PLAYLIST = [
        { title: "Mẹ Ơi Bạn Con Gọi", src: "grad music/me oi ban con goi.mp3" },
        { title: "Nam Định Phố", src: "grad music/nam dinh pho.mp3" },
        { title: "NYC", src: "grad music/nyc.mp3" },
        { title: "Phố Hoa Cải", src: "grad music/pho hoa cai.mp3" }
    ];

    let bgmAudio = null;
    let currentSong = null;

    function initBGM() {
        if (!bgmAudio) {
            bgmAudio = new Audio();
            bgmAudio.preload = 'auto';
            bgmAudio.volume = 0.35; // Giảm âm lượng nhạc nền 50% cho êm dịu

            // Chọn ngẫu nhiên 1 trong 4 bài
            currentSong = GRAD_MUSIC_PLAYLIST[Math.floor(Math.random() * GRAD_MUSIC_PLAYLIST.length)];
            bgmAudio.src = encodeURI(currentSong.src);

            // Khi bài hát kết thúc, tự động chọn ngẫu nhiên bài tiếp theo
            bgmAudio.addEventListener('ended', () => {
                playNextRandomSong();
            });

            bgmAudio.addEventListener('play', () => {
                musicPlaying = true;
                if (muteSlash) muteSlash.style.display = 'none';
                if (musicBtn) {
                    musicBtn.classList.add('playing');
                    musicBtn.setAttribute('title', `Đang phát: ${currentSong ? currentSong.title : 'Nhạc'} 🎵 (Bấm để dừng)`);
                }
            });

            bgmAudio.addEventListener('pause', () => {
                musicPlaying = false;
                if (muteSlash) muteSlash.style.display = 'block';
                if (musicBtn) {
                    musicBtn.classList.remove('playing');
                    musicBtn.setAttribute('title', 'Bật nhạc nền 🎵');
                }
            });

            bgmAudio.addEventListener('error', (e) => {
                console.warn('Lỗi tải file nhạc:', currentSong ? currentSong.src : '', e);
                if (currentSong && currentSong.src.startsWith('grad music/')) {
                    const fallbackSrc = encodeURI('music/' + currentSong.src.replace('grad music/', ''));
                    if (bgmAudio.src !== fallbackSrc) {
                        bgmAudio.src = fallbackSrc;
                        if (musicPlaying) bgmAudio.play().catch(() => {});
                    }
                }
            });
        }
    }

    function playNextRandomSong() {
        if (!bgmAudio) initBGM();
        let nextSong;
        do {
            nextSong = GRAD_MUSIC_PLAYLIST[Math.floor(Math.random() * GRAD_MUSIC_PLAYLIST.length)];
        } while (nextSong === currentSong && GRAD_MUSIC_PLAYLIST.length > 1);

        currentSong = nextSong;
        bgmAudio.src = encodeURI(currentSong.src);
        bgmAudio.play().catch(e => console.log('Autoplay prevented:', e));
    }

    function startBGM() {
        initBGM();
        if (bgmAudio) {
            bgmAudio.play().then(() => {
                musicPlaying = true;
            }).catch(err => {
                console.log('Audio autoplay prevented by browser policy:', err);
            });
        }
    }

    function stopBGM() {
        if (bgmAudio) {
            bgmAudio.pause();
        }
        musicPlaying = false;
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (musicPlaying) {
                stopBGM();
            } else {
                startBGM();
            }
        });
    }

    // ----------------------------------------------------------------------
    // 5. HIỆU ỨNG ÂM THANH XÉ TÚI, FANFARE, WHOOSH FLIP (Web Audio API SFX)
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let masterGain = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTearSound(pitch = 1) {
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * 0.14;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400 * pitch, ctx.currentTime);
            filter.Q.value = 3;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            noise.start();
        } catch (e) { }
    }

    function playVictoryFanfare() {
        try {
            const ctx = getAudioContext();
            const brassNotes = [
                { f: 523.25, t: 0, d: 0.2 },
                { f: 659.25, t: 0.08, d: 0.2 },
                { f: 783.99, t: 0.16, d: 0.2 },
                { f: 1046.50, t: 0.24, d: 0.5 },
                { f: 1318.51, t: 0.35, d: 0.6 }
            ];

            brassNotes.forEach(n => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

                gain.gain.setValueAtTime(0, ctx.currentTime + n.t);
                gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + n.t + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);

                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(ctx.currentTime + n.t);
                osc.stop(ctx.currentTime + n.t + n.d);
            });

            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(160, ctx.currentTime);
            sub.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);
            subGain.gain.setValueAtTime(0.7, ctx.currentTime);
            subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

            sub.connect(subGain);
            subGain.connect(masterGain);
            sub.start(ctx.currentTime);
            sub.stop(ctx.currentTime + 0.6);
        } catch (e) { }
    }

    function playSalvoSound() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.6, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) { }
    }

    function playFlipSound() {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) { }
    }

    // ----------------------------------------------------------------------
    // 5. XỬ LÝ TAP XÉ TÚI MÙ (Blind Bag Rip Interaction)
    // ----------------------------------------------------------------------
    const feedbackTexts = [
        "NICE START! TAP AGAIN!",
        "KEEP GOING!! 🔥",
        "ALMOST THERE!! ✨",
        "SO CLOSE!! 💥",
        "OPENING... 👑"
    ];

    blindBag.addEventListener('click', (e) => {
        if (isTorn) return;

        if (!musicPlaying) {
            getAudioContext();
            startBGM();
        }

        clickCount++;
        const percent = Math.min((clickCount / maxClicks) * 100, 100);
        tapProgress.style.width = percent + '%';

        const clickX = e.clientX || (window.innerWidth / 2);
        const clickY = e.clientY || (window.innerHeight / 2);

        createTapSparks3D(clickX, clickY, clickCount);

        playTearSound(1 + clickCount * 0.25);

        statusText.innerText = feedbackTexts[clickCount - 1] || "KEEP GOING!";

        bagTearGap.style.height = (clickCount * 4.5) + 'px';

        blindBag.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
        void blindBag.offsetWidth;

        if (clickCount <= 2) {
            blindBag.classList.add('shake-light');
        } else if (clickCount <= 4) {
            blindBag.classList.add('shake-medium');
        } else {
            blindBag.classList.add('shake-heavy');
        }

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
        bagTopPiece.classList.add('torn');
        bagBottomPiece.classList.add('torn');

        playVictoryFanfare();
        createGrandCelebration3D();

        magicalFlash.classList.add('flash-active');
        setTimeout(() => {
            magicalFlash.classList.remove('flash-active');
        }, 500);

        setTimeout(() => {
            bagStage.style.display = 'none';
            cardStage.style.display = 'flex';

            cardImage.src = rolledCard.src;
            rarityBadge.innerText = rolledCard.rarity;
            if (photocardName) {
                photocardName.innerText = rolledCard.name;
            }
            applyRandomQuote();

            const cardFrontSide = document.getElementById('card-front-side');
            if (cardFrontSide) {
                cardFrontSide.classList.remove('tier-common', 'tier-rare', 'tier-sr', 'tier-special');
                cardFrontSide.classList.add(`tier-${rolledCard.tier}`);
            }

            saveUnlockedCard(rolledCard.id);
            updateCollectionUI(rolledCard.id);

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

            congratsBanner.classList.add('show-congrats');

            inviteCard.style.transform = 'scale(0.6) translateY(50px) rotate(-8deg)';
            inviteCard.style.opacity = '0';
            inviteCard.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            setTimeout(() => {
                inviteCard.style.transform = 'scale(1) translateY(0) rotate(0deg)';
                inviteCard.style.opacity = '1';
                canTilt = true;
            }, 50);

            setTimeout(() => {
                congratsBanner.classList.remove('show-congrats');
            }, 2500);

            setTimeout(() => {
                flipCard();
            }, 3200);

        }, 400);
    }

    // ----------------------------------------------------------------------
    // 7. LẬT THẺ 3D FLIP & TƯƠNG TÁC TILT + CAMERA PARALLAX
    // ----------------------------------------------------------------------
    window.flipCard = function () {
        isFlipped = !isFlipped;
        cardInnerBox.classList.toggle('is-flipped', isFlipped);
        playFlipSound();
    };

    inviteCard.addEventListener('click', () => {
        flipCard();
    });

    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Three.js Camera Parallax
        if (camera) {
            camera.position.x = mouseX * 2.5;
            camera.position.y = mouseY * 2.5;
            camera.lookAt(0, 0, 0);
        }

        if (!canTilt) return;
        const rect = inviteCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = -(y / rect.height) * 14;
        const rotY = (x / rect.width) * 14;

        inviteCard.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    window.addEventListener('mouseleave', () => {
        if (camera) {
            camera.position.set(0, 0, 28);
            camera.lookAt(0, 0, 0);
        }
        if (!canTilt) return;
        inviteCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if (!e.gamma || !e.beta) return;
            const normX = Math.min(Math.max(e.gamma / 30, -1), 1);
            const normY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);

            if (camera) {
                camera.position.x = normX * 2.5;
                camera.position.y = -normY * 2.5;
                camera.lookAt(0, 0, 0);
            }

            if (!canTilt) return;
            const rotY = Math.min(Math.max(e.gamma / 3, -15), 15);
            const rotX = Math.min(Math.max((e.beta - 45) / 3, -15), 15);
            inviteCard.style.transform = `perspective(1200px) rotateX(${-rotX}deg) rotateY(${rotY}deg)`;
        });
    }
});


