import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Stethoscope,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Award
} from 'lucide-react';
import { NMCPrescription } from '../types';
import { useLanguage } from '../translations';

interface NmcPrescriptionModalProps {
  prescription: NMCPrescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NmcPrescriptionModal: React.FC<NmcPrescriptionModalProps> = ({
  prescription,
  isOpen,
  onClose
}) => {
  const { isTelugu } = useLanguage();

  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      id="nmc-prescription-modal-backdrop"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:m-0 print:p-0"
        id="nmc-prescription-container"
      >
        {/* Modal Toolbar (hidden in print) */}
        <div className="flex items-center justify-between p-4 px-6 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isTelugu ? 'ధృవీకరించబడిన NMC డిజిటల్ ప్రిస్క్రిప్షన్' : 'Verified NMC Digital Telemedicine Prescription'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              MoHFW Guidelines 2020
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              id="print-prescription-btn"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ప్రింట్ / PDF సేవ్ చేయండి' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Prescription Document Sheet (Print Target) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:bg-white print:p-6 print:space-y-4">
          
          {/* Regulatory Letterhead Header */}
          <div className="border-b-2 border-teal-600 pb-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-teal-950 dark:text-teal-200 print:text-teal-900">
                      {prescription.doctorDetails.name}
                    </h2>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-slate-700">
                      {prescription.doctorDetails.qualification}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 print:text-slate-700 space-y-0.5">
                  <p className="font-semibold">{prescription.doctorDetails.clinicName}</p>
                  <p>{prescription.doctorDetails.clinicAddress}</p>
                </div>
              </div>

              {/* RMP Registration Seal Block */}
              <div className="sm:text-right text-xs bg-slate-50 dark:bg-slate-800/80 print:bg-slate-50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 print:border-slate-300">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>RMP Registered Practitioner</span>
                </div>
                <p className="font-black text-slate-900 dark:text-white print:text-black">
                  Council Reg No: {prescription.doctorDetails.medicalCouncilRegNo}
                </p>
                <p className="text-[11px] text-slate-500 print:text-slate-600">
                  {prescription.doctorDetails.stateMedicalCouncil}
                </p>
                <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1">
                  Rx ID: {prescription.prescriptionId}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-800/60 print:bg-slate-100 border border-teal-100 dark:border-slate-700 print:border-slate-300 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Name</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
                {prescription.patientDetails.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Age / Gender</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">
                {prescription.patientDetails.age || 'Adult'} Yrs / {prescription.patientDetails.gender}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Date & Time</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">
                {new Date(prescription.issuedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}{' '}
                {new Date(prescription.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ABHA Health ID</span>
              <span className="font-mono font-bold text-teal-700 dark:text-teal-300 print:text-teal-800">
                {prescription.patientDetails.abhaId || 'Not Linked (Optional)'}
              </span>
            </div>
          </div>

          {/* Clinical Impression & ICD-10 Diagnosis */}
          <div className="space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Provisional Diagnosis / Rotterdam Phenotype
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white print:text-black">
                  {prescription.clinicalFindings.rotterdamPhenotype}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-mono font-bold text-[11px] border border-teal-300 dark:border-teal-700">
                ICD-10: {prescription.clinicalFindings.icd10Code}
              </span>
            </div>

            {prescription.clinicalFindings.chiefComplaints && (
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700 pt-1">
                <strong>Chief Complaints & Findings:</strong> {prescription.clinicalFindings.chiefComplaints}
              </p>
            )}
          </div>

          {/* Rx: Medications Table (Mandatory Generic Names per Telemedicine Guidelines) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-teal-700 dark:text-teal-400 print:text-teal-800">℞</span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white print:text-black">
                  Prescribed Medications (Generic Formulations)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                NMC Telemedicine Schedule Compliant
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-200 text-slate-700 dark:text-slate-300 print:text-slate-900 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5 sm:p-3">#</th>
                    <th className="p-2.5 sm:p-3">Generic Name (Form & Strength)</th>
                    <th className="p-2.5 sm:p-3">Frequency</th>
                    <th className="p-2.5 sm:p-3">Duration</th>
                    <th className="p-2.5 sm:p-3">Instructions</th>
                    <th className="p-2.5 sm:p-3 print:hidden">Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                  {prescription.medications.map((med, idx) => (
                    <tr key={med.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 sm:p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 sm:p-3">
                        <span className="font-extrabold text-slate-900 dark:text-white print:text-black block">
                          {med.genericName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {med.dosageForm} • {med.strength} {med.brandNameOptional ? `(${med.brandNameOptional})` : ''}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-3 font-bold text-teal-800 dark:text-teal-300 print:text-teal-900 whitespace-nowrap">
                        {med.frequency}
                      </td>
                      <td className="p-2.5 sm:p-3 whitespace-nowrap">{med.durationDays} Days</td>
                      <td className="p-2.5 sm:p-3 text-slate-600 dark:text-slate-300 print:text-slate-700">
                        {med.instructions}
                      </td>
                      <td className="p-2.5 sm:p-3 print:hidden">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {med.drugClassification.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Investigations & Diagnostic Lab Orders */}
          {prescription.investigationsRequested && prescription.investigationsRequested.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 border border-slate-200 dark:border-slate-700 print:border-slate-300 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white print:text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-600" />
                <span>Diagnostic Investigations Ordered:</span>
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 print:text-slate-800 font-medium pl-1">
                {prescription.investigationsRequested.map((inv, iIdx) => (
                  <li key={iIdx}>{inv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Nutrition Therapy (MNT) & Lifestyle Orders */}
          {prescription.medicalNutritionAndLifestyleAdvice && prescription.medicalNutritionAndLifestyleAdvice.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 print:bg-emerald-50 border border-emerald-200 dark:border-emerald-800/60 print:border-emerald-300 text-xs space-y-1.5">
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200 print:text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Medical Nutrition & Lifestyle Protocol:</span>
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900 dark:text-emerald-300 print:text-emerald-900 pl-1">
                {prescription.medicalNutritionAndLifestyleAdvice.map((adv, aIdx) => (
                  <li key={aIdx}>{adv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up advice */}
          {prescription.followUpAdvice && (
            <div className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 pt-1">
              <strong>Follow-Up Directives:</strong> {prescription.followUpAdvice}
            </div>
          )}

          {/* Statutory Telemedicine Emergency Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 print:bg-amber-50 border border-amber-200 dark:border-amber-800/80 print:border-amber-300 text-[11px] text-amber-900 dark:text-amber-200 print:text-amber-950 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase">Statutory Red-Flag Disclaimer:</span>{' '}
              {prescription.emergencyDisclaimer}
            </div>
          </div>

          {/* Digital Signature & Council Stamp */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono space-y-0.5">
              <p>Security Hash: {prescription.digitalSignature.verificationHash}</p>
              <p>Generated under Indian IT Act 2000 & Telemedicine Guidelines 2020</p>
              <p>Timestamp: {new Date(prescription.digitalSignature.timestamp).toISOString()}</p>
            </div>

            <div className="text-right sm:self-end">
              <div className="inline-block p-2 px-4 rounded-xl border border-teal-300 dark:border-teal-700 print:border-teal-800 bg-teal-50/50 dark:bg-slate-800 text-center">
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-widest block">
                  Authenticated Digital Seal
                </span>
                <span className="font-serif italic font-bold text-slate-900 dark:text-white print:text-black text-sm block">
                  {prescription.digitalSignature.signedByName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Reg No: {prescription.digitalSignature.regNo}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
