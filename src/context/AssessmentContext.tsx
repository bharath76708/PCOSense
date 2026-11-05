/**
 * Assessment Context for PCOSense
 * Preserves multi-step wizard state, loaded profile/preset, and latest prediction response
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PatientRecord, PredictionResponse } from '../types';
import { getDefaultPatientRecord, PRESET_PROFILES, generatePredictionResponse } from '../ml/modelEngine';
import { predictPCOS, saveUserProfile } from '../services/api';
import { useAuth } from './AuthContext';

interface AssessmentContextType {
  patientData: PatientRecord;
  currentStep: number;
  predictionResult: PredictionResponse | null;
  isLoading: boolean;
  error: string | null;
  activePresetId: string | null;
  isProfileAutoLoaded: boolean;
  hasModifiedSinceLoad: boolean;
  updateField: (field: keyof PatientRecord, value: number) => void;
  updateMultipleFields: (fields: Partial<PatientRecord>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  loadPreset: (presetId: string) => void;
  loadFromUserProfile: () => void;
  saveCurrentFormToProfile: () => Promise<boolean>;
  resetAssessment: () => void;
  submitPrediction: (notes?: string, updateProfileToo?: boolean) => Promise<PredictionResponse | null>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const FORM_STORAGE_KEY = 'pcosense_active_form_state';
const FORM_LOCAL_BACKUP_KEY = 'pcosense_latest_patient_inputs';
const RESULT_STORAGE_KEY = 'pcosense_active_result_state';
const RESULT_LOCAL_BACKUP_KEY = 'pcosense_latest_prediction_result';

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, isAuthenticated, saveProfileData } = useAuth();

  const [patientData, setPatientData] = useState<PatientRecord>(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY) || localStorage.getItem(FORM_LOCAL_BACKUP_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getDefaultPatientRecord();
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileAutoLoaded, setIsProfileAutoLoaded] = useState<boolean>(false);
  const [hasModifiedSinceLoad, setHasModifiedSinceLoad] = useState<boolean>(false);

  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(() => {
    try {
      const saved = sessionStorage.getItem(RESULT_STORAGE_KEY) || localStorage.getItem(RESULT_LOCAL_BACKUP_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generatePredictionResponse(getDefaultPatientRecord());
  });

  // Automatically load saved profile when user is logged in and has completed/saved profile
  useEffect(() => {
    if (isAuthenticated && profile && profile.patientData && !isProfileAutoLoaded) {
      // Check if session storage already has custom data or if we should populate with saved profile
      const savedSession = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (!savedSession || savedSession === '{}') {
        setPatientData({ ...getDefaultPatientRecord(), ...profile.patientData });
        setIsProfileAutoLoaded(true);
        setHasModifiedSinceLoad(false);
      }
    }
  }, [isAuthenticated, profile]);

  // Auto-sync form state to sessionStorage & localStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(patientData));
      localStorage.setItem(FORM_LOCAL_BACKUP_KEY, JSON.stringify(patientData));
    } catch {
      // ignore
    }
  }, [patientData]);

  // Auto-sync prediction result
  useEffect(() => {
    if (predictionResult) {
      try {
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(predictionResult));
        localStorage.setItem(RESULT_LOCAL_BACKUP_KEY, JSON.stringify(predictionResult));
      } catch {
        // ignore
      }
    }
  }, [predictionResult]);

  // Background debounced autosave of patient data to user profile if authenticated
  useEffect(() => {
    if (!isAuthenticated || !hasModifiedSinceLoad) return;
    const timer = setTimeout(() => {
      saveProfileData(patientData).catch(() => {
        // silently catch background autosave
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [patientData, isAuthenticated, hasModifiedSinceLoad]);

  const updateField = (field: keyof PatientRecord, value: number) => {
    setHasModifiedSinceLoad(true);
    setPatientData(prev => {
      const next = { ...prev, [field]: value };
      
      // If height or weight changed, auto-compute BMI
      if (field === 'Height(Cm)' || field === 'Weight (Kg)') {
        const heightM = (field === 'Height(Cm)' ? value : next['Height(Cm)']) / 100;
        const weightKg = field === 'Weight (Kg)' ? value : next['Weight (Kg)'];
        if (heightM > 0 && weightKg > 0) {
          next['BMI'] = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
        }
      }

      // If waist or hip changed, auto-compute ratio
      if (field === 'Waist(inch)' || field === 'Hip(inch)') {
        const waist = field === 'Waist(inch)' ? value : next['Waist(inch)'];
        const hip = field === 'Hip(inch)' ? value : next['Hip(inch)'];
        if (hip > 0 && waist > 0) {
          next['Waist:Hip Ratio'] = Math.round((waist / hip) * 1000) / 1000;
        }
      }

      // If FSH or LH changed, auto-compute FSH/LH ratio
      if (field === 'FSH(mIU/mL)' || field === 'LH(mIU/mL)') {
        const fsh = field === 'FSH(mIU/mL)' ? value : next['FSH(mIU/mL)'];
        const lh = field === 'LH(mIU/mL)' ? value : next['LH(mIU/mL)'];
        if (lh > 0) {
          next['FSH/LH'] = Math.round((fsh / lh) * 100) / 100;
        }
      }

      return next;
    });
  };

  const updateMultipleFields = (fields: Partial<PatientRecord>) => {
    setHasModifiedSinceLoad(true);
    setPatientData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESET_PROFILES.find(p => p.id === presetId);
    if (preset) {
      setPatientData({ ...getDefaultPatientRecord(), ...preset.data });
      setActivePresetId(presetId);
      setIsProfileAutoLoaded(false);
      setHasModifiedSinceLoad(false);
      setError(null);
    }
  };

  const loadFromUserProfile = () => {
    if (profile && profile.patientData) {
      setPatientData({ ...getDefaultPatientRecord(), ...profile.patientData });
      setIsProfileAutoLoaded(true);
      setActivePresetId(null);
      setHasModifiedSinceLoad(false);
      setError(null);
    }
  };

  const saveCurrentFormToProfile = async (): Promise<boolean> => {
    try {
      await saveProfileData(patientData);
      setHasModifiedSinceLoad(false);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
      return false;
    }
  };

  const resetAssessment = () => {
    setPatientData(getDefaultPatientRecord());
    setCurrentStep(1);
    setActivePresetId(null);
    setIsProfileAutoLoaded(false);
    setHasModifiedSinceLoad(false);
    setError(null);
  };

  const submitPrediction = async (notes?: string, updateProfileToo: boolean = true): Promise<PredictionResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (updateProfileToo && isAuthenticated) {
        await saveProfileData(patientData);
        setHasModifiedSinceLoad(false);
      }

      const response = await predictPCOS(patientData, notes);
      setPredictionResult(response);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate risk prediction');
      setIsLoading(false);
      return null;
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        patientData,
        currentStep,
        predictionResult,
        isLoading,
        error,
        activePresetId,
        isProfileAutoLoaded,
        hasModifiedSinceLoad,
        updateField,
        updateMultipleFields,
        setCurrentStep,
        nextStep,
        prevStep,
        loadPreset,
        loadFromUserProfile,
        saveCurrentFormToProfile,
        resetAssessment,
        submitPrediction
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
