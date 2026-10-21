import { collection, doc, getDocs, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole, AccountStatus } from '../types';
import { createAuditLog } from './resourceService';

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching users list:', err);
    return [];
  }
}

export async function updateUserStatus(
  targetUid: string,
  newStatus: AccountStatus,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const ref = doc(db, 'users', targetUid);
    await updateDoc(ref, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    await createAuditLog({
      action: 'UPDATE_USER_STATUS',
      targetType: 'user',
      targetId: targetUid,
      details: `User ${targetUid} status updated to ${newStatus}`,
      performedBy: adminEmail,
      performedByUid: adminUid,
      performedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export async function updateUserRole(
  targetUid: string,
  targetEmail: string,
  newRole: UserRole,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const ref = doc(db, 'users', targetUid);
    await updateDoc(ref, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    const adminDocRef = doc(db, 'admins', targetUid);
    if (newRole === 'admin') {
      await setDoc(adminDocRef, {
        uid: targetUid,
        email: targetEmail,
        grantedAt: new Date().toISOString(),
        grantedBy: adminEmail,
      });
    } else {
      await deleteDoc(adminDocRef);
    }

    await createAuditLog({
      action: 'UPDATE_USER_ROLE',
      targetType: 'user',
      targetId: targetUid,
      details: `User ${targetEmail} role set to ${newRole}`,
      performedBy: adminEmail,
      performedByUid: adminUid,
      performedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}
