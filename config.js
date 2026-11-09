// 智能合约配置
const CONFIG = {
    // 替换为您部署的 Agent777Vault 金库合约地址 (注意：不是代币地址，是金库合约地址)
    CONTRACT_ADDRESS: "0x005Ec38D51c87eCdC5C6AB9fFEAB239E7A553F80",
    // 目标网络 (BSC Testnet: 97, BSC Mainnet: 56)
    CHAIN_ID: 97, 
    
    // 极简 ABI，仅包含 MVP 需要的接口
    ABI: [
        "function totalQualificationsSold() view returns (uint256)",
        "function isUpgraded() view returns (bool)",
        "function users(address) view returns (bool hasPurchased, bool isHighTierUnlocked, bytes3 myReferralCode, address inviter, uint256 referralCount, uint256 lockedHighTierReward, uint128 lastTweetId, uint256 pendingInitial, uint256 pendingHighTier, uint256 pendingReferral, uint256 claimedInitial, uint256 claimedHighTier, uint256 claimedReferral)",
        "function purchaseAndApply(bytes3 inviterCode, string agentId, tuple(uint128 tweetId, string xHandle, uint128 xId, string substring) proof, bytes signature) payable",
        "function claimVaultRewards()",
        "function claimReferralRewards()",
        "function checkAndUpgradePool()"
    ],

    // Space ID 解析器配置 (用于前端实时校验 .ai 域名所有权)
    // 注意：这里填入 BSC 主网真实的 Space ID Resolver 地址
    SPACE_ID_RESOLVER_ADDRESS: "0x0000000000000000000000000000000000000000", 
    SPACE_ID_ABI: [
        "function addr(bytes32 node) view returns (address)"
    ]
};