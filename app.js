// --- 1. Trae 风格背景动效 (空气里的数字微光) ---
function initCanvas() {
    const canvas = document.getElementById('traeCanvas');
    const ctx = canvas.getContext('2d');
    let dots = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDots();
    }

    function initDots() {
        dots = [];
        const spacing = 45; // 稀疏分布
        for (let x = 0; x < canvas.width; x += spacing) {
            for (let y = 0; y < canvas.height; y += spacing) {
                // 仅保留极少部分点阵活跃
                if (Math.random() > 0.92) {
                    dots.push({
                        x: x,
                        y: y,
                        opacity: 0,
                        targetOpacity: Math.random() * 0.4,
                        speed: 0.002 + Math.random() * 0.005 // 极慢的渐变
                    });
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        dots.forEach(dot => {
            // 离散闪烁逻辑
            if (Math.abs(dot.opacity - dot.targetOpacity) < 0.01) {
                dot.targetOpacity = Math.random() * 0.4;
            }
            dot.opacity += (dot.targetOpacity - dot.opacity) * dot.speed;

            ctx.fillStyle = `rgba(212, 175, 55, ${dot.opacity})`;
            ctx.fillRect(dot.x, dot.y, 2, 2); // 2px 精密点阵
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}

// --- 2. 智能合约与 UI 交互逻辑 ---
let provider, signer, contract, userAddress;

const UI = {
    connectBtn: document.getElementById('connectBtn'),
    soldStatus: document.getElementById('soldStatus'),
    purchaseBtn: document.getElementById('purchaseBtn'),
    claimVaultBtn: document.getElementById('claimVaultBtn'),
    claimRefBtn: document.getElementById('claimRefBtn'),
    pendingVault: document.getElementById('pendingVault'),
    pendingRef: document.getElementById('pendingRef'),
    myReferralCode: document.getElementById('myReferralCode'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    checkUpgradeBtn: document.getElementById('checkUpgradeBtn'),
    modal: document.getElementById('modal'),
    modalText: document.getElementById('modalText'),
    modalClose: document.getElementById('modalClose'),
    agentIdInput: document.getElementById('agentId'),
    tweetTemplate: document.getElementById('tweetTemplate'),
    copyTweetBtn: document.getElementById('copyTweetBtn'),
    
    // 视图切换相关
    landingView: document.getElementById('landingView'),
    appView: document.getElementById('appView'),
    launchAppBtn: document.getElementById('launchAppBtn'),
    launchAppBtn2: document.getElementById('launchAppBtn2'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),
    
    // Dashboard 新增元素
    soldStatusText: document.getElementById('soldStatusText'),
    soldProgressBar: document.getElementById('soldProgressBar'),
    purchaseFormArea: document.getElementById('purchaseFormArea'),
    purchasedSuccessArea: document.getElementById('purchasedSuccessArea'),
    twitterGuideArea: document.getElementById('twitterGuideArea'),
    referralCountText: document.getElementById('referralCountText'),
    referralProgressBar: document.getElementById('referralProgressBar'),
    upgradeStatusText: document.getElementById('upgradeStatusText'),
    upgradeHintText: document.getElementById('upgradeHintText'),
    
    // Agent ID 验证
    agentIdStatus: document.getElementById('agentIdStatus'),
    
    // 邀请记录
    toggleHistoryBtn: document.getElementById('toggleHistoryBtn'),
    historyChevron: document.getElementById('historyChevron'),
    historyListContainer: document.getElementById('historyListContainer'),
    referralList: document.getElementById('referralList')
};

// --- 国际化 (i18n) 逻辑 ---
const i18nData = {
    zh: {
        navHome: "首页", navProduct: "产品", navEcosystem: "生态", navDocs: "文档",
        launchApp: "Launch App ↗", watchDemo: "观看演示",
        heroSub: "你的社交 Agent，连接链上支付", heroDesc: "将你的社交影响力转化为真实的链上收益。",
        feat1Desc: "链上身份", feat2Desc: "社交连接", feat3Desc: "链上支付", feat4Desc: "生态奖励",
        // 操作页面新增
        connect_wallet: "连接钱包",
        global_nodes: "全球节点抢购进度",
        app_title: "获取节点资格",
        inviter_label: "邀请码 (选填)",
        inviter_placeholder: "输入邀请人的 6 位代码",
        agent_id_label: "Agent ID (必填)",
        agent_id_placeholder: "例如: bob.ai",
        agent_id_hint: "请输入您在币安生态拥有的 .ai 域名。",
        social_verify: "社交身份验证",
        step_1_desc: "复制以下专属口令，前往推特公开发布：",
        copy_btn: "复制",
        step_2_desc: "粘贴您发布的推文链接 (点击推文的 Share -> Copy link)：",
        tweet_link_placeholder: "例如: https://x.com/username/status/123456...",
        buy_btn: "验证并购买 (0.05 BNB)",
        success_title: "您已成功激活节点",
        success_desc: "您的社交身份已绑定，现在可以开始邀请好友并赚取分红。",
        your_code: "您的专属邀请码",
        my_assets: "我的收益",
        vault_reward: "待领金库奖励 (保底 + 高阶)",
        ref_reward: "待领邀请佣金 (1%)",
        claim_btn: "提取",
        fission_status: "高阶奖励解锁进度",
        invite_progress: "已邀请人数",
        vault_status: "全局金库状态",
        not_upgraded: "等待市值达标",
        upgraded: "已升级 (高阶奖励已解锁)",
        check_upgrade: "检查升级",
        upgrade_hint: "等待代币上线 DEX 升级奖池",
        sold_status: "{sold} / 777",
        invite_count: "{count} / 3",
        view_history: "查看我的邀请记录",
        loading_history: "加载中...",
        no_history: "暂无邀请记录，快去分享吧！"
    },
    en: {
        navHome: "Home", navProduct: "Product", navEcosystem: "Ecosystem", navDocs: "Docs",
        launchApp: "Launch App ↗", watchDemo: "Watch Demo",
        heroSub: "Your Social Agent for On-Chain Payments", heroDesc: "Turn your social influence into real on-chain yields.",
        feat1Desc: "On-chain ID", feat2Desc: "Social Connect", feat3Desc: "On-chain Pay", feat4Desc: "Eco Rewards",
        // 操作页面新增
        connect_wallet: "Connect Wallet",
        global_nodes: "Global Nodes Progress",
        app_title: "Get Node Qualification",
        inviter_label: "Invite Code (Optional)",
        inviter_placeholder: "Enter 6-digit code",
        agent_id_label: "Agent ID (Required)",
        agent_id_placeholder: "e.g. bob.ai",
        agent_id_hint: "Please enter your .ai domain owned in Binance ecosystem.",
        social_verify: "Social Identity Verification",
        step_1_desc: "Copy the exclusive phrase below and post it publicly on X (Twitter):",
        copy_btn: "Copy",
        step_2_desc: "Paste your tweet link (Click Share -> Copy link on your tweet):",
        tweet_link_placeholder: "e.g. https://x.com/username/status/123456...",
        buy_btn: "Verify & Purchase (0.05 BNB)",
        success_title: "Node Activated Successfully",
        success_desc: "Your social identity is bound. Start inviting friends to earn dividends.",
        your_code: "Your Exclusive Invite Code",
        my_assets: "My Yields",
        vault_reward: "Pending Vault Rewards (Base + High-Tier)",
        ref_reward: "Pending Referral Rewards (1%)",
        claim_btn: "Claim",
        fission_status: "High-Tier Unlock Progress",
        invite_progress: "Invited Users",
        vault_status: "Global Vault Status",
        not_upgraded: "Waiting for Market Cap",
        upgraded: "Upgraded (High-Tier Unlocked)",
        check_upgrade: "Check Upgrade",
        upgrade_hint: "Waiting for token to launch on DEX to upgrade pool",
        sold_status: "{sold} / 777",
        invite_count: "{count} / 3",
        view_history: "View My Referrals",
        loading_history: "Loading...",
        no_history: "No referrals yet. Start sharing!"
    }
};

let currentLang = localStorage.getItem('lang') || 'zh';

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[lang][key]) {
            el.innerText = i18nData[lang][key];
        }
    });
    
    // 处理 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18nData[lang][key]) {
            el.placeholder = i18nData[lang][key];
        }
    });

    const toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) {
        toggleBtn.innerText = lang === 'zh' ? 'EN' : '中文';
    }
    
    // 如果已经加载了数据，重新渲染动态文本
    if (contract && userAddress) {
        loadData();
    }
}

