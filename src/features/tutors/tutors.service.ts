import { NotFoundError, ForbiddenError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';

import { CredentialModel } from './credentials.model.js';
import { TutorModel, type IAvailabilityWindow } from './tutors.model.js';

class TutorService {
  async getPublicProfile(tutorId: string) {
    const tutor = await TutorModel.findOne({ id: tutorId }).lean();
    if (!tutor) throw new NotFoundError('Tutor');
    return tutor;
  }

  async getOrCreateMyProfile(userId: string) {
    let tutor = await TutorModel.findOne({ userId }).lean();
    if (!tutor) {
      tutor = await TutorModel.create({ id: ids.tutor(), userId });
    }
    return tutor;
  }

  async updateProfile(userId: string, data: Partial<{
    bio: string; subjects: string[]; levels: string[]; rate: number;
    connectionFee: number; format: string; location: string; photoKey: string;
  }>) {
    const tutor = await TutorModel.findOneAndUpdate({ userId }, { $set: data }, { new: true }).lean();
    if (!tutor) throw new NotFoundError('Tutor profile');
    return tutor;
  }

  async updateAvailability(userId: string, availability: IAvailabilityWindow[]) {
    const tutor = await TutorModel.findOneAndUpdate({ userId }, { $set: { availability } }, { new: true }).lean();
    if (!tutor) throw new NotFoundError('Tutor profile');
    return tutor;
  }

  async updateVisibility(userId: string, isListed: boolean) {
    const tutor = await TutorModel.findOne({ userId }).lean();
    if (!tutor) throw new NotFoundError('Tutor profile');
    if (tutor.verificationStatus !== 'verified' && isListed) {
      throw new ForbiddenError('Profile must be verified before listing');
    }
    return TutorModel.findOneAndUpdate({ userId }, { $set: { isListed } }, { new: true }).lean();
  }

  async addCredential(userId: string, fileKey: string, type: 'degree' | 'governmentId' | 'reference') {
    const tutor = await TutorModel.findOne({ userId }).lean();
    if (!tutor) throw new NotFoundError('Tutor profile');
    return CredentialModel.create({ id: ids.credential(), tutorId: tutor.id, fileKey, type });
  }

  async getMyCredentials(userId: string) {
    const tutor = await TutorModel.findOne({ userId }).lean();
    if (!tutor) throw new NotFoundError('Tutor profile');
    return CredentialModel.find({ tutorId: tutor.id }).lean();
  }
}

export const tutorService = new TutorService();
