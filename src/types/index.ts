export type Surgery = {
  name: string;
  reason: string;
  date: string;
  notes: string;
};

export type Dog = {
  id: string;
  name: string;
  photoUrl?: string;
  species: string;
  breed: string;
  gender: 'Macho' | 'Hembra';
  birthDate?: string;
  ageText: string;
  weight: number;
  color: string;
  microchip?: string;
  allergies: string[];
  diseases: string[];
  emergencyNotes: string;
  isNeutered: boolean;
  neuterDate?: string;
  surgeries: Surgery[];
  publicQrToken?: string;
  owner: {
    name: string;
    phone: string;
    email: string;
  };
};

export type TreatmentState = 'activo' | 'finalizado' | 'suspendido';

export type Treatment = {
  id: string;
  name: string;
  reason: string;
  startDate: string;
  endDate?: string;       // Optional: null/empty for permanent treatments
  frequencyHours: number; // every X hours
  doseAmount: number;
  unit: string;
  initialQuantity: number;
  remainingQuantity: number;
  state: TreatmentState;
  notes: string;
  isPermanent?: boolean;  // true = no end date required
  recipeId?: string;      // Link to recipe
};

export type DoseHistory = {
  id: string;
  treatmentId: string;
  medicineName: string;
  doseAmount: number;
  unit: string;
  givenAt: string; // ISO string Date
  status: 'dada' | 'omitida';
  notes: string;
};

export type Prescription = {
  id: string;
  veterinarian: string;
  clinic: string;
  date: string;
  diagnosis: string;
  medications: string; // Keeping for legacy, replaced by Recipe model mostly
  instructions: string;
  nextControl?: string;
  attachmentUrl?: string;
};

export type Recipe = {
  id: string;
  title: string;
  date: string;
  vetName: string;
  clinic: string;
  diagnosis: string;
  instructions: string;
  imageUrl: string;
  relatedTreatmentId?: string;
  notes: string;
};

export type FoodControl = {
  id: string;
  foodName: string;         // nombre del alimento
  brand: string;
  foodType: string;
  totalQuantityKg: number;
  remainingQuantityKg: number;
  unit: string;             // 'kg' | 'g'
  dailyRationGrams: number;
  timesPerDay: number;
  purchaseDate: string;
  openDate: string;         // fecha de apertura del saco
  purchasePlace: string;    // lugar de compra
  price: number | null;     // valor/precio
  alertThresholdDays: number;
  mealTimes: string[];      // HH:MM array
  reminderMinutes: number;  // minutos antes del recordatorio
  reminderActive: boolean;
};

export type VaccineState = 'al día' | 'próxima' | 'vencida';

export type Vaccine = {
  id: string;
  type: 'vacuna' | 'desparasitación';
  name: string;
  applicationDate: string;
  nextDate: string;
  veterinarian: string;
  notes: string;
  state: VaccineState;
};

export type QrSettings = {
  enabled: boolean;
  showAllergies: boolean;
  showConditions: boolean;
  showActiveTreatments: boolean;
  showVaccines: boolean;
  showOwnerContact: boolean;
  showEmergencyNotes: boolean;
  showFood: boolean;
};

// ── Phase 2: Veterinary Visits ───────────────────────────────────────────────
export type VisitType =
  | 'medicina general'
  | 'especialidad'
  | 'urgencia'
  | 'control sano'
  | 'vacunación'
  | 'cirugía'
  | 'otro';

export type VeterinaryVisit = {
  id: string;
  dogId: string;
  date: string;
  clinic: string;
  clinicPhone: string;
  visitType: VisitType;
  specialtyName: string;
  vetName: string;
  tasks: string;
  observations: string;
  nextControl: string;
  treatmentIds: string[];
  createdAt: string;
};

// ── Phase 4: Exams ───────────────────────────────────────────────────────────
export type ExamReason =
  | 'cirugía'
  | 'enfermedad'
  | 'control sano'
  | 'seguimiento'
  | 'otro';

export type Exam = {
  id: string;
  dogId: string;
  name: string;
  examDate: string;
  reason: ExamReason | string;
  clinic: string;
  fileUrl: string;
  observations: string;
  createdAt: string;
};

// ── Phase 5: Veterinary Centers ──────────────────────────────────────────────
export type VeterinaryCenter = {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone: string;
  vetName: string;
  specialty: string;
  observations: string;
  createdAt: string;
};

export type AppData = {
  dog: Dog;
  treatments: Treatment[];
  doseHistory: DoseHistory[];
  prescriptions: Prescription[]; // Legacy or simple format
  recipes: Recipe[];
  food: FoodControl;
  vaccines: Vaccine[];
  qrSettings: QrSettings;
};