document.getElementById('langToggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
});

// 初始化语言
applyLanguage(currentLang);

// --- 视图切换逻辑 ---
function switchView(viewId) {
    UI.landingView.classList.remove('active');
    UI.appView.classList.remove('active');
    
    if (viewId === 'app') {
        UI.appView.classList.add('active');
    } else {
        UI.landingView.classList.add('active');
    }
}

UI.launchAppBtn?.addEventListener('click', () => switchView('app'));
UI.launchAppBtn2?.addEventListener('click', () => switchView('app'));
UI.backToHomeBtn?.addEventListener('click', () => switchView('landing'));

function showModal(msg) {
    UI.modalText.innerText = msg;
    UI.modal.classList.remove('hidden');
}

UI.modalClose.addEventListener('click', () => {
    UI.modal.classList.add('hidden');
});

async function initWeb3() {
    // 检查是否安装了任何以太坊兼容钱包
    if (typeof window.ethereum !== 'undefined') {
        
        // 处理多钱包冲突 (例如同时安装了 MetaMask, OKX, Bitget 等)
        // 很多钱包会注入 window.ethereum，但 MetaMask 会额外注入 window.ethereum.isMetaMask
        let providerToUse = window.ethereum;

        // 如果存在 providers 数组 (EIP-6963 或多钱包注入的常见模式)
        if (window.ethereum.providers?.length) {
            // 优先寻找 MetaMask
            const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
            if (metamaskProvider) {
                providerToUse = metamaskProvider;
            }
        }

        provider = new ethers.providers.Web3Provider(providerToUse);
        
        UI.connectBtn.addEventListener('click', async () => {
            try {
                // 请求连接钱包
                const accounts = await providerToUse.request({ method: 'eth_requestAccounts' });
                userAddress = accounts[0];
                signer = provider.getSigner();
                contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.ABI, signer);
                
                UI.connectBtn.innerText = userAddress.substring(0, 6) + "..." + userAddress.substring(38);
                updateTweetTemplate();
                await loadData();

                // 监听账户切换
                providerToUse.on('accountsChanged', (newAccounts) => {
                    if (newAccounts.length > 0) {
                        userAddress = newAccounts[0];
                        UI.connectBtn.innerText = userAddress.substring(0, 6) + "..." + userAddress.substring(38);
                        updateTweetTemplate();
                        loadData();
                    } else {
                        // 用户断开了连接
                        window.location.reload();
                    }
                });

                // 监听网络切换
                providerToUse.on('chainChanged', () => {
                    window.location.reload();
                });

            } catch (error) {
                console.error(error);
                showModal("连接钱包失败或被拒绝");
            }
        });
    } else {
        showModal("未检测到 Web3 钱包，请安装 MetaMask");
    }
}

