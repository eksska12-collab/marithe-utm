import { UTMParams, UTMResult } from '@/types';

const CSV_HEADER = [
    '구분', 'Date', 'Source', 'Medium', '캠페인', '브랜드', '목표', '이슈', '시즌', '프로모션명', 'UTM캠페인', '소재', 'UTM소재', '랜딩URL', '최종URL'
];

interface RowData {
    type: string;
    date: string;
    source: string;
    medium: string;
    friendlyCampaign: string;
    brand: string;
    objective: string;
    issue: string;
    season: string;
    promotion: string;
    utmCampaign: string;
    materialName: string;
    utmContent: string;
    landingUrl: string;
    finalUrl: string;
}

function getRows(params: UTMParams, result: UTMResult): RowData[] {
    const rows: RowData[] = [];

    Object.entries(result).forEach(([brand, data]) => {
        data.url.forEach((url, idx) => {
            // Split landing URL and query params to get Landing URL
            const landingUrl = url.split('?')[0];

            // Determine material name
            let materialName = '';
            if (params.builderType === 'BS') {
                const bsAreas = ['homelink', 'brandnews', 'mainimage', 'maintext', 'thum1', 'thum2', 'thum3', 'sub1'];
                materialName = bsAreas[idx] || `area_${idx + 1}`;
            } else {
                materialName = `img_${(idx + 1).toString().padStart(2, '0')}`;
            }

            rows.push({
                type: params.builderType,
                date: params.date,
                source: params.medium,
                medium: params.product,
                friendlyCampaign: params.promotion,
                brand: brand,
                objective: params.objective,
                issue: params.issue,
                season: params.season,
                promotion: params.promotion,
                utmCampaign: data.campaign,
                materialName: materialName,
                utmContent: data.content[idx],
                landingUrl: landingUrl,
                finalUrl: url
            });
        });
    });

    return rows;
}

export function generateCSV(params: UTMParams, result: UTMResult): string {
    const rows = getRows(params, result);

    const csvContent = [
        CSV_HEADER.join(','),
        ...rows.map(row => [
            row.type,
            row.date,
            row.source,
            row.medium,
            row.friendlyCampaign,
            row.brand,
            row.objective,
            row.issue,
            row.season,
            row.promotion,
            row.utmCampaign,
            row.materialName,
            row.utmContent,
            row.landingUrl,
            row.finalUrl
        ].map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
}

export function generateExcelText(params: UTMParams, result: UTMResult): string {
    const rows = getRows(params, result);

    const excelContent = [
        CSV_HEADER.join('\t'),
        ...rows.map(row => [
            row.type,
            row.date,
            row.source,
            row.medium,
            row.friendlyCampaign,
            row.brand,
            row.objective,
            row.issue,
            row.season,
            row.promotion,
            row.utmCampaign,
            row.materialName,
            row.utmContent,
            row.landingUrl,
            row.finalUrl
        ].join('\t'))
    ].join('\n');

    return excelContent;
}

export function downloadCSV(content: string, filename: string) {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-16le;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
