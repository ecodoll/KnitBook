import AppHeader from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser } from "@/lib/knitbook/app-user";

/**
 * 서버에서 헤더용 사용자 정보를 불러와 AppHeader를 렌더한다.
 */
const AppHeaderLoader = async () => {
  const user = await getAppHeaderUser();

  if (!user) {
    return null;
  }

  return <AppHeader user={user} />;
};

export default AppHeaderLoader;
