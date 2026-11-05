import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PipelineFlowVisualizer } from '../components/PipelineFlowVisualizer';
import { useLanguage } from '../translations';

export const EducationPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { isTelugu } = useLanguage();

  const rotterdamCriteria = [
    {
      number: '01',
      title: isTelugu ? 'అనోవులేషన్ లేదా పీరియడ్స్ ఆలస్యం' : 'Oligo- or Anovulation',
      summary: isTelugu ? 'అక్రమ, ఆలస్యమైన (>35 రోజులు) లేదా రాని రుతుస్రావాలు.' : 'Irregular, delayed (>35 days), or completely absent menstrual periods.',
      clinicalDetail: isTelugu
        ? 'హార్మోన్ల అసమతుల్యత వల్ల అండం సమయానికి విడుదల కాకపోవడం, ఫలితంగా అక్రమ రక్తస్రావం జరుగుతుంది.'
        : 'Disrupted hypothalamic-pituitary-ovarian signaling prevents regular follicle recruitment and rupture, leading to unpredictable bleeding or amenorrhea.'
    },
    {
      number: '02',
      title: isTelugu ? 'హైపర్‌ఆండ్రోజెనిజం (పురుష హార్మోన్ల పెరుగుదల)' : 'Hyperandrogenism (Clinical or Biochemical)',
      summary: isTelugu ? 'ఆండ్రోజెన్ హార్మోన్ల ఆధిక్యత (ముఖంపై అవాంఛిత రోమాలు, తీవ్రమైన మొటిమలు లేదా జుట్టు రాలడం).' : 'Elevated androgen activity (hirsutism, cystic adult acne, or androgenic alopecia).',
      clinicalDetail: isTelugu
        ? 'అండాశయాలు అధిక టెస్టోస్టెరాన్ లేదా DHEA-S ఉత్పత్తి చేయడం వల్ల శరీర లక్షణాలు లేదా రక్త పరీక్షల్లో పెరుగుదల కనిపిస్తుంది.'
        : 'The theca cells of the ovary produce excess testosterone or DHEA-S, clinically presenting as coarse facial/body hair or verified by elevated free testosterone laboratory assays.'
    },
    {
      number: '03',
      title: isTelugu ? 'పాలిసిస్టిక్ అండాశయ ఆకృతి (PCOM)' : 'Polycystic Ovarian Morphology (PCOM)',
      summary: isTelugu ? 'అల్ట్రాసౌండ్‌లో ఏదైనా అండాశయంలో ≥12-20 చిన్న ఫోలికల్స్ కనిపించడం.' : 'Ultrasound visualization of ≥12-20 antral follicles (2–9 mm) in either ovary.',
      clinicalDetail: isTelugu
        ? 'పెల్విక్ అల్ట్రాసౌండ్‌లో అండాశయ పరిమాణం పెరగడం మరియు పూసల దండలా కనిపించే ఫోలికల్స్ కనిపించడం.'
        : 'Under transvaginal or transabdominal pelvic ultrasonography, ovaries show an increased ovarian volume (>10 mL) and peripheral string-of-pearls follicle clusters.'
    }
  ];

  const phenotypes = [
    {
      tag: isTelugu ? 'ఫీనోటైప్ A' : 'Phenotype A',
      name: isTelugu ? 'క్లాసిక్ / సంపూర్ణ PCOS' : 'Classic / Complete PCOS',
      criteria: isTelugu ? 'ఆండ్రోజెన్ అధికం + అండం లోపం + పాలిసిస్టిక్ అండాశయాలు (అన్నీ 3)' : 'Hyperandrogenism + Ovulatory Dysfunction + Polycystic Ovaries (All 3)',
      desc: isTelugu ? 'తీవ్రమైన ఇన్సులిన్ నిరోధకత మరియు మెటబాలిక్ సిండ్రోమ్‌తో ముడిపడి ఉంటుంది.' : 'Associated with the highest prevalence of severe insulin resistance, metabolic syndrome, and elevated LH/FSH ratios.'
    },
    {
      tag: isTelugu ? 'ఫీనోటైప్ B' : 'Phenotype B',
      name: isTelugu ? 'క్లాసిక్ / అల్ట్రాసౌండ్ సాధారణం' : 'Classic / Non-PCO',
      criteria: isTelugu ? 'ఆండ్రోజెన్ అధికం + అండం లోపం (సాధారణ అల్ట్రాసౌండ్)' : 'Hyperandrogenism + Ovulatory Dysfunction (Normal Ultrasound)',
      desc: isTelugu ? 'అల్ట్రాసౌండ్‌లో మార్పులు లేకుండానే అక్రమ పీరియడ్స్ మరియు హార్మోన్ లక్షణాలు ఉంటాయి.' : 'Patients experience typical irregular cycles and androgen symptoms without the classic polycystic ultrasound appearance.'
    },
    {
      tag: isTelugu ? 'ఫీనోటైప్ C' : 'Phenotype C',
      name: isTelugu ? 'ఓవులేటరీ PCOS' : 'Ovulatory PCOS',
      criteria: isTelugu ? 'ఆండ్రోజెన్ అధికం + పాలిసిస్టిక్ అండాశయాలు (క్రమమైన పీరియడ్స్)' : 'Hyperandrogenism + Polycystic Ovaries (Regular Cycles)',
      desc: isTelugu ? 'పీరియడ్స్ క్రమంగానే వస్తాయి కానీ హార్మోన్ల అసమతుల్యత మరియు స్కానింగ్‌లో మార్పులు ఉంటాయి.' : 'Patients maintain predictable monthly cycles but show clinical/biochemical androgen excess and polycystic morphology.'
    },
    {
      tag: isTelugu ? 'ఫీనోటైప్ D' : 'Phenotype D',
      name: isTelugu ? 'నాన్-హైపర్‌ఆండ్రోజెనిక్ PCOS' : 'Non-Hyperandrogenic PCOS',
      criteria: isTelugu ? 'అండం లోపం + పాలిసిస్టిక్ అండాశయాలు (సాధారణ ఆండ్రోజెన్లు)' : 'Ovulatory Dysfunction + Polycystic Ovaries (Normal Androgens)',
      desc: isTelugu ? 'ముఖంపై రోమాలు లేకుండానే అక్రమ పీరియడ్స్ మరియు అండాశయాల్లో మార్పులు ఉంటాయి.' : 'Patients have irregular periods and polycystic ovaries without clinical hirsutism or elevated testosterone.'
    }
  ];

  const mythsVsFacts = [
    {
      myth: isTelugu ? 'PCOS ఉంటే గర్భం దాల్చడం అస్సలు సాధ్యం కాదు.' : 'You cannot get pregnant if you have PCOS.',
      fact: isTelugu
        ? 'PCOS చికిత్స చేయదగిన సంతానోత్పత్తి సమస్య. సరైన జీవనశైలి, ఆహారం మరియు వైద్య మద్దతుతో చాలా మంది మహిళలు విజయవంతంగా గర్భం దాలుస్తారు.'
        : 'PCOS is one of the most treatable causes of ovulatory subfertility. Through evidence-based ovulation induction, lifestyle optimization, and metabolic support, the vast majority of women with PCOS conceive successfully.'
    },
    {
      myth: isTelugu ? 'PCOS అధిక బరువు ఉన్నవారికి మాత్రమే వస్తుంది.' : 'PCOS only affects individuals with overweight or obesity.',
      fact: isTelugu
        ? 'సన్నగా ఉన్నవారికి కూడా PCOS రావచ్చు (దీనిని Lean PCOS అంటారు). వీరిలో కూడా ఇన్సులిన్ మరియు హార్మోన్ల అసమతుల్యత ఉంటుంది.'
        : 'PCOS can occur in individuals of any body weight (known clinically as "Lean PCOS"). Thin individuals with PCOS still exhibit insulin resistance, hormonal imbalances, and polycystic ovarian morphology.'
    },
    {
      myth: isTelugu ? 'PCOS నిర్ధారణకు అండాశయాల్లో సిస్ట్‌లు తప్పనిసరిగా ఉండాలి.' : 'You must have ovarian cysts to have PCOS.',
      fact: isTelugu
        ? 'ఇవి నిజమైన కణితులు కావు, ఎదగని చిన్న ఫోలికల్స్ మాత్రమే. రొటర్‌డ్యామ్ ప్రమాణాల ప్రకారం స్కానింగ్ సాధారణంగా ఉన్నా లక్షణాలతో PCOS నిర్ధారణ చేయవచ్చు.'
        : 'Despite the name, the "cysts" are not true pathological cysts, but rather tiny immature follicles arrested in development. Under the Rotterdam criteria (Phenotype B), a diagnosis can be made even with completely normal ultrasound morphology.'
    },
    {
      myth: isTelugu ? 'ఒకే ఒక్క మందుతో PCOS పూర్తిగా నయమవుతుంది.' : 'PCOS can be cured completely with a single medication.',
      fact: isTelugu
        ? 'PCOS ఒక జీవక్రియ మరియు హార్మోన్ల స్థితి. ఇది శాశ్వతంగా నయం కాకపోయినా, మంచి జీవనశైలి మరియు ఆహారంతో లక్షణాలను అద్భుతంగా అదుపులో ఉంచుకోవచ్చు.'
        : 'PCOS is a lifelong endocrine and metabolic predisposition. While it cannot be permanently cured, symptoms can be effectively managed and reversed through targeted nutritional, physical, and medical therapies.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {isTelugu ? 'ఆధారాల ఆధారిత ఆరోగ్య జ్ఞానం' : 'Evidence-Based Health Knowledge'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">
            {isTelugu ? 'PCOS అవగాహన కేంద్రం' : 'PCOS Awareness Center'}
          </h1>
          <p className="text-sm text-slate-600">
            {isTelugu
              ? 'పాలిసిస్టిక్ ఓవరీ సిండ్రోమ్, రోగ నిర్ధారణ ప్రమాణాలు మరియు శాస్త్రీయ ఆరోగ్య నిర్వహణపై పూర్తి వివరాలు.'
              : 'Clinical insights into Polycystic Ovary Syndrome, diagnostic consensus standards, and evidence-based health management.'}
          </p>
        </div>

        {/* 1. WHAT IS PCOS & ROTTERDAM CONSENSUS */}
        <section className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {isTelugu ? 'రోగ నిర్ధారణ ప్రమాణాలు' : 'Diagnostic Consensus'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">
              {isTelugu ? 'PCOS అంటే ఏమిటి? (రొటర్‌డ్యామ్ ప్రమాణాలు)' : 'What is PCOS? (Rotterdam Criteria)'}
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isTelugu
                ? 'పాలిసిస్టిక్ ఓవరీ సిండ్రోమ్ (PCOS) అనేది ప్రపంచవ్యాప్తంగా 8–13% మంది పునరుత్పత్తి వయస్సు గల మహిళలను ప్రభావితం చేసే ఎండోక్రైన్ మరియు జీవక్రియ పరిస్థితి. అంతర్జాతీయ రొటర్‌డ్యామ్ 2003 ప్రమాణాల ప్రకారం, క్రింది మూడింటిలో కనీసం '
                : 'Polycystic Ovary Syndrome (PCOS) is a multi-system endocrine, reproductive, and metabolic condition affecting approximately 8–13% of women of reproductive age worldwide. Under the international Rotterdam 2003 diagnostic consensus, a diagnosis requires meeting at least '}
              <strong>{isTelugu ? 'రెండు ప్రమాణాలు' : 'two of the following three criteria'}</strong>
              {isTelugu ? ' ఉండాలి:' : ' (after excluding thyroid, prolactin, or adrenal disorders):'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rotterdamCriteria.map(c => (
              <div key={c.number} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-extrabold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                  {isTelugu ? `ప్రమాణం ${c.number}` : `Criterion ${c.number}`}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-700 font-medium">{c.summary}</p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                  {c.clinicalDetail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. THE 4 CLINICAL PHENOTYPES */}
        <section className="space-y-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {isTelugu ? 'క్లినికల్ వర్గీకరణ' : 'Clinical Heterogeneity'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">
              {isTelugu ? '4 రకాల PCOS ఫీనోటైప్‌లు' : 'The 4 PCOS Phenotypes'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isTelugu
                ? 'PCOS ప్రతి ఒక్కరిలో విభిన్నంగా కనిపిస్తుంది కాబట్టి నాలుగు విభిన్న రకాలుగా వర్గీకరించబడింది.'
                : 'Because PCOS presents differently in every individual, clinical practice recognizes four distinct sub-phenotypes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phenotypes.map(p => (
              <div key={p.tag} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {p.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{p.name}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {p.criteria}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LIFESTYLE & NUTRITION MANAGEMENT */}
        <section className="rounded-3xl bg-teal-900 text-white p-6 sm:p-10 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              {isTelugu ? 'శాస్త్రీయ నిర్వహణ' : 'Evidence-Based Management'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              {isTelugu ? 'జీవనశైలి & పోషకాహార ఆప్టిమైజేషన్' : 'Metabolic & Lifestyle Optimization'}
            </h2>
            <p className="text-xs text-teal-100 mt-1 max-w-2xl">
              {isTelugu
                ? 'జీవనశైలి మార్పులు PCOS చికిత్సలో మొదటి మరియు అత్యంత ముఖ్యమైన దశ, ఇది ఇన్సులిన్ స్థాయిలను నియంత్రించి హార్మోన్ల సమతుల్యతను పునరుద్ధరిస్తుంది.'
                : 'Lifestyle interventions represent the first-line therapeutic standard in clinical guidelines, directly addressing hyperinsulinemia and ovulatory recovery.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <h3 className="text-sm font-bold text-teal-200">
                {isTelugu ? 'గ్లైసెమిక్ పోషకాహారం' : 'Glycemic Nutrition'}
              </h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                {isTelugu
                  ? 'తక్కువ గ్లైసెమిక్ ఇండెక్స్ ఉన్న ఆహారాలు, పీచు పదార్థాలు మరియు ప్రోటీన్లను ఎంచుకోవడం ద్వారా ఇన్సులిన్ స్పైక్‌లను నివారించవచ్చు.'
                  : 'Prioritize low-glycemic index carbohydrates, fiber-dense vegetables, and lean protein pairings to reduce postprandial insulin surges that trigger ovarian theca androgen release.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <h3 className="text-sm font-bold text-teal-200">
                {isTelugu ? 'శారీరక వ్యాయామం & స్ట్రెంత్ ట్రైనింగ్' : 'Resistance & Aerobics'}
              </h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                {isTelugu
                  ? 'వారానికి 150 నిమిషాల వ్యాయామం మరియు కండరాల బలం పెంచే శిక్షణ ఇన్సులిన్ సెన్సిటివిటీని గణనీయంగా మెరుగుపరుస్తాయి.'
                  : 'Combining 150 min/week of moderate cardio with progressive strength training upregulates GLUT-4 transporters in skeletal muscle, improving insulin sensitivity independent of weight change.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <h3 className="text-sm font-bold text-teal-200">
                {isTelugu ? 'నిద్ర & ఒత్తిడి నిర్వహణ' : 'Circadian & Stress'}
              </h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                {isTelugu
                  ? 'నిద్రలేమి మరియు మానసిక ఒత్తిడి కార్టిసాల్ హార్మోన్‌ను పెంచి శరీరంలో వాపు మరియు ఇన్సులిన్ నిరోధకతను పెంచుతాయి.'
                  : 'Chronic sleep restriction and psychological distress activate the adrenal axis (HPA axis), augmenting DHEA-S secretion and exacerbating inflammatory insulin resistance.'}
              </p>
            </div>
          </div>
        </section>

        {/* 4. MYTHS VS FACTS ACCORDION */}
        <section className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {isTelugu ? 'అపోహలు - నిజాలు' : 'Debunking Misinformation'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">
              {isTelugu ? 'సాధారణ అపోహలు vs క్లినికల్ నిజాలు' : 'Common Myths vs. Clinical Facts'}
            </h2>
          </div>

          <div className="space-y-3">
            {mythsVsFacts.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                  >
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                        {isTelugu ? 'అపోహ' : 'Myth'}
                      </span>
                      {item.myth}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-700 space-y-1 animate-in fade-in-50 duration-150">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 inline-block mb-1">
                        {isTelugu ? 'వైద్య నిజం' : 'Clinical Fact'}
                      </span>
                      <p className="leading-relaxed text-slate-700">{item.fact}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. CLINICAL AND DATA PIPELINE VISUALIZATION */}
        <section>
          <PipelineFlowVisualizer currentStepId="personalized_awareness" />
        </section>

        {/* 6. WHEN TO SEE A SPECIALIST */}
        <section className="rounded-3xl bg-amber-50/70 border border-amber-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-amber-700" />
            <h3 className="text-base font-bold text-amber-950">
              {isTelugu ? 'వైద్యుడిని ఎప్పుడు సంప్రదించాలి' : 'When to Consult a Medical Professional'}
            </h3>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {isTelugu
              ? 'మీరు క్రింది లక్షణాలలో దేనినైనా అనుభవిస్తే, స్త్రీ జననేంద్రియ నిపుణులు లేదా ఎండోక్రినాలజిస్ట్‌ను సంప్రదించాల్సిందిగా సిఫార్సు చేస్తున్నాము:'
              : 'If you experience any of the following symptoms, we recommend scheduling an evaluation with a board-certified gynecologist or reproductive endocrinologist:'}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-amber-950 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              {isTelugu ? '35 రోజుల కంటే ఎక్కువ వ్యవధిలో పీరియడ్స్ రావడం లేదా అసలు రాకపోవడం' : 'Menstrual cycles occurring less frequently than every 35 days'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              {isTelugu ? 'ముఖం లేదా శరీరంపై అకస్మాత్తుగా అవాంఛిత రోమాలు పెరగడం' : 'Rapid onset or worsening facial/body hair growth (hirsutism)'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              {isTelugu ? 'సాధారణ చికిత్సలకు తగ్గని తీవ్రమైన మొటిమలు' : 'Persistent adult cystic acne unresponsive to topical dermatological care'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              {isTelugu ? '6-12 నెలల ప్రయత్నం తర్వాత కూడా గర్భం దాల్చడంలో ఇబ్బంది కలగడం' : 'Difficulty conceiving after 6–12 months of timed intercourse'}
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-900"
            >
              <span>{isTelugu ? 'ఉచిత రిస్క్ అంచనాను ప్రారంభించండి' : 'Take Free Risk Assessment'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
