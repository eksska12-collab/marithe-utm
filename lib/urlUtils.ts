/**
 * URL 처리 유틸리티
 * - 기존 쿼리스트링 파싱
 * - UTM 파라미터 제거
 * - URL 인코딩
 */

export interface ParsedUrl {
    baseUrl: string;
    params: Record<string, string>;
    hasQuery: boolean;
}

/**
 * URL을 파싱하여 베이스 URL과 쿼리 파라미터로 분리
 */
export function parseUrl(url: string): ParsedUrl {
    const [baseUrl, queryString] = url.split('?');
    const params: Record<string, string> = {};
    let hasQuery = false;

    if (queryString) {
        hasQuery = true;
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });
    }

    return { baseUrl, params, hasQuery };
}

/**
 * 기존 UTM 파라미터 제거
 */
export function removeUTMParams(params: Record<string, string>): Record<string, string> {
    const filtered: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (!key.startsWith('utm_')) {
            filtered[key] = value;
        }
    });

    return filtered;
}

/**
 * 파라미터를 URL 인코딩하여 쿼리스트링으로 변환
 */
export function encodeParams(params: Record<string, string>): string {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

/**
 * UTM 파라미터를 URL에 추가
 */
export function buildUrlWithUTM(
    baseUrl: string,
    utmParams: {
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
        utm_content?: string;
        utm_term?: string;
    }
): string {
    // 기존 URL 파싱
    const parsed = parseUrl(baseUrl);

    // 기존 UTM 파라미터 제거
    const cleanParams = removeUTMParams(parsed.params);

    // 새 UTM 파라미터 추가
    const allParams: Record<string, string> = {
        ...cleanParams,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
    };

    if (utmParams.utm_content) {
        allParams.utm_content = utmParams.utm_content;
    }

    if (utmParams.utm_term) {
        allParams.utm_term = utmParams.utm_term;
    }

    // URL 조합
    const queryString = encodeParams(allParams);
    return `${parsed.baseUrl}?${queryString}`;
}

/**
 * URL이 유효한지 검증
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
