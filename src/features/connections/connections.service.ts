import { UserModel } from '@features/auth/auth.model.js';
import { TutorModel } from '@features/tutors/tutors.model.js';
import { ConflictError, ForbiddenError, NotFoundError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';

import { ConnectionModel, type IConnection } from './connections.model.js';

type MaskedConnection = Omit<IConnection, 'studentId'> & { studentName: string };

class ConnectionService {
  async open(studentId: string, tutorId: string) {
    const tutor = await TutorModel.findOne({ id: tutorId }).lean();
    if (!tutor) throw new NotFoundError('Tutor');
    if (!tutor.isListed) throw new ForbiddenError('Tutor is not available');

    const existing = await ConnectionModel.findOne({ studentId, tutorId }).lean();
    if (existing) throw new ConflictError('Connection already exists');

    const connection = await ConnectionModel.create({
      id: ids.connection(),
      studentId,
      tutorId,
      tutorUserId: tutor.userId,
      amount: 0,
      openedAt: new Date(),
    });

    return connection;
  }

  async list(userId: string, role: 'student' | 'tutor' | 'admin') {
    const filter = role === 'tutor' ? { tutorUserId: userId } : { studentId: userId };
    const connections = await ConnectionModel.find(filter).sort({ createdAt: -1 }).lean();

    if (role === 'tutor') {
      return Promise.all(connections.map((c) => this.withMaskedStudent(c)));
    }

    return connections;
  }

  async getOne(connectionId: string, userId: string, role: 'student' | 'tutor' | 'admin') {
    const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
    if (!connection) throw new NotFoundError('Connection');

    const isMember = connection.studentId === userId || connection.tutorUserId === userId;
    if (role !== 'admin' && !isMember) throw new ForbiddenError();

    if (role === 'tutor' && connection.tutorUserId === userId) {
      return this.withMaskedStudent(connection);
    }

    return connection;
  }

  private async withMaskedStudent(connection: IConnection): Promise<MaskedConnection> {
    const student = await UserModel.findOne({ id: connection.studentId }).select('firstName lastName').lean();
    const studentName = student
      ? `${student.firstName} ${student.lastName.charAt(0)}.`
      : 'Unknown';

    const { studentId: _omit, ...rest } = connection as IConnection & { studentId: string };
    return { ...rest, studentName };
  }
}

export const connectionService = new ConnectionService();
