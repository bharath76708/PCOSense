# MODEL_SPEC.md — PCOSense Machine Learning Specification

## 1. Dataset Overview
* **Dataset Name / Source:** Polycystic Ovary Syndrome (PCOS) Clinical & Metabolic Dataset (`PCOS_data_without_infertility.xlsx` [Sheet: `Full_new`] & `PCOS_infertility.csv`)
* **Total Instances (Rows):** 541 patients
* **Total Columns (Raw):** 45 columns (including 1 empty trailing Excel column `Unnamed: 44` which was removed, leaving 44 clinical columns)
* **Target Variable:** `PCOS (Y/N)` (Binary Classification: `0 = Non-PCOS / Normal`, `1 = PCOS Diagnosed`)
* **Identifiers Excluded from Training:** `Sl. No`, `Patient File No.`
* **Effective Feature Count:** 41 clinical, biometric, metabolic, hormonal, and pelvic ultrasound features.

---

## 2. Target Variable Distribution
* **Total Patients:** 541
* **Class 0 (Non-PCOS / Negative):** 364 patients (**67.28%**)
* **Class 1 (PCOS / Positive):** 177 patients (**32.72%**)
* **Class Imbalance Ratio:** ~2.06 : 1 (Stratified sampling applied during train/test splits and 5-fold cross-validation)

---

## 3. Complete Feature Catalog (41 Features in Exact Model Order)

