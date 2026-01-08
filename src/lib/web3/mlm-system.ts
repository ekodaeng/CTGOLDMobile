import { supabase } from '../supabaseClient';

export interface BonusLevel {
  level: number;
  amount: number;
}

const BONUS_STRUCTURE: BonusLevel[] = [
  { level: 1, amount: 100 },
  { level: 2, amount: 10 },
  { level: 3, amount: 10 },
  { level: 4, amount: 100 },
  { level: 5, amount: 100 },
  { level: 6, amount: 100 },
  { level: 7, amount: 100 },
  { level: 8, amount: 100 },
  { level: 9, amount: 100 },
  { level: 10, amount: 100 },
];

export async function distributeBonus(newUserId: string): Promise<{
  success: boolean;
  totalDistributed: number;
  distributions: Array<{
    userId: string;
    level: number;
    amount: number;
  }>;
  error?: string;
}> {
  try {
    const { data: newUser, error: userError } = await supabase
      .from('web3_users')
      .select('*')
      .eq('id', newUserId)
      .maybeSingle();

    if (userError || !newUser) {
      return {
        success: false,
        totalDistributed: 0,
        distributions: [],
        error: 'New user not found',
      };
    }

    if (!newUser.is_active) {
      return {
        success: false,
        totalDistributed: 0,
        distributions: [],
        error: 'User is not active (balance < 1000)',
      };
    }

    const distributions: Array<{ userId: string; level: number; amount: number }> = [];
    let totalDistributed = 0;

    let currentUplineId = newUser.upline_id;
    let currentLevel = 1;

    while (currentUplineId && currentLevel <= 10) {
      const { data: upline, error: uplineError } = await supabase
        .from('web3_users')
        .select('*')
        .eq('id', currentUplineId)
        .maybeSingle();

      if (uplineError || !upline) {
        break;
      }

      if (upline.is_active) {
        const bonusAmount = BONUS_STRUCTURE[currentLevel - 1].amount;

        const { error: updateError } = await supabase
          .from('web3_users')
          .update({
            internal_balance: upline.internal_balance + bonusAmount,
            total_earnings: upline.total_earnings + bonusAmount,
          })
          .eq('id', upline.id);

        if (!updateError) {
          await supabase.from('web3_transactions').insert({
            user_id: upline.id,
            amount: bonusAmount,
            type: 'BONUS',
            level_from: currentLevel,
            from_user_id: newUserId,
            description: `Level ${currentLevel} referral bonus from ${newUser.wallet_address.substring(0, 8)}...`,
          });

          const { error: refError } = await supabase
            .from('web3_referrals')
            .upsert(
              {
                user_id: newUserId,
                referrer_id: upline.id,
                level: currentLevel,
                bonus_paid: bonusAmount,
              },
              {
                onConflict: 'user_id,referrer_id',
              }
            );

          if (!refError) {
            distributions.push({
              userId: upline.id,
              level: currentLevel,
              amount: bonusAmount,
            });

            totalDistributed += bonusAmount;
          }
        }
      }

      currentUplineId = upline.upline_id;
      currentLevel++;
    }

    if (newUser.upline_id) {
      await supabase
        .from('web3_users')
        .update({
          total_referrals: supabase.raw('total_referrals + 1'),
        })
        .eq('id', newUser.upline_id);
    }

    return {
      success: true,
      totalDistributed,
      distributions,
    };
  } catch (error) {
    console.error('Error distributing bonus:', error);
    return {
      success: false,
      totalDistributed: 0,
      distributions: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getUserUplineTree(userId: string, maxLevel: number = 10) {
  const uplineTree: Array<{
    level: number;
    userId: string;
    walletAddress: string;
    internalBalance: number;
    isActive: boolean;
  }> = [];

  let currentUplineId: string | null = userId;
  let currentLevel = 0;

  const { data: startUser } = await supabase
    .from('web3_users')
    .select('upline_id')
    .eq('id', userId)
    .maybeSingle();

  if (!startUser || !startUser.upline_id) {
    return uplineTree;
  }

  currentUplineId = startUser.upline_id;
  currentLevel = 1;

  while (currentUplineId && currentLevel <= maxLevel) {
    const { data: upline, error } = await supabase
      .from('web3_users')
      .select('*')
      .eq('id', currentUplineId)
      .maybeSingle();

    if (error || !upline) {
      break;
    }

    uplineTree.push({
      level: currentLevel,
      userId: upline.id,
      walletAddress: upline.wallet_address,
      internalBalance: upline.internal_balance,
      isActive: upline.is_active,
    });

    currentUplineId = upline.upline_id;
    currentLevel++;
  }

  return uplineTree;
}

export async function getUserDownlineTree(userId: string, maxLevel: number = 10) {
  interface DownlineNode {
    level: number;
    userId: string;
    walletAddress: string;
    internalBalance: number;
    isActive: boolean;
    children: DownlineNode[];
  }

  async function buildTree(
    parentId: string,
    currentLevel: number
  ): Promise<DownlineNode[]> {
    if (currentLevel > maxLevel) {
      return [];
    }

    const { data: directReferrals, error } = await supabase
      .from('web3_users')
      .select('*')
      .eq('upline_id', parentId);

    if (error || !directReferrals) {
      return [];
    }

    const nodes: DownlineNode[] = [];

    for (const referral of directReferrals) {
      const children = await buildTree(referral.id, currentLevel + 1);

      nodes.push({
        level: currentLevel,
        userId: referral.id,
        walletAddress: referral.wallet_address,
        internalBalance: referral.internal_balance,
        isActive: referral.is_active,
        children,
      });
    }

    return nodes;
  }

  return buildTree(userId, 1);
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CT';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createWeb3User(
  walletAddress: string,
  uplineReferralCode?: string
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const { data: existingUser } = await supabase
      .from('web3_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (existingUser) {
      return {
        success: true,
        user: existingUser,
      };
    }

    let uplineId: string | null = null;

    if (uplineReferralCode) {
      const { data: upline } = await supabase
        .from('web3_users')
        .select('id')
        .eq('referral_code', uplineReferralCode)
        .maybeSingle();

      if (upline) {
        uplineId = upline.id;
      }
    }

    let referralCode = generateReferralCode();
    let attempts = 0;

    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('web3_users')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (!existing) {
        break;
      }

      referralCode = generateReferralCode();
      attempts++;
    }

    const { data: newUser, error: insertError } = await supabase
      .from('web3_users')
      .insert({
        wallet_address: walletAddress,
        referral_code: referralCode,
        upline_id: uplineId,
        internal_balance: 0,
        is_active: false,
        is_vip: false,
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message,
      };
    }

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error('Error creating web3 user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
