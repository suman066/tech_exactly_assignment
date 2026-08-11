export type Task = {
  id: string;
  ownerId: string;
  title: string;
  notes?: string;
  completed: boolean;
  reminder?: string;
  notificationId?: string;
  updatedAt: string;
  synced: boolean;
};

export type UserProfile = {
  userId: string;
  email: string | null;
};
