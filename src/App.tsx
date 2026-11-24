import React, { useState, useEffect } from 'react';
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
import { GpuRestorationModal } from './components/features/GpuRestorationModal';
import { GpuHardwareModal } from './components/features/GpuHardwareModal';
import { RestorationStudio } from './components/studio/RestorationStudio';
import { IndianDesignStudioHub } from './components/studio/IndianDesignStudioHub';
import { PASSPORT_PRESETS } from './lib/presets';
import { PassportPreset, AppMode, GpuServerStatus } from './types';
import { CompressResult } from './lib/compression';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LicenseStatus } from './types/subscription';
import { getSavedLicense, clearActiveLicense } from './lib/licensing';
import { checkGpuServerHealth } from './lib/gpuRestoration';
import { SubscriptionGate } from './components/subscription/SubscriptionGate';
import { SubscriptionStatusModal } from './components/subscription/SubscriptionStatusModal';
import { Zap, X } from 'lucide-react';

export const MainApp: React.FC = () => {
  const [license, setLicense] = useState<LicenseStatus>(() => getSavedLicense());
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<AppMode>('passport');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // GPU Auto-Connection State
  const [gpuStatus, setGpuStatus] = useState<GpuServerStatus | null>(null);
  const [isGpuInfoOpen, setIsGpuInfoOpen] = useState<boolean>(false);
  const [showGpuToast, setShowGpuToast] = useState<boolean>(false);

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
  const [isGpuModalOpen, setIsGpuModalOpen] = useState<boolean>(false);
  const [gpuModalImage, setGpuModalImage] = useState<string | null>(null);

  // Auto-connect to physical system GPU as soon as the repo is browsed
  useEffect(() => {
    let mounted = true;
    checkGpuServerHealth().then((status) => {
      if (mounted) {
        setGpuStatus(status);
        if (status.online) {
          setShowGpuToast(true);
          const t = setTimeout(() => {
            if (mounted) setShowGpuToast(false);
          }, 4500);
          return () => clearTimeout(t);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const openGpuRestore = (initialImg?: string) => {
    setGpuModalImage(initialImg || bgProcessedImage || croppedImage || rawImage || null);
    setIsGpuModalOpen(true);
  };

  const handleApplyGpuRestored = (restoredUrl: string) => {
    if (currentStep <= 3) {
      setRawImage(restoredUrl);
      if (currentStep === 1) {
        goToStep(2);
      }
    } else if (currentStep === 4) {
      setCroppedImage(restoredUrl);
    } else {
      setBgProcessedImage(restoredUrl);
    }
  };

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

  const handleDeactivateLicense = () => {
    clearActiveLicense();
    setLicense({ active: false });
    setIsLicenseModalOpen(false);
  };

  // If client does not have an active subscription, display the Subscription Gate
  if (!license.active) {
    return (
      <I18nProvider>
        <SubscriptionGate onSuccess={(newLic) => setLicense(newLic)} />
      </I18nProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenGpuModal={() => setIsGpuInfoOpen(true)}
        license={license}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
      />

      {/* When in dedicated Indian Design Studio mode */}
      {activeMode === 'design-studio' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <IndianDesignStudioHub
            currentPhotoUrl={finalPhotoUrl || bgProcessedImage || croppedImage || rawImage}
            onBackToPassport={() => setActiveMode('passport')}
          />
        </main>
      ) : activeMode === 'restoration' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <RestorationStudio
            onSendToPassportMaker={(restoredImage) => {
              setRawImage(restoredImage);
              setActiveMode('passport');
              goToStep(2);
            }}
          />
        </main>
      ) : (
        <>
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
                onOpenGpuRestore={(img) => openGpuRestore(img)}
                onSelectStudio={() => setActiveMode('restoration')}
                onSelectDesignStudio={() => setActiveMode('design-studio')}
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
            onOpenGpuRestore={() => openGpuRestore()}
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
            onOpenDesignStudio={() => setActiveMode('design-studio')}
          />
        )}
          </main>
        </>
      )}

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

      {/* GPU Restoration Modal */}
      <GpuRestorationModal
        isOpen={isGpuModalOpen}
        onClose={() => setIsGpuModalOpen(false)}
        inputImage={gpuModalImage}
        onApplyRestoredImage={handleApplyGpuRestored}
      />

      {/* Subscription Status Modal */}
      <SubscriptionStatusModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        license={license}
        onDeactivate={handleDeactivateLicense}
      />

      {/* System GPU Hardware Monitor Modal */}
      <GpuHardwareModal
        isOpen={isGpuInfoOpen}
        onClose={() => setIsGpuInfoOpen(false)}
        status={gpuStatus}
        onLaunchStudio={() => {
          setActiveMode('restoration');
        }}
      />

      {/* Auto-Connected System GPU Toast */}
      {showGpuToast && gpuStatus?.online && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-3.5 bg-slate-900/95 text-white border border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System GPU Auto-Connected
            </div>
            <div className="text-[11px] text-slate-300">
              {gpuStatus.gpuName} • Hardware Acceleration Ready
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGpuToast(false)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg text-xs cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}
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
