import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentHistoryItem } from '../types';

export interface PDFExportOptions {
  user?: {
    full_name?: string;
    email?: string;
  } | null;
  records: AssessmentHistoryItem[];
  singleRecord?: AssessmentHistoryItem;
  clinicNotes?: string;
}

/**
 * Generates and downloads a clinical-grade PDF summary report for healthcare providers.
 */
export const exportAssessmentHistoryPDF = ({
  user,
  records,
  clinicNotes
}: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Colors
  const primaryTeal = [13, 148, 136]; // #0d9488
  const darkSlate = [15, 23, 42]; // #0f172a
  const textMuted = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc

  let currentY = 18;

  // 1. Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PCOSENSE CLINICAL SCREENING SUMMARY', 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 246, 228); // teal-200
  doc.text('Comprehensive Longitudinal Assessment Report for Healthcare Providers', 20, currentY + 16);

  currentY += 30;

  // 2. Patient & Metadata Grid
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('PATIENT INFORMATION', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Patient Name:`, 18, currentY + 12);
  doc.text(`Patient Email / ID:`, 18, currentY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(user?.full_name || 'Patient (Self-Reported)', 44, currentY + 12);
  doc.text(user?.email || 'Confidential Session ID', 48, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Generated On:`, 115, currentY + 12);
  doc.text(`Screening Records:`, 115, currentY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(todayStr, 142, currentY + 12);
  doc.text(`${records.length} Completed Screenings`, 147, currentY + 17);

  currentY += 27;

  // 3. Most Recent Assessment Snapshot Box
  if (records.length > 0) {
    const latest = records[0];

    doc.setFillColor(240, 253, 250); // teal-50
    doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'F');
    doc.setDrawColor(94, 234, 212); // teal-300
    doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110); // teal-700
    doc.text('LATEST CLINICAL RISK SNAPSHOT', 18, currentY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Evaluation Date: ${latest.dateFormatted || 'Recent'} (${latest.id})`, 18, currentY + 12);
    doc.text(`Menstrual Cycle Rhythm: ${latest.cycleStatus || 'Regular (2)'}`, 18, currentY + 18);

    doc.text(`Model Probability:`, 115, currentY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(latest.probability >= 60 ? 190 : 15, latest.probability >= 60 ? 18 : 118, 60);
    doc.text(`${latest.probability}% (${latest.risk_level} Risk Tier)`, 146, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Calculated BMI:`, 115, currentY + 18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${latest.bmi || '--'} kg/m²`, 140, currentY + 18);

    currentY += 29;
  }

  // 4. Longitudinal Screening Log Table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('LONGITUDINAL SCREENING LOG', 14, currentY + 2);
  currentY += 5;

  const tableBody = records.map(r => [
    r.id,
    r.dateFormatted || 'Recent',
    `${r.probability}%`,
    r.risk_level,
    r.cycleStatus || 'Regular',
    r.bmi ? `${r.bmi} kg/m²` : '--'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Record ID', 'Assessment Date', 'Probability', 'Risk Tier', 'Cycle Rhythm', 'BMI']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
  let nextY = finalY + 8;

  // Check if we have enough room on the current page for Rotterdam & Provider Notes; otherwise add a page
  if (nextY > 215) {
    doc.addPage();
    nextY = 20;
  }

  // 5. Rotterdam Diagnostic Criteria Reference for Physician
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, nextY, pageWidth - 28, 38, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, nextY, pageWidth - 28, 38, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('DIAGNOSTIC FRAMEWORK & ROTTERDAM CONSENSUS CRITERIA', 18, nextY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Diagnosis of PCOS requires meeting at least 2 of the following 3 Rotterdam criteria:', 18, nextY + 12);

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('1. Oligo- or Anovulation: Delayed or irregular menses (>35 days interval or <8 cycles/year).', 20, nextY + 18);
  doc.text('2. Hyperandrogenism: Clinical hirsutism (mFG score >= 4-6), persistent acne, or elevated Free T.', 20, nextY + 24);
  doc.text('3. Polycystic Ovarian Morphology: Ultrasound showing >= 12-20 follicles (2-9mm) or ovarian vol > 10ml.', 20, nextY + 30);

  nextY += 44;

  // 6. Recommended Clinical Tests & Discussion Agenda
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('RECOMMENDED CLINICAL WORKUP TO DISCUSS WITH PROVIDER', 14, nextY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    '• Comprehensive Hormone Panel: Serum Total/Free Testosterone, DHEA-S, LH/FSH ratio, and Prolactin.\n' +
    '• Metabolic & Glycemic Screening: Fasting Plasma Glucose, Fasting Insulin, HbA1c, and Lipid Profile.\n' +
    '• Transvaginal / Pelvic Ultrasound: Follicle count assessment and endometrial thickness monitoring.',
    14,
    nextY + 5
  );

  nextY += 22;

  // 7. Clinical Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, nextY, pageWidth - 14, nextY);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'CONFIDENTIAL MEDICAL RECORD NOTICE: This report was prepared by the PCOSense machine learning pre-screening assistant. ' +
    'It is designed solely to facilitate structured clinical conversation between patients and licensed healthcare professionals. ' +
    'This summary does not constitute formal medical diagnosis or prescription.',
    14,
    nextY + 5,
    { maxWidth: pageWidth - 28 }
  );

  // Save the document
  const fileName = `PCOSense_Clinical_Report_${user?.full_name?.replace(/\s+/g, '_') || 'Patient'}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Generates and downloads a single assessment PDF for a specific screening session.
 */
export const exportSingleAssessmentPDF = ({
  user,
  singleRecord
}: {
  user?: { full_name?: string; email?: string } | null;
  singleRecord: AssessmentHistoryItem;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];

  let currentY = 18;

  // Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`PCOSENSE CLINICAL VISIT REPORT: ${singleRecord.id}`, 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 246, 228);
  doc.text(`Screening session timestamp: ${singleRecord.dateFormatted || todayStr}`, 20, currentY + 15);

  currentY += 28;

  // Patient & Evaluation Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('PATIENT & ASSESSMENT DETAILS', 18, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Patient Name:`, 18, currentY + 14);
  doc.text(`Assessment ID:`, 18, currentY + 20);
  doc.text(`Report Export Date:`, 18, currentY + 26);
  doc.text(`Menstrual Rhythm:`, 18, currentY + 32);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(user?.full_name || 'Patient (Self-Reported)', 50, currentY + 14);
  doc.text(singleRecord.id, 50, currentY + 20);
  doc.text(todayStr, 50, currentY + 26);
  doc.text(singleRecord.cycleStatus || 'Regular', 50, currentY + 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Calculated Model Risk:`, 110, currentY + 14);
  doc.text(`Risk Tier Category:`, 110, currentY + 20);
  doc.text(`Body Mass Index (BMI):`, 110, currentY + 26);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(
    singleRecord.probability >= 60 ? 190 : 15,
    singleRecord.probability >= 60 ? 18 : 118,
    60
  );
  doc.text(`${singleRecord.probability}%`, 150, currentY + 14);
  doc.text(`${singleRecord.risk_level}`, 150, currentY + 20);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${singleRecord.bmi || '--'} kg/m²`, 150, currentY + 26);

  currentY += 45;

  // Clinical Summary Key Findings
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('CLINICAL ASSESSMENT HIGHLIGHTS', 14, currentY);

  currentY += 5;

  const summaryRows = [
    ['Evaluation Metric', 'Recorded Value', 'Clinical Interpretation'],
    ['Estimated Risk Level', `${singleRecord.risk_level} (${singleRecord.probability}%)`, singleRecord.probability >= 60 ? 'Elevated likelihood of PCOS' : 'Low to moderate indicator pattern'],
    ['Menstrual Cycle', singleRecord.cycleStatus || 'Regular', singleRecord.cycleStatus?.includes('Irregular') ? 'Possible ovulatory dysfunction' : 'Regular cycle reported'],
    ['Anthropometric (BMI)', `${singleRecord.bmi || '--'} kg/m²`, Number(singleRecord.bmi) >= 25 ? 'Weight management & insulin sensitivity focus' : 'Normal body mass range']
  ];

  autoTable(doc, {
    startY: currentY,
    head: [summaryRows[0]],
    body: summaryRows.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    margin: { left: 14, right: 14 }
  });

  const endY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  let bottomY = endY + 10;

  // Rotterdam guide
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(14, bottomY, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(94, 234, 212);
  doc.roundedRect(14, bottomY, pageWidth - 28, 28, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('HEALTHCARE PROVIDER DISCUSSION SUMMARY', 18, bottomY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'Please bring this record to your gynecologist, endocrinologist, or primary care physician. ' +
    'Recommended topics include evaluating menstrual cycle consistency over 6 months, examining hirsutism / acne progression, ' +
    'and discussing whether baseline fasting glucose, lipid panel, or transvaginal ultrasound is indicated.',
    18,
    bottomY + 12,
    { maxWidth: pageWidth - 36 }
  );

  bottomY += 34;

  // Disclaimer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'PCOSense AI Pre-Screening Summary • Confidential Clinical Decision Support Tool • Not a standalone medical diagnosis',
    14,
    bottomY
  );

  doc.save(`PCOSense_Assessment_${singleRecord.id}.pdf`);
};

/**
 * Generates and downloads a clinical-grade PDF schedule for the Next 3 Menstrual & Ovulation Cycles Forecast.
 */
export const exportCyclePredictionsPDF = ({
  cycleLengthDays = 32,
  user,
  startDate = new Date()
}: {
  cycleLengthDays?: number;
  user?: { full_name?: string; email?: string } | null;
  startDate?: Date;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const primaryTeal = [13, 148, 136];
  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  let currentY = 18;

  // 1. Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PCOSENSE 3-CYCLE FORECAST & OVULATORY SCHEDULE', 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 246, 228);
  doc.text(`Clinical Cycle Projection Protocol • Base Interval: ${cycleLengthDays} Days`, 20, currentY + 16);

  currentY += 30;

  // 2. Patient & Model Parameter Card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('CYCLE & PATIENT PARAMETERS', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Patient Name:', 18, currentY + 12);
  doc.text('Average Cycle Length:', 18, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(user?.full_name || 'Patient (Self-Monitored)', 44, currentY + 12);
  doc.text(`${cycleLengthDays} Days ${cycleLengthDays > 35 ? '(Oligomenorrhea / Dynamic)' : '(Regular Rhythm)'}`, 52, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Forecast Generated:', 120, currentY + 12);
  doc.text('Projection Window:', 120, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(todayStr, 152, currentY + 12);
  doc.text('Next 3 Consecutive Cycles', 152, currentY + 18);

  currentY += 29;

  // 3. Compute 3 cycles
  const cycleData = [];
  const baseStart = new Date(startDate);

  for (let i = 0; i < 3; i++) {
    const cycleStart = new Date(baseStart.getTime() + i * cycleLengthDays * 86400000);
    const cycleEnd = new Date(cycleStart.getTime() + (cycleLengthDays - 1) * 86400000);
    const mensesEnd = new Date(cycleStart.getTime() + 4 * 86400000);
    
    // Estimated ovulation ~ (cycleLength - 14) days from start
    const ovulationDayOffset = Math.max(10, cycleLengthDays - 14);
    const ovulationDate = new Date(cycleStart.getTime() + ovulationDayOffset * 86400000);
    const fertileStart = new Date(ovulationDate.getTime() - 5 * 86400000);
    const fertileEnd = new Date(ovulationDate.getTime() + 1 * 86400000);
    const pmsDate = new Date(cycleEnd.getTime() - 4 * 86400000);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    cycleData.push({
      num: i + 1,
      menses: `${fmtShort(cycleStart)} – ${fmtShort(mensesEnd)}`,
      fertile: `${fmtShort(fertileStart)} – ${fmtShort(fertileEnd)}`,
      ovulation: fmt(ovulationDate),
      nextPeriod: fmt(new Date(cycleStart.getTime() + cycleLengthDays * 86400000)),
      pms: fmtShort(pmsDate)
    });
  }

  // 4. Cycle Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('3-CYCLE PREDICTIVE CHRONOLOGY TABLE', 14, currentY + 2);
  currentY += 5;

  const tableRows = cycleData.map(c => [
    `Cycle ${c.num}`,
    c.menses,
    c.fertile,
    c.ovulation,
    c.nextPeriod,
    `Log cramps, bloating & energy`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Cycle', 'Menses Window', 'Fertile Window', 'Est. Ovulation', 'Next Period Date', 'Clinical Focus']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  let postTableY = (doc as any).lastAutoTable?.finalY || currentY + 45;
  postTableY += 8;

  // 5. Phase-by-Phase Nutritional & Lifestyle Guidelines Card
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(14, postTableY, pageWidth - 28, 48, 2, 2, 'F');
  doc.setDrawColor(94, 234, 212);
  doc.roundedRect(14, postTableY, pageWidth - 28, 48, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('PCOS PHASE-BASED CLINICAL MANAGEMENT RECOMMENDATIONS', 18, postTableY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  const tips = [
    '• Menstrual Phase (Days 1-5): Replenish iron & electrolytes. Prioritize warm broths, gentle walks, and adequate hydration (2.5L).',
    '• Follicular Phase (Days 6-13): Estrogen rising. Include pumpkin & flax seeds (Seed Cycling Phase 1) to support hormone clearance.',
    '• Ovulatory Window (Est. Day - 14): Peak LH. Look for cervical mucus changes and track basal body temperature (BBT) if monitoring fertility.',
    '• Luteal Phase (Post-Ovulation to Menses): Progesterone phase. Support with sunflower & sesame seeds, magnesium, and stress reduction.'
  ];

  let tipY = postTableY + 12;
  tips.forEach(tip => {
    doc.text(tip, 18, tipY, { maxWidth: pageWidth - 36 });
    tipY += 8.5;
  });

  postTableY += 56;

  // 6. Medical Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, postTableY, pageWidth - 14, postTableY);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'CLINICAL NOTICE: Menstrual predictions in PCOS are subject to hormonal variability and anovulatory cycles. ' +
    'This PDF schedule is designed for lifestyle planning and doctor review, not as a contraception guarantee.',
    14,
    postTableY + 5,
    { maxWidth: pageWidth - 28 }
  );

  doc.save(`PCOSense_Cycle_Forecast_${cycleLengthDays}Days_${Date.now()}.pdf`);
};

/**
 * Generates and downloads a Specialist Appointment & Clinical Prep Guide PDF.
 */
export const exportSpecialistAppointmentPrepPDF = ({
  appointmentDate,
  appointmentTime = '10:00 AM',
  clinicName = 'Women’s Health & Fertility Clinic',
  doctorName = 'Attending Gynecologist / Endocrinologist',
  user,
  latestRecord
}: {
  appointmentDate: string;
  appointmentTime?: string;
  clinicName?: string;
  doctorName?: string;
  user?: { full_name?: string; email?: string } | null;
  latestRecord?: AssessmentHistoryItem | null;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  let currentY = 18;

  // 1. Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PCOSENSE SPECIALIST CONSULTATION & CLINICAL PREP GUIDE', 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 246, 228);
  doc.text('Pre-Visit Preparation, Diagnostic Agenda & Clinical Checklist for Physicians', 20, currentY + 16);

  currentY += 30;

  // 2. Appointment & Patient Card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('APPOINTMENT & PATIENT DETAILS', 18, currentY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Patient Name:', 18, currentY + 12);
  doc.text('Clinic / Facility:', 18, currentY + 18);
  doc.text('Consultation Date:', 18, currentY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(user?.full_name || 'Patient (Self-Reported)', 44, currentY + 12);
  doc.text(clinicName, 44, currentY + 18);
  doc.text(`${appointmentDate} at ${appointmentTime}`, 48, currentY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Pre-Screening Risk:', 120, currentY + 12);
  doc.text('Document Date:', 120, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(latestRecord && latestRecord.probability >= 60 ? 190 : 15, 18, 60);
  doc.text(latestRecord ? `${latestRecord.risk_level} (${latestRecord.probability}%)` : 'Screening on file', 152, currentY + 12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(todayStr, 152, currentY + 18);

  currentY += 34;

  // 3. Clinical Pre-Visit Checklist
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('CLINICAL PRE-VISIT CHECKLIST', 14, currentY);
  currentY += 4;

  const checklistItems = [
    ['[ ] 8-12 Hour Overnight Fasting', 'Required if comprehensive fasting glucose, fasting insulin, or lipid profiles are scheduled.'],
    ['[ ] Pelvic / Ultrasound Preparation', 'For transabdominal scans: drink 1L water 1 hour prior (full bladder). For transvaginal: empty bladder.'],
    ['[ ] Past Lab Reports & Ultrasounds', 'Bring paper or digital copies of previous hormone panels, thyroid (TSH), or pelvic scans.'],
    ['[ ] Current Medications & Supplements', 'Document all active supplements: Inositol, Metformin, Vitamin D3, Omega-3, Spironolactone.'],
    ['[ ] Menstrual Timeline Log', 'Have past 3-6 cycle lengths and last menstrual period (LMP) date clearly ready to share.']
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Preparation Item', 'Clinical Recommendation & Patient Action']],
    body: checklistItems,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    margin: { left: 14, right: 14 }
  });

  let nextY = (doc as any).lastAutoTable?.finalY || currentY + 45;
  nextY += 8;

  // 4. High-Yield Questions to Ask the Specialist
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(14, nextY, pageWidth - 28, 40, 2, 2, 'F');
  doc.setDrawColor(94, 234, 212);
  doc.roundedRect(14, nextY, pageWidth - 28, 40, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('KEY QUESTIONS TO ASK YOUR ENDOCRINOLOGIST OR GYNECOLOGIST', 18, nextY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  const questions = [
    '1. "Do my symptoms align with the Rotterdam criteria for PCOS (oligo-ovulation, hyperandrogenism, or polycystic ovaries)?"',
    '2. "Should we test for insulin resistance via Fasting Insulin + Fasting Glucose (HOMA-IR) or HbA1c?"',
    '3. "Would a transvaginal ultrasound (TVS) or hormone panel (LH, FSH, Total Testosterone, DHEA-S) be appropriate?"',
    '4. "What are the first-line lifestyle, dietary, or pharmacological therapies recommended for my specific profile?"'
  ];

  let qY = nextY + 12;
  questions.forEach(q => {
    doc.text(q, 18, qY, { maxWidth: pageWidth - 36 });
    qY += 7;
  });

  nextY += 46;

  // 5. Physician Notes & Recommendations Fillable Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, nextY, pageWidth - 28, 30, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, nextY, pageWidth - 28, 30, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('PHYSICIAN’S CLINICAL ASSESSMENT & ACTION PLAN (FILLABLE IN CLINIC)', 18, nextY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Diagnosis / Impression: __________________________________________________________________________', 18, nextY + 13);
  doc.text('Lab Tests Ordered: _____________________________________________________________________________', 18, nextY + 19);
  doc.text('Follow-up Date & Plan: __________________________________________________________________________', 18, nextY + 25);

  nextY += 36;

  // Disclaimer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'PCOSense Pre-Screening Prep Sheet • Take this printed guide to your clinical appointment to maximize consultation efficiency.',
    14,
    nextY
  );

  doc.save(`PCOSense_Specialist_Consultation_Prep_${Date.now()}.pdf`);
};

/**
 * Generates and downloads a 30-Day Daily Symptom & Habit Tracking Log Sheet PDF.
 */
export const exportDailyHabitTrackerPDF = ({
  user,
  targetSteps = 8000,
  targetWaterMl = 2500
}: {
  user?: { full_name?: string; email?: string } | null;
  targetSteps?: number;
  targetWaterMl?: number;
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  let currentY = 16;

  // 1. Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PCOSENSE 30-DAY DAILY SYMPTOM & WELLNESS TRACKING LOG', 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 246, 228);
  doc.text(`Daily Clinical Monitoring Sheet • Daily Targets: ${targetSteps.toLocaleString()} Steps | ${targetWaterMl} mL Water`, 20, currentY + 15);

  currentY += 27;

  // 2. Patient & Target Summary Bar
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Patient: ${user?.full_name || 'Patient (Self-Reported)'}`, 18, currentY + 6);
  doc.text(`Start Date: ${todayStr}`, 18, currentY + 11);

  doc.text(`Daily Walking Target: ${targetSteps.toLocaleString()} steps`, 90, currentY + 6);
  doc.text(`Daily Hydration Goal: ${targetWaterMl} mL`, 90, currentY + 11);

  doc.text(`Tracking Period: 30 Consecutive Days`, 148, currentY + 6);
  doc.text(`Log Frequency: 8:00 PM Daily`, 148, currentY + 11);

  currentY += 20;

  // 3. 30-Day Grid Table
  const rows = [];
  for (let d = 1; d <= 30; d++) {
    rows.push([
      `Day ${d}`,
      '', // Date
      '', // Pelvic Cramps (1-10)
      '', // Bloating (Y/N)
      '', // Mood / Energy (1-5)
      '', // Water Intake (mL)
      '', // Steps Logged
      '', // Inositol / Meds (✓)
      ''  // Sleep / Notes
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Day', 'Date', 'Cramps (1-10)', 'Bloat', 'Mood (1-5)', 'Water (mL)', 'Steps', 'Meds', 'Sleep / Notes']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 6,
      minCellHeight: 5,
      textColor: [30, 41, 59],
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 20 },
      3: { cellWidth: 14 },
      4: { cellWidth: 18 },
      5: { cellWidth: 20 },
      6: { cellWidth: 18 },
      7: { cellWidth: 14 },
      8: { cellWidth: 46, halign: 'left' }
    },
    margin: { left: 14, right: 14 }
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 180;
  let bottomY = finalTableY + 4;

  if (bottomY > 275) {
    doc.addPage();
    bottomY = 18;
  }

  // Footer guidance
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Tip: Consistent daily symptom tracking builds accurate trigger correlation heatmaps and helps your doctor tailor PCOS therapy.',
    14,
    bottomY
  );

  doc.save(`PCOSense_30Day_Habit_Tracker_${Date.now()}.pdf`);
};

/**
 * Generates and downloads a complete Patient Health Profile & History Archive PDF.
 */
export const exportComprehensiveHealthProfilePDF = ({
  user,
  profileData,
  records = [],
  symptomLogs = []
}: {
  user?: { full_name?: string; email?: string } | null;
  profileData?: any;
  records?: AssessmentHistoryItem[];
  symptomLogs?: any[];
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  let currentY = 18;

  // Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PCOSENSE COMPREHENSIVE PATIENT HEALTH RECORD', 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 246, 228);
  doc.text('Complete Clinical Profile, Biometrics, Screening History & Symptom Archive', 20, currentY + 16);

  currentY += 30;

  // Patient Card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('PATIENT PROFILE & ARCHIVE METADATA', 18, currentY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Full Name:`, 18, currentY + 13);
  doc.text(`Email / Account:`, 18, currentY + 19);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(user?.full_name || 'Patient Profile', 42, currentY + 13);
  doc.text(user?.email || 'Confidential ID', 42, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Export Timestamp:`, 115, currentY + 13);
  doc.text(`Archived Records:`, 115, currentY + 19);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(todayStr, 145, currentY + 13);
  doc.text(`${records.length} Screenings • ${symptomLogs.length} Symptom Logs`, 145, currentY + 19);

  currentY += 32;

  // Biometrics Table if profileData exists
  if (profileData) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('BASELINE CLINICAL BIOMETRICS', 14, currentY);
    currentY += 4;

    const biometricRows = [
      ['Metric', 'Recorded Value', 'Metric', 'Recorded Value'],
      ['Age', `${profileData['Age (yrs)'] || '--'} yrs`, 'BMI', `${profileData['BMI'] ? Number(profileData['BMI']).toFixed(1) : '--'} kg/m²`],
      ['Weight', `${profileData['Weight (Kg)'] || '--'} kg`, 'Height', `${profileData['Height(Cm)'] || '--'} cm`],
      ['Cycle Length', `${profileData['Cycle length(days)'] || '--'} days`, 'Menstrual Rhythm', profileData['Cycle(R/I)'] === 4 ? 'Irregular (4)' : 'Regular (2)'],
      ['Waist / Hip Ratio', `${profileData['Waist:Hip Ratio'] ? Number(profileData['Waist:Hip Ratio']).toFixed(2) : '--'}`, 'Skin Darkening', profileData['Skin darkening (Y/N)'] === 1 ? 'Yes (Present)' : 'No'],
      ['Hair Growth (Hirsutism)', profileData['hair growth(Y/N)'] === 1 ? 'Yes (Present)' : 'No', 'Weight Gain', profileData['Weight gain(Y/N)'] === 1 ? 'Yes (Reported)' : 'No']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [biometricRows[0]],
      body: biometricRows.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 45;
  }

  // Assessment History Table
  if (records.length > 0) {
    if (currentY > 210) {
      doc.addPage();
      currentY = 18;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('LONGITUDINAL CLINICAL SCREENING TIMELINE', 14, currentY);
    currentY += 4;

    const assessmentRows = records.map(r => [
      r.id,
      r.dateFormatted || 'Recent',
      `${r.probability}%`,
      r.risk_level,
      r.cycleStatus || 'Regular',
      r.bmi ? `${r.bmi} kg/m²` : '--'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Assessment ID', 'Date', 'Model Probability', 'Risk Level', 'Cycle Rhythm', 'BMI']],
      body: assessmentRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 45;
  }

  if (currentY > 230) {
    doc.addPage();
    currentY = 18;
  }

  // Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, pageWidth - 14, currentY);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'PCOSense Comprehensive Health Profile • Clinical AI Decision Support Record • Confidential Patient Copy',
    14,
    currentY + 5
  );

  doc.save(`PCOSense_Complete_Health_Record_${user?.full_name?.replace(/\s+/g, '_') || 'Patient'}_${Date.now()}.pdf`);
};

