// A protocol's farm plan: six steps, each an action with what it costs and how long it takes.
//
// The plan is derived from the protocol's own record (category, chains, TVL, age), never from a
// hand-written list of names. The same derivation runs in main.ts, so the steps board.json carries
// are the steps the dashboard shows, and in the dashboard, so the detail view can rebuild them.

import type { BoardRow, Snapshot, SnapshotProtocol } from './model.ts';

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The category's main action, in the words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('borrow') || c.includes('collateral')) {
    return `Supply $${capital} of USDC to ${name} on ${chain} and leave it supplied, so the position earns the protocol's own yield.`;
  }
  if (c.includes('dex') || c.includes('amm') || c.includes('swap')) {
    return `Provide $${capital} of liquidity to ${name}'s deepest pool on ${chain} and keep the position open through the next fee cycle.`;
  }
  if (c.includes('leveraged farm') || c.includes('yield')) {
    return `Deposit $${capital} of USDC into ${name}'s highest-yield vault on ${chain} and keep the shares until the position seasons.`;
  }
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) {
    return `Deposit $${capital} of USDC as margin on ${name} on ${chain} and open one small hedged position, then close it the same week.`;
  }
  if (c.includes('bridge') || c.includes('canonical bridge')) {
    return `Bridge $${capital} of USDC to ${chain} through ${name} and put the bridged funds to work in the app it lands in.`;
  }
  if (c.includes('restak') || c.includes('liquid staking') || c.includes('staking')) {
    return `Stake $${capital} of the chain's staking asset through ${name} on ${chain} and keep the liquid receipt in your wallet.`;
  }
  if (c.includes('stable')) {
    return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain} and hold it in the protocol's savings position.`;
  }
  if (c.includes('rwa') || c.includes('real world')) {
    return `Mint $${capital} of ${name}'s yield-bearing asset on ${chain} and hold it, so the position accrues the underlying yield.`;
  }
  if (c.includes('prediction')) {
    return `Fund $${capital} on ${name} and take one small position in a market that settles within the week.`;
  }
  if (c.includes('insurance')) {
    return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy active for the full cover period.`;
  }
  if (c.includes('vault') || c.includes('curator') || c.includes('allocator') || c.includes('aggregator')) {
    return `Deposit $${capital} into a ${name} vault on ${chain} and keep the vault shares, so the position is counted as a depositor.`;
  }
  if (c.includes('payment')) {
    return `Route $${capital} of payments through ${name} on ${chain} and keep a small working balance in the account.`;
  }
  if (c.includes('launchpad') || c.includes('launch')) {
    return `Stake $${capital} with ${name} on ${chain} to qualify for its allocation rounds and take part in the next one.`;
  }
  if (c.includes('gaming') || c.includes('game')) {
    return `Spend $${capital} inside ${name} on ${chain} on the assets the game itself sells, and play at least once a week.`;
  }
  if (c.includes('social')) {
    return `Open an account on ${name} on ${chain}, fund it with $${capital} of the asset it takes, and post or interact once a week.`;
  }
  if (c.includes('ai') || c.includes('compute')) {
    return `Spend $${capital} on ${name}'s compute or agent credits on ${chain} and run at least one job a week.`;
  }
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open, so the protocol counts you as an active user.`;
}

/** The weekly action that keeps a position qualifying, by category. */
function weeklyFor(p: SnapshotProtocol): string {
  const c = (p.category ?? '').toLowerCase();
  if (c.includes('lend') || c.includes('cdp') || c.includes('borrow') || c.includes('collateral')) {
    return `Each week, supply or borrow a small amount so the position shows fresh activity.`;
  }
  if (c.includes('dex') || c.includes('amm') || c.includes('swap')) {
    return `Each week, swap a small amount through the pool so the position shows fresh activity.`;
  }
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) {
    return `Each week, open and close one small position so the account shows fresh activity.`;
  }
  if (c.includes('bridge') || c.includes('canonical bridge')) {
    return `Each week, bridge a small amount onward or back so the route shows fresh activity.`;
  }
  if (c.includes('restak') || c.includes('liquid staking') || c.includes('staking')) {
    return `Each week, top up the stake by a small amount so the position shows fresh activity.`;
  }
  if (c.includes('prediction')) {
    return `Each week, settle or place one small market position so the account shows fresh activity.`;
  }
  if (c.includes('gaming') || c.includes('game') || c.includes('social')) {
    return `Each week, use the app once, so the account shows fresh activity.`;
  }
  return `Each week, make one qualifying action, such as a deposit, a swap, a vote or a claim.`;
}

/**
 * A protocol's farm plan: six steps, each an action with a cost and a time. The plan is derived
 * from the protocol's own record (category, chains, TVL, age), never from a hand-written list.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const action = actionFor(p, capital, chain);
  const weekly = weeklyFor(p);
  return [
    {
      text: `Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline, never in a screenshot or a chat.`,
      cost: 'under $3 of gas for the first transaction',
      time: '5 minutes',
    },
    {
      text: action,
      cost: `$${capital} of capital and about $${capital >= 150 ? 8 : 4} of gas`,
      time: '15 minutes to set up',
    },
    {
      text: weekly,
      cost: 'about $2 of gas a week',
      time: '10 minutes a week',
    },
    {
      text: `Hold the position for at least ${hold} days, so the activity is counted in more than one snapshot and not written off as a one-off.`,
      cost: `the $${capital} stays in the position`,
      time: `${hold} days`,
    },
    {
      text: `Before you withdraw, open the protocol's own points or rewards page and claim only from the link it publishes, never from a link in a chat or a search ad.`,
      cost: 'no fee to check, and never pay to claim',
      time: '10 minutes',
    },
    {
      text: `Write the wallet, the dates and every transaction hash in a farm log, so you can repeat the position, unwind it, or prove it later.`,
      cost: 'nothing but the log',
      time: '5 minutes',
    },
  ];
}

/** Fill every board row's farm_steps from its protocol's own record. */
export function attachFarmSteps(board: BoardRow[], snapshot: Snapshot): void {
  const index = new Map(snapshot.protocols.map((p) => [p.slug, p]));
  for (const row of board) {
    const p = index.get(row.slug);
    if (p === undefined) continue;
    row.farm_steps = farmSteps(p, row.age_days).map(stepText);
  }
}