async function loadData() {
    if (!contract) return;
    try {
        // 读取全局状态
        const sold = await contract.totalQualificationsSold();
        const maxSold = 777;
        UI.soldStatusText.innerText = i18nData[currentLang].sold_status.replace('{sold}', sold.toString());
        UI.soldProgressBar.style.width = `${(sold.toNumber() / maxSold) * 100}%`;
        
        const isUpgraded = await contract.isUpgraded();
        if (isUpgraded) {
            UI.upgradeStatusText.innerText = i18nData[currentLang].upgraded;
            UI.upgradeStatusText.style.color = "#10B981";
            UI.checkUpgradeBtn.style.display = "none";
            if (UI.upgradeHintText) UI.upgradeHintText.style.display = "none";
        } else {
            UI.upgradeStatusText.innerText = i18nData[currentLang].not_upgraded;
            if (UI.upgradeHintText) UI.upgradeHintText.style.display = "flex";
        }

        // 读取用户状态
        let userInfo;
        try {
            userInfo = await contract.users(userAddress);
            console.log("=== 调试信息：从合约读取到的用户信息 ===");
            console.log("hasPurchased:", userInfo.hasPurchased);
            console.log("myReferralCode:", userInfo.myReferralCode);
            console.log("========================================");
        } catch (e) {
            console.warn("无法读取用户状态，可能合约未初始化或地址错误", e);
            // 如果读取失败，强制显示购买表单
            UI.purchaseFormArea.classList.remove('hidden');
            UI.purchasedSuccessArea.classList.add('hidden');
            return;
        }
        
        // 计算待领奖励 (格式化为 BNB，保留 3 位小数)
        const pendingVaultTotal = userInfo.pendingInitial.add(userInfo.pendingHighTier);
        const formattedVault = parseFloat(ethers.utils.formatEther(pendingVaultTotal)).toFixed(3);
        const formattedRef = parseFloat(ethers.utils.formatEther(userInfo.pendingReferral)).toFixed(3);
        
        UI.pendingVault.innerText = formattedVault;
        UI.pendingRef.innerText = formattedRef;
        
        // 更新邀请进度
        const refCount = userInfo.referralCount.toNumber();
        UI.referralCountText.innerText = i18nData[currentLang].invite_count.replace('{count}', refCount);
        UI.referralProgressBar.style.width = `${Math.min((refCount / 3) * 100, 100)}%`;

        // 严格判断是否已购买 (必须是布尔值 true)
        if (userInfo.hasPurchased === true) {
            // 隐藏购买表单，显示成功状态 (使用内联样式确保生效)
            UI.purchaseFormArea.style.display = 'none';
            UI.purchasedSuccessArea.style.display = 'block';
            
            // 展示邀请码 (将 bytes3 转换为字符串)
            if (userInfo.myReferralCode && userInfo.myReferralCode !== "0x000000") {
                // 去除 0x 前缀并转换为 ASCII
                const hexCode = userInfo.myReferralCode.substring(2);
                let asciiCode = '';
                for (let i = 0; i < hexCode.length; i += 2) {
                    const charCode = parseInt(hexCode.substr(i, 2), 16);
                    if (charCode > 0) asciiCode += String.fromCharCode(charCode);
                }
                // 如果解析出来为空，直接显示 hex
                UI.myReferralCode.innerText = asciiCode || userInfo.myReferralCode;
            } else {
                UI.myReferralCode.innerText = "未生成";
            }
            
            // 如果已购买，尝试加载邀请记录
            if (refCount > 0) {
                loadReferralHistory();
            } else {
                UI.referralList.innerHTML = `<li style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">${i18nData[currentLang].no_history}</li>`;
            }
            
        } else {
            // 确保未购买时显示购买表单，隐藏成功状态 (使用内联样式确保生效)
            UI.purchaseFormArea.style.display = 'block';
            UI.purchasedSuccessArea.style.display = 'none';
        }
    } catch (error) {
        console.error("读取数据失败", error);
    }
}

