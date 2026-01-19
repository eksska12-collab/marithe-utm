'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from "@/hooks/use-toast";
import { generateUTM, getTodayDate } from '@/lib/utmGenerator';
import { generateCSV, generateExcelText, downloadCSV } from '@/lib/csvGenerator';
import { BRANDS, OBJECTIVES, ISSUES, SEASONS } from '@/lib/constants';
import { UTMParams, UTMResult, BuilderType, UTMTemplate } from '@/types';
import {
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const TAB_CONFIG = {
  DA: {
    media: ['meta', 'google', 'criteo'],
    products: ['traffic', 'conversion']
  },
  SA: {
    media: ['naver_sa'],
    products: ['powerlink_pc', 'powerlink_mo']
  },
  BS: {
    media: ['naver_bsa'],
    products: ['lite-pc', 'lite-mo']
  }
};

export default function UTMBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<BuilderType>('DA');
  const [formData, setFormData] = useState<UTMParams>({
    date: getTodayDate(),
    medium: 'meta',
    product: 'traffic',
    brands: ['MFG'],
    objective: 'CV-RT',
    issue: 'RL',
    season: '25WI',
    promotion: '',
    materialCount: 1,
    builderType: 'DA',
    urlMode: 'auto'
  });

  const [result, setResult] = useState<UTMResult | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<{ [key: string]: boolean }>({});
  const [history, setHistory] = useState<UTMParams[]>([]);
  const [templates, setTemplates] = useState<UTMTemplate[]>([]);

  // Load data
  useEffect(() => {
    const savedHistory = localStorage.getItem('utm_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedTemplates = localStorage.getItem('utm_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  // Sync builderType
  useEffect(() => {
    const config = TAB_CONFIG[activeTab];
    setFormData(prev => ({
      ...prev,
      builderType: activeTab,
      medium: config.media[0],
      product: config.products[0]
    }));
  }, [activeTab]);

  const validate = () => {
    if (!/^\d{6}$/.test(formData.date)) {
      toast({ variant: "destructive", title: "날짜 형식 오류", description: "YYMMDD 형식으로 입력해주세요." });
      return false;
    }
    if (formData.promotion && !/^[a-z0-9]+$/.test(formData.promotion)) {
      toast({ variant: "destructive", title: "프로모션명 오류", description: "소문자와 숫자만 가능합니다." });
      return false;
    }
    if (formData.brands.length === 0) {
      toast({ variant: "destructive", title: "브랜드 미선택", description: "브랜드를 선택해주세요." });
      return false;
    }
    if (formData.urlMode === 'manual' && !formData.manualUrl) {
      toast({ variant: "destructive", title: "URL 미입력", description: "URL을 입력해주세요." });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const utmResult = generateUTM(formData);
    setResult(utmResult);

    // History update
    const newHistory = [formData, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(formData))].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('utm_history', JSON.stringify(newHistory));

    toast({ title: "생성 완료", description: "UTM 파라미터가 생성되었습니다." });
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStatus({ ...copiedStatus, [id]: true });
    setTimeout(() => setCopiedStatus({ ...copiedStatus, [id]: false }), 1000);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const content = generateCSV(formData, result);
    downloadCSV(content, `marithe_utm_${formData.date}.csv`);
    toast({ title: "다운로드 시작", description: "CSV 파일이 생성되었습니다." });
  };

  const handleCopyExcel = async () => {
    if (!result) return;
    const content = generateExcelText(formData, result);
    await navigator.clipboard.writeText(content);
    setCopiedStatus({ ...copiedStatus, excel: true });
    setTimeout(() => setCopiedStatus({ ...copiedStatus, excel: false }), 2000);
    toast({ title: "복사 완료", description: "엑셀에 붙여넣기 하세요." });
  };

  const loadTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const { id: _, templateName: __, ...params } = template;
      setFormData(params);
      setActiveTab(params.builderType);
      toast({ title: "로드 완료", description: `${template.templateName} 템플릿을 불러왔습니다.` });
    }
  };

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brand) ? prev.brands.filter(b => b !== brand) : [...prev.brands, brand]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            마리떼 UTM 빌더
          </h1>
          <p className="text-gray-600 mt-1">정확한 UTM 파라미터 생성 도구</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BuilderType)} className="mb-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="DA" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              DA 빌더
            </TabsTrigger>
            <TabsTrigger value="SA" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              SA 빌더
            </TabsTrigger>
            <TabsTrigger value="BS" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              BS 빌더
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Layout: Left Form + Right Result */}
        <div className="grid grid-cols-[900px_1fr] gap-6">

          {/* Left: Input Form */}
          <Card className="bg-white rounded-xl shadow-sm p-6">
            {/* Template & History */}
            <div className="mb-6 flex items-center gap-3">
              <Select onValueChange={loadTemplate}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="템플릿 불러오기" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>저장된 템플릿 없음</SelectItem>
                  ) : (
                    templates.map(t => <SelectItem key={t.id} value={t.id}>{t.templateName}</SelectItem>)
                  )}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex gap-2 flex-1">
                {history.slice(0, 3).map((h, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => { setFormData(h); setActiveTab(h.builderType); }}
                  >
                    {h.date}_{h.brands[0]}
                  </Badge>
                ))}
                {history.length === 0 && <span className="text-xs text-gray-400">최근 기록 없음</span>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 3-Column Grid for Main Inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">작업일 (YYMMDD)</Label>
                  <Input
                    className="h-9"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="260119"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">매체</Label>
                  <Select value={formData.medium} onValueChange={v => setFormData({ ...formData, medium: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TAB_CONFIG[activeTab].media.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">상품</Label>
                  <Select value={formData.product} onValueChange={v => setFormData({ ...formData, product: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TAB_CONFIG[activeTab].products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">목표</Label>
                  <Select value={formData.objective} onValueChange={v => setFormData({ ...formData, objective: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OBJECTIVES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">이슈</Label>
                  <Select value={formData.issue} onValueChange={v => setFormData({ ...formData, issue: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ISSUES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">시즌</Label>
                  <Select value={formData.season} onValueChange={v => setFormData({ ...formData, season: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEASONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Brand Selection */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">브랜드</Label>
                <div className="flex gap-2">
                  {BRANDS.map(brand => (
                    <Button
                      key={brand}
                      type="button"
                      variant={formData.brands.includes(brand) ? "default" : "outline"}
                      className={`flex-1 h-9 ${formData.brands.includes(brand) ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      onClick={() => toggleBrand(brand)}
                    >
                      {brand}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Promotion & Material Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    프로모션명 <span className="text-xs text-gray-400">*소문자/숫자만</span>
                  </Label>
                  <Input
                    className="h-9"
                    value={formData.promotion}
                    onChange={(e) => setFormData({ ...formData, promotion: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="clearancesale"
                  />
                </div>

                {activeTab !== 'BS' && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">소재 개수</Label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      className="h-9"
                      value={formData.materialCount}
                      onChange={(e) => setFormData({ ...formData, materialCount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                )}
              </div>

              {activeTab === 'BS' && (
                <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg flex gap-2 items-center border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  BS빌더는 8개 영역이 자동 생성됩니다.
                </div>
              )}

              {/* URL Settings */}
              {activeTab !== 'BS' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">랜딩 URL 설정</Label>
                  <RadioGroup
                    value={formData.urlMode}
                    onValueChange={(v) => setFormData({ ...formData, urlMode: v as 'auto' | 'manual' })}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="auto" id="auto" />
                      <Label htmlFor="auto" className="font-normal cursor-pointer text-sm">
                        자동 생성 (브랜드별 추천 경로)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="font-normal cursor-pointer text-sm">
                        직접 입력 (모든 소재 동일 적용)
                      </Label>
                    </div>
                  </RadioGroup>
                  {formData.urlMode === 'manual' && (
                    <Input
                      className="h-9 mt-2"
                      placeholder="https://marithe-official.com/..."
                      value={formData.manualUrl || ''}
                      onChange={(e) => setFormData({ ...formData, manualUrl: e.target.value })}
                    />
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-md"
              >
                UTM 생성하기
              </Button>
            </form>
          </Card>

          {/* Right: Results */}
          <Card className="bg-white rounded-xl shadow-sm p-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">생성 결과</h3>
              {result && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {Object.keys(result).length}개 브랜드
                </Badge>
              )}
            </div>

            {!result ? (
              <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">생성된 UTM이 없습니다</p>
                <p className="text-sm mt-1">왼쪽 폼을 입력하고 생성 버튼을 눌러주세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(result)[0]}>
                  {Object.entries(result).map(([brand, data]) => (
                    <AccordionItem key={brand} value={brand} className="border rounded-lg mb-2 bg-gray-50">
                      <AccordionTrigger className="hover:no-underline px-4 py-3">
                        <div className="flex items-center gap-3 w-full">
                          <Badge className="bg-blue-600">{brand}</Badge>
                          <span className="text-sm font-medium text-gray-600 truncate flex-1 text-left font-mono">
                            {data.campaign}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3 pt-2">
                          {/* Campaign */}
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-500">Campaign</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleCopy(data.campaign, `${brand}-camp`)}
                              >
                                {copiedStatus[`${brand}-camp`] ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <code className="text-xs text-slate-700 font-mono break-all block">
                              {data.campaign}
                            </code>
                          </div>

                          {/* URLs */}
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500">
                                URLs ({data.url.length})
                              </span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                              {data.url.map((url, i) => (
                                <div key={i} className="text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                  <div className="flex justify-between items-center text-gray-400 mb-1">
                                    <span className="font-mono text-[10px]">#{i + 1} {data.content[i]}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(url, `${brand}-u-${i}`)}
                                      className="hover:text-blue-600 transition-colors"
                                    >
                                      {copiedStatus[`${brand}-u-${i}`] ? (
                                        <Check className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="font-mono text-slate-600 break-all">{url}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Separator />

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={handleCopyExcel}
                  >
                    {copiedStatus.excel ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                    )}
                    엑셀 복사
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={handleExportCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV 다운로드
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
