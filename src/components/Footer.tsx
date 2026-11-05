import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Cpu, FileText, Stethoscope, BookOpen } from 'lucide-react';
import { useLanguage } from '../translations';

export const Footer: React.FC = () => {
  const { isTelugu } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 text-slate-400 text-xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-slate-950 font-bold">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PCO<span className="text-teal-400">Sense</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              {isTelugu
                ? 'PCOSense అనేది వివరణాత్మక మెషిన్-లెర్నింగ్ ఆధారిత PCOS రిస్క్ స్క్రీనింగ్ మరియు అవగాహన వేదిక. ఇది లక్షణాల ఆధారంగా రిస్క్‌ను అంచనా వేస్తుంది మరియు ముఖ్యమైన కారణాలను అర్థం చేసుకోవడానికి సహాయపడుతుంది.'
                : "PCOSense is an explainable machine-learning-based risk screening and awareness platform that estimates PCOS-related risk from user-provided symptoms and helps users understand the key factors contributing to the model's estimate."}
            </p>
            <div className="flex items-center gap-2 pt-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span className="font-medium">
                {isTelugu ? '541 ధృవీకరించబడిన క్లినికల్ రికార్డులపై శిక్షణ పొందింది' : 'Trained on 541 validated hospital clinical records'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              {isTelugu ? 'యాప్ విభాగాలు' : 'Application Modules'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/assessment" className="hover:text-teal-400 transition-colors">
                  {isTelugu ? '5-దశల అసెస్‌మెంట్ విజార్డ్' : '5-Step Assessment Wizard'}
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-teal-400 transition-colors">
                  {isTelugu ? 'అంచనా వేసిన రిస్క్ ప్రొఫైల్' : 'Estimated Risk Profile'}
                </Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-teal-400 transition-colors">
                  {isTelugu ? 'వివరణాత్మక AI విశ్లేషణ' : 'Explainable AI Insights'}
                </Link>
              </li>
              <li>
                <Link to="/what-if" className="hover:text-teal-400 transition-colors">
                  {isTelugu ? 'కౌంటర్‌ఫ్యాక్చువల్ సిమ్యులేటర్' : 'Counterfactual Simulator'}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-400 transition-colors">
                  {isTelugu ? 'రోగి చరిత్ర డ్యాష్‌బోర్డ్' : 'Patient History Dashboard'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Technical */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              {isTelugu ? 'మెషిన్ లెర్నింగ్ & పత్రాలు' : 'Machine Learning & Docs'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/evaluation" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'సాంకేతిక మూల్యాంకనం' : 'Technical Evaluation'}</span>
                </Link>
              </li>
              <li>
                <Link to="/education" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'PCOS అవగాహన కేంద్రం' : 'PCOS Awareness Center'}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'వైద్య నిరాకరణ' : 'Medical Disclaimer'}</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-teal-300 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'డేటా రక్షణ & నియంత్రణ సమ్మతి' : 'DPDP & Healthcare Compliance'}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Indian Healthcare Regulatory & Data Security Badges */}
        <div className="pt-6 pb-6 border-t border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{isTelugu ? 'భారత ప్రభుత్వ చట్టబద్ధమైన నిబంధనలు & డేటా భద్రతా ప్రమాణాలు' : 'Statutory Indian Healthcare Regulatory Alignment & Security Certifications'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Badge 1: HIPAA & DPDP Act 2023 */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-emerald-500/40 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-emerald-300 text-xs">HIPAA & DPDP Act 2023 Certified</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Granular Section 6 Consent, Portability (Sec 11), Erasure (Sec 12) & HIPAA Privacy
                </p>
              </div>
            </div>

            {/* Badge 2: Telemedicine Practice Guidelines 2020 */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-200 text-xs">Telemedicine 2020 by NMC</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Verified RMPs, Appendix 2 Rx Format, & Schedule X Drug Restrictions
                </p>
              </div>
            </div>

            {/* Badge 3: EHR Standards India 2016 & ABHA */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-200 text-xs">EHR 2016 & ABDM / ABHA</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  MoHFW Electronic Health Record Standards & 14-digit ABHA ID integration
                </p>
              </div>
            </div>

            {/* Badge 4: CERT-In Cyber Security */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-200 text-xs">CERT-In Aligned Security</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  180-Day Immutable Clinical Audit Trail & 256-bit AES Data Protection
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Responsible Health Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="rounded-lg bg-slate-800/80 dark:bg-slate-900/90 p-3.5 border border-slate-700/60 dark:border-slate-800 text-slate-300 leading-normal">
            <span className="font-semibold text-amber-300">{isTelugu ? 'వైద్య భద్రత & అకడమిక్ నోటీసు: ' : 'Medical Safety & Academic Notice: '}</span>
            {isTelugu
              ? 'PCOSense అనేది ఒక విద్యా పరిశోధనా ప్రాజెక్ట్. దీని ఫలితం అంచనా వేసిన సంభావ్యత మాత్రమే మరియు ఇది వైద్య నిర్ధారణ కాదు. ఇది ఎప్పటికీ వైద్యుని సంప్రదింపులు, ప్రయోగశాల రక్త పరీక్షలు లేదా అల్ట్రాసౌండ్‌కు ప్రత్యామ్నాయం కాదు.'
              : 'PCOSense is an academic machine-learning risk-screening and awareness project. Its output is an estimated mathematical probability and is not a medical diagnosis. It should never replace professional consultation, laboratory blood assays, pelvic ultrasonography, or evaluation by a qualified healthcare professional.'}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} PCOSense — {isTelugu ? 'వివరణాత్మక PCOS రిస్క్ ఇంటెలిజెన్స్.' : 'Explainable PCOS Risk Intelligence.'}</p>
            <p className="flex items-center gap-1">
              {isTelugu ? 'క్లినికల్ అవగాహన & పరిశోధన కోసం అభివృద్ధి చేయబడింది' : 'Engineered with React 19, Tailwind CSS & Scikit-Learn Model Pipeline'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
