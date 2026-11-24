'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Upload,
  Download,
  FileSpreadsheet,
  QrCode,
  Barcode,
  Printer,
  ShieldAlert,
  Users,
  CheckCircle,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { IDCardData } from '@/types';
import { generateA4BatchIDPDF } from '@/lib/exportUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IDCardMaker() {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [category, setCategory] = useState<'school' | 'college' | 'corporate' | 'hospital' | 'visitor'>('school');

  // Single ID Card Active Data
  const [cardData, setCardData] = useState<IDCardData>({
    id: 'DPS-2026-1042',
    fullName: 'Aarav Sharma',
    designationOrClass: 'Class X - Science',
    idNumber: 'DPS-2026-1042',
    departmentOrSection: 'Section A',
    bloodGroup: 'O+',
    dob: '14-08-2010',
    contactNumber: '+91 98765 43210',
    organizationName: 'DELHI PUBLIC SCHOOL',
    validUpto: '31 March 2027',
    emergencyContact: 'Mr. Rajesh Sharma (Father): +91 98765 00000',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  });

  // Batch CSV records for bulk generation
  const [batchRecords, setBatchRecords] = useState<IDCardData[]>([
    {
      id: 'DPS-101',
      fullName: 'Aarav Sharma',
      designationOrClass: 'Class X - A',
      idNumber: 'DPS-2026-101',
      departmentOrSection: 'Science',
      bloodGroup: 'O+',
      dob: '12-05-2010',
      contactNumber: '+91 98765 43210',
      organizationName: 'DELHI PUBLIC SCHOOL',
      validUpto: '31-03-2027',
      emergencyContact: '+91 98765 00000',
    },
    {
      id: 'DPS-102',
      fullName: 'Diya Patel',
      designationOrClass: 'Class X - B',
      idNumber: 'DPS-2026-102',
      departmentOrSection: 'Commerce',
      bloodGroup: 'B+',
      dob: '22-09-2010',
      contactNumber: '+91 98111 22334',
      organizationName: 'DELHI PUBLIC SCHOOL',
      validUpto: '31-03-2027',
      emergencyContact: '+91 98111 99999',
    },
    {
      id: 'DPS-103',
      fullName: 'Kabir Singh',
      designationOrClass: 'Class XI - A',
      idNumber: 'DPS-2026-103',
      departmentOrSection: 'Science',
      bloodGroup: 'A+',
      dob: '18-02-2009',
      contactNumber: '+91 98222 33445',
      organizationName: 'DELHI PUBLIC SCHOOL',
      validUpto: '31-03-2027',
      emergencyContact: '+91 98222 88888',
    },
    {
      id: 'DPS-104',
      fullName: 'Ananya Deshmukh',
      designationOrClass: 'Class IX - C',
      idNumber: 'DPS-2026-104',
      departmentOrSection: 'Humanities',
      bloodGroup: 'AB+',
      dob: '05-11-2011',
      contactNumber: '+91 98333 44556',
      organizationName: 'DELHI PUBLIC SCHOOL',
      validUpto: '31-03-2027',
      emergencyContact: '+91 98333 77777',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate QR Code and Barcode
  useEffect(() => {
    // Generate QR
    QRCode.toDataURL(
      `ID:${cardData.idNumber}|NAME:${cardData.fullName}|ORG:${cardData.organizationName}|BG:${cardData.bloodGroup}`,
      { width: 100, margin: 1 }
    )
      .then(setQrDataUrl)
      .catch(console.error);

    // Generate Barcode SVG
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, cardData.idNumber || 'DPS20261042', {
          format: 'CODE128',
          width: 1.5,
          height: 35,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.warn('Barcode error', err);
      }
    }
  }, [cardData]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCardData((prev) => ({ ...prev, photoUrl: ev.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle CSV Import
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed: IDCardData[] = [];
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          parsed.push({
            id: parts[0] || `ID-${i}`,
            fullName: parts[1] || 'Student/Employee',
            designationOrClass: parts[2] || 'Class/Designation',
            idNumber: parts[0] || `DPS-${i}`,
            departmentOrSection: parts[3] || 'General',
            bloodGroup: parts[4] || 'B+',
            dob: parts[5] || '01-01-2005',
            contactNumber: parts[6] || '+91 90000 00000',
            organizationName: cardData.organizationName,
            validUpto: cardData.validUpto,
            emergencyContact: parts[7] || '',
          });
        }
      }

      if (parsed.length > 0) {
        setBatchRecords(parsed);
        alert(`Successfully imported ${parsed.length} student/employee records!`);
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV template
  const handleDownloadSampleCSV = () => {
    const csvContent = `ID_Number,Full_Name,Designation_or_Class,Department,Blood_Group,DOB,Contact,Emergency_Contact
DPS-2026-01,Aryan Singh,Class X - A,Science,O+,15-05-2010,+91 9876543210,+91 9876500000
DPS-2026-02,Isha Sharma,Class X - B,Commerce,B+,12-08-2010,+91 9811122334,+91 9811199999
DPS-2026-03,Rohan Gupta,Class XI - A,Science,A+,20-02-2009,+91 9822233445,+91 9822288888
DPS-2026-04,Sneha Patel,Class IX - C,General,AB+,11-11-2011,+91 9833344556,+91 9833377777`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ID_Card_Bulk_Data_Sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Single CR80 Card PDF
  const handleDownloadSingleCardPDF = async () => {
    if (!cardElementRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = await html2canvas(cardElementRef.current, {
        scale: 3, // 300 DPI sharpness
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54], // Exact CR80 standard credit card size (85.6mm x 54mm)
      });

      doc.addImage(imgData, 'JPEG', 0, 0, 85.6, 54);
      doc.save(`${cardData.fullName}_ID_Card_CR80.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate 10 Cards A4 Print Sheet
  const handleGenerateA4Sheet = async () => {
    if (!cardElementRef.current) return;
    setIsProcessing(true);

    try {
      // Capture the current card canvas as base image
      const canvas = await html2canvas(cardElementRef.current, {
        scale: 2.5,
        useCORS: true,
      });
      const singleCardImg = canvas.toDataURL('image/jpeg', 0.95);

      // Repeat for all batch records or replicate current card 10 times on page
      const cardImages = Array(Math.max(batchRecords.length, 10)).fill(singleCardImg);

      await generateA4BatchIDPDF(cardImages, {
        title: `${cardData.organizationName}_A4_ID_Sheet`,
        includeCropMarks: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          CR80 Standard PVC ID Card Generator
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          School & Corporate ID Card Maker
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Design high-resolution PVC identity cards with live barcode, QR code verification, Excel batch import, and 10-cards-per-A4 sheet print output.
        </p>
      </div>

      {/* Organization Authorization Notice */}
      <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Organization Verification & Authorization Notice:</span>
          <p className="text-amber-800/90 mt-0.5 leading-relaxed">
            By generating and printing identity cards on this platform, you certify that you are an authorized representative of the designated educational institution, hospital, or corporate organization. Unauthorized reproduction of government or institutional credentials is strictly prohibited under Indian Law.
          </p>
        </div>
      </div>

      {/* Single vs Bulk Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single ID Designer
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'bulk'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Bulk Excel / CSV Batch Generator
          </button>
        </div>
      </div>

      {/* SINGLE ID DESIGNER WORKFLOW */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FORM PANEL (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Student / Employee Details</h3>
              {/* Category selector */}
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setCategory(cat);
                  if (cat === 'corporate') {
                    setCardData((prev) => ({
                      ...prev,
                      organizationName: 'INFOTECH CLOUD SOLUTIONS PVT LTD',
                      designationOrClass: 'Senior Software Engineer',
                      departmentOrSection: 'Engineering & DevOps',
                    }));
                  } else if (cat === 'hospital') {
                    setCardData((prev) => ({
                      ...prev,
                      organizationName: 'CITY CARE MULTI-SPECIALTY HOSPITAL',
                      designationOrClass: 'Staff Nurse / Medical Officer',
                      departmentOrSection: 'ICU / Emergency',
                    }));
                  } else {
                    setCardData((prev) => ({
                      ...prev,
                      organizationName: 'DELHI PUBLIC SCHOOL',
                      designationOrClass: 'Class X - Science',
                      departmentOrSection: 'Section A',
                    }));
                  }
                }}
                className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="school">School Student ID</option>
                <option value="college">College / University Pass</option>
                <option value="corporate">Corporate Employee Badge</option>
                <option value="hospital">Hospital Medical Staff</option>
                <option value="visitor">Visitor & Event Pass</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / School Name
                </label>
                <input
                  type="text"
                  value={cardData.organizationName}
                  onChange={(e) => setCardData({ ...cardData, organizationName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={cardData.fullName}
                  onChange={(e) => setCardData({ ...cardData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class / Designation
                </label>
                <input
                  type="text"
                  value={cardData.designationOrClass}
                  onChange={(e) => setCardData({ ...cardData, designationOrClass: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Number / Roll No.
                </label>
                <input
                  type="text"
                  value={cardData.idNumber}
                  onChange={(e) => setCardData({ ...cardData, idNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={cardData.bloodGroup}
                  onChange={(e) => setCardData({ ...cardData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={cardData.contactNumber}
                  onChange={(e) => setCardData({ ...cardData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valid Upto
                </label>
                <input
                  type="text"
                  value={cardData.validUpto}
                  onChange={(e) => setCardData({ ...cardData, validUpto: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Card Holder Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadSingleCardPDF}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                {isProcessing ? 'Generating...' : 'Download Single CR80 Card (PDF)'}
              </button>
              <button
                onClick={handleGenerateA4Sheet}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Print 10 Cards on A4 Sheet
              </button>
            </div>
          </div>

          {/* LIVE CR80 CARD PREVIEW (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>CR80 Card Live Preview</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                <button
                  onClick={() => setActiveSide('front')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeSide === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setActiveSide('back')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeSide === 'back' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* CARD DOM CONTAINER (Exact 85.6mm x 54mm aspect ratio 1.585) */}
            <div
              ref={cardElementRef}
              className="w-full aspect-[1.585/1] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between relative select-none"
            >
              {activeSide === 'front' ? (
                <>
                  {/* Front Top Header */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-3 text-white text-center">
                    <h3 className="font-bold text-xs sm:text-sm tracking-tight leading-tight">
                      {cardData.organizationName}
                    </h3>
                    <p className="text-[9px] text-blue-200 mt-0.5">
                      IDENTITY PASS • SESSION 2026-27
                    </p>
                  </div>

                  {/* Front Body */}
                  <div className="flex-1 px-4 py-2.5 flex items-center gap-4">
                    {/* Photo Box */}
                    <div className="w-20 sm:w-24 aspect-[35/45] rounded-lg border-2 border-blue-900 overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                      {cardData.photoUrl ? (
                        <img
                          src={cardData.photoUrl}
                          alt="ID Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          Photo
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-tight truncate">
                        {cardData.fullName}
                      </h4>
                      <p className="text-[10px] font-semibold text-blue-700 truncate">
                        {cardData.designationOrClass}
                      </p>

                      <div className="mt-1.5 space-y-0.5 text-[9px] text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">ID No.:</span>{' '}
                          {cardData.idNumber}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Blood Group:</span>{' '}
                          <span className="text-rose-600 font-bold">{cardData.bloodGroup}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Contact:</span>{' '}
                          {cardData.contactNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Front Footer: Barcode */}
                  <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-7 flex items-center">
                      <svg ref={barcodeRef} className="h-6 max-w-[130px]" />
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-0.5 bg-blue-900 ml-auto mb-0.5" />
                      <span className="text-[8px] font-bold text-blue-900">Auth. Signature</span>
                    </div>
                  </div>
                </>
              ) : (
                /* BACK OF CARD */
                <div className="p-4 flex flex-col justify-between h-full bg-slate-50 text-slate-700 text-[10px]">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">
                      Instructions & Terms
                    </h4>
                    <ul className="mt-2 space-y-1 text-[9px] text-slate-600 list-disc list-inside">
                      <li>This card is the property of {cardData.organizationName}.</li>
                      <li>Loss of this card must be immediately reported to administration.</li>
                      <li>Card is non-transferable and must be surrendered upon departure.</li>
                      <li>Valid Upto: <span className="font-bold text-slate-900">{cardData.validUpto}</span></li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="text-[9px]">
                      <p className="font-bold text-slate-900">Emergency Contact:</p>
                      <p className="text-slate-600">{cardData.emergencyContact}</p>
                    </div>

                    {qrDataUrl && (
                      <div className="p-1 bg-white border border-slate-200 rounded">
                        <img src={qrDataUrl} alt="Verify QR" className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              Standard CR80 (85.6mm × 54mm) • Thermal PVC Card Ready
            </p>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT WORKFLOW */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900">Batch ID Generation via CSV</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload student/employee records to instantly generate sheets with 10 cards per A4 page.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSampleCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV
              </button>
              <label className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload CSV File
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID Number</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Class / Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-blue-700">{rec.idNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rec.fullName}</td>
                    <td className="py-2.5 px-3">{rec.designationOrClass}</td>
                    <td className="py-2.5 px-3">{rec.departmentOrSection}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 font-bold rounded">
                        {rec.bloodGroup}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{rec.contactNumber}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setCardData((prev) => ({
                            ...prev,
                            fullName: rec.fullName,
                            idNumber: rec.idNumber,
                            designationOrClass: rec.designationOrClass,
                            bloodGroup: rec.bloodGroup,
                            contactNumber: rec.contactNumber,
                          }));
                          setActiveTab('single');
                        }}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Batch Print CTA */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Total <span className="font-bold text-slate-900">{batchRecords.length}</span> cards ready for batch generation (10 cards / page).
            </span>
            <button
              onClick={handleGenerateA4Sheet}
              disabled={isProcessing}
              className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isProcessing ? 'Generating A4 PDF...' : 'Download Complete A4 Batch Print PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
