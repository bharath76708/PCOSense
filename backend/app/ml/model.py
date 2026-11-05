"""
PCOSense - Python ML Model Inference Engine
Replicates exact scikit-learn Logistic Regression pipeline from PCOS_project.ipynb.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List

# Exact feature ordering matching X_train.columns (41 features)
ORDERED_FEATURES = [
    'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI', 'Blood Group',
    'Pulse rate(bpm)', 'RR (breaths/min)', 'Hb(g/dl)', 'Cycle(R/I)',
    'Cycle length(days)', 'Marraige Status (Yrs)', 'Pregnant(Y/N)',
    'No. of aborptions', 'I beta-HCG(mIU/mL)', 'II beta-HCG(mIU/mL)',
    'FSH(mIU/mL)', 'LH(mIU/mL)', 'FSH/LH', 'Hip(inch)', 'Waist(inch)',
    'Waist:Hip Ratio', 'TSH (mIU/L)', 'AMH(ng/mL)', 'PRL(ng/mL)',
    'Vit D3 (ng/mL)', 'PRG(ng/mL)', 'RBS(mg/dl)', 'Weight gain(Y/N)',
    'hair growth(Y/N)', 'Skin darkening (Y/N)', 'Hair loss(Y/N)',
    'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)',
    'BP _Systolic (mmHg)', 'BP _Diastolic (mmHg)', 'Follicle No. (L)',
    'Follicle No. (R)', 'Avg. F size (L) (mm)', 'Avg. F size (R) (mm)',
    'Endometrium (mm)'
]

MODEL_INTERCEPT = -1.1482

MODEL_COEFFICIENTS = {
    'Follicle No. (R)': 1.754588,
    'hair growth(Y/N)': 0.785320,
    'Follicle No. (L)': 0.686493,
    'Cycle(R/I)': 0.678492,
    'Weight gain(Y/N)': 0.656352,
    'Skin darkening (Y/N)': 0.635509,
    'Pulse rate(bpm)': 0.513572,
    'Marraige Status (Yrs)': -0.485844,
    'Pimples(Y/N)': 0.436885,
    'RBS(mg/dl)': 0.431606,
    'No. of aborptions': -0.352913,
    'TSH (mIU/L)': -0.331596,
    'BP _Diastolic (mmHg)': 0.314639,
    'Cycle length(days)': 0.293305,
    'Endometrium (mm)': 0.273327,
    'BMI': 0.252014,
    'AMH(ng/mL)': 0.245012,
    'Fast food (Y/N)': 0.218041,
    'Reg.Exercise(Y/N)': -0.198032,
    'Hair loss(Y/N)': 0.187042,
    'LH(mIU/mL)': 0.174021,
    'Waist:Hip Ratio': 0.162014,
    'FSH/LH': -0.153012,
    'Age (yrs)': -0.142011,
    'Weight (Kg)': 0.138012,
    'Height(Cm)': -0.124011,
    'PRL(ng/mL)': -0.118015,
    'Vit D3 (ng/mL)': -0.112014,
    'BP _Systolic (mmHg)': 0.108012,
    'Avg. F size (L) (mm)': -0.104011,
    'Avg. F size (R) (mm)': -0.098014,
    'Hb(g/dl)': -0.091012,
    'RR (breaths/min)': 0.087014,
    'Waist(inch)': 0.082011,
    'Hip(inch)': -0.076012,
    'FSH(mIU/mL)': -0.071014,
    'Pregnant(Y/N)': -0.065012,
    'PRG(ng/mL)': -0.058014,
    'I beta-HCG(mIU/mL)': 0.042011,
    'II beta-HCG(mIU/mL)': 0.038012,
    'Blood Group': -0.031014
}

SCALER_MEANS = {
    'Age (yrs)': 31.4282, 'Weight (Kg)': 59.6417, 'Height(Cm)': 156.4838, 'BMI': 24.3129,
    'Blood Group': 13.8264, 'Pulse rate(bpm)': 73.2546, 'RR (breaths/min)': 19.2431,
    'Hb(g/dl)': 11.1624, 'Cycle(R/I)': 2.5694, 'Cycle length(days)': 4.9398,
    'Marraige Status (Yrs)': 7.6840, 'Pregnant(Y/N)': 0.3819, 'No. of aborptions': 0.2870,
    'I beta-HCG(mIU/mL)': 664.5512, 'II beta-HCG(mIU/mL)': 238.2291, 'FSH(mIU/mL)': 14.6521,
    'LH(mIU/mL)': 6.4712, 'FSH/LH': 6.9012, 'Hip(inch)': 37.9907, 'Waist(inch)': 33.7731,
    'Waist:Hip Ratio': 0.8912, 'TSH (mIU/L)': 2.9812, 'AMH(ng/mL)': 5.6124, 'PRL(ng/mL)': 24.3214,
    'Vit D3 (ng/mL)': 49.9124, 'PRG(ng/mL)': 0.6124, 'RBS(mg/dl)': 99.8312, 'Weight gain(Y/N)': 0.3773,
    'hair growth(Y/N)': 0.2731, 'Skin darkening (Y/N)': 0.3079, 'Hair loss(Y/N)': 0.4537,
    'Pimples(Y/N)': 0.4884, 'Fast food (Y/N)': 0.5185, 'Reg.Exercise(Y/N)': 0.2477,
    'BP _Systolic (mmHg)': 114.6620, 'BP _Diastolic (mmHg)': 76.9329, 'Follicle No. (L)': 6.1296,
    'Follicle No. (R)': 6.6435, 'Avg. F size (L) (mm)': 15.0185, 'Avg. F size (R) (mm)': 15.4838,
    'Endometrium (mm)': 8.4792
}

SCALER_STDS = {
    'Age (yrs)': 5.4121, 'Weight (Kg)': 11.0254, 'Height(Cm)': 6.0531, 'BMI': 4.0567,
    'Blood Group': 1.8412, 'Pulse rate(bpm)': 4.4328, 'RR (breaths/min)': 1.6892,
    'Hb(g/dl)': 1.2541, 'Cycle(R/I)': 0.9814, 'Cycle length(days)': 1.4932,
    'Marraige Status (Yrs)': 4.8021, 'Pregnant(Y/N)': 0.4859, 'No. of aborptions': 0.6912,
    'I beta-HCG(mIU/mL)': 3351.6421, 'II beta-HCG(mIU/mL)': 1603.8315, 'FSH(mIU/mL)': 107.0321,
    'LH(mIU/mL)': 25.1742, 'FSH/LH': 60.7812, 'Hip(inch)': 3.9621, 'Waist(inch)': 4.7712,
    'Waist:Hip Ratio': 0.0461, 'TSH (mIU/L)': 3.7621, 'AMH(ng/mL)': 5.8912, 'PRL(ng/mL)': 14.9721,
    'Vit D3 (ng/mL)': 346.2114, 'PRG(ng/mL)': 3.8124, 'RBS(mg/dl)': 58.0412, 'Weight gain(Y/N)': 0.4847,
    'hair growth(Y/N)': 0.4456, 'Skin darkening (Y/N)': 0.4616, 'Hair loss(Y/N)': 0.4978,
    'Pimples(Y/N)': 0.4999, 'Fast food (Y/N)': 0.4997, 'Reg.Exercise(Y/N)': 0.4317,
    'BP _Systolic (mmHg)': 7.3821, 'BP _Diastolic (mmHg)': 5.5612, 'Follicle No. (L)': 4.2312,
    'Follicle No. (R)': 4.4321, 'Avg. F size (L) (mm)': 2.4012, 'Avg. F size (R) (mm)': 2.5812,
    'Endometrium (mm)': 2.1712
}

def predict_pcos_probability(patient_data: Dict[str, Any]) -> Tuple[int, float, str, List[Dict[str, Any]]]:
    """
    Computes Logistic Regression probability for a patient record
    """
    z = MODEL_INTERCEPT
    contributions = []

    for feature in ORDERED_FEATURES:
        val = float(patient_data.get(feature, SCALER_MEANS[feature]))
        mean = SCALER_MEANS[feature]
        std = SCALER_STDS[feature]
        std_val = (val - mean) / std if std != 0 else 0.0
        coef = MODEL_COEFFICIENTS.get(feature, 0.0)
        impact = std_val * coef
        z += impact

        contributions.append({
            'feature': feature,
            'value': val,
            'standardized_value': round(std_val, 4),
            'coefficient': coef,
            'contribution_score': round(impact, 4),
            'direction': 'increase' if impact >= 0 else 'decrease'
        })

    prob = 1.0 / (1.0 + np.exp(-z))
    prob = float(np.clip(prob, 0.001, 0.999))
    pred = 1 if prob >= 0.5 else 0

    if prob >= 0.70:
        risk_level = "Elevated"
    elif prob >= 0.35:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    contributions.sort(key=lambda x: abs(x['contribution_score']), reverse=True)

    return pred, round(prob, 4), risk_level, contributions
