import { UTMParams, UTMResult } from '@/types';
import { buildUrlWithUTM } from './urlUtils';

const BS_AREAS: Record<string, string> = {
  homelink: 'https://marithe-official.com',
  brandnews: 'https://marithe-official.com/page/welcome-kit.html',
  mainimage: 'https://marithe-official.com/product/list.html?cate_no=1515',
  maintext: 'https://marithe-official.com',
  thum1: 'https://marithe-official.com/product/list.html?cate_no=809',
  thum2: 'https://marithe-official.com/product/list.html?cate_no=810',
  thum3: 'https://marithe-official.com/product/list.html?cate_no=819',
  sub1: 'https://marithe-official.com/product/list.html?cate_no=922'
};

const AUTO_URL_DA: Record<string, string> = {
  MFG: '/collection/detail/',
  KID: '/collection/detail/',
  UND: '/product/list.html?cate_no=1378'
};

const AUTO_URL_SA: Record<string, string> = {
  MFG: '/',
  KID: '?cate_no=811',
  UND: '?cate_no=1378'
};

export function generateUTM(params: UTMParams): UTMResult {
  const {
    date,
    medium,
    product,
    brands,
    objective,
    issue,
    season,
    promotion,
    materialCount,
    builderType,
    urlMode,
    manualUrl
  } = params;

  const result: UTMResult = {};

  brands.forEach(brand => {
    const campaign = `${date}_${brand}_${objective}_${issue}_${season}_${promotion}`;
    const content: string[] = [];
    const urls: string[] = [];

    if (builderType === 'BS') {
      Object.entries(BS_AREAS).forEach(([area, baseUrl]) => {
        const contentStr = `${date}_${brand}_${season}_${promotion}_01_${area}`;
        content.push(contentStr);

        const fullUrl = buildUrlWithUTM(baseUrl, {
          utm_source: medium,
          utm_medium: product,
          utm_campaign: campaign,
          utm_content: contentStr,
        });
        urls.push(fullUrl);
      });
    } else {
      let baseUrl = manualUrl || 'https://marithe-official.com';

      if (urlMode === 'auto') {
        const path = builderType === 'DA'
          ? (AUTO_URL_DA[brand] || '/collection/detail/')
          : (AUTO_URL_SA[brand] || '/');

        baseUrl = `https://marithe-official.com${path.startsWith('/') ? '' : '/'}${path}`;
      }

      // utm_content vs utm_term 결정 (기본값: content)
      const useTermParam = params.utmParamType === 'term';

      for (let i = 1; i <= materialCount; i++) {
        const paramStr = `${date}_${brand}_${season}_${promotion}_img_${i.toString().padStart(2, '0')}`;
        content.push(paramStr);

        const utmParams: any = {
          utm_source: medium,
          utm_medium: product,
          utm_campaign: campaign,
        };

        if (useTermParam) {
          utmParams.utm_term = paramStr;
        } else {
          utmParams.utm_content = paramStr;
        }

        const url = buildUrlWithUTM(baseUrl, utmParams);
        urls.push(url);
      }
    }

    result[brand] = {
      campaign,
      content,
      url: urls
    };
  });

  return result;
}



export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}