| # | Feature Name in Dataset | Type | Encoding / Unit | Missing Values Handling |
|---|------------------------|------|-----------------|-------------------------|
| 1 | `Age (yrs)` | Continuous | Years (Integer: 20 - 48) | 0 missing |
| 2 | `Weight (Kg)` | Continuous | Kilograms (Float: 31.0 - 108.0) | 0 missing |
| 3 | `Height(Cm)` | Continuous | Centimeters (Float: 137.0 - 180.0) | 0 missing |
| 4 | `BMI` | Continuous | $\text{kg/m}^2$ (Float: 12.4 - 38.9) | 0 missing |
| 5 | `Blood Group` | Categorical | Discrete code: 11: A+, 12: A-, 13: B+, 14: B-, 15: O+, 16: O-, 17: AB+, 18: AB- | 0 missing |
| 6 | `Pulse rate(bpm)` | Continuous | Beats per minute (Integer: 70 - 82) | 0 missing |
| 7 | `RR (breaths/min)` | Continuous | Breaths per minute (Integer: 16 - 28) | 0 missing |
| 8 | `Hb(g/dl)` | Continuous | Hemoglobin g/dL (Float: 8.5 - 14.8) | 0 missing |
| 9 | `Cycle(R/I)` | Categorical | 2 = Regular, 4 = Irregular, 5 = Irregular variation | 0 missing |
| 10 | `Cycle length(days)` | Continuous | Days (Integer: 0 - 12) | 0 missing |
| 11 | `Marraige Status (Yrs)` | Continuous | Years (Float: 0 - 30) | 1 missing $\rightarrow$ Imputed with Median (**7.0**) |
| 12 | `Pregnant(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 13 | `No. of aborptions` | Discrete | Count (Integer: 0 - 5) | 0 missing |
| 14 | `I beta-HCG(mIU/mL)` | Continuous | mIU/mL (Float: 1.3 - 32400.0) | 0 missing |
| 15 | `II beta-HCG(mIU/mL)` | Continuous | mIU/mL (Float: 0.1 - 25000.0) | 1 non-numeric $\rightarrow$ Imputed with Median (**1.99**) |
| 16 | `FSH(mIU/mL)` | Continuous | mIU/mL (Float: 0.2 - 2051.0) | 0 missing |
| 17 | `LH(mIU/mL)` | Continuous | mIU/mL (Float: 0.0 - 2020.0) | 0 missing |
| 18 | `FSH/LH` | Continuous | Ratio (Float: 0.002 - 1372.8) | 0 missing |
| 19 | `Hip(inch)` | Continuous | Inches (Integer: 26 - 48) | 0 missing |
| 20 | `Waist(inch)` | Continuous | Inches (Integer: 24 - 47) | 0 missing |
| 21 | `Waist:Hip Ratio` | Continuous | Ratio (Float: 0.75 - 0.98) | 0 missing |
| 22 | `TSH (mIU/L)` | Continuous | mIU/L (Float: 0.04 - 65.0) | 0 missing |
| 23 | `AMH(ng/mL)` | Continuous | ng/mL (Float: 0.1 - 66.0) | 1 non-numeric string ('a') $\rightarrow$ Imputed with Median (**3.7**) |
| 24 | `PRL(ng/mL)` | Continuous | ng/mL (Float: 0.06 - 128.0) | 0 missing |
| 25 | `Vit D3 (ng/mL)` | Continuous | ng/mL (Float: 3.5 - 6000.0) | 0 missing |
| 26 | `PRG(ng/mL)` | Continuous | ng/mL (Float: 0.05 - 85.0) | 0 missing |
| 27 | `RBS(mg/dl)` | Continuous | mg/dL (Float: 60.0 - 350.0) | 0 missing |
| 28 | `Weight gain(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 29 | `hair growth(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 30 | `Skin darkening (Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 31 | `Hair loss(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 32 | `Pimples(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 33 | `Fast food (Y/N)` | Binary | 0.0 = No, 1.0 = Yes | 1 missing $\rightarrow$ Imputed with Mode (**1.0**) |
| 34 | `Reg.Exercise(Y/N)` | Binary | 0 = No, 1 = Yes | 0 missing |
| 35 | `BP _Systolic (mmHg)` | Continuous | mmHg (Integer: 12 - 140) | 0 missing |
| 36 | `BP _Diastolic (mmHg)` | Continuous | mmHg (Integer: 8 - 100) | 0 missing |
| 37 | `Follicle No. (L)` | Discrete | Count (Integer: 0 - 22) | 0 missing |
| 38 | `Follicle No. (R)` | Discrete | Count (Integer: 0 - 20) | 0 missing |
| 39 | `Avg. F size (L) (mm)` | Continuous | mm (Float: 3.0 - 24.0) | 0 missing |
| 40 | `Avg. F size (R) (mm)` | Continuous | mm (Float: 3.0 - 24.0) | 0 missing |
| 41 | `Endometrium (mm)` | Continuous | mm (Float: 1.0 - 18.0) | 0 missing |

---

## 4. Preprocessing & Data Cleaning
1. **Column Normalization:** Strip whitespace and clean duplicated spaces in column strings (e.g., `II    beta-HCG(mIU/mL)` $\rightarrow$ `II beta-HCG(mIU/mL)`).
2. **Coerce Non-Numeric Entries:** `II beta-HCG` and `AMH` had corrupted string cells (e.g. `'a'`) which were converted to `NaN` using `pd.to_numeric(..., errors='coerce')`.
3. **Median/Mode Imputation:**
   - `Marraige Status (Yrs)`: Missing replaced with median = **7.0**
   - `Fast food (Y/N)`: Missing replaced with mode = **1.0**
   - `II beta-HCG(mIU/mL)`: Missing replaced with median = **1.99**
   - `AMH(ng/mL)`: Missing replaced with median = **3.70**
4. **Feature Standardization:** `StandardScaler` ($\mu=0, \sigma=1$) fit exclusively on `X_train` and applied to `X_test` and inference payloads to prevent data leakage.

---

## 5. Train / Test Split
* **Method:** Stratified 80/20 train/test split (`random_state=42`, `stratify=y`)
* **Training Set:** 432 patients (291 Non-PCOS [67.36%], 141 PCOS [32.64%])
* **Test Set:** 109 patients (73 Non-PCOS [66.97%], 36 PCOS [33.03%])

---

## 6. Model Evaluation & Benchmark Comparison

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC | Selected? | Justification |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Logistic Regression (StandardScaled)** | **88.99%** | **81.58%** | **86.11%** | **83.78%** | **95.09%** | **YES (Best Model)** | **Highest clinical Recall (86.11%) & highest ROC-AUC (95.09%)**, crucial for medical screening to minimize false negatives |
| **Random Forest (200 Trees, Balanced)** | 91.74% | 96.55% | 77.78% | 86.15% | 93.46% | Alternative | Higher overall accuracy but significantly lower sensitivity/recall (77.78% vs 86.11%), missing 8 true cases |

### 5-Fold Stratified Cross-Validation (Selected Logistic Regression)
* **Mean Accuracy:** **86.82%** ($\pm 3.7\%$)
* **Mean Precision:** **80.90%** ($\pm 6.8\%$)
* **Mean Recall:** **78.74%** ($\pm 7.4\%$)
* **Mean F1 Score:** **79.58%** ($\pm 5.5\%$)
* **Mean ROC-AUC:** **93.34%** ($\pm 1.4\%$)

* **Fold Breakdown:**
  - Fold 1: Accuracy 81.61%, Precision 68.75%, Recall 78.57%, F1 73.33%, ROC-AUC 91.71%
  - Fold 2: Accuracy 86.21%, Precision 81.48%, Recall 75.86%, F1 78.57%, ROC-AUC 93.94%
  - Fold 3: Accuracy 91.86%, Precision 88.89%, Recall 85.71%, F1 87.27%, ROC-AUC 91.75%
  - Fold 4: Accuracy 84.88%, Precision 82.61%, Recall 67.86%, F1 74.51%, ROC-AUC 95.38%
  - Fold 5: Accuracy 89.53%, Precision 82.76%, Recall 85.71%, F1 84.21%, ROC-AUC 93.90%

### Test Set Confusion Matrix (Logistic Regression)
```
                Predicted Normal (0)   Predicted PCOS (1)
Actual Normal (0):       66                    7           (True Negatives: 66, False Positives: 7)
Actual PCOS (1):          5                   31           (False Negatives: 5, True Positives: 31)
```

---

## 7. Model Feature Importance & Coefficients ($\beta$)

| Rank | Feature | Model Importance / $|\beta|$ | Direction | Clinical Role |
|:---:|---|:---:|:---:|---|
| 1 | `Follicle No. (R)` | **1.7546** | $+$ (Positive Risk) | Right ovarian antral follicle count $>10-12$ |
| 2 | `hair growth(Y/N)` | **0.7853** | $+$ (Positive Risk) | Clinical sign of hyperandrogenism (Hirsutism) |
| 3 | `Follicle No. (L)` | **0.6865** | $+$ (Positive Risk) | Left ovarian antral follicle count |
| 4 | `Cycle(R/I)` | **0.6785** | $+$ (Positive Risk) | Menstrual irregularity (Oligomenorrhea/Amenorrhea) |
| 5 | `Weight gain(Y/N)` | **0.6564** | $+$ (Positive Risk) | Rapid/unexplained weight gain & metabolic disruption |
| 6 | `Skin darkening (Y/N)`| **0.6355** | $+$ (Positive Risk) | Acanthosis Nigricans (insulin resistance biomarker) |
| 7 | `Pulse rate(bpm)` | **0.5136** | $+$ (Positive Risk) | Autonomic / cardiovascular metabolic indicator |
| 8 | `Marraige Status (Yrs)`| **0.4858** | $-$ (Inverse Risk) | Length of marriage (demographic cofactor) |
| 9 | `Pimples(Y/N)` | **0.4369** | $+$ (Positive Risk) | Persistent adult cystic acne (hyperandrogenism) |
| 10 | `RBS(mg/dl)` | **0.4316** | $+$ (Positive Risk) | Random blood glucose (glucose intolerance indicator) |
| 11 | `No. of aborptions` | **0.3529** | $-$ (Inverse Risk) | Obstetric history |
| 12 | `TSH (mIU/L)` | **0.3316** | $-$ (Inverse Risk) | Thyroid-stimulating hormone (thyroid axis differentiation) |
| 13 | `BP _Diastolic (mmHg)`| **0.3146** | $+$ (Positive Risk) | Diastolic blood pressure |
| 14 | `Cycle length(days)` | **0.2933** | $+$ (Positive Risk) | Duration of menstrual cycle bleed |
| 15 | `Endometrium (mm)` | **0.2733** | $+$ (Positive Risk) | Endometrial lining proliferation under unopposed estrogen |

---

## 8. Prediction Probability & Stratification Formula
For any standardized input vector $\mathbf{x}_{\text{scaled}} = \frac{\mathbf{x} - \boldsymbol{\mu}}{\boldsymbol{\sigma}}$:

$$z = \beta_0 + \sum_{i=1}^{41} \beta_i \cdot x_{\text{scaled}, i}$$

$$P(\text{PCOS}) = \sigma(z) = \frac{1}{1 + e^{-z}}$$

$$\text{Risk Category} = \begin{cases} 
\text{Low Risk} & \text{if } P < 0.35 \\ 
\text{Moderate Risk} & \text{if } 0.35 \le P < 0.70 \\ 
\text{Elevated / High Risk} & \text{if } P \ge 0.70 
\end{cases}$$

---

## 9. Required Artifacts
1. `pcos_best_model.pkl`: Trained `LogisticRegression(max_iter=1000, random_state=42)`
2. `pcos_scaler.pkl`: `StandardScaler()` fit on training set
3. `pcos_feature_names.pkl`: List of 41 feature column names in exact order
