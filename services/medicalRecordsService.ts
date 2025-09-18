import { supabase } from '../lib/supabase';
import { MedicalRecord } from '../types';

export class MedicalRecordsService {
  static async createMedicalRecord(record: Omit<MedicalRecord, 'id'> & { patientId: string }): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: record.patientId,
        date: record.date,
        type: record.type,
        summary: record.summary,
        doctor: record.doctor,
        category: record.category,
        file_url: record.fileUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }

    return {
      id: data.id,
      patientId: data.patient_id,
      date: data.date,
      type: data.type,
      summary: data.summary,
      doctor: data.doctor,
      category: data.category,
      fileUrl: data.file_url,
    };
  }

  static async getMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }

    return data.map(record => ({
      id: record.id,
      patientId: record.patient_id,
      date: record.date,
      type: record.type,
      summary: record.summary,
      doctor: record.doctor,
      category: record.category,
      fileUrl: record.file_url,
    }));
  }

  static async deleteMedicalRecord(recordId: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }

  static async updateMedicalRecord(recordId: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .update({
        date: updates.date,
        type: updates.type,
        summary: updates.summary,
        doctor: updates.doctor,
        category: updates.category,
        file_url: updates.fileUrl,
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }

    return {
      id: data.id,
      patientId: data.patient_id,
      date: data.date,
      type: data.type,
      summary: data.summary,
      doctor: data.doctor,
      category: data.category,
      fileUrl: data.file_url,
    };
  }
}