// --- 邀请记录查询逻辑 ---
let isHistoryLoaded = false;

UI.toggleHistoryBtn?.addEventListener('click', () => {
    const isHidden = UI.historyListContainer.style.display === 'none';
    if (isHidden) {
        UI.historyListContainer.style.display = 'block';
        UI.historyChevron.style.transform = 'rotate(180deg)';
        if (!isHistoryLoaded && contract && userAddress) {
            loadReferralHistory();
        }
    } else {
        UI.historyListContainer.style.display = 'none';
        UI.historyChevron.style.transform = 'rotate(0deg)';
    }
});

async function loadReferralHistory() {
    if (!contract || !userAddress) return;
    
    try {
        UI.referralList.innerHTML = `<li style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">${i18nData[currentLang].loading_history}</li>`;
        
        // 查询 QualificationPurchased 事件
        // event QualificationPurchased(address indexed user, address indexed inviter, bytes3 inviterCode, string agentId);
        const filter = contract.filters.QualificationPurchased(null, userAddress);
        
        // 注意：在生产环境中，如果区块跨度太大，可能需要分段查询或使用 The Graph
        // 这里为了 MVP 演示，直接查询最近的 10000 个区块
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); 
        
        const events = await contract.queryFilter(filter, fromBlock, "latest");
        
        if (events.length === 0) {
            UI.referralList.innerHTML = `<li style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">${i18nData[currentLang].no_history}</li>`;
            isHistoryLoaded = true;
            return;
        }
        
        // 渲染列表
        let html = '';
        // 倒序排列，最新的在最上面
        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i];
            const invitedUser = event.args.user;
            const agentId = event.args.agentId;
            
            const shortAddress = invitedUser.substring(0, 6) + "..." + invitedUser.substring(38);
            
            html += `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 24px; height: 24px; background: rgba(0,82,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <span style="font-size: 0.9rem; color: var(--text-main); font-family: monospace;">${shortAddress}</span>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); background: #F8F9FA; padding: 2px 8px; border-radius: 100px;">${agentId}</span>
                </li>
            `;
        }
        
        UI.referralList.innerHTML = html;
        isHistoryLoaded = true;
        
    } catch (error) {
        console.error("查询邀请记录失败:", error);
        UI.referralList.innerHTML = `<li style="font-size: 0.85rem; color: #EF4444; text-align: center; padding: 1rem 0;">查询失败，请稍后重试</li>`;
    }
}

