/**
 * 입력값 검증 및 정제 유틸리티
 */

import { UTMParams } from '@/types';

/**
 * 날짜 형식 검증 (YYMMDD)
 */
export function validateDate(date: string): { valid: boolean; message?: string } {
    if (!date) {
        return { valid: false, message: '날짜를 입력해주세요.' };
    }

    if (!/^\d{6}$/.test(date)) {
        return { valid: false, message: 'YYMMDD 형식으로 입력해주세요.' };
    }

    // 날짜 유효성 검증
    const year = parseInt('20' + date.substring(0, 2));
    const month = parseInt(date.substring(2, 4));
    const day = parseInt(date.substring(4, 6));

    if (month < 1 || month > 12) {
        return { valid: false, message: '월은 01-12 사이여야 합니다.' };
    }

    if (day < 1 || day > 31) {
        return { valid: false, message: '일은 01-31 사이여야 합니다.' };
    }

    return { valid: true };
}

/**
 * 프로모션명 정제 (소문자, 특수문자/공백 제거)
 */
export function sanitizePromotion(promotion: string): string {
    return promotion
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // 영문 소문자와 숫자만 허용
}

/**
 * 프로모션명 검증
 */
export function validatePromotion(promotion: string): { valid: boolean; message?: string } {
    if (!promotion) {
        return { valid: true }; // 프로모션명은 선택사항
    }

    const sanitized = sanitizePromotion(promotion);
    if (sanitized !== promotion) {
        return { valid: false, message: '소문자와 숫자만 사용 가능합니다.' };
    }

    return { valid: true };
}

/**
 * 매체별 utm_source/utm_medium 조합 검증
 */
export function validateMediaCombination(
    medium: string,
    product: string
): { valid: boolean; warning?: string } {
    const validCombinations: Record<string, string[]> = {
        meta: ['traffic', 'conversion'],
        google: ['traffic', 'conversion'],
        criteo: ['traffic', 'conversion'],
        naver_sa: ['powerlink_pc', 'powerlink_mo'],
        naver_bsa: ['lite-pc', 'lite-mo'],
    };

    const validProducts = validCombinations[medium];

    if (!validProducts) {
        return { valid: true }; // 알 수 없는 매체는 경고 없이 통과
    }

    if (!validProducts.includes(product)) {
        return {
            valid: false,
            warning: `${medium} 매체는 ${validProducts.join(', ')} 상품만 사용 가능합니다.`,
        };
    }

    return { valid: true };
}

/**
 * 전체 폼 유효성 검증
 */
export function isFormValid(params: UTMParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 날짜 검증
    const dateValidation = validateDate(params.date);
    if (!dateValidation.valid) {
        errors.push(dateValidation.message || '날짜 형식 오류');
    }

    // 프로모션명 검증
    const promotionValidation = validatePromotion(params.promotion);
    if (!promotionValidation.valid) {
        errors.push(promotionValidation.message || '프로모션명 형식 오류');
    }

    // 브랜드 선택 검증
    if (params.brands.length === 0) {
        errors.push('브랜드를 선택해주세요.');
    }

    // URL 모드가 manual일 때 URL 검증
    if (params.urlMode === 'manual' && !params.manualUrl) {
        errors.push('랜딩 URL을 입력해주세요.');
    }

    // 매체 조합 검증
    const mediaValidation = validateMediaCombination(params.medium, params.product);
    if (!mediaValidation.valid && mediaValidation.warning) {
        errors.push(mediaValidation.warning);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
