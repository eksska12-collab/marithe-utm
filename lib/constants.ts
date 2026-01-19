export const BRANDS = ['MFG', 'KID', 'UND'];
export const OBJECTIVES = ['CV-RT', 'CV-UT', 'TF-RT'];
export const ISSUES = ['RL', 'PR', 'AO'];
export const SEASONS = ['25WI', '26SP', '26SS', '26FW'];

// 매체별 UTM 프리셋
export const MEDIA_PRESETS: Record<string, { source: string; validMediums: string[] }> = {
    meta: { source: 'meta', validMediums: ['traffic', 'conversion'] },
    google: { source: 'google', validMediums: ['traffic', 'conversion'] },
    criteo: { source: 'criteo', validMediums: ['traffic', 'conversion'] },
    naver_sa: { source: 'naver', validMediums: ['powerlink_pc', 'powerlink_mo'] },
    naver_bsa: { source: 'naver', validMediums: ['lite-pc', 'lite-mo'] },
};