// 动态更新推文模板并验证 Agent ID
let agentIdCheckTimeout;
async function updateTweetTemplate() {
    if (!userAddress) {
        UI.tweetTemplate.innerText = "请先连接钱包";
        return;
    }
    const agentId = UI.agentIdInput.value.trim();
    
    // 重置状态
    if (UI.agentIdStatus) {
        UI.agentIdStatus.style.display = 'none';
    }
    UI.agentIdInput.style.borderColor = 'var(--border-color)';
    UI.purchaseBtn.disabled = false;

    if (agentId) {
        UI.tweetTemplate.innerText = `PAYFI Agent: ${userAddress.toLowerCase()} ${agentId}`;
        UI.twitterGuideArea.style.opacity = "1"; // 输入 Agent ID 后高亮推特引导区
        
        // 防抖处理：用户停止输入 500ms 后进行链上查询
        clearTimeout(agentIdCheckTimeout);
        agentIdCheckTimeout = setTimeout(async () => {
            if (!UI.agentIdStatus || !provider) return;
            
            // 1. 格式校验
            if (!agentId.toLowerCase().endsWith('.ai')) {
                UI.agentIdStatus.style.display = 'flex';
                UI.agentIdStatus.style.color = '#EF4444'; // Red
                UI.agentIdStatus.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Agent ID 必须以 .ai 结尾`;
                UI.agentIdInput.style.borderColor = '#EF4444';
                UI.purchaseBtn.disabled = true;
                return;
            }

            // 2. 链上所有权校验 (调用 Space ID Resolver)
            if (CONFIG.SPACE_ID_RESOLVER_ADDRESS !== "0x0000000000000000000000000000000000000000") {
                try {
                    UI.agentIdStatus.style.display = 'flex';
                    UI.agentIdStatus.style.color = 'var(--text-muted)';
                    UI.agentIdStatus.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 正在验证域名所有权...`;
                    UI.purchaseBtn.disabled = true;

                    const spaceIdContract = new ethers.Contract(CONFIG.SPACE_ID_RESOLVER_ADDRESS, CONFIG.SPACE_ID_ABI, provider);
                    
                    // 计算 namehash (使用 ethers.js 内置方法)
                    const node = ethers.utils.namehash(agentId);
                    const ownerAddress = await spaceIdContract.addr(node);

                    if (ownerAddress.toLowerCase() === userAddress.toLowerCase()) {
                        UI.agentIdStatus.style.color = '#10B981'; // Green
                        UI.agentIdStatus.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 域名验证通过`;
                        UI.agentIdInput.style.borderColor = '#10B981';
                        UI.purchaseBtn.disabled = false;
                    } else {
                        UI.agentIdStatus.style.color = '#EF4444'; // Red
                        UI.agentIdStatus.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> 该域名不属于当前连接的钱包`;
                        UI.agentIdInput.style.borderColor = '#EF4444';
                        UI.purchaseBtn.disabled = true;
                    }
                } catch (error) {
                    console.error("Space ID 解析失败", error);
                    UI.agentIdStatus.style.color = '#EF4444';
                    UI.agentIdStatus.innerHTML = `验证失败，请检查网络或稍后重试`;
                }
            } else {
                // 如果未配置解析器地址，仅提示格式正确
                UI.agentIdStatus.style.display = 'flex';
                UI.agentIdStatus.style.color = '#10B981';
                UI.agentIdStatus.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 格式正确 (测试网暂未开启链上校验)`;
                UI.agentIdInput.style.borderColor = '#10B981';
            }
            
        }, 500);

    } else {
        UI.tweetTemplate.innerText = `PAYFI Agent: ${userAddress.toLowerCase()} <您的AgentID>`;
        UI.twitterGuideArea.style.opacity = "0.5";
    }
}

UI.agentIdInput.addEventListener('input', updateTweetTemplate);

// 复制推文模板
UI.copyTweetBtn.addEventListener('click', () => {
    const text = UI.tweetTemplate.innerText;
    if (text && !text.includes("请先连接钱包")) {
        navigator.clipboard.writeText(text).then(() => {
            showModal("推文内容已复制，请前往推特发布");
        });
    } else {
        showModal("请先连接钱包并输入 Agent ID");
    }
});

// 购买逻辑
UI.purchaseBtn.addEventListener('click', async () => {
    if (!contract) return showModal("请先连接钱包");
    
    const inviterCodeStr = document.getElementById('inviterCode').value.trim();
    const agentId = document.getElementById('agentId').value.trim();
    const tweetId = document.getElementById('tweetId').value.trim();

    if (!agentId) return showModal("请输入 Agent ID");
    if (!tweetId) return showModal("请输入推文 ID");

    // 处理邀请码 (转换为 bytes3)
    let inviterCodeBytes = "0x000000";
    if (inviterCodeStr.length > 0) {
        inviterCodeBytes = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(inviterCodeStr)).substring(0, 8);
        if (inviterCodeBytes.length < 8) inviterCodeBytes = inviterCodeBytes.padEnd(8, '0');
    }

    const expectedSubstring = `PAYFI Agent: ${userAddress.toLowerCase()} ${agentId}`;
    
    UI.purchaseBtn.innerText = "正在获取推特验证签名...";
    UI.purchaseBtn.disabled = true;

    let proof, signature;

    try {
        // 调用 FLAP 官方 Oracle API 获取真实签名
        const response = await fetch(`https://verifyx.taxed.fun/prove?chain_id=${CONFIG.CHAIN_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tweet_id: tweetId,
                substring: expectedSubstring
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "推特验证失败，请检查推文内容和 ID");
        }

        const data = await response.json();
        
        proof = {
            tweetId: data.tweet_id,
            xHandle: data.x_handle,
            xId: data.x_id,
            substring: data.substring
        };
        signature = data.signature;

    } catch (error) {
        console.error("Oracle Error:", error);
        showModal(error.message);
        UI.purchaseBtn.innerText = "购买资格 (0.05 BNB)";
        UI.purchaseBtn.disabled = false;
        return;
    }

    try {
        UI.purchaseBtn.innerText = "交易确认中...";
        const tx = await contract.purchaseAndApply(
            inviterCodeBytes, 
            agentId, 
            proof, 
            signature, 
            { value: ethers.utils.parseEther("0.05") }
        );
        await tx.wait();
        showModal("购买成功！");
        loadData();
    } catch (error) {
        console.error(error);
        showModal("交易失败或被拒绝");
        UI.purchaseBtn.innerText = "购买资格 (0.05 BNB)";
        UI.purchaseBtn.disabled = false;
    }
});

