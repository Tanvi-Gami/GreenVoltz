export interface OptimizationSummary {
  sessionsOptimized: number;
  costReduction: string;
  carbonReduction: string;
  peakReduction: string;
  requirementsMet: string;
  savings: string;
  carbonAvoided: string;
}

export interface ComparisonMetric {
  label: string;
  current: string;
  optimized: string;
  improvement: string;
}

export interface ScheduleSession {
  id: string;
  ev: string;
  station: string;
  currentWindow: string;
  optimizedWindow: string;
  energyKwh: number;
  status: 'Optimized' | 'Fixed' | 'Completed';
  reason: string;
  savings: string;
  carbonImpact: string;
  departureRequirement: string;
  currentPosition: number;
  optimizedPosition: number;
}

export interface OptimizationDecision {
  title: string;
  detail: string;
  metric: string;
  value: string;
  icon: 'cost' | 'renewable' | 'carbon' | 'peak';
}

export interface OptimizationSignal {
  time: string;
  price: number;
  renewable: number;
  carbon: number;
  demand: number;
  preferred?: boolean;
}

export interface FlexibilitySummary {
  flexibleSessions: number;
  fixedSessions: number;
  flexibleEnergyKwh: number;
  requirementsRespected: string;
}

export interface ActivityItem {
  time: string;
  text: string;
}

export interface OptimizationData {
  summary: OptimizationSummary;
  comparison: ComparisonMetric[];
  schedule: ScheduleSession[];
  decisions: OptimizationDecision[];
  signals: OptimizationSignal[];
  flexibility: FlexibilitySummary;
  activity: ActivityItem[];
}

const schedule: ScheduleSession[] = [
  { id: 'tesla-model-3', ev: 'Tesla Model 3', station: 'GreenVolt Central', currentWindow: '13:00–13:45', optimizedWindow: '14:30–15:15', energyKwh: 31, status: 'Optimized', reason: 'Moved 45 minutes later because renewable availability increases from 61% to 78% while grid carbon intensity decreases.', savings: '₹42', carbonImpact: '1.8 kg avoided', departureRequirement: 'Depart by 16:30', currentPosition: 27, optimizedPosition: 52 },
  { id: 'ioniq-5', ev: 'Hyundai Ioniq 5', station: 'Riverside', currentWindow: '14:00–14:40', optimizedWindow: '15:00–15:40', energyKwh: 36, status: 'Optimized', reason: 'Shifted into the renewable generation peak while preserving the driver departure constraint.', savings: '₹38', carbonImpact: '2.4 kg avoided', departureRequirement: 'Depart by 17:00', currentPosition: 40, optimizedPosition: 60 },
  { id: 'kia-ev6', ev: 'Kia EV6', station: 'Airport', currentWindow: '16:00–16:35', optimizedWindow: '15:30–16:05', energyKwh: 42, status: 'Optimized', reason: 'Started earlier to avoid the evening demand spike at Airport Road.', savings: '₹29', carbonImpact: '1.1 kg avoided', departureRequirement: 'Depart by 16:45', currentPosition: 73, optimizedPosition: 65 },
  { id: 'mg-zs', ev: 'MG ZS EV', station: 'EcoCharge West', currentWindow: '12:30–13:20', optimizedWindow: '14:00–14:50', energyKwh: 28, status: 'Optimized', reason: 'Moved to a lower tariff period with stronger renewable availability.', savings: '₹31', carbonImpact: '1.6 kg avoided', departureRequirement: 'Depart by 16:00', currentPosition: 20, optimizedPosition: 45 },
  { id: 'volvo-xc40', ev: 'Volvo XC40 Recharge', station: 'CityCharge North', currentWindow: '17:00–17:50', optimizedWindow: '16:15–17:05', energyKwh: 39, status: 'Optimized', reason: 'Staggered before the network demand peak without affecting the planned departure.', savings: '₹27', carbonImpact: '1.2 kg avoided', departureRequirement: 'Depart by 18:30', currentPosition: 82, optimizedPosition: 75 },
  { id: 'tata-nexon', ev: 'Tata Nexon EV', station: 'GreenVolt Metro', currentWindow: '15:00–15:35', optimizedWindow: '15:00–15:35', energyKwh: 24, status: 'Fixed', reason: 'Kept in place because the driver departure requirement leaves no scheduling flexibility.', savings: '₹0', carbonImpact: 'No change', departureRequirement: 'Depart by 15:45', currentPosition: 55, optimizedPosition: 55 },
  { id: 'byd-atto', ev: 'BYD Atto 3', station: 'GreenVolt Harbor', currentWindow: '11:30–12:20', optimizedWindow: '14:30–15:20', energyKwh: 34, status: 'Optimized', reason: 'Moved away from a high-carbon midday period into the afternoon renewable peak.', savings: '₹36', carbonImpact: '2.8 kg avoided', departureRequirement: 'Depart by 17:30', currentPosition: 10, optimizedPosition: 52 },
  { id: 'skoda-enyaq', ev: 'Skoda Enyaq', station: 'GreenVolt Central', currentWindow: '18:00–18:45', optimizedWindow: '17:15–18:00', energyKwh: 41, status: 'Optimized', reason: 'Staggered ahead of the evening demand spike to protect network capacity.', savings: '₹24', carbonImpact: '0.9 kg avoided', departureRequirement: 'Depart by 19:00', currentPosition: 90, optimizedPosition: 80 },
  { id: 'renault-kwid', ev: 'Renault Kwid E-Tech', station: 'EcoCharge South', currentWindow: '09:00–09:30', optimizedWindow: '09:00–09:30', energyKwh: 18, status: 'Completed', reason: 'Session completed before the latest optimization cycle.', savings: '₹0', carbonImpact: 'No change', departureRequirement: 'Departed at 10:00', currentPosition: 10, optimizedPosition: 10 },
];

