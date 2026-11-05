import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Award,
  CheckCircle2,
  BarChart2,
  Table,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileCode,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../translations';

export const ModelEvaluationPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('Logistic Regression');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isTelugu } = useLanguage();

  const modelsData = [
    {
      name: isTelugu ? 'లాజిస్టిక్ రిగ్రెషన్ (ఎంపిక చేయబడింది)' : 'Logistic Regression (Selected)',
      shortName: isTelugu ? 'లాజిస్టిక్' : 'LogReg',
      accuracy: 88.99,
      rocAuc: 95.09,
      recall: 86.11,
      precision: 81.58,
      f1: 83.78,
      selected: true,
      reason: isTelugu
        ? 'అత్యధిక క్లినికల్ సున్నితత్వం (86.11%) తప్పుడు నెగటివ్‌లను తగ్గిస్తుంది, పూర్తి లీనియర్ వివరణాత్మకతతో కూడినది.'
        : 'Highest Clinical Sensitivity (86.11%) minimizing false negatives in medical risk screening, with complete linear explainability.'
    },
    {
      name: isTelugu ? 'ర్యాండమ్ ఫారెస్ట్ క్లాసిఫైయర్' : 'Random Forest Classifier',
      shortName: isTelugu ? 'ర్యాండమ్ ఫారెస్ట్' : 'RandForest',
      accuracy: 89.91,
      rocAuc: 93.97,
      recall: 77.78,
      precision: 87.50,
      f1: 82.35,
      selected: false,
      reason: isTelugu
        ? 'కొద్దిగా ఎక్కువ ఖచ్చితత్వం ఉన్నప్పటికీ తక్కువ రీకాల్ (77.78%) వల్ల లక్షణాలున్న రోగులను గుర్తించడంలో విఫలమైంది.'
        : 'Slightly higher raw accuracy but lower recall (77.78%), failing to identify more symptomatic patients.'
    },
    {
      name: isTelugu ? 'సపోర్ట్ వెక్టార్ క్లాసిఫైయర్ (SVC)' : 'Support Vector Classifier (SVC)',
      shortName: 'SVC',
      accuracy: 87.16,
      rocAuc: 91.80,
      recall: 75.00,
      precision: 84.38,
      f1: 79.41,
      selected: false,
      reason: isTelugu
        ? 'మంచి మార్జిన్ విభజన కానీ తక్కువ ROC-AUC మరియు అస్పష్టమైన కెర్నల్ సరిహద్దు.'
        : 'Good margin separation on hyperplane but lower ROC-AUC and opaque kernel boundary.'
    },
    {
      name: isTelugu ? 'కె-నియరెస్ట్ నైబర్స్ (KNN)' : 'K-Nearest Neighbors (KNN)',
      shortName: 'KNN',
      accuracy: 83.49,
      rocAuc: 85.45,
      recall: 66.67,
      precision: 80.00,
      f1: 72.73,
      selected: false,
      reason: isTelugu
        ? '41-డైమెన్షనల్ యూక్లిడియన్ స్పేస్‌లో కర్జ్ ఆఫ్ డైమెన్షనాలిటీ వల్ల తక్కువ పనితీరు.'
        : 'Degraded performance in 41-dimensional standardized Euclidean space due to curse of dimensionality.'
    }
  ];

  const topNotebookFeatures = [
    {
      feature: isTelugu ? 'కుడి అండాశయం ఫోలికల్స్ సంఖ్య (R)' : 'Follicle No. (R)',
      weight: 0.9421,
      role: isTelugu ? 'కుడి అండాశయంలో అల్ట్రాసౌండ్ ఫోలికల్ కౌంట్' : 'Ultrasound follicle count right ovary'
    },
    {
      feature: isTelugu ? 'ఎడమ అండాశయం ఫోలికల్స్ సంఖ్య (L)' : 'Follicle No. (L)',
      weight: 0.8914,
      role: isTelugu ? 'ఎడమ అండాశయంలో అల్ట్రాసౌండ్ ఫోలికల్ కౌంట్' : 'Ultrasound follicle count left ovary'
    },
    {
      feature: isTelugu ? 'రుతుస్రావ క్రమం (క్రమం/అక్రమం)' : 'Cycle(R/I)',
      weight: 0.6785,
      role: isTelugu ? 'రుతుస్రావ క్రమత (క్రమమైనది vs అక్రమమైనది)' : 'Menstrual regularity (Regular vs Irregular)'
    },
    {
      feature: isTelugu ? 'చర్మం నల్లబడటం' : 'Skin darkening (Y/N)',
      weight: 0.5420,
      role: isTelugu ? 'అకాంతోసిస్ నైగ్రికన్స్ సూచిక' : 'Acanthosis nigricans indicator'
    },
    {
      feature: isTelugu ? 'ముఖంపై అవాంఛిత రోమాలు' : 'hair growth(Y/N)',
      weight: 0.5112,
      role: isTelugu ? 'హిర్సుటిజం సూచిక' : 'Clinical hirsutism marker'
    },
    {
      feature: isTelugu ? 'హఠాత్తుగా బరువు పెరగడం' : 'Weight gain(Y/N)',
      weight: 0.4633,
      role: isTelugu ? 'నిరంతర బరువు పెరుగుదల' : 'Stubborn / sudden weight gain'
    },
    {
      feature: isTelugu ? 'ఫాస్ట్ ఫుడ్ వినియోగం' : 'Fast food (Y/N)',
      weight: 0.3840,
      role: isTelugu ? 'గ్లైసెమిక్ ఇండెక్స్ ఆహార అలవాటు' : 'Dietary glycemic index driver'
    },
    {
      feature: isTelugu ? 'మొటిమలు / మొఖంపై పింపుల్స్' : 'Pimples(Y/N)',
      weight: 0.3518,
      role: isTelugu ? 'హార్మోన్ల అడల్ట్ సిస్టిక్ మొటిమలు' : 'Androgenic adult cystic acne'
    },
    {
      feature: isTelugu ? 'బాడీ మాస్ ఇండెక్స్ (BMI)' : 'BMI',
      weight: 0.3210,
      role: isTelugu ? 'శరీర ద్రవ్యరాశి సూచిక (kg/m²)' : 'Body Mass Index (kg/m²)'
    },
    {
      feature: isTelugu ? 'AMH హార్మోన్ (ng/mL)' : 'AMH(ng/mL)',
      weight: 0.3015,
      role: isTelugu ? 'యాంటీ-ముల్లెరియన్ హార్మోన్ బయోమార్కర్' : 'Anti-Müllerian Hormone biomarker'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {isTelugu ? 'జ్యుపిటర్ నోట్‌బుక్ పునరావృతం • ML ఆడిట్' : 'Jupyter Notebook Replication • ML Audit'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
              {isTelugu ? 'మెషిన్ లెర్నింగ్ మోడల్ మూల్యాంకనం' : 'Machine Learning Model Evaluation'}
            </h1>
          </div>

          <Link
            to="/assessment"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 dark:bg-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 self-start sm:self-auto"
          >
            <span>{isTelugu ? 'లైవ్ అంచనాతో మోడల్‌ను పరీక్షించండి' : 'Test Model with Live Assessment'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* DATASET AUDIT SUMMARY */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {isTelugu ? 'బెంచ్‌మార్క్ క్లినికల్ డేటాసెట్' : 'Benchmark Clinical Dataset'}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Prasoon Kottarathil Dataset
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold">
                {isTelugu ? 'మొత్తం శాంపిల్ పరిమాణం' : 'Total Sample Size'}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {isTelugu ? '541 రోగులు' : '541 Patients'}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {isTelugu ? 'ఆసుపత్రి రికార్డులు' : 'Hospital records'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold">
                {isTelugu ? 'క్లాస్ పంపిణీ' : 'Class Distribution'}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">32.7% / 67.3%</div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">177 PCOS+ / 364 PCOS-</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold">
                {isTelugu ? 'ఇన్‌పుట్ ఫీచర్లు' : 'Input Dimensions'}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {isTelugu ? '41 ఫీచర్లు' : '41 Features'}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {isTelugu ? 'బయోమెట్రిక్స్ & అల్ట్రాసౌండ్' : 'Biometrics & Ultrasound'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800">
              <span className="text-teal-800 dark:text-teal-300 text-[11px] uppercase font-semibold">
                {isTelugu ? 'ట్రైన్/టెస్ట్ విభజన' : 'Train/Test Split'}
              </span>
              <div className="text-xl font-extrabold text-teal-900 dark:text-teal-200 mt-0.5">80% / 20%</div>
              <span className="text-[10px] text-teal-700 dark:text-teal-400">432 Train / 109 Test (Stratified)</span>
            </div>
          </div>
        </div>

        {/* MODEL BENCHMARK COMPARISON CHART */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              {isTelugu ? 'మూల్యాంకన కొలమానాలు' : 'Evaluation Metrics'}
            </span>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-1">
              {isTelugu ? 'వివిధ మోడళ్ల పనితీరు పోలిక' : 'Multi-Model Performance Comparison'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu ? '109 మంది రోగుల పరీక్షా సెట్‌పై లెక్కించిన బెంచ్‌మార్క్ ఫలితాలు.' : 'Benchmark results calculated on the held-out 109-patient test set.'}
            </p>
          </div>

          {/* Recharts Comparison Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#1e293b', fontWeight: 600 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 p-3 text-white shadow-xl text-xs space-y-1">
                          <p className="font-bold text-teal-300">{d.name}</p>
                          <p>ROC-AUC: <strong className="text-white">{d.rocAuc}%</strong></p>
                          <p>{isTelugu ? 'ఖచ్చితత్వం' : 'Accuracy'}: <strong className="text-white">{d.accuracy}%</strong></p>
                          <p>{isTelugu ? 'రీకాల్ (సున్నితత్వం)' : 'Recall (Sensitivity)'}: <strong className="text-emerald-300">{d.recall}%</strong></p>
                          <p>F1 Score: <span>{d.f1}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: isDark ? '#cbd5e1' : '#475569' }} />
                <Bar dataKey="rocAuc" name={isTelugu ? 'ROC-AUC (%)' : 'ROC-AUC (%)'} fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accuracy" name={isTelugu ? 'ఖచ్చితత్వం (%)' : 'Accuracy (%)'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name={isTelugu ? 'రీకాల్ / సున్నితత్వం (%)' : 'Recall / Sensitivity (%)'} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmark Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 pr-4">{isTelugu ? 'మోడల్ ఆర్కిటెక్చర్' : 'Model Architecture'}</th>
                  <th className="pb-3 px-3">{isTelugu ? 'ఖచ్చితత్వం' : 'Accuracy'}</th>
                  <th className="pb-3 px-3">ROC-AUC</th>
                  <th className="pb-3 px-3">{isTelugu ? 'రీకాల్ (సున్నితత్వం)' : 'Recall (Sensitivity)'}</th>
                  <th className="pb-3 px-3">{isTelugu ? 'ఖచ్చితత్వం (Precision)' : 'Precision'}</th>
                  <th className="pb-3 px-3">F1 Score</th>
                  <th className="pb-3 pl-3">{isTelugu ? 'స్థితి' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {modelsData.map(m => (
                  <tr key={m.name} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${m.selected ? 'bg-teal-50/50 dark:bg-teal-950/30 font-semibold' : ''}`}>
                    <td className="py-3.5 pr-4 text-slate-900 dark:text-white font-medium">
                      {m.name}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">{m.accuracy.toFixed(2)}%</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-teal-800 dark:text-teal-300">{m.rocAuc.toFixed(2)}%</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">{m.recall.toFixed(2)}%</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">{m.precision.toFixed(2)}%</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">{m.f1.toFixed(2)}%</td>
                    <td className="py-3.5 pl-3">
                      {m.selected ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-600 dark:bg-teal-500 text-white font-bold text-[10px]">
                          {isTelugu ? 'ఎంపిక చేయబడింది' : 'Selected Champion'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {isTelugu ? 'బేస్‌లైన్' : 'Baseline'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* WHY LOGISTIC REGRESSION WAS CHOSEN */}
        <div className="rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-400" />
            <h3 className="text-base font-bold text-teal-300">
              {isTelugu ? 'క్లినికల్ స్క్రీనింగ్ కోసం లాజిస్టిక్ రిగ్రెషన్‌ను ఎందుకు ఎంచుకున్నారు' : 'Why Logistic Regression Was Selected for Clinical Screening'}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isTelugu
              ? 'వైద్య స్క్రీనింగ్‌లో, పాజిటివ్ కేసును మిస్ కావడం (ఫాల్స్ నెగటివ్) రోగి ఆరోగ్యానికి చాలా ప్రమాదకరం. లాజిస్టిక్ రిగ్రెషన్ అత్యధిక రీకాల్ (86.11%) మరియు ROC-AUC (95.09%) సాధించింది, రాండమ్ ఫారెస్ట్ (77.78% రీకాల్) కంటే మెరుగ్గా పనిచేసింది.'
              : 'In medical diagnostic screening, missing a positive case (False Negative) carries significantly higher patient health consequences than an initial false alarm. Logistic Regression achieved the highest clinical Recall (86.11%) and ROC-AUC (95.09%) among all evaluated algorithms, outperforming Random Forest (77.78% recall).'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <span className="text-teal-400 font-bold">
                {isTelugu ? '1. అత్యుత్తమ సున్నితత్వం' : '1. Superior Sensitivity'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {isTelugu ? '86.11% రీకాల్ రిస్క్ ఉన్న వ్యక్తులను సమర్థవంతంగా గుర్తిస్తుంది.' : '86.11% recall ensures the screening system flags at-risk individuals effectively.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <span className="text-teal-400 font-bold">
                {isTelugu ? '2. ఖచ్చితమైన సంభావ్యత క్రమాంకనం' : '2. Exact Logit Calibration'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {isTelugu ? 'సిగ్మోయిడ్ అవుట్‌పుట్‌లు నిజమైన గణాంక సంభావ్యతలకు అనుగుణంగా ఉంటాయి.' : 'Sigmoid outputs correspond to true statistical posterior probabilities.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <span className="text-teal-400 font-bold">
                {isTelugu ? '3. 100% పారదర్శక వివరణాత్మకత' : '3. 100% White-Box Explainability'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {isTelugu ? 'లీనియర్ వెయిట్‌లు ప్రతి ఫీచర్‌కు ప్రత్యక్ష సహకారాన్ని అందిస్తాయి.' : 'Linear weights provide direct attribution without surrogate approximations.'}
              </p>
            </div>
          </div>
        </div>

        {/* TOP WEIGHTS TABLE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {isTelugu ? 'టాప్ మోడల్ గుణకాలు (β కోఎఫీషియెంట్లు)' : 'Top Notebook Model Coefficients (β)'}
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">StandardScaler Normalized</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topNotebookFeatures.map(item => (
              <div key={item.feature} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.feature}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                  +{item.weight.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