// 提取金库奖励
UI.claimVaultBtn.addEventListener('click', async () => {
    if (!contract) return;
    try {
        const originalText = UI.claimVaultBtn.innerText;
        UI.claimVaultBtn.innerText = "提取中...";
        UI.claimVaultBtn.disabled = true;
        
        const tx = await contract.claimVaultRewards();
        await tx.wait();
        
        showModal("提取成功！");
        await loadData();
    } catch (error) {
        showModal("提取失败，可能暂无奖励");
    } finally {
        UI.claimVaultBtn.innerText = "提取";
        UI.claimVaultBtn.disabled = false;
    }
});

// 提取邀请奖励
UI.claimRefBtn.addEventListener('click', async () => {
    if (!contract) return;
    try {
        const originalText = UI.claimRefBtn.innerText;
        UI.claimRefBtn.innerText = "提取中...";
        UI.claimRefBtn.disabled = true;
        
        const tx = await contract.claimReferralRewards();
        await tx.wait();
        
        showModal("提取成功！");
        await loadData();
    } catch (error) {
        showModal("提取失败，可能未解锁或暂无奖励");
    } finally {
        UI.claimRefBtn.innerText = "提取";
        UI.claimRefBtn.disabled = false;
    }
});

// 复制邀请码
UI.copyCodeBtn?.addEventListener('click', () => {
    const code = UI.myReferralCode.innerText;
    if (code && code !== "未生成") {
        navigator.clipboard.writeText(code).then(() => {
            const originalText = UI.copyCodeBtn.innerText;
            UI.copyCodeBtn.innerText = "已复制!";
            setTimeout(() => {
                UI.copyCodeBtn.innerText = originalText;
            }, 2000);
        });
    }
});

// 检查并升级金库
UI.checkUpgradeBtn?.addEventListener('click', async () => {
    if (!contract) return showModal("请先连接钱包");
    try {
        const isUpgraded = await contract.isUpgraded();
        if (isUpgraded) {
            return showModal("金库已经处于升级状态");
        }
        
        const originalText = UI.checkUpgradeBtn.innerText;
        UI.checkUpgradeBtn.innerText = "检查中...";
        UI.checkUpgradeBtn.disabled = true;
        
        const tx = await contract.checkAndUpgradePool();
        await tx.wait();
        
        showModal("金库升级成功！高阶奖励已解锁。");
        await loadData();
    } catch (error) {
        console.error(error);
        showModal("升级失败：代币可能尚未迁移至 DEX，或发生其他错误");
    } finally {
        UI.checkUpgradeBtn.innerText = "检查升级";
        UI.checkUpgradeBtn.disabled = false;
    }
});

// 初始化
window.onload = () => {
    initCanvas();
    initWeb3();
};