/**
 * localStorage 관리 유틸리티
 * - 빌더 타입별 히스토리 관리
 * - 템플릿 저장/로드/내보내기/불러오기
 */

import { UTMParams, UTMTemplate, BuilderType } from '@/types';

/**
 * 빌더 타입별 히스토리 저장
 */
export function saveHistory(params: UTMParams): void {
    const key = `utm_history_${params.builderType}`;
    const existing = loadHistory(params.builderType);

    // 중복 제거 (동일한 설정은 제외)
    const filtered = existing.filter(
        h => JSON.stringify(h) !== JSON.stringify(params)
    );

    // 최신 항목을 맨 앞에 추가, 최대 5개 유지
    const updated = [params, ...filtered].slice(0, 5);

    localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * 빌더 타입별 히스토리 로드
 */
export function loadHistory(builderType: BuilderType): UTMParams[] {
    const key = `utm_history_${builderType}`;
    const saved = localStorage.getItem(key);

    if (!saved) return [];

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

/**
 * 템플릿 저장
 */
export function saveTemplate(params: UTMParams, templateName: string): void {
    const templates = loadTemplates();

    const newTemplate: UTMTemplate = {
        ...params,
        id: `template_${Date.now()}`,
        templateName,
    };

    const updated = [...templates, newTemplate];
    localStorage.setItem('utm_templates', JSON.stringify(updated));
}

/**
 * 템플릿 목록 로드
 */
export function loadTemplates(): UTMTemplate[] {
    const saved = localStorage.getItem('utm_templates');

    if (!saved) return [];

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

/**
 * 템플릿 삭제
 */
export function deleteTemplate(id: string): void {
    const templates = loadTemplates();
    const updated = templates.filter(t => t.id !== id);
    localStorage.setItem('utm_templates', JSON.stringify(updated));
}

/**
 * 템플릿 JSON 파일로 내보내기
 */
export function exportTemplate(template: UTMTemplate): void {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `utm_template_${template.templateName}_${Date.now()}.json`;
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * JSON 파일에서 템플릿 불러오기
 */
export function importTemplate(file: File): Promise<UTMTemplate> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const template = JSON.parse(content) as UTMTemplate;

                // 기본 검증
                if (!template.builderType || !template.date) {
                    reject(new Error('유효하지 않은 템플릿 파일입니다.'));
                    return;
                }

                resolve(template);
            } catch (error) {
                reject(new Error('JSON 파싱 오류'));
            }
        };

        reader.onerror = () => {
            reject(new Error('파일 읽기 오류'));
        };

        reader.readAsText(file);
    });
}

/**
 * 모든 템플릿을 하나의 JSON 파일로 내보내기
 */
export function exportAllTemplates(): void {
    const templates = loadTemplates();

    if (templates.length === 0) {
        throw new Error('저장된 템플릿이 없습니다.');
    }

    const json = JSON.stringify(templates, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `utm_templates_all_${Date.now()}.json`;
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