export function getOptimizationData(): OptimizationData {
  return {
    summary: { sessionsOptimized: 24, costReduction: '13.7%', carbonReduction: '30.8%', peakReduction: '18.6%', requirementsMet: '100%', savings: '₹2,920', carbonAvoided: '56 kg' },
    comparison: [
      { label: 'Charging cost', current: '₹21,340', optimized: '₹18,420', improvement: '13.7% lower' },
      { label: 'CO₂ emissions', current: '182 kg', optimized: '126 kg', improvement: '30.8% lower' },
      { label: 'Peak demand', current: '91%', optimized: '74%', improvement: '18.6% lower' },
      { label: 'Average delay', current: '18 min', optimized: '9 min', improvement: '50% lower' },
      { label: 'Renewable energy usage', current: '51%', optimized: '78%', improvement: '+27 pts' },
    ],
    schedule,
    decisions: [
      { title: 'Lower energy cost', detail: '7 flexible sessions shifted to a lower tariff period.', metric: 'Potential savings', value: '₹310', icon: 'cost' },
      { title: 'Higher renewable availability', detail: '5 sessions moved into the afternoon renewable generation peak.', metric: 'Renewable share', value: '+21%', icon: 'renewable' },
      { title: 'Lower grid carbon', detail: '4 sessions shifted away from a high-carbon grid period.', metric: 'CO₂ avoided', value: '18 kg', icon: 'carbon' },
      { title: 'Peak demand balancing', detail: '8 sessions were staggered to prevent a network demand spike.', metric: 'Peak reduction', value: '17%', icon: 'peak' },
    ],
    signals: [
      { time: '06:00', price: 38, renewable: 24, carbon: 58, demand: 22 },
      { time: '09:00', price: 64, renewable: 38, carbon: 72, demand: 48 },
      { time: '12:00', price: 72, renewable: 58, carbon: 76, demand: 64 },
      { time: '15:00', price: 42, renewable: 88, carbon: 38, demand: 46, preferred: true },
      { time: '18:00', price: 91, renewable: 34, carbon: 84, demand: 92 },
      { time: '21:00', price: 68, renewable: 28, carbon: 70, demand: 59 },
    ],
    flexibility: { flexibleSessions: 18, fixedSessions: 6, flexibleEnergyKwh: 412, requirementsRespected: '100%' },
    activity: [
      { time: '14:32', text: '7 sessions shifted to renewable peak.' },
      { time: '14:31', text: 'Central Hub demand forecast updated.' },
      { time: '14:30', text: 'Grid carbon intensity decreased 12%.' },
      { time: '14:29', text: 'Optimizer recalculated 24 charging sessions.' },
      { time: '14:28', text: 'New electricity tariff received.' },
    ],
  };
}

export function runOptimization(): Promise<OptimizationData> {
  return new Promise(resolve => {
    window.setTimeout(() => resolve(getOptimizationData()), 900);
  });
}
