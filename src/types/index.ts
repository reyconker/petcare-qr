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
  emergencyNotes: string; // Updated from notes
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
  endDate: string;
  frequencyHours: number; // every X hours
  doseAmount: number;
  unit: string;
  initialQuantity: number;
  remainingQuantity: number;
  state: TreatmentState;
  notes: string;
  recipeId?: string; // Link to recipe
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
  brand: string;
  foodType: string;
  totalQuantityKg: number;
  remainingQuantityKg: number;
  dailyRationGrams: number;
  timesPerDay: number;
  purchaseDate: string;
  alertThresholdDays: number;
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
