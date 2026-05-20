// HMVOD VIP Premium Clone Engine
// Dynamic SPA state management, simulated api, and interactive animations

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State Definition
    const state = {
        user: {
            phone: '+380 97 *** ** 42',
            uid: '8493012',
            balance: 15.00,
            vipLevel: 0,
            commissionEarned: 0.00,
            tasksCompleted: 0,
            tasksTotalToday: 5,
            signedInToday: false,
            lotterySpins: 1,
            rechargeTotal: 0.00,
            withdrawTotal: 0.00,
            teamCount: 14,
            teamDeposit: 350.00,
            teamCommission: 42.50
        },
        movies: [
            { id: 1, title: 'Dune: Part Two (2024)', category: 'Sci-Fi / Adventure', rating: 4.8, poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop', commission: 0.40, completed: false },
            { id: 2, title: 'Oppenheimer (2023)', category: 'Biography / Drama', rating: 4.9, poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=300&auto=format&fit=crop', commission: 0.50, completed: false },
            { id: 3, title: 'Interstellar (2014)', category: 'Sci-Fi / Drama', rating: 4.9, poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop', commission: 0.60, completed: false },
            { id: 4, title: 'The Dark Knight (2008)', category: 'Action / Crime', rating: 5.0, poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=300&auto=format&fit=crop', commission: 0.45, completed: false },
            { id: 5, title: 'Spider-Man: Across the Spider-Verse', category: 'Animation / Action', rating: 4.7, poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=300&auto=format&fit=crop', commission: 0.55, completed: false }
        ],
        vipConfig: {
            0: { name: 'VIP 0', cost: 0, maxTasks: 5, multiplier: 1.0 },
            1: { name: 'VIP 1', cost: 50, maxTasks: 10, multiplier: 1.5 },
            2: { name: 'VIP 2', cost: 150, maxTasks: 15, multiplier: 2.2 },
            3: { name: 'VIP 3', cost: 500, maxTasks: 20, multiplier: 3.5 },
            4: { name: 'VIP 4', cost: 1200, maxTasks: 25, multiplier: 5.0 }
        },
        transactions: [
            { id: 'T29481029', type: 'Бонус за реєстрацію', amount: 15.00, status: 'Успішно', date: '2026-05-20 12:00' }
        ],
        grabbedMovie: null
    };

    // 2. DOM Selection Helper
    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    // 3. UI Updater Elements
    function updateUI() {
        // Balances
        $$('.user-balance').forEach(el => {
            animateNumber(el, parseFloat(el.textContent) || 0, state.user.balance, 2, '$');
        });
        
        // Stats on tasks & profiles
        const currentVip = state.vipConfig[state.user.vipLevel];
        
        if ($('#tasks-completed-num')) $('#tasks-completed-num').textContent = `${state.user.tasksCompleted}/${state.user.tasksTotalToday}`;
        if ($('#commission-earned-num')) $('#commission-earned-num').textContent = `$${state.user.commissionEarned.toFixed(2)}`;
        if ($('#vip-level-profile')) $('#vip-level-profile').textContent = currentVip.name;
        if ($('#total-earnings-num')) $('#total-earnings-num').textContent = `$${state.user.commissionEarned.toFixed(2)}`;
        if ($('#invite-code-display')) $('#invite-code-display').value = `https://hmvod.vip/reg?ref=${state.user.uid}`;
        
        // Update VIP levels unlock state cards
        $$('.vip-card').forEach((card, index) => {
            const level = parseInt(card.dataset.level);
            const btn = card.querySelector('.vip-btn');
            
            if (level <= state.user.vipLevel) {
                card.classList.add('unlocked');
                btn.className = 'vip-btn active-btn';
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Активно';
            } else {
                card.classList.remove('unlocked');
                btn.className = 'vip-btn lock';
                btn.innerHTML = `<i class="fas fa-unlock"></i> Розблокувати за $${state.vipConfig[level].cost}`;
            }
        });
    }

    // Smooth Number Animation Counter
    function animateNumber(element, start, end, decimals, prefix = '') {
        let current = start;
        const range = end - start;
        const duration = 800; // ms
        const increment = range / (duration / 16); // ~60fps
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                clearInterval(timer);
                element.textContent = `${prefix}${end.toFixed(decimals)}`;
            } else {
                element.textContent = `${prefix}${current.toFixed(decimals)}`;
            }
        }, 16);
    }

    // 4. Tab Routing Navigation
    const tabs = $$('.tab-item');
    const screens = $$('.app-screen');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetScreen = tab.dataset.screen;
            
            // Switch tabs active classes
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Switch screen active classes with fade transitions
            screens.forEach(screen => {
                screen.classList.remove('active');
                if (screen.id === targetScreen) {
                    screen.classList.add('active');
                }
            });

            // Special initializations based on page
            if (targetScreen === 'tasks') {
                renderMovies();
            }
        });
    });

    // 5. Toast Notification System
    function showToast(message, type = 'success') {
        const container = $('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-times-circle';
        if (type === 'info') icon = 'fa-info-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideInToast 0.3s cubic-bezier(0.1, 0.76, 0.55, 0.94) reverse';
            setTimeout(() => toast.remove(), 290);
        }, 3000);
    }

    // 6. Swiper Banner Carousel Simulation
    let bannerIndex = 0;
    const track = $('.banner-track');
    const dots = $$('.banner-dots .dot');
    
    function slideBanners() {
        bannerIndex = (bannerIndex + 1) % 3;
        if (track) {
            track.style.transform = `translateX(-${bannerIndex * 33.333}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === bannerIndex);
            });
        }
    }
    setInterval(slideBanners, 5000);

    // 7. Simulated Live Profit Feed
    const firstNames = ['Oleksandr', 'Mariia', 'Dmytro', 'Yuliia', 'Andrii', 'Olena', 'Ihor', 'Tetiana', 'Serhii', 'Anna'];
    const lastInitials = ['K.', 'M.', 'P.', 'S.', 'V.', 'Z.', 'L.', 'B.', 'T.', 'O.'];
    const feedContainer = $('.feed-container');

    function generateLiveFeedItem() {
        if (!feedContainer) return;
        
        const name = firstNames[Math.floor(Math.random() * firstNames.length)];
        const initial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
        const vipLevel = Math.floor(Math.random() * 4); // VIP 0 - 3
        const profit = (Math.random() * 12 + 1.25) * (vipLevel + 1); // scalable profit

        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        
        // HTML content
        feedItem.innerHTML = `
            <div class="feed-user">
                <div class="feed-avatar">${name[0]}${initial[0]}</div>
                <div class="feed-details">
                    <h4>${name} ${initial}</h4>
                    <p>Щойно завершив оцінку фільму</p>
                </div>
            </div>
            <div class="feed-profit">
                <div class="profit-amount">+$${profit.toFixed(2)}</div>
                <div class="profit-vip">VIP ${vipLevel}</div>
            </div>
        `;

        feedContainer.prepend(feedItem);

        // Keep maximum 4 items visible in list
        const items = feedContainer.children;
        if (items.length > 4) {
            items[items.length - 1].remove();
        }
    }
    // Initialize a few start items
    for (let i = 0; i < 4; i++) generateLiveFeedItem();
    // Run loop
    setInterval(generateLiveFeedItem, 4000);

    // 8. Task grab and rating mechanics
    function renderMovies() {
        const grid = $('.movies-grid');
        if (!grid) return;
        grid.innerHTML = '';

        state.movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            const currentVip = state.vipConfig[state.user.vipLevel];
            const multiplier = currentVip.multiplier;
            const computedCommission = movie.commission * multiplier;

            card.innerHTML = `
                <div class="movie-poster" style="background-image: url('${movie.poster}')"></div>
                <div class="movie-details">
                    <div>
                        <h3>${movie.title}</h3>
                        <p class="movie-meta"><i class="fas fa-tags"></i> ${movie.category}</p>
                        <p class="movie-meta" style="margin-top: 4px;"><i class="fas fa-star" style="color: var(--gold);"></i> ${movie.rating} / 5</p>
                    </div>
                    <div class="movie-action">
                        <span class="movie-commission">+$${computedCommission.toFixed(2)}</span>
                        <button class="rate-btn ${movie.completed ? 'completed' : ''}" data-id="${movie.id}">
                            ${movie.completed ? '<i class="fas fa-check"></i> Завершено' : 'Оцінити фільм'}
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add rate buttons click listener
        $$('.rate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const movieId = parseInt(btn.dataset.id);
                const movie = state.movies.find(m => m.id === movieId);
                
                if (movie.completed) return;
                
                if (state.user.tasksCompleted >= state.user.tasksTotalToday) {
                    showToast('Ви лімітували сьогоднішні завдання! Підвищте свій VIP.', 'error');
                    return;
                }

                // Show rating modal overlay
                state.grabbedMovie = movie;
                $('#grabbed-movie-title').textContent = movie.title;
                $('#rate-overlay-modal').style.display = 'flex';
            });
        });
    }

    // Grab new random single task button
    const mainGrabBtn = $('#main-grab-btn');
    if (mainGrabBtn) {
        mainGrabBtn.addEventListener('click', () => {
            if (state.user.tasksCompleted >= state.user.tasksTotalToday) {
                showToast('Досягнуто ліміт завдань. Оновіть свій рівень VIP!', 'error');
                return;
            }

            // Find an incomplete movie
            const incompleteMovies = state.movies.filter(m => !m.completed);
            if (incompleteMovies.length === 0) {
                // Reset all to incomplete for simulation longevity
                state.movies.forEach(m => m.completed = false);
            }
            
            const randomMovie = incompleteMovies[Math.floor(Math.random() * incompleteMovies.length)] || state.movies[0];
            
            // Open rating screen instantly
            state.grabbedMovie = randomMovie;
            $('#grabbed-movie-title').textContent = randomMovie.title;
            $('#rate-overlay-modal').style.display = 'flex';
        });
    }

    // Handle Rating Stars Selection
    const stars = $$('.rating-stars i');
    let selectedRating = 5;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val);
            selectedRating = val;
            
            stars.forEach((s, idx) => {
                s.classList.toggle('active', idx < val);
            });
        });
    });

    // Rating Submission Action
    const submitRatingBtn = $('#submit-rating-btn');
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', () => {
            const movie = state.grabbedMovie;
            if (!movie) return;

            // Mark completed
            movie.completed = true;
            
            // Calculate and award commission
            const currentVip = state.vipConfig[state.user.vipLevel];
            const earned = movie.commission * currentVip.multiplier;
            
            state.user.balance += earned;
            state.user.commissionEarned += earned;
            state.user.tasksCompleted += 1;

            // Log Transaction
            state.transactions.unshift({
                id: `T${Math.floor(Math.random() * 90000000) + 10000000}`,
                type: `Комісія за оцінку: ${movie.title.split(' (')[0]}`,
                amount: earned,
                status: 'Успішно',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16)
            });

            // Close modal
            $('#rate-overlay-modal').style.display = 'none';
            
            // Success alert
            showToast(`Кіно оцінено на ${selectedRating}★! Зараховано +$${earned.toFixed(2)}`, 'success');
            
            // Re-render
            updateUI();
            renderMovies();
            renderTransactions();

            // Reset stars select
            selectedRating = 5;
            stars.forEach(s => s.classList.add('active'));
        });
    }

    // Close rating modal
    const closeRatingModal = $('#close-rating-modal');
    if (closeRatingModal) {
        closeRatingModal.addEventListener('click', () => {
            $('#rate-overlay-modal').style.display = 'none';
        });
    }

    // 9. Lucky Wheel Game Logic
    const spinBtn = $('#spin-center-btn');
    const wheel = $('#wheel-canvas');
    let isSpinning = false;

    if (spinBtn && wheel) {
        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            if (state.user.lotterySpins <= 0) {
                showToast('У вас немає безкоштовних обертань!', 'error');
                return;
            }

            isSpinning = true;
            state.user.lotterySpins--;
            $('#spins-left-num').textContent = state.user.lotterySpins;

            // Random angle between 1080 and 2160 degrees
            const degrees = Math.floor(Math.random() * 1080) + 1080;
            wheel.style.transform = `rotate(${degrees}deg)`;

            // Awards configuration based on final angle modulo 360
            const finalAngle = degrees % 360;
            
            setTimeout(() => {
                isSpinning = false;
                
                // Deterministic award calculation (8 slices, each 45deg)
                // Slices: 0: $1.00, 1: Спробуй ще, 2: $5.00, 3: $0.50, 4: VIP 1 Бонус, 5: $2.00, 6: Спробуй ще, 7: $10.00
                const sliceIndex = Math.floor(((360 - finalAngle) % 360) / 45);
                const awards = [
                    { txt: 'Бонус $1.00', amount: 1.00 },
                    { txt: 'Спробуй ще', amount: 0.00 },
                    { txt: 'Бонус $5.00', amount: 5.00 },
                    { txt: 'Бонус $0.50', amount: 0.50 },
                    { txt: 'VIP 1 Бонус', amount: 3.00 },
                    { txt: 'Бонус $2.00', amount: 2.00 },
                    { txt: 'Спробуй ще', amount: 0.00 },
                    { txt: 'Джекпот $10.00', amount: 10.00 }
                ];

                const result = awards[sliceIndex];
                
                if (result.amount > 0) {
                    state.user.balance += result.amount;
                    showToast(`Вітаємо! Ви виграли: ${result.txt}!`, 'success');
                    updateUI();
                    
                    // Transaction Log
                    state.transactions.unshift({
                        id: `L${Math.floor(Math.random() * 90000000) + 10000000}`,
                        type: `Колесо удачі: ${result.txt}`,
                        amount: result.amount,
                        status: 'Успішно',
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    });
                    renderTransactions();
                } else {
                    showToast('На жаль, пустий квиток. Наступного разу пощастить!', 'info');
                }
            }, 6000); // 6s duration match transitions
        });
    }

    // 10. Modals Navigation System (Wallet, Recharge, Withdraw)
    function setupModal(triggerId, modalId, closeClass) {
        const trigger = $(triggerId);
        const modal = $(modalId);
        const close = modal ? modal.querySelector(closeClass) : null;

        if (trigger && modal) {
            trigger.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        }
        if (close && modal) {
            close.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    setupModal('#recharge-menu-btn', '#recharge-modal', '.close-sheet-btn');
    setupModal('#withdraw-menu-btn', '#withdraw-modal', '.close-sheet-btn');
    setupModal('#wheel-action-btn', '#wheel-modal', '.close-sheet-btn');
    setupModal('#sign-action-btn', '#sign-modal', '.close-sheet-btn');
    setupModal('#kyc-menu-btn', '#kyc-modal', '.close-sheet-btn');
    setupModal('#support-menu-btn', '#support-modal', '.close-sheet-btn');

    // Quick access buttons from Home
    setupModal('#home-recharge-btn', '#recharge-modal', '.close-sheet-btn');
    setupModal('#home-withdraw-btn', '#withdraw-modal', '.close-sheet-btn');
    setupModal('#home-lottery-btn', '#wheel-modal', '.close-sheet-btn');
    setupModal('#home-checkin-btn', '#sign-modal', '.close-sheet-btn');

    // VIP upgrade clicks
    $$('.vip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.vip-card');
            const level = parseInt(card.dataset.level);
            
            if (level <= state.user.vipLevel) return; // Already unlocked

            const config = state.vipConfig[level];
            
            if (state.user.balance < config.cost) {
                showToast(`Недостатньо коштів! Необхідно $${config.cost}. Будь ласка, поповніть рахунок.`, 'error');
                // Open recharge modal instantly
                $('#recharge-modal').style.display = 'flex';
            } else {
                state.user.balance -= config.cost;
                state.user.vipLevel = level;
                state.user.tasksTotalToday = config.maxTasks;
                
                showToast(`Вітаємо! Ви успішно перейшли на рівень ${config.name}!`, 'success');
                
                // Transaction Log
                state.transactions.unshift({
                    id: `V${Math.floor(Math.random() * 90000000) + 10000000}`,
                    type: `Активація статусу ${config.name}`,
                    amount: -config.cost,
                    status: 'Успішно',
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                });
                
                updateUI();
                renderTransactions();
            }
        });
    });

    // 11. Transaction forms submit simulations
    // Recharge Form Submit
    const rechargeSubmit = $('#submit-recharge-btn');
    if (rechargeSubmit) {
        rechargeSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            const amountInput = $('#recharge-amount');
            const amount = parseFloat(amountInput.value);

            if (isNaN(amount) || amount <= 0) {
                showToast('Будь ласка, введіть коректну суму.', 'error');
                return;
            }

            // Simulate blockchain validation spinner
            rechargeSubmit.disabled = true;
            rechargeSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Перевірка транзакції...';

            setTimeout(() => {
                state.user.balance += amount;
                state.user.rechargeTotal += amount;
                
                // Add spin reward for deposit
                if (amount >= 50) state.user.lotterySpins += 1;

                // Log Transaction
                state.transactions.unshift({
                    id: `R${Math.floor(Math.random() * 90000000) + 10000000}`,
                    type: 'Поповнення балансу (USDT TRC20)',
                    amount: amount,
                    status: 'Успішно',
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                });

                showToast(`Транзакцію підтверджено! Баланс поповнено на +$${amount.toFixed(2)}`, 'success');
                
                // Reset form
                amountInput.value = '';
                rechargeSubmit.disabled = false;
                rechargeSubmit.textContent = 'Я оплатив';
                $('#recharge-modal').style.display = 'none';

                updateUI();
                renderTransactions();
            }, 2500);
        });
    }

    // Withdraw Form Submit
    const withdrawSubmit = $('#submit-withdraw-btn');
    if (withdrawSubmit) {
        withdrawSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            const amountInput = $('#withdraw-amount');
            const amount = parseFloat(amountInput.value);
            const address = $('#withdraw-address').value;
            const password = $('#withdraw-password').value;

            if (isNaN(amount) || amount <= 0) {
                showToast('Будь ласка, введіть коректну суму.', 'error');
                return;
            }
            if (amount > state.user.balance) {
                showToast('Недостатній баланс для виведення!', 'error');
                return;
            }
            if (!address) {
                showToast('Будь ласка, введіть адресу гаманця.', 'error');
                return;
            }
            if (!password) {
                showToast('Будь ласка, введіть фінансовий пароль.', 'error');
                return;
            }

            // Withdraw animation simulation
            withdrawSubmit.disabled = true;
            withdrawSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Створення запиту...';

            setTimeout(() => {
                state.user.balance -= amount;
                state.user.withdrawTotal += amount;

                // Log Transaction
                state.transactions.unshift({
                    id: `W${Math.floor(Math.random() * 90000000) + 10000000}`,
                    type: 'Виведення коштів (USDT TRC20)',
                    amount: -amount,
                    status: 'В обробці',
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                });

                showToast(`Запит на виведення $${amount.toFixed(2)} надіслано в обробку!`, 'success');
                
                // Reset Form
                amountInput.value = '';
                $('#withdraw-address').value = '';
                $('#withdraw-password').value = '';
                
                withdrawSubmit.disabled = false;
                withdrawSubmit.textContent = 'Вивести кошти';
                $('#withdraw-modal').style.display = 'none';

                updateUI();
                renderTransactions();
            }, 2000);
        });
    }

    // Daily Sign-In button simulation
    const signBtnAction = $('#sign-in-btn-action');
    if (signBtnAction) {
        signBtnAction.addEventListener('click', () => {
            if (state.user.signedInToday) {
                showToast('Ви вже здійснили чекін сьогодні!', 'info');
                return;
            }

            state.user.signedInToday = true;
            state.user.balance += 0.50;
            
            // Transaction Log
            state.transactions.unshift({
                id: `S${Math.floor(Math.random() * 90000000) + 10000000}`,
                type: 'Щоденний Чек-ін',
                amount: 0.50,
                status: 'Успішно',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16)
            });

            showToast('Щоденний бонус +$0.50 нараховано успішно!', 'success');
            
            signBtnAction.textContent = 'Вже підтверджено';
            signBtnAction.style.background = 'rgba(255,255,255,0.05)';
            signBtnAction.style.color = 'var(--text-dark)';
            
            $('#sign-modal').style.display = 'none';
            updateUI();
            renderTransactions();
        });
    }

    // KYC Form Simulation
    const kycSubmit = $('#submit-kyc-btn');
    if (kycSubmit) {
        kycSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            kycSubmit.disabled = true;
            kycSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обробка даних...';

            setTimeout(() => {
                showToast('Ваші документи успішно надіслано на перевірку!', 'success');
                kycSubmit.disabled = false;
                kycSubmit.textContent = 'Надіслати на верифікацію';
                $('#kyc-modal').style.display = 'none';
            }, 2000);
        });
    }

    // Support Form Simulation
    const supportSubmit = $('#submit-support-btn');
    if (supportSubmit) {
        supportSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            const text = $('#support-msg').value;
            if (!text) {
                showToast('Введіть повідомлення.', 'error');
                return;
            }
            
            supportSubmit.disabled = true;
            supportSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Надсилання...';

            setTimeout(() => {
                showToast('Повідомлення надіслано. Менеджер зв\'яжеться з вами найближчим часом!', 'success');
                $('#support-msg').value = '';
                supportSubmit.disabled = false;
                supportSubmit.textContent = 'Зв\'язатися';
                $('#support-modal').style.display = 'none';
            }, 1500);
        });
    }

    // Copy Referral Link mechanics
    const copyLinkBtn = $('#copy-invite-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const input = $('#invite-code-display');
            input.select();
            input.setSelectionRange(0, 99999); // Mobile
            
            navigator.clipboard.writeText(input.value).then(() => {
                showToast('Реферальне посилання скопійовано!', 'success');
            }).catch(() => {
                showToast('Не вдалося скопіювати посилання.', 'error');
            });
        });
    }

    // 12. Render Bills History
    function renderTransactions() {
        const list = $('#bills-history-list');
        if (!list) return;

        list.innerHTML = '';
        state.transactions.forEach(t => {
            const card = document.createElement('div');
            card.className = 'referral-card';
            card.style.padding = '12px 16px';
            card.style.marginBottom = '8px';

            const isPositive = t.amount >= 0;
            const amountText = `${isPositive ? '+' : ''}$${t.amount.toFixed(2)}`;

            card.innerHTML = `
                <div class="referral-header">
                    <div class="referral-level-icon" style="background: ${isPositive ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)'}; color: ${isPositive ? 'var(--green)' : 'var(--red)'}; border-color: transparent;">
                        <i class="fas ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                    </div>
                    <div class="referral-details">
                        <h4 style="font-size:12px;">${t.type}</h4>
                        <p style="font-size:9px;">${t.date} | ID: ${t.id}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: ${isPositive ? 'var(--green)' : 'var(--text-main)'}; font-size:13px; font-family: var(--font-outfit);">${amountText}</div>
                    <div style="font-size: 8px; color: var(--text-muted); margin-top:2px;">${t.status}</div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    // Setup close triggers on overlay click for modals
    $$('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });

    // 13. Initialize App
    updateUI();
    renderTransactions();
});
