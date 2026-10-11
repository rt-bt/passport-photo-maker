import React, { useState } from 'react';
import { I18nProvider } from './i18n';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Stepper } from './components/layout/Stepper';
import { Step1Upload } from './components/steps/Step1Upload';
import { Step2Preset } from './components/steps/Step2Preset';
import { Step3CropAlign } from './components/steps/Step3CropAlign';
import { Step4Background } from './components/steps/Step4Background';
import { Step5AdjustCompress } from './components/steps/Step5AdjustCompress';
import { Step6PrintSheet } from './components/steps/Step6PrintSheet';
import { Step7Download } from './components/steps/Step7Download';
import { Modal } from './components/common/Modal';
import { ComplianceChecklist } from './components/features/ComplianceChecklist';
import { BatchProcessorModal } from './components/features/BatchProcessorModal';
import { PASSPORT_PRESETS } from './lib/presets';
import { PassportPreset } from './types';
import { CompressResult } from './lib/compression';
import { useLocalStorage } from './hooks/useLocalStorage';

export const MainApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // Stored preferences
  const [savedPresetId, setSavedPresetId] = useLocalStorage<string>(
    'ppm_preset_id',
    'in-passport'
  );
  const [dpi, setDpi] = useLocalStorage<150 | 300 | 600>('ppm_dpi', 300);

  const [preset, setPreset] = useState<PassportPreset>(() => {
    return PASSPORT_PRESETS.find((p) => p.id === savedPresetId) || PASSPORT_PRESETS[0];
  });

  // Photo workflow data states
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [originalSizeBytes, setOriginalSizeBytes] = useState<number>(0);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [bgProcessedImage, setBgProcessedImage] = useState<string | null>(null);
  const [finalPhotoUrl, setFinalPhotoUrl] = useState<string | null>(null);
  const [compressResult, setCompressResult] = useState<CompressResult | null>(null);

  // Modals
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
  };

  const handlePresetSelect = (newPreset: PassportPreset) => {
    setPreset(newPreset);
    setSavedPresetId(newPreset.id);
  };

  const handleRestart = () => {
    setRawImage(null);
    setCroppedImage(null);
    setBgProcessedImage(null);
    setFinalPhotoUrl(null);
    setCompressResult(null);
    setCurrentStep(1);
    setMaxReachedStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header onOpenBatch={() => setIsBatchOpen(true)} />

      {rawImage && (
        <Stepper
          currentStep={currentStep}
          maxReachedStep={maxReachedStep}
          onSelectStep={setCurrentStep}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <Step1Upload
            onImageLoaded={(dataUrl, sizeBytes) => {
              setRawImage(dataUrl);
              setOriginalSizeBytes(sizeBytes);
              goToStep(2);
            }}
          />
        )}

        {/* Step 2: Choose Size Preset */}
        {currentStep === 2 && rawImage && (
          <Step2Preset
            selectedPreset={preset}
            onSelectPreset={handlePresetSelect}
            dpi={dpi}
            onChangeDpi={setDpi}
            onNext={() => goToStep(3)}
            onBack={() => setCurrentStep(1)}
            onOpenCompliance={() => setIsComplianceOpen(true)}
          />
        )}

        {/* Step 3: Crop & Align Face */}
        {currentStep === 3 && rawImage && (
          <Step3CropAlign
            imageSrc={rawImage}
            preset={preset}
            dpi={dpi}
            onCropComplete={(croppedUrl) => {
              setCroppedImage(croppedUrl);
              goToStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* Step 4: Background Removal */}
        {currentStep === 4 && (croppedImage || rawImage) && (
          <Step4Background
            croppedImage={croppedImage || rawImage!}
            preset={preset}
            dpi={dpi}
            onComplete={(bgUrl) => {
              setBgProcessedImage(bgUrl);
              goToStep(5);
            }}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Step 5: Adjustments & Compression */}
        {currentStep === 5 && (bgProcessedImage || croppedImage || rawImage) && (
          <Step5AdjustCompress
            inputImage={bgProcessedImage || croppedImage || rawImage!}
            preset={preset}
            dpi={dpi}
            originalSizeBytes={originalSizeBytes}
            onComplete={(finalUrl, result) => {
              setFinalPhotoUrl(finalUrl);
              setCompressResult(result);
              goToStep(6);
            }}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {/* Step 6: Print Sheet */}
        {currentStep === 6 && (finalPhotoUrl || bgProcessedImage || croppedImage || rawImage) && (
          <Step6PrintSheet
            photoDataUrl={finalPhotoUrl || bgProcessedImage || croppedImage || rawImage!}
            preset={preset}
            dpi={dpi}
            onNext={() => goToStep(7)}
            onBack={() => setCurrentStep(5)}
          />
        )}

        {/* Step 7: Download & Summary */}
        {currentStep === 7 && (finalPhotoUrl || bgProcessedImage || croppedImage || rawImage) && (
          <Step7Download
            finalPhotoUrl={finalPhotoUrl || bgProcessedImage || croppedImage || rawImage!}
            preset={preset}
            dpi={dpi}
            compressResult={compressResult}
            onRestart={handleRestart}
            onGoToSheet={() => setCurrentStep(6)}
            onOpenCompliance={() => setIsComplianceOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Compliance Checklist Modal */}
      <Modal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        title="Official Passport Compliance Checklist"
        maxWidth="xl"
      >
        <ComplianceChecklist
          currentPreset={preset}
          onSelectPreset={(newPreset) => {
            handlePresetSelect(newPreset);
            setIsComplianceOpen(false);
          }}
        />
      </Modal>

      {/* Batch Processing Modal */}
      <BatchProcessorModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        preset={preset}
      />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
