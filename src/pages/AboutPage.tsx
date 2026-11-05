import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartPulse,
  Brain,
  Code2,
  Database,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { useLanguage } from '../translations';

export const AboutPage: React.FC = () => {
  const { isTelugu } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {isTelugu ? 'PCOSense గురించి' : 'About PCOSense'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">
            {isTelugu ? 'మహిళల ఆరోగ్యం కోసం వివరింపదగిన AI' : "Explainable AI for Women's Health"}
          </h1>
          <p className="text-sm text-slate-600">
            {isTelugu
              ? 'క్లినికల్ మెషిన్ లెర్నింగ్‌ను పారదర్శకమైన, సానుభూతితో కూడిన ఆరోగ్య అవగాహనతో అనుసంధానించడం.'
              : 'Bridging clinical machine learning with transparent, compassionate health awareness.'}
          </p>
        </div>

        {/* Mission Statement */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HeartPulse className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-950">
              {isTelugu ? 'మా ముఖ్య లక్ష్యం' : 'Our Core Mission'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isTelugu
              ? 'పాలిసిస్టిక్ ఓవరీ సిండ్రోమ్ (PCOS) ప్రపంచంలో చాలా తక్కువగా గుర్తించబడే మరియు అపార్థం చేసుకోబడే హార్మోన్ల సమస్య. చాలా మంది సరైన రోగ నిర్ధారణ పొందేందుకు సంవత్సరాల తరబడి లక్షణాలతో బాధపడుతున్నారు.'
              : 'Polycystic Ovary Syndrome (PCOS) is one of the most underdiagnosed and misunderstood endocrine conditions in the world. Many individuals experience years of unexplained symptoms before receiving an accurate medical assessment.'}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>PCOSense</strong>{' '}
            {isTelugu
              ? 'అనేది పారదర్శకమైన, సులభంగా అందుబాటులో ఉండే మరియు గణితశాస్త్రపరంగా ధృవీకరించబడిన ప్రాథమిక స్క్రీనింగ్ సాధనం. ఆసుపత్రి రికార్డులపై శిక్షణ పొందిన మెషిన్ లెర్నింగ్ మోడల్స్ మరియు వివరణాత్మక సిమ్యులేటర్ ద్వారా వినియోగదారులు వైద్యులను సంప్రదించే ముందు తమ ఆరోగ్య సూచికలను సులభంగా అర్థం చేసుకోవడానికి PCOSense సహాయపడుతుంది.'
              : 'was built to provide an explainable, accessible, and mathematically validated preliminary screening tool. By pairing machine learning trained on peer-reviewed clinical hospital records with instance-level feature attribution and interactive counterfactual simulation, PCOSense empowers individuals to understand their health markers before consulting medical specialists.'}
          </p>
        </div>

        {/* Full-Stack Architecture */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Code2 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-950">
              {isTelugu ? 'సాంకేతిక ఆర్కిటెక్చర్ & స్టాక్' : 'Technical Architecture & Stack'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-teal-600" /> {isTelugu ? 'మెషిన్ లెర్నింగ్ ఇంజిన్' : 'Machine Learning Engine'}
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {isTelugu
                  ? 'పైథాన్, సైకిట్-లెర్న్ మరియు టైప్‌స్క్రిప్ట్ పైప్‌లైన్ ద్వారా లాజిస్టిక్ రిగ్రెషన్ మోడల్‌ను ఉపయోగించి 95.09% ROC-AUC ఖచ్చితత్వాన్ని సాధించింది.'
                  : 'Python, scikit-learn, and TypeScript replication pipeline utilizing StandardScaler parameters and Logistic Regression (z = βᵀX + β₀) with 95.09% ROC-AUC.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-600" /> {isTelugu ? 'క్లినికల్ డేటా ఫౌండేషన్' : 'Clinical Data Foundation'}
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {isTelugu
                  ? 'రొటర్‌డ్యామ్ 2003 ప్రమాణాల ఆధారంగా 41 బయోమెట్రిక్, జీవక్రియ మరియు అల్ట్రాసౌండ్ ఫీచర్లతో కూడిన 541 ఆసుపత్రి క్లినికల్ రికార్డులు.'
                  : '541 hospital clinical records comprising 41 biometric, metabolic, and pelvic ultrasound features based on the Rotterdam 2003 diagnostic consensus.'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Safety Disclaimer Callout */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-bold text-teal-300">
              {isTelugu ? 'వైద్య భద్రత & నిర్ధారణ పరిమితి' : 'Medical Safety & Diagnostic Scope'}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isTelugu
              ? 'PCOSense అనేది పూర్తిగా రిస్క్ స్క్రీనింగ్ మరియు ఆరోగ్య అవగాహన వేదిక మాత్రమే. ఇది ఆటోమేటెడ్ వైద్య నిర్ధారణ లేదా వైద్యుడి సంప్రదింపులకు ప్రత్యామ్నాయం కాదు. మెషిన్ లెర్నింగ్ ఇంజిన్ ద్వారా లెక్కించబడిన శాతం కేవలం డేటాసెట్‌లోని గణాంక ధోరణులను సూచిస్తుంది మరియు ధృవీకరించబడిన వైద్యుని పర్యవేక్షణలో ప్రయోగశాల పరీక్షలతో మాత్రమే సమీక్షించాలి.'
              : 'PCOSense is strictly a risk screening and health awareness platform. It is not an automated medical diagnostic tool, medical device, or replacement for clinical consultation. The probability percentages generated by the machine learning engine reflect statistical patterns within the training dataset and should always be reviewed alongside comprehensive clinical laboratory and ultrasound examinations conducted by a board-certified physician.'}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all"
          >
            <span>{isTelugu ? 'రిస్క్ అంచనాను ప్రారంభించండి' : 'Launch Risk Assessment'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
