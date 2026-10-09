import { useRouter } from 'expo-router';

import { ContentLibraryScreen } from '@/features/content';

export default function StaffContentRoute(): React.JSX.Element {
  const router = useRouter();

  return <ContentLibraryScreen canManageLibrary={false} onBackPress={router.back} />;
}